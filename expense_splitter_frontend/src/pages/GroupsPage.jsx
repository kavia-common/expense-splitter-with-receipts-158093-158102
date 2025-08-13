import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Modal from '../components/Modal';
import GroupList from '../components/GroupList';
import GroupForm from '../components/GroupForm';

/**
 * GroupsPage lists user groups and provides creation and management UI.
 */
// PUBLIC_INTERFACE
export default function GroupsPage() {
  /** Render the groups list page with modal to create/edit groups. */
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load(signal) {
    setLoading(true);
    setErrMsg('');
    try {
      const data = await api.get('/groups', { signal });
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrMsg('Unable to load groups right now.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (g) => {
    setEditing(g);
    setModalOpen(true);
  };

  const onView = (g) => navigate(`/groups/${g.id}`);

  const onDelete = async (g) => {
    const yes = window.confirm(`Delete group "${g.name}"? This cannot be undone.`);
    if (!yes) return;
    try {
      await api.del(`/groups/${g.id}`);
      await load();
    } catch (err) {
      alert('Failed to delete the group.');
    }
  };

  const handleSubmit = async ({ name }) => {
    setSubmitting(true);
    try {
      if (editing?.id) {
        await api.patch(`/groups/${editing.id}`, { name });
      } else {
        await api.post('/groups', { name });
      }
      setModalOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      alert('Failed to save the group.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section">
      <h1>Groups</h1>
      <div className="actions-row">
        <button className="btn btn-primary" onClick={openCreate}>New Group</button>
      </div>

      {loading && <div className="card">Loading...</div>}
      {!loading && errMsg && <div className="card">{errMsg}</div>}
      {!loading && !errMsg && (
        <GroupList groups={groups} onView={onView} onEdit={openEdit} onDelete={onDelete} />
      )}

      <Modal isOpen={modalOpen} title={editing ? 'Edit Group' : 'Create Group'} onClose={() => setModalOpen(false)}>
        <GroupForm
          initialData={editing || { name: '' }}
          onCancel={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </Modal>
    </section>
  );
}
