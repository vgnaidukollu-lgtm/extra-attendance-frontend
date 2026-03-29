function resolveApiBase() {
  const v = import.meta.env.VITE_API_URL;
  if (v != null && String(v).trim() !== '') {
    return String(v).replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return '';
  }
  return '';
}

const base = resolveApiBase();

export function getToken() {
  return localStorage.getItem('token');
}

export function setAuth({ token, username, role }) {
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
  localStorage.setItem('role', role);
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
}

export function getStoredUser() {
  const token = getToken();
  if (!token) return null;
  return {
    token,
    username: localStorage.getItem('username') || '',
    role: localStorage.getItem('role') || 'STUDENT',
  };
}

async function request(path, options = {}) {
  const headers = { ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  const res = await fetch(`${base}${path}`, { ...options, headers });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    if (
      res.status === 401 &&
      !path.includes('/api/auth/login') &&
      !path.includes('/api/auth/register')
    ) {
      clearAuth();
      window.dispatchEvent(new Event('attendance:session-expired'));
    }
    const msg = typeof data === 'object' && data?.error ? data.error : res.statusText;
    throw new Error(msg || 'Request failed');
  }
  return data;
}

export const api = {
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  studentCreate: (body) => request('/api/student/attendance', { method: 'POST', body }),
  studentMine: () => request('/api/student/attendance/mine'),
  adminAll: () => request('/api/admin/attendance'),
  async downloadExport(kind) {
    const token = getToken();
    const url = `${base}/api/admin/attendance/export/${kind}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      if (res.status === 401) {
        clearAuth();
        window.dispatchEvent(new Event('attendance:session-expired'));
      }
      const t = await res.text();
      let err = t;
      try {
        const j = JSON.parse(t);
        err = j.error || t;
      } catch {
        /* ignore */
      }
      throw new Error(err || 'Download failed');
    }
    return res.blob();
  },
};
