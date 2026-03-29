import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function Protected({ role, children }) {
  const { user } = useAuth();
  if (!user?.token) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/student" replace /> : <Register />} />
      <Route
        path="/student"
        element={
          <Protected role="STUDENT">
            <StudentDashboard />
          </Protected>
        }
      />
      <Route
        path="/admin"
        element={
          <Protected role="ADMIN">
            <AdminDashboard />
          </Protected>
        }
      />
      <Route path="/" element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/student') : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
