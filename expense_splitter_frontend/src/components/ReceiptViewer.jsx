import React from 'react';
import { getReceiptUrl } from '../api/client';

/**
 * Displays the receipt (image/file) for an expense.
 * If the receipt is an image, the <img> tag will render it.
 * For non-image receipts, shows a download link.
 * Props:
 * - expense: expense object with id and receipt fields
 */
// PUBLIC_INTERFACE
export default function ReceiptViewer({ expense }) {
  /** Render a viewer for an expense's receipt. */
  if (!expense?.receipt_filename) {
    return <div className="card">This expense has no receipt.</div>;
    }
  const url = getReceiptUrl(expense.id);

  const isImage = isLikelyImage(expense.receipt_filename, expense.receipt_mime_type);

  return (
    <div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14 }}>
          {expense.receipt_filename}
          {expense.receipt_mime_type ? ` • ${expense.receipt_mime_type}` : ''}
        </div>
      </div>
      {isImage ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <img
            src={url}
            alt="Expense receipt"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
          />
        </div>
      ) : (
        <div className="card">
          <a className="btn btn-primary" href={url} target="_blank" rel="noopener noreferrer">
            Download receipt
          </a>
        </div>
      )}
    </div>
  );
}

function isLikelyImage(filename, mime) {
  const m = (mime || '').toLowerCase();
  if (m.startsWith('image/')) return true;
  const fn = (filename || '').toLowerCase();
  return fn.endsWith('.png') || fn.endsWith('.jpg') || fn.endsWith('.jpeg') || fn.endsWith('.gif') || fn.endsWith('.webp');
}
