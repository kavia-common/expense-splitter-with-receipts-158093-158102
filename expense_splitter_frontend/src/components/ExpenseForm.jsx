import React, { useEffect, useMemo, useState } from 'react';

/**
 * ExpenseForm allows creating or editing an expense.
 * Props:
 * - groupId: number (required)
 * - members: array of group members to select payer and shares
 * - initialData: optional expense object for editing
 * - submitting: boolean to control button state
 * - onSubmit(payload): called with payload matching API schema
 * - onCancel(): close dialog
 *
 * Notes:
 * - Amounts are handled as strings for API precision (decimal as string).
 * - If no shares provided, backend will split equally among group members.
 */
// PUBLIC_INTERFACE
export default function ExpenseForm({
  groupId,
  members = [],
  initialData = null,
  submitting = false,
  onSubmit,
  onCancel,
}) {
  /** Render a form for creating or editing an expense. */
  const isEdit = !!initialData?.id;

  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount ?? '');
  const [paidByUserId, setPaidByUserId] = useState(initialData?.paid_by_user?.id || '');
  const [date, setDate] = useState(() => {
    if (initialData?.expense_date) {
      const d = new Date(initialData.expense_date);
      // Convert to yyyy-mm-dd for date input
      return d.toISOString().slice(0, 10);
    }
    return '';
  });

  // Shares state: array of { user_id, amount }
  const [enableCustomShares, setEnableCustomShares] = useState(
    Array.isArray(initialData?.shares) && initialData.shares.length > 0
  );
  const [shares, setShares] = useState(() => {
    if (Array.isArray(initialData?.shares) && initialData.shares.length > 0) {
      return initialData.shares.map((s) => ({
        user_id: s.user?.id,
        amount: s.amount ?? '',
      }));
    }
    // default one row per member with empty amount (user checked off)
    return members.map((m) => ({ user_id: m.user?.id, amount: '' }));
  });

  useEffect(() => {
    // When initialData or members change, reset fields accordingly
    if (initialData) {
      setDescription(initialData.description || '');
      setAmount(initialData.amount ?? '');
      setPaidByUserId(initialData.paid_by_user?.id || '');
      setDate(initialData.expense_date ? new Date(initialData.expense_date).toISOString().slice(0, 10) : '');
      const hasShares = Array.isArray(initialData.shares) && initialData.shares.length > 0;
      setEnableCustomShares(hasShares);
      setShares(
        hasShares
          ? initialData.shares.map((s) => ({ user_id: s.user?.id, amount: s.amount ?? '' }))
          : members.map((m) => ({ user_id: m.user?.id, amount: '' }))
      );
    } else {
      setDescription('');
      setAmount('');
      setPaidByUserId('');
      setDate('');
      setEnableCustomShares(false);
      setShares(members.map((m) => ({ user_id: m.user?.id, amount: '' })));
    }
  }, [initialData, members]);

  const membersById = useMemo(() => {
    const map = new Map();
    members.forEach((m) => map.set(m.user?.id, m));
    return map;
  }, [members]);

  const handleShareChange = (userId, value) => {
    setShares((prev) =>
      prev.map((s) => (s.user_id === userId ? { ...s, amount: value } : s))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount) {
      return;
    }
    const payload = {
      description: description.trim(),
      amount: String(amount),
      ...(paidByUserId ? { paid_by_user_id: Number(paidByUserId) } : {}),
      ...(date ? { expense_date: new Date(`${date}T00:00:00Z`).toISOString() } : {}),
    };

    if (enableCustomShares) {
      const cleaned = shares
        .filter((s) => s.user_id && s.amount !== '' && s.amount !== null)
        .map((s) => ({ user_id: Number(s.user_id), amount: String(s.amount) }));
      if (cleaned.length > 0) {
        payload.shares = cleaned;
      }
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <label className="label" htmlFor="desc">Description</label>
        <input
          id="desc"
          className="input"
          type="text"
          maxLength={255}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Dinner at Luigi's"
          required
        />
      </div>

      <div className="form-row">
        <label className="label" htmlFor="amount">Amount</label>
        <input
          id="amount"
          className="input"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div className="form-row">
        <label className="label" htmlFor="paid-by">Paid by</label>
        <select
          id="paid-by"
          className="select"
          value={paidByUserId}
          onChange={(e) => setPaidByUserId(e.target.value)}
        >
          <option value="">Select payer (optional)</option>
          {members.map((m) => (
            <option key={m.id} value={m.user?.id}>
              {m.user?.name || `User #${m.user?.id}`}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label className="label" htmlFor="date">Date</label>
        <input
          id="date"
          className="input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label className="label">Shares</label>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={enableCustomShares}
              onChange={(e) => setEnableCustomShares(e.target.checked)}
            />
            Custom shares (otherwise the amount will be split equally)
          </label>
        </div>
        {enableCustomShares && (
          <div>
            {members.map((m) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 160, fontSize: 14 }}>
                  {m.user?.name || `User #${m.user?.id}`}
                </div>
                <input
                  className="input"
                  style={{ maxWidth: 140 }}
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  value={shares.find((s) => s.user_id === m.user?.id)?.amount ?? ''}
                  onChange={(e) => handleShareChange(m.user?.id, e.target.value)}
                  placeholder="0.00"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="modal-actions">
        <button type="button" className="btn" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting || !description.trim() || !amount}>
          {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create expense'}
        </button>
      </div>
    </form>
  );
}
