import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RealTimeProvider } from './contexts/RealTimeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailReply from './pages/EmailReply';
import HouseholdDashboard from './dashboards/HouseholdDashboard';
import BusinessDashboard from './dashboards/BusinessDashboard';
import CollectorDashboard from './dashboards/CollectorDashboard';
import NGODashboard from './dashboards/NGODashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  // Check localStorage as fallback while loading
  const checkLocalStorage = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  };

  if (loading) {
    // While loading, check localStorage
    const storedUser = checkLocalStorage();
    if (storedUser) {
      // User exists in localStorage, allow access (will be verified by AuthContext)
      return children;
    }
    return <div>Loading...</div>;
  }

  // If no user in context, check localStorage before redirecting
  if (!user) {
    const storedUser = checkLocalStorage();
    if (storedUser) {
      // User exists in localStorage, allow access
      return children;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const DashboardRouter = () => {
  const { user, loading } = useAuth();
  
  // Check localStorage as fallback
  const getStoredUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  };

  if (loading) {
    const storedUser = getStoredUser();
    if (storedUser) {
      // Use stored user while loading
      const role = storedUser.role;
      switch (role) {
        case 'HOUSEHOLD':
          return <HouseholdDashboard />;
        case 'BUSINESS':
          return <BusinessDashboard />;
        case 'COLLECTOR':
          return <CollectorDashboard />;
        case 'NGO':
          return <NGODashboard />;
        case 'ADMIN':
          return <AdminDashboard />;
        default:
          return <Navigate to="/" replace />;
      }
    }
    return <div>Loading...</div>;
  }
  
  if (!user) {
    const storedUser = getStoredUser();
    if (storedUser) {
      // Use stored user if context doesn't have it yet
      const role = storedUser.role;
      switch (role) {
        case 'HOUSEHOLD':
          return <HouseholdDashboard />;
        case 'BUSINESS':
          return <BusinessDashboard />;
        case 'COLLECTOR':
          return <CollectorDashboard />;
        case 'NGO':
          return <NGODashboard />;
        case 'ADMIN':
          return <AdminDashboard />;
        default:
          return <Navigate to="/" replace />;
      }
    }
    return <Navigate to="/login" replace />;
  }
  
  switch (user.role) {
    case 'HOUSEHOLD':
      return <HouseholdDashboard />;
    case 'BUSINESS':
      return <BusinessDashboard />;
    case 'COLLECTOR':
      return <CollectorDashboard />;
    case 'NGO':
      return <NGODashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
};

const PublicLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
};

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      {children}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <RealTimeProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <DashboardRouter />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <DashboardLayout>
                      <AdminDashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/email-reply/:messageId" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <DashboardLayout>
                      <EmailReply />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </RealTimeProvider>
    </AuthProvider>
  );
}

export default App;