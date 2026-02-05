import React, { useState, useEffect } from 'react';
import { Users, UserCheck, AlertTriangle, Settings, BarChart3, Shield, User, FileText, Plus, Edit, Trash2, CheckCircle, X, Download, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardNavbar from '../components/DashboardNavbar';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../utils/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [allUsers, setAllUsers] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [systemReport, setSystemReport] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalCollectors: 0,
    totalNGOs: 0,
    pendingPickups: 0,
    completedPickups: 0,
    totalWasteCollected: 0
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'users', label: 'User Management', icon: <Users size={16} /> },
    { id: 'pickups', label: 'Pickup Management', icon: <Shield size={16} /> },
    { id: 'messages', label: 'Messages', icon: <MessageCircle size={16} /> },
    { id: 'reports', label: 'System Reports', icon: <FileText size={16} /> }
  ];

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      const data = response.data;
      console.log('Dashboard data:', data); // Debug log
      setSystemStats({
        totalUsers: data.totalUsers || 0,
        totalCollectors: data.totalCollectors || 0,
        totalNGOs: data.totalNGOs || 0,
        pendingPickups: data.pendingPickups || 0,
        completedPickups: data.completedPickups || 0,
        totalWasteCollected: data.totalWasteCollected || 0
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setSystemStats({
        totalUsers: 0,
        totalCollectors: 0,
        totalNGOs: 0,
        pendingPickups: 0,
        completedPickups: 0,
        totalWasteCollected: 0
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setAllUsers(response.data || []);
    } catch (error) {
      setAllUsers([]);
    }
  };

  const fetchPickups = async () => {
    try {
      const response = await adminAPI.getAllPickups();
      setPickups(response.data || []);
    } catch (error) {
      setPickups([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (user && user.role === 'ADMIN') {
        setLoading(true);
        try {
          await Promise.all([fetchDashboard(), fetchUsers(), fetchPickups()]);
        } catch (error) {
          // Handle errors silently
        }
        setLoading(false);
      }
    };
    
    loadData();
    
    // Set up real-time refresh every 5 seconds
    const interval = setInterval(() => {
      if (user && user.role === 'ADMIN') {
        fetchDashboard();
        fetchPickups();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [user]);

  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      const response = await adminAPI.getAllMessages();
      setMessages(response.data || []);
    } catch (error) {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages' && user && user.role === 'ADMIN') {
      fetchMessages();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === 'reports' && user) {
      const carbonSaved = systemStats.totalWasteCollected * 0.5; // 0.5 kg CO2 per kg waste
      setSystemReport({
        reportDate: new Date().toISOString(),
        totalUsers: systemStats.totalUsers,
        totalPickups: pickups.length,
        completedPickups: systemStats.completedPickups,
        totalWasteCollected: systemStats.totalWasteCollected,
        totalCarbonSaved: carbonSaved,
        usersByRole: {
          HOUSEHOLD: allUsers.filter(u => u.role === 'HOUSEHOLD').length,
          BUSINESS: allUsers.filter(u => u.role === 'BUSINESS').length,
          COLLECTOR: allUsers.filter(u => u.role === 'COLLECTOR').length,
          NGO: allUsers.filter(u => u.role === 'NGO').length,
          ADMIN: allUsers.filter(u => u.role === 'ADMIN').length
        },
        wasteByType: {
          BIODEGRADABLE: 0,
          NON_BIODEGRADABLE: 0,
          ORGANIC_WASTE: 0
        }
      });
    }
  }, [activeTab, user, systemStats, allUsers, pickups]);

  const handleUserStatusUpdate = async (userId, status) => {
    try {
      await adminAPI.updateUserStatus(userId, status);
      toast.success(`User status updated to ${status}!`);
      await fetchUsers();
      await fetchDashboard();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const downloadSystemReport = () => {
    if (!systemReport) {
      toast.error('No report data available');
      return;
    }

    const content = `BinToBloom System Report
Generated: ${new Date(systemReport.reportDate).toLocaleDateString()}

Statistics:
- Total Users: ${systemReport.totalUsers}
- Total Pickups: ${systemReport.totalPickups}
- Completed Pickups: ${systemReport.completedPickups}
- Total Waste Collected: ${systemReport.totalWasteCollected} kg
- Total Carbon Saved: ${systemReport.totalCarbonSaved} kg CO₂

Users by Role:
${Object.entries(systemReport.usersByRole || {}).map(([role, count]) => `  ${role}: ${count}`).join('\n')}

Waste by Type:
${Object.entries(systemReport.wasteByType || {}).map(([type, weight]) => `  ${type}: ${weight} kg`).join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('System report downloaded!');
  };

  if (loading) {
    return (
      <div className="dashboard">
        <DashboardNavbar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="tab-content">
      <div className="stats-grid">
        <div className="stat-card">
          <Users className="stat-icon" />
          <div className="stat-content">
            <h3>{systemStats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <Shield className="stat-icon" />
          <div className="stat-content">
            <h3>{systemStats.totalCollectors}</h3>
            <p>Collectors</p>
          </div>
        </div>
        <div className="stat-card">
          <User className="stat-icon" />
          <div className="stat-content">
            <h3>{systemStats.totalNGOs}</h3>
            <p>NGOs</p>
          </div>
        </div>
        <div className="stat-card">
          <AlertTriangle className="stat-icon" />
          <div className="stat-content">
            <h3>{systemStats.pendingPickups}</h3>
            <p>Pending Pickups</p>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle className="stat-icon" />
          <div className="stat-content">
            <h3>{systemStats.completedPickups}</h3>
            <p>Completed Pickups</p>
          </div>
        </div>
        <div className="stat-card">
          <BarChart3 className="stat-icon" />
          <div className="stat-content">
            <h3>{systemStats.totalWasteCollected.toFixed(1)} kg</h3>
            <p>Total Waste Collected</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>User Management</h2>
      </div>
      
      <div className="approval-list">
        {allUsers.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No users found</p>
        ) : (
          allUsers.map(userItem => (
            <div key={userItem.userId} className="approval-item">
              <div className="user-info">
                <h4>{userItem.name}</h4>
                <p>{userItem.email}</p>
                <span className={`role-badge ${userItem.role.toLowerCase()}`}>
                  {userItem.role}
                </span>
                <span className="city">{userItem.city}</span>
              </div>
              <div className="approval-actions">
                <span className={`status status-${userItem.status.toLowerCase()}`}>
                  {userItem.status}
                </span>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleUserStatusUpdate(
                    userItem.userId,
                    userItem.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                  )}
                >
                  {userItem.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderPickups = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Pickup Management</h2>
      </div>
      
      <div className="pickup-list">
        {pickups.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No pickups found</p>
        ) : (
          pickups.map(pickup => (
            <div key={pickup.pickupId} className="pickup-item">
              <div className="pickup-info">
                <h4>{pickup.user?.name || 'Unknown User'}</h4>
                <p>{pickup.wasteType}</p>
                <span className="pickup-date">
                  {pickup.scheduledDate} at {pickup.scheduledTime}
                </span>
              </div>
              <div className="pickup-status">
                <span className={`status status-${pickup.pickupStatus?.toLowerCase()}`}>
                  {pickup.pickupStatus}
                </span>
                {pickup.collector && (
                  <span className="collector-name">
                    Collector: {pickup.collector.name}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Contact Messages</h2>
      </div>
      
      <div className="messages-list">
        {messages.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No messages found</p>
        ) : (
          messages.map(message => (
            <div key={message.id} className="message-item">
              <div className="message-header">
                <h4>{message.name}</h4>
                <span className="message-email">{message.email}</span>
                <span className={`message-status status-${message.status?.toLowerCase()}`}>
                  {message.status}
                </span>
              </div>
              <div className="message-content">
                <h5>{message.subject}</h5>
                <p>{message.message}</p>
                <span className="message-date">
                  {new Date(message.createdAt).toLocaleDateString()}
                </span>
                <div className="message-actions">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate(`/email-reply/${message.messageId}`)}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>System Reports</h2>
        <button className="btn btn-primary" onClick={downloadSystemReport}>
          <Download size={16} />
          Download Report
        </button>
      </div>
      
      {systemReport && (
        <div className="report-content">
          <div className="report-section">
            <h3>System Statistics</h3>
            <div className="report-stats">
              <div className="report-stat">
                <span>Total Users:</span>
                <strong>{systemReport.totalUsers}</strong>
              </div>
              <div className="report-stat">
                <span>Total Pickups:</span>
                <strong>{systemReport.totalPickups}</strong>
              </div>
              <div className="report-stat">
                <span>Waste Collected:</span>
                <strong>{systemReport.totalWasteCollected.toFixed(1)} kg</strong>
              </div>
              <div className="report-stat">
                <span>Carbon Saved:</span>
                <strong>{systemReport.totalCarbonSaved.toFixed(1)} kg CO₂</strong>
              </div>
            </div>
          </div>
          
          <div className="report-section">
            <h3>Users by Role</h3>
            <div className="role-breakdown">
              {Object.entries(systemReport.usersByRole || {}).map(([role, count]) => (
                <div key={role} className="role-item">
                  <span>{role}:</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'pickups':
        return renderPickups();
      case 'messages':
        return renderMessages();
      case 'reports':
        return renderReports();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="dashboard">
      <DashboardNavbar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;