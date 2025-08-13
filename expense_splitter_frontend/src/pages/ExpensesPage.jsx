import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import ExpensesList from '../components/ExpensesList';
import ExpenseForm from '../components/ExpenseForm';
import ReceiptUpload from '../components/ReceiptUpload';
import ReceiptViewer from '../components/ReceiptViewer';

/**
 * ExpensesPage allows the user to:
 * - Select a group
 * - List expenses in that group
 * - Create, edit, and delete expenses
 * - Upload, replace, view, and delete receipts for expenses
 */
// PUBLIC_INTERFACE
export default function ExpensesPage() {
  /** Render fully functional expenses screen with CRUD and receipt management. */
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [showUpload, setShowUpload] = useState(false);
  const [uploadExpense, setUploadExpense] = useState(null);

  const [showViewer, setShowViewer] = useState(false);
  const [viewExpense, setViewExpense] = useState(null);

  // Load groups on mount
  useEffect(() => {
    const controller = new AbortController();
    api.get('/groups', { signal: controller.signal })
      .then((data) => {
        setGroups(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedGroupId(String(data[0].id));
        }
      })
      .catch(() => setErrMsg('Unable to load groups right now.'));
    return () => controller.abort();
  }, []);

  const groupIdNum = useMemo(() => (selectedGroupId ? Number(selectedGroupId) : null), [selectedGroupId]);
  const selectedGroup = useMemo(() => groups.find((g) => g.id === groupIdNum), [groups, groupIdNum]);

  // Load members and expenses when group changes
  useEffect(() => {
    if (!groupIdNum) return;
    const controller = new AbortController();
    setLoading(true);
    setErrMsg('');
    Promise.all([
      api.get(`/groups/${groupIdNum}/members`, { signal: controller.signal }),
      api.get(`/groups/${groupIdNum}/expenses`, { signal: controller.signal }),
    ])
      .then(([ms, ex]) => {
        setMembers(Array.isArray(ms) ? ms : []);
        setExpenses(Array.isArray(ex) ? ex : []);
      })
      .catch(() => {
        setErrMsg('Unable to load expenses for the selected group.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [groupIdNum]);

  const reloadExpenses = async () => {
    if (!groupIdNum) return;
    try {
      const data = await api.get(`/groups/${groupIdNum}/expenses`);
      setExpenses(Array.isArray(data) ? data : []);
    } catch {
      // keep prior list, maybe show toast
    }
  };

  const openCreate = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  const openEdit = (ex) => {
    setEditingExpense(ex);
    setShowForm(true);
  };

  const handleDelete = async (ex) => {
    const yes = window.confirm(`Delete expense "${ex.description}"? This cannot be undone.`);
    if (!yes) return;
    try {
      await api.del(`/expenses/${ex.id}`);
      await reloadExpenses();
    } catch {
      alert('Failed to delete the expense.');
    }
  };

  const handleSubmit = async (payload) => {
    if (!groupIdNum) return;
    setSubmitting(true);
    try {
      if (editingExpense?.id) {
        const updated = await api.patch(`/expenses/${editingExpense.id}`, payload);
        // Update one in place if same group
        setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      } else {
        const created = await api.post(`/groups/${groupIdNum}/expenses`, payload);
        setExpenses((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setEditingExpense(null);
    } catch (err) {
      alert('Failed to save expense. Please check your input.');
    } finally {
      setSubmitting(false);
    }
  };

  const openUpload = (ex) => {
    setUploadExpense(ex);
    setShowUpload(true);
  };

  const onUploaded = async (updated) => {
    // replace in list
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setShowUpload(false);
    setUploadExpense(null);
  };

  const onDeletedReceipt = async (updated) => {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setShowUpload(false);
    setUploadExpense(null);
  };

  const openView = (ex) => {
    setViewExpense(ex);
    setShowViewer(true);
  };

  return (
    <section className="section">
      <h1>Expenses</h1>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="form-row">
          <label className="label" htmlFor="group-select">Group</label>
          <select
            id="group-select"
            className="select"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div className="actions-row">
          <button className="btn btn-primary" onClick={openCreate} disabled={!groupIdNum}>New Expense</button>
        </div>
      </div>

      {loading && <div className="card">Loading...</div>}
      {!loading && errMsg && <div className="card">{errMsg}</div>}
      {!loading && !errMsg && (
        <ExpensesList
          expenses={expenses}
          onEdit={openEdit}
          onDelete={handleDelete}
          onUploadReceipt={openUpload}
          onViewReceipt={openView}
        />
      )}

      <Modal
        isOpen={showForm}
        title={editingExpense ? 'Edit Expense' : 'Create Expense'}
        onClose={() => setShowForm(false)}
      >
        <ExpenseForm
          groupId={selectedGroup?.id}
          members={members}
          initialData={editingExpense}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <Modal
        isOpen={showUpload}
        title="Upload Receipt"
        onClose={() => setShowUpload(false)}
      >
        {uploadExpense && (
          <ReceiptUpload
            expense={uploadExpense}
            onUploaded={onUploaded}
            onDeleted={onDeletedReceipt}
          />
        )}
      </Modal>

      <Modal
        isOpen={showViewer}
        title="Receipt"
        onClose={() => setShowViewer(false)}
      >
        {viewExpense && <ReceiptViewer expense={viewExpense} />}
      </Modal>
    </section>
  );
}
