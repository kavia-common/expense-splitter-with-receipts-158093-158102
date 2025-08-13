import React, { useState } from 'react';
import api from '../api/client';

/**
 * ReceiptUpload provides an interface for uploading/replacing and deleting a receipt for an expense.
 * Props:
 * - expense: expense object (requires id and optionally receipt_filename)
 * - onUploaded(updatedExpense): callback on successful upload
 * - onDeleted(updatedExpense): callback on successful deletion
 */
// PUBLIC_INTERFACE
export default function ReceiptUpload({ expense, onUploaded, onDeleted }) {
  /** Render receipt upload UI for a given expense. */
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const doUpload = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const updated = await api.uploadReceipt(expense.id, file);
      setFile(null);
      onUploaded?.(updated);
    } catch (err) {
      setError('Failed to upload receipt. Please try a different file.');
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    const yes = window.confirm('Delete the current receipt?');
    if (!yes) return;
    setBusy(true);
    setError('');
    try {
      const updated = await api.deleteReceipt(expense.id);
      onDeleted?.(updated);
    } catch (err) {
      setError('Failed to delete receipt.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {expense.receipt_filename ? (
        <div className="card" style={{ marginBottom: 12 }}>
          Current receipt: <strong>{expense.receipt_filename}</strong>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 12 }}>
          No receipt currently attached.
        </div>
      )}

      {error && <div className="card">{error}</div>}

      <div className="form-row">
        <label className="label" htmlFor="receipt-file">Choose an image or PDF</label>
        <input id="receipt-file" className="input" type="file" onChange={onChange} accept="image/*,application/pdf" />
      </div>

      <div className="actions-row">
        <button className="btn btn-primary" onClick={doUpload} disabled={busy || !file}>
          {busy ? 'Uploading...' : expense.receipt_filename ? 'Replace' : 'Upload'}
        </button>
        {expense.receipt_filename && (
          <button className="btn btn-danger" onClick={doDelete} disabled={busy}>
            Delete receipt
          </button>
        )}
      </div>
    </div>
  );
}
