import React, { useState, useEffect } from 'react';

/**
 * Form for creating or editing a group.
 * - If initialData has id, this acts as edit form, otherwise create form.
 */
// PUBLIC_INTERFACE
export default function GroupForm({ initialData = { name: '' }, onCancel, onSubmit, submitting = false }) {
  /** Render a form to create or edit a group. */
  const [name, setName] = useState(initialData?.name || '');
  const isEdit = !!initialData?.id;

  useEffect(() => {
    setName(initialData?.name || '');
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({ name: name.trim() });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <label className="label" htmlFor="group-name">Group name</label>
        <input
          id="group-name"
          className="input"
          type="text"
          value={name}
          maxLength={150}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Trip to Spain"
          required
        />
      </div>
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting || !name.trim()}>
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create group'}
        </button>
      </div>
    </form>
  );
}
