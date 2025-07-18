import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  
} from "react-router-dom";
// Outlet,
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Interviews from "./pages/Interviews";
import CreateInterview from "./pages/CreateInterview";
import InterviewDetail from "./pages/InterviewDetail";
import InterviewDetails from './pages/InterviewDetails';//working
import SendInvites from "./pages/SendInvites";
import InterviewToken from "./pages/InterviewToken";
import Signup from './components/Signup';
import Login from './components/Login';
import { auth } from "./firebase";

import "./App.css";

function RequireAuth({ children }) {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('firebase_id_token');
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppLayout({ onLogout }) {
  return (
    <div className="app-layout">
      <Sidebar onLogout={onLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard onLogout={onLogout} />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/create" element={<CreateInterview />} />
          <Route path="/interviews/:id" element={<InterviewDetail />} />
          <Route path="/interview/:id/details" element={<InterviewDetails />} />
          <Route path="/send-invites/:interviewId" element={<SendInvites />} />
          {/* Catch-all route for unknown paths */}
          <Route path="*" element={<div className="p-6 text-center text-red-600">404 - Page Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('firebase_id_token'));

  useEffect(() => {
    const handler = () => setIsAuthenticated(!!localStorage.getItem('firebase_id_token'));
    window.addEventListener('storage', handler);
    // --- Token refresh interval ---
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const newToken = await user.getIdToken(true); // force refresh
          localStorage.setItem('firebase_id_token', newToken);
        } catch (err) {
          // If refresh fails, log out user
          localStorage.removeItem('firebase_id_token');
          setIsAuthenticated(false);
        }
      }
    }, 10 * 60 * 1000); // every 10 minutes
    return () => {
      window.removeEventListener('storage', handler);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('firebase_id_token');
    setIsAuthenticated(false);
    window.location.replace('/login');
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <Login
              onLoginSuccess={(_uid, _email, token) => {
                localStorage.setItem('firebase_id_token', token);
                setIsAuthenticated(true);
                window.location.replace('/dashboard');
              }}
              onToggleView={() => window.location.replace('/signup')}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <Signup
              onSignupSuccess={() => {
                window.location.replace('/login');
              }}
              onToggleView={() => window.location.replace('/login')}
            />
          }
        />

        {/* Candidate Interview Route (NO sidebar) */}
        <Route path="/interview/:token" element={<InterviewToken />} />

        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* All protected routes nested in AppLayout */}
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AppLayout onLogout={handleLogout} />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}
