import React from 'react';

/**
 * Renders a list of expenses with actions to edit, delete, upload/view receipts.
 * Expects expense objects shaped like the backend schema (see openapi).
 */
// PUBLIC_INTERFACE
export default function ExpensesList({
  expenses = [],
  onEdit,
  onDelete,
  onUploadReceipt,
  onViewReceipt,
}) {
  /** Render a list of expenses with action buttons. */
  if (!expenses.length) {
    return <div className="card">No expenses yet.</div>;
  }

  return (
    <div>
      {expenses.map((ex) => (
        <div key={ex.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>
                {ex.description} • {formatMoney(ex.amount)}
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {ex.expense_date ? new Date(ex.expense_date).toLocaleDateString() : '—'}
                {ex.paid_by_user ? ` • Paid by ${ex.paid_by_user.name}` : ''}
                {ex.group ? ` • Group: ${ex.group.name}` : ''}
                {ex.receipt_filename ? ` • Receipt: ${ex.receipt_filename}` : ' • No receipt'}
              </div>
              {Array.isArray(ex.shares) && ex.shares.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 12 }}>
                  Shares:{' '}
                  {ex.shares.map((s) => `${s.user?.name || `User #${s.user?.id}`}: ${formatMoney(s.amount)}`).join(', ')}
                </div>
              )}
            </div>
            <div className="actions-row" style={{ justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => onEdit?.(ex)}>Edit</button>
              <button className="btn btn-danger" onClick={() => onDelete?.(ex)}>Delete</button>
              <button className="btn" onClick={() => onUploadReceipt?.(ex)}>{ex.receipt_filename ? 'Replace Receipt' : 'Upload Receipt'}</button>
              {onViewReceipt && (
                <button className="btn btn-primary" onClick={() => onViewReceipt?.(ex)} disabled={!ex.receipt_filename}>
                  View Receipt
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatMoney(amount) {
  if (amount == null) return '—';
  try {
    const num = typeof amount === 'string' ? Number(amount) : amount;
    if (Number.isNaN(num)) return amount;
    return `$${num.toFixed(2)}`;
  } catch {
    return amount;
  }
}
