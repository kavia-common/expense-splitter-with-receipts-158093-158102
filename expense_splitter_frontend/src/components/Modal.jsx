import React from 'react';

/**
 * Generic modal dialog component.
 * Uses portal-less approach for simplicity within this template.
 */
// PUBLIC_INTERFACE
export default function Modal({ isOpen, title, children, onClose }) {
  /** Render a simple modal with a backdrop. */
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title || 'Dialog'}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="btn btn-secondary" onClick={onClose} aria-label="Close dialog">Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
