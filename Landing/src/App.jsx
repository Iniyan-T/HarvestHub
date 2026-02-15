import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      Loading...
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Role-based Dashboard Redirect
const DashboardRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Get token from localStorage
  const token = localStorage.getItem('token');

  if (user.role === 'farmer') {
    // Redirect to farmer dashboard with user ID in URL path
    // Format: http://localhost:5173/{userId}?token=xxx
    const params = new URLSearchParams({
      token: token || '',
      userName: user.name || '',
      userEmail: user.email || ''
    });
    window.location.href = `http://localhost:5173/${user.id}?${params.toString()}`;
    return null;
  }

  if (user.role === 'buyer') {
    // Redirect to buyer dashboard with user ID in URL path
    const params = new URLSearchParams({
      token: token || '',
      userName: user.name || '',
      userEmail: user.email || ''
    });
    window.location.href = `http://localhost:3001/${user.id}?${params.toString()}`;
    return null;
  }

  return <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
