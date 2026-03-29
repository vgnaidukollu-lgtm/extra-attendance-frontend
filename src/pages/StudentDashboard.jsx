import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const emptyForm = {
  universityId: '',
  date: new Date().toISOString().slice(0, 10),
  hours: '1',
  reasonForAbsent: '',
  subjectCode: '',
};

export default function StudentDashboard() {
  const { logout, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.studentMine();
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

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const hours = parseInt(form.hours, 10);
    if (!Number.isFinite(hours) || hours < 1) {
      setError('Hours must be a whole number of at least 1.');
      return;
    }
    try {
      await api.studentCreate({
        universityId: form.universityId.trim(),
        date: form.date,
        hours,
        reasonForAbsent: form.reasonForAbsent.trim(),
        subjectCode: form.subjectCode.trim(),
      });
      setMessage('Entry saved.');
      setForm({ ...emptyForm, date: form.date });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="layout">
      <header className="topbar">
        <div>
          <h1>My attendance</h1>
          <p className="muted small">Signed in as {user?.username}</p>
        </div>
        <button type="button" className="btn ghost" onClick={logout}>
          Log out
        </button>
      </header>

      <div className="card">
        <h2>Add entry</h2>
        <form onSubmit={submit} className="form grid-form">
          {message && <div className="alert ok">{message}</div>}
          {error && <div className="alert error">{error}</div>}
          <label>
            University ID
            <input
              value={form.universityId}
              onChange={(e) => setForm({ ...form, universityId: e.target.value })}
              required
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </label>
          <label>
            Hours (whole number)
            <input
              type="number"
              step="1"
              min="1"
              inputMode="numeric"
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: e.target.value })}
              required
            />
          </label>
          <label>
            Subject code
            <input
              value={form.subjectCode}
              onChange={(e) => setForm({ ...form, subjectCode: e.target.value })}
              required
            />
          </label>
          <label className="full">
            Reason for absent
            <textarea
              rows={3}
              value={form.reasonForAbsent}
              onChange={(e) => setForm({ ...form, reasonForAbsent: e.target.value })}
              required
            />
          </label>
          <div className="full">
            <button type="submit" className="btn primary">
              Save entry
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Your entries</h2>
          <button type="button" className="btn secondary" disabled={loading} onClick={() => load()}>
            Refresh
          </button>
        </div>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="muted">No entries yet.</p>
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
