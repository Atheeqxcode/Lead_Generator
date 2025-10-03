// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';

// --- TESTING NOTES ---
// To test:
// 1. Seed admin user: In the `server` directory, run `npm run seed-admin`.
//    (Ensure SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are set in `server/.env`)
// 2. Login as the admin user.
// 3. Add at least 5 agents via the "Add Agent" page.
// 4. Upload a sample CSV file with columns: FirstName,Phone,Notes.
// 5. Confirm the Dashboard shows the assigned leads distributed among the agents.

// Lazy load page components for better performance.
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AddAgent = lazy(() => import('./pages/AddAgent'));
const Upload = lazy(() => import('./pages/Upload'));

/**
 * A wrapper component that protects routes requiring authentication.
 * If the user is not authenticated (i.e., no token in localStorage),
 * it redirects them to the /login page.
 */
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app-container">
      {isAuthenticated && (
        <nav className="top-nav">
          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/add-agent">Add Agent</Link>
            <Link to="/upload">Upload Leads</Link>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </nav>
      )}
      <main className="main-content">
        <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-agent"
              element={
                <PrivateRoute>
                  <AddAgent />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <Upload />
                </PrivateRoute>
              }
            />
            {/* Default route redirects to dashboard if logged in, otherwise to login */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
