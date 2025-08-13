import React, { useEffect, useState } from 'react';

/**
 * Form for creating or editing a group member.
 * - For create: requires user_id and optional role.
 * - For edit: allows updating role only.
 */
// PUBLIC_INTERFACE
export default function MemberForm({ mode = 'create', initialData = {}, onCancel, onSubmit, submitting = false }) {
  /** Render a form to add or edit a member. */
  const isEdit = mode === 'edit';
  const [userId, setUserId] = useState(initialData?.user?.id || '');
  const [role, setRole] = useState(initialData?.role || '');

  useEffect(() => {
    setUserId(initialData?.user?.id || '');
    setRole(initialData?.role || '');
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !userId) return;
    await onSubmit({
      ...(isEdit ? {} : { user_id: Number(userId) }),
      ...(role ? { role: role.trim() } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {!isEdit && (
        <div className="form-row">
          <label className="label" htmlFor="user-id">User ID</label>
          <input
            id="user-id"
            className="input"
            type="number"
            min="1"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter the existing user's ID"
            required={!isEdit}
          />
        </div>
      )}
      <div className="form-row">
        <label className="label" htmlFor="role">Role (optional)</label>
        <input
          id="role"
          className="input"
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Admin, Member"
          maxLength={50}
        />
      </div>
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting || (!isEdit && !userId)}>
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Add member'}
        </button>
      </div>
    </form>
  );
}
