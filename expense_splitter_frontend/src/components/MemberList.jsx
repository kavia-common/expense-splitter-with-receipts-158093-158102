import React from 'react';

/**
 * List group members with actions to edit and remove.
 */
// PUBLIC_INTERFACE
export default function MemberList({ members, onEdit, onDelete }) {
  /** Render members list. */
  if (!members?.length) {
    return <div className="card">No members yet. Add your first member.</div>;
  }

  return (
    <div>
      {members.map((m) => (
        <div key={m.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{m.user?.name || `User #${m.user?.id}`}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Member ID: {m.id} • {m.role ? `Role: ${m.role} • ` : ''}Joined {m.joined_at ? new Date(m.joined_at).toLocaleString() : '—'}
              </div>
            </div>
            <div className="actions-row">
              <button className="btn" onClick={() => onEdit?.(m)}>Edit</button>
              <button className="btn btn-danger" onClick={() => onDelete?.(m)}>Remove</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
