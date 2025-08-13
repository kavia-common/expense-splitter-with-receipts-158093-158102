import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import ReceiptViewer from '../components/ReceiptViewer';
import ReceiptUpload from '../components/ReceiptUpload';

/**
 * ReceiptsPage lets the user:
 * - Select a group
 * - See only expenses that have receipts
 * - View the receipt or replace/delete it
 */
// PUBLIC_INTERFACE
export default function ReceiptsPage() {
  /** Render receipts management page. */
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewExpense, setViewExpense] = useState(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadExpense, setUploadExpense] = useState(null);

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
      .catch(() => setErrMsg('Unable to load receipts for the selected group.'))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [groupIdNum]);

  const expensesWithReceipts = useMemo(
    () => expenses.filter((e) => !!e.receipt_filename),
    [expenses]
  );

  const openView = (ex) => {
    setViewExpense(ex);
    setViewerOpen(true);
  };

  const openUpload = (ex) => {
    setUploadExpense(ex);
    setUploadOpen(true);
  };

  const onUploaded = (updated) => {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setUploadOpen(false);
    setUploadExpense(null);
  };

  const onDeleted = (updated) => {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setUploadOpen(false);
    setUploadExpense(null);
  };

  return (
    <section className="section">
      <h1>Receipts</h1>

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
      </div>

      {loading && <div className="card">Loading...</div>}
      {!loading && errMsg && <div className="card">{errMsg}</div>}
      {!loading && !errMsg && (
        <div>
          {!expensesWithReceipts.length && (
            <div className="card">No receipts found in this group.</div>
          )}
          {expensesWithReceipts.map((ex) => (
            <div key={ex.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{ex.description} • ${Number(ex.amount).toFixed(2)}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {ex.expense_date ? new Date(ex.expense_date).toLocaleDateString() : '—'}
                    {ex.paid_by_user ? ` • Paid by ${ex.paid_by_user.name}` : ''}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    Receipt: <strong>{ex.receipt_filename}</strong>
                  </div>
                </div>
                <div className="actions-row" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" onClick={() => openView(ex)}>View</button>
                  <button className="btn" onClick={() => openUpload(ex)}>Replace/Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={viewerOpen} title="Receipt" onClose={() => setViewerOpen(false)}>
        {viewExpense && <ReceiptViewer expense={viewExpense} />}
      </Modal>

      <Modal isOpen={uploadOpen} title="Manage Receipt" onClose={() => setUploadOpen(false)}>
        {uploadExpense && (
          <ReceiptUpload
            expense={uploadExpense}
            onUploaded={onUploaded}
            onDeleted={onDeleted}
          />
        )}
      </Modal>
    </section>
  );
}
