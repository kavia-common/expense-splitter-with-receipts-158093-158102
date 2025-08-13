import React, { useEffect, useState } from 'react';
import api from '../api/client';

/**
 * GroupsPage lists user groups and provides entry point into a group.
 */
// PUBLIC_INTERFACE
export default function GroupsPage() {
  /** Render the groups list page. */
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setErrMsg('');
      try {
        const data = await api.get('/groups', { signal: controller.signal });
        if (isMounted && Array.isArray(data)) {
          setGroups(data);
        }
      } catch (err) {
        // Swallow errors in skeleton to avoid breaking initial UX/tests
        if (isMounted) setErrMsg('Unable to load groups right now.');
        // console.warn(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <section className="section">
      <h1>Groups</h1>
      {loading && <div className="card">Loading...</div>}
      {!loading && errMsg && <div className="card">{errMsg}</div>}
      {!loading && !errMsg && groups.length === 0 && (
        <div className="card">No groups yet. Create one from the backend or future UI.</div>
      )}
      {!loading && !errMsg && groups.map((g) => (
        <div key={g.id ?? g.name} className="card">
          <div style={{ fontWeight: 700 }}>{g.name}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            ID: {g.id ?? '—'} {g.created_at ? `• Created ${new Date(g.created_at).toLocaleString()}` : ''}
          </div>
        </div>
      ))}
    </section>
  );
}
