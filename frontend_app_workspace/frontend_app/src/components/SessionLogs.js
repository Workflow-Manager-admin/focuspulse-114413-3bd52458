import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// PUBLIC_INTERFACE
/**
 * SessionLogs: Displays previously logged Pomodoro sessions for the user.
 * Props:
 *   - user: supabase user object.
 *   - refresh: boolean; when changed, will reload logs (to allow manual or event-driven refresh).
 */
export default function SessionLogs({ user, refresh }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLogs([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(15);
      if (!cancelled) {
        setLogs(data || []);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user, refresh]);

  if (!user) {
    return <div className="logs-box">Sign in to see session logs.</div>;
  }

  return (
    <div className="logs-box">
      <h3>Recent Sessions</h3>
      {loading ? <div>Loading...</div> :
        (logs.length === 0
          ? <div>No sessions yet.</div>
          : <ul className="logs-list">
              {logs.map(log =>
                <li key={log.id || log.timestamp}>
                  <span className="log-date">{(new Date(log.timestamp)).toLocaleString()}</span>{" — "}
                  Focus: {log.focus}m, Break: {log.break}m
                </li>
              )}
            </ul>
        )
      }
    </div>
  )
}
