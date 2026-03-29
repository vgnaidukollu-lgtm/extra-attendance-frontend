import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [dlBusy, setDlBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.adminAll();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const download = async (kind) => {
    setDlBusy(kind);
    setError('');
    try {
      const blob = await api.downloadExport(kind);
      const name = kind === 'csv' ? 'attendance.csv' : 'attendance.xlsx';
      triggerDownload(blob, name);
    } catch (e) {
      setError(e.message);
    } finally {
      setDlBusy(null);
    }
  };

  return (
    <div className="layout">
      <header className="topbar">
        <div>
          <h1>Admin — all attendance</h1>
          <p className="muted small">Signed in as {user?.username}</p>
        </div>
        <div className="actions">
          <button type="button" className="btn secondary" disabled={loading} onClick={() => load()}>
            Refresh
          </button>
          <button
            type="button"
            className="btn secondary"
            disabled={dlBusy === 'csv'}
            onClick={() => download('csv')}
          >
            {dlBusy === 'csv' ? 'Preparing…' : 'Download CSV'}
          </button>
          <button
            type="button"
            className="btn secondary"
            disabled={dlBusy === 'excel'}
            onClick={() => download('excel')}
          >
            {dlBusy === 'excel' ? 'Preparing…' : 'Download Excel'}
          </button>
          <button type="button" className="btn ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <div className="card">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="muted">No entries in the system.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>University ID</th>
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Subject</th>
                  <th>Reason for absent</th>
                  <th>Entered by</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.sNo}>
                    <td>{r.sNo}</td>
                    <td>{r.universityId}</td>
                    <td>{r.date}</td>
                    <td>{r.hours}</td>
                    <td>{r.subjectCode}</td>
                    <td>{r.reasonForAbsent}</td>
                    <td>{r.enteredByUsername}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
