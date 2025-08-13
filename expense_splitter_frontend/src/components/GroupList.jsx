import React from 'react';

/**
 * Display a list of groups with action buttons.
 */
// PUBLIC_INTERFACE
export default function GroupList({ groups, onView, onEdit, onDelete }) {
  /** Render groups list; calls back for view/edit/delete actions. */
  if (!groups?.length) {
    return <div className="card">No groups yet. Create your first group.</div>;
  }

  return (
    <div>
      {groups.map((g) => (
        <div key={g.id ?? g.name} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{g.name}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                ID: {g.id ?? '—'} {g.created_at ? `• Created ${new Date(g.created_at).toLocaleString()}` : ''}
              </div>
            </div>
            <div className="actions-row">
              <button className="btn btn-primary" onClick={() => onView?.(g)}>View</button>
              <button className="btn" onClick={() => onEdit?.(g)}>Edit</button>
              <button className="btn btn-danger" onClick={() => onDelete?.(g)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
