import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import BalancesCard from '../components/BalancesCard';

/**
 * BalancesPage allows the user to:
 * - Select a group
 * - Fetch and view the group's outstanding balances
 * Backend: GET /groups/{group_id}/balances
 */
// PUBLIC_INTERFACE
export default function BalancesPage() {
  /** Render balances screen with group selection and balances list. */
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  // Load groups on mount
  useEffect(() => {
    const controller = new AbortController();
    api
      .get('/groups', { signal: controller.signal })
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setGroups(arr);
        if (arr.length > 0) {
          setSelectedGroupId(String(arr[0].id));
        }
      })
      .catch(() => setErrMsg('Unable to load groups right now.'));
    return () => controller.abort();
  }, []);

  const groupIdNum = useMemo(
    () => (selectedGroupId ? Number(selectedGroupId) : null),
    [selectedGroupId]
  );

  // Load balances when group changes
  useEffect(() => {
    if (!groupIdNum) return;
    const controller = new AbortController();
    setLoading(true);
    setErrMsg('');
    api
      .get(`/groups/${groupIdNum}/balances`, { signal: controller.signal })
      .then((data) => {
        const arr = Array.isArray(data?.balances) ? data.balances : [];
        setBalances(arr);
      })
      .catch(() => setErrMsg('Unable to load balances for the selected group.'))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [groupIdNum]);

  return (
    <section className="section">
      <h1>Balances</h1>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="form-row">
          <label className="label" htmlFor="group-select">Group</label>
          <select
            id="group-select"
            className="select"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="card">Loading...</div>}
      {!loading && errMsg && <div className="card">{errMsg}</div>}
      {!loading && !errMsg && <BalancesCard balances={balances} />}
    </section>
  );
}
