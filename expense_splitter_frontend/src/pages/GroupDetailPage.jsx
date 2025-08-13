import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import Modal from '../components/Modal';
import GroupForm from '../components/GroupForm';
import MemberList from '../components/MemberList';
import MemberForm from '../components/MemberForm';

/**
 * GroupDetailPage shows a single group's details and allows managing members.
 */
// PUBLIC_INTERFACE
export default function GroupDetailPage() {
  /** Render group details, rename/delete actions, and members CRUD. */
  const { groupId } = useParams();
  const navigate = useNavigate();
  const gid = useMemo(() => Number(groupId), [groupId]);

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberFormMode, setMemberFormMode] = useState('create'); // 'create'|'edit'
  const [memberEditing, setMemberEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadAll(signal) {
    setLoading(true);
    setErrMsg('');
    try {
      const [g, ms] = await Promise.all([
        api.get(`/groups/${gid}`, { signal }),
        api.get(`/groups/${gid}/members`, { signal }),
      ]);
      setGroup(g);
      setMembers(Array.isArray(ms) ? ms : []);
    } catch (err) {
      setErrMsg('Unable to load group details right now.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadAll(controller.signal);
    return () => controller.abort();
  }, [gid]);

  const handleDeleteGroup = async () => {
    if (!group) return;
    const yes = window.confirm(`Delete group "${group.name}"? This cannot be undone.`);
    if (!yes) return;
    try {
      await api.del(`/groups/${gid}`);
      navigate('/groups');
    } catch (err) {
      alert('Failed to delete the group.');
    }
  };

  const openAddMember = () => {
    setMemberFormMode('create');
    setMemberEditing(null);
    setShowMemberForm(true);
  };

  const openEditMember = (m) => {
    setMemberFormMode('edit');
    setMemberEditing(m);
    setShowMemberForm(true);
  };

  const handleSaveGroup = async (payload) => {
    if (!group) return;
    setSubmitting(true);
    try {
      await api.patch(`/groups/${gid}`, payload);
      setShowEditGroup(false);
      await loadAll();
    } catch (err) {
      alert('Failed to save group.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMember = async (payload) => {
    setSubmitting(true);
    try {
      await api.post(`/groups/${gid}/members`, payload);
      setShowMemberForm(false);
      await loadAll();
    } catch (err) {
      alert('Failed to add member. Ensure the user exists and is not already a member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMember = async (payload) => {
    if (!memberEditing) return;
    setSubmitting(true);
    try {
      await api.patch(`/groups/${gid}/members/${memberEditing.id}`, payload);
      setShowMemberForm(false);
      await loadAll();
    } catch (err) {
      alert('Failed to update member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (m) => {
    const yes = window.confirm(`Remove ${m.user?.name || `User #${m.user?.id}`} from this group?`);
    if (!yes) return;
    try {
      await api.del(`/groups/${gid}/members/${m.id}`);
      await loadAll();
    } catch (err) {
      alert('Failed to remove member.');
    }
  };

  return (
    <section className="section">
      <h1>Group Details</h1>
      {loading && <div className="card">Loading...</div>}
      {!loading && errMsg && <div className="card">{errMsg}</div>}
      {!loading && !errMsg && group && (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{group.name}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  ID: {group.id} {group.created_at ? `• Created ${new Date(group.created_at).toLocaleString()}` : ''}{' '}
                  {group.created_by ? `• By ${group.created_by.name}` : ''}
                </div>
              </div>
              <div className="actions-row">
                <button className="btn" onClick={() => setShowEditGroup(true)}>Edit Group</button>
                <button className="btn btn-danger" onClick={handleDeleteGroup}>Delete Group</button>
              </div>
            </div>
          </div>

          <div className="actions-row">
            <button className="btn btn-primary" onClick={openAddMember}>Add Member</button>
            <button className="btn" onClick={() => navigate('/groups')}>Back to Groups</button>
          </div>

          <h2 style={{ fontSize: 16, marginTop: 8 }}>Members</h2>
          <MemberList members={members} onEdit={openEditMember} onDelete={handleDeleteMember} />
        </>
      )}

      {/* Edit group modal */}
      <Modal isOpen={showEditGroup} title="Edit Group" onClose={() => setShowEditGroup(false)}>
        <GroupForm
          initialData={group || { name: '' }}
          onCancel={() => setShowEditGroup(false)}
          onSubmit={handleSaveGroup}
          submitting={submitting}
        />
      </Modal>

      {/* Member form modal */}
      <Modal
        isOpen={showMemberForm}
        title={memberFormMode === 'edit' ? 'Edit Member' : 'Add Member'}
        onClose={() => setShowMemberForm(false)}
      >
        {memberFormMode === 'edit' ? (
          <MemberForm
            mode="edit"
            initialData={memberEditing || {}}
            onCancel={() => setShowMemberForm(false)}
            onSubmit={handleUpdateMember}
            submitting={submitting}
          />
        ) : (
          <MemberForm
            mode="create"
            initialData={{}}
            onCancel={() => setShowMemberForm(false)}
            onSubmit={handleCreateMember}
            submitting={submitting}
          />
        )}
      </Modal>
    </section>
  );
}
