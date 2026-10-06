import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import ResumeAnalysis from './pages/ResumeAnalysis';
import History from './pages/History';
import Profile from './pages/Profile';
import ResumeBuilder from './pages/ResumeBuilder';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Loader from './components/Loader';

const ProtectedLayout = ({ children, fullWidth = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen max-h-screen bg-darkBg text-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Navbar />
        <main className={`flex-1 min-h-0 ${fullWidth ? 'p-0 overflow-hidden flex flex-col' : 'overflow-y-auto p-4 md:p-8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/builder" element={<ProtectedLayout fullWidth><ResumeBuilder /></ProtectedLayout>} />
          <Route path="/builder/:id" element={<ProtectedLayout fullWidth><ResumeBuilder /></ProtectedLayout>} />
          <Route path="/analysis/:id" element={<ProtectedLayout><ResumeAnalysis /></ProtectedLayout>} />
          <Route path="/history" element={<ProtectedLayout><History /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#131B2E',
            color: '#F1F5F9',
            border: '1px solid #1E293B'
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
