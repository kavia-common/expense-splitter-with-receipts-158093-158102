import React from 'react';

/**
 * BalancesCard renders a list of user balances for a group.
 * Positive balance => the user is owed money.
 * Negative balance => the user owes money.
 * Zero => settled.
 * Props:
 * - balances: Array<{ user: { id, name, email? }, balance: string }>
 */
// PUBLIC_INTERFACE
export default function BalancesCard({ balances = [] }) {
  /** Render the balances list. */
  if (!Array.isArray(balances) || balances.length === 0) {
    return <div className="card">All settled. No outstanding balances.</div>;
  }

  return (
    <div>
      {balances.map((entry) => {
        const name = entry.user?.name || `User #${entry.user?.id}`;
        const bn = toNumber(entry.balance);
        const abs = Math.abs(bn);
        const money = formatMoney(abs);
        let status = 'is settled';
        let color = undefined;

        if (bn > 0) {
          status = `is owed ${money}`;
          color = '#2e7d32'; // greenish
        } else if (bn < 0) {
          status = `owes ${money}`;
          color = '#c62828'; // reddish
        }

        return (
          <div key={entry.user?.id ?? name} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
              <div style={{ fontWeight: 700 }}>{name}</div>
              <div style={{ fontWeight: 700, color }}>{status}</div>
            </div>
            {typeof entry.balance === 'string' && (
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                Raw: {entry.balance}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function toNumber(val) {
  if (val == null) return 0;
  if (typeof val === 'number') return val;
  const n = Number(val);
  return Number.isNaN(n) ? 0 : n;
}

function formatMoney(amount) {
  try {
    const num = typeof amount === 'string' ? Number(amount) : amount;
    if (Number.isNaN(num)) return amount;
    return `$${num.toFixed(2)}`;
  } catch {
    return amount;
  }
}
