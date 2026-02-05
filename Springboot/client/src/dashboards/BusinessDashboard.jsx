import React, { useState, useEffect } from 'react';
import { Building, Calendar, CreditCard, BarChart3, Download, Plus, User, Settings, Trash2, Edit, Eye, Award, XCircle, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/datetime-inputs.css';
import DashboardNavbar from '../components/DashboardNavbar';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../contexts/AuthContext';
import { businessAPI, trackingAPI, paymentAPI } from '../utils/api';
import api from '../utils/api';
import MapContainer from '../components/MapContainer';

const BusinessDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pickups, setPickups] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(1000);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalWaste: 0,
    monthlySpend: 0,
    completedPickups: 0,
    ecoPoints: 0
  });

  const [trackingInfo, setTrackingInfo] = useState(null);
  const [showTrackingMap, setShowTrackingMap] = useState(false);
  const [activeTrackingId, setActiveTrackingId] = useState(null);

  const [recentRewards, setRecentRewards] = useState([]);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    businessType: '',
    pickupFrequency: 'WEEKLY'
  });

  const [profileErrors, setProfileErrors] = useState({});

  // Profile validation functions
  const validateProfileField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Business name is required';
        if (value.length < 2 || value.length > 100) return 'Business name must be 2-100 characters';
        return '';
      case 'businessType':
        if (!value.trim()) return 'Business type is required';
        if (!/^[a-zA-Z\s]{2,100}$/.test(value.trim())) return 'Business type must be 2-100 characters, letters and spaces only';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone is required';
        if (!/^[0-9]{10}$/.test(value)) return 'Phone must be exactly 10 digits';
        return '';
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.length > 200) return 'Address must not exceed 200 characters';
        return '';
      case 'city':
        if (!value.trim()) return 'City is required';
        if (!/^[a-zA-Z\s]{2,50}$/.test(value.trim())) return 'City must be 2-50 characters, letters and spaces only';
        return '';
      default:
        return '';
    }
  };

  const validateProfileForm = () => {
    const newErrors = {
      name: validateProfileField('name', profile.name),
      businessType: validateProfileField('businessType', profile.businessType),
      phone: validateProfileField('phone', profile.phone),
      address: validateProfileField('address', profile.address),
      city: validateProfileField('city', profile.city)
    };

    setProfileErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const [scheduleForm, setScheduleForm] = useState({
    wasteType: 'ORGANIC_WASTE',
    pickupFrequency: 'WEEKLY',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
    latitude: 18.5204,
    longitude: 73.8567
  });

  const [editingPickup, setEditingPickup] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [errors, setErrors] = useState({});

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'pickups', label: 'Bulk Pickups', icon: <Calendar size={16} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={16} /> },
    { id: 'rewards', label: 'Rewards', icon: <Award size={16} /> },
    { id: 'reports', label: 'Reports', icon: <Download size={16} /> },
    { id: 'profile', label: 'Profile', icon: <User size={16} /> }
  ];

  const fetchProfile = async () => {
    try {
      const response = await businessAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      setProfile({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        businessType: '',
        pickupFrequency: 'WEEKLY'
      });
    }
  };

  const fetchPickups = async () => {
    try {
      const response = await businessAPI.getPickups();
      setPickups(response.data || []);
      const completed = (response.data || []).filter(p => p.pickupStatus === 'COMPLETED').length;
      setStats(prev => ({ ...prev, completedPickups: completed }));
    } catch (error) {
      setPickups([]);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payment/history');
      setPayments(response.data || []);
      const totalSpend = (response.data || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      setStats(prev => ({ ...prev, monthlySpend: totalSpend }));
    } catch (error) {
      setPayments([]);
    }
  };

  const fetchEcoPoints = async () => {
    try {
      const response = await businessAPI.getEcoPoints();
      setStats(prev => ({
        ...prev,
        ecoPoints: response.data.totalPoints,
        totalWaste: response.data.totalWaste || 0
      }));
      setRecentRewards(response.data.recentRewards);
    } catch (error) {
      setStats(prev => ({ ...prev, ecoPoints: 0 }));
      setRecentRewards([]);
    }
  };

  const fetchTrackingInfo = async (pickupId) => {
    try {
      const response = await trackingAPI.getTracking(pickupId);
      setTrackingInfo(response.data);
    } catch (error) {
      console.error("Failed to fetch tracking info");
      toast.error("Failed to load tracking info. Please try again.");
      setShowTrackingMap(false);
    }
  };

  const handleTrackPickup = (pickupId) => {
    setActiveTrackingId(pickupId);
    fetchTrackingInfo(pickupId);
    setShowTrackingMap(true);
  };

  // Add focus event listener to refresh eco-points when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchEcoPoints();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchPickups();
        fetchProfile();
        fetchPayments();
        fetchEcoPoints();
      } catch (error) {

      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
      // Set up interval to refresh data every 3 seconds
      const interval = setInterval(() => {
        fetchEcoPoints();
        fetchPayments();
        fetchPickups(); // Also refresh pickups for completed status
      }, 3000);

      // Tracking update interval
      const trackingInterval = setInterval(() => {
        if (activeTrackingId) {
          fetchTrackingInfo(activeTrackingId);
        }
      }, 5000);

      return () => {
        clearInterval(interval);
        clearInterval(trackingInterval);
      };
    }
  }, [user, activeTrackingId]);

  // Check if pickup can be modified (pending status and more than 2 hours before scheduled time)
  const canModifyPickup = (pickup) => {
    if (pickup.pickupStatus !== 'PENDING') return false;

    const scheduledDateTime = new Date(`${pickup.scheduledDate}T${pickup.scheduledTime}`);
    const now = new Date();
    const twoHoursBefore = new Date(scheduledDateTime.getTime() - 2 * 60 * 60 * 1000);

    return now < twoHoursBefore;
  };

  const handleEditPickup = (pickup) => {
    setEditingPickup(pickup);
    setScheduleForm({
      wasteType: pickup.wasteType,
      pickupFrequency: pickup.pickupFrequency || 'WEEKLY',
      scheduledDate: pickup.scheduledDate,
      scheduledTime: pickup.scheduledTime,
      notes: pickup.notes || ''
    });
    setShowEditForm(true);
  };

  const handleUpdatePickup = async (e) => {
    e.preventDefault();

    if (!validateScheduleForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    try {
      await businessAPI.updatePickup(editingPickup.pickupId, scheduleForm);
      toast.success('Pickup updated successfully! 🌿');
      setShowEditForm(false);
      setEditingPickup(null);
      setErrors({});
      await fetchPickups();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update pickup';
      toast.error(errorMessage);
    }
  };

  const handleDeletePickup = async (pickupId) => {
    if (!window.confirm('Are you sure you want to delete this pickup?')) return;

    try {
      await businessAPI.deletePickup(pickupId);
      toast.success('Pickup deleted successfully! 🗑️');
      await fetchPickups();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete pickup';
      toast.error(errorMessage);
    }
  };

  const validateScheduleForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(scheduleForm.scheduledDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (!scheduleForm.scheduledDate) {
      newErrors.scheduledDate = 'Date is required';
    } else if (selectedDate < today) {
      newErrors.scheduledDate = 'Cannot schedule pickup for past dates';
    }

    if (!scheduleForm.scheduledTime) {
      newErrors.scheduledTime = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayBill = async (pickupId) => {
    const res = await loadRazorpay();
    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      const response = await paymentAPI.payBill(pickupId);
      const { orderId, amount, currency, keyId } = response.data;

      const options = {
        key: keyId,
        amount: amount.toString(),
        currency: currency,
        name: "BinToBloom",
        description: "Pickup Services",
        order_id: orderId,
        handler: async function (response) {
          try {
            await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success('Payment successful! 💳');
            // Refresh all data after payment
            await Promise.all([
              fetchPickups(),
              fetchPayments(),
              fetchEcoPoints()
            ]);
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone || ''
        },
        theme: {
          color: "#10b981"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      toast.error('Failed to initiate payment');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();

    if (!validateScheduleForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    try {
      const payload = {
        wasteType: scheduleForm.wasteType,
        scheduledDate: scheduleForm.scheduledDate,
        scheduledTime: scheduleForm.scheduledTime,
        pickupFrequency: scheduleForm.pickupFrequency,
        notes: scheduleForm.notes || '',
        latitude: scheduleForm.latitude,
        longitude: scheduleForm.longitude
      };

      await businessAPI.createPickup(payload);
      toast.success('Bulk pickup scheduled successfully! 🌿');
      setScheduleForm({
        wasteType: 'ORGANIC_WASTE',
        pickupFrequency: 'WEEKLY',
        scheduledDate: '',
        scheduledTime: '',
        notes: '',
        latitude: 18.5204,
        longitude: 73.8567
      });
      setShowScheduleForm(false);
      setErrors({});
      await fetchPickups();
      await fetchEcoPoints();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to schedule pickup. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handlePaymentSuccess = async () => {
    await fetchPayments();
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    try {
      await businessAPI.updateProfile(profile);
      toast.success('Profile updated successfully! 🌿');
      setShowProfileForm(false);
      setProfileErrors({});
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const downloadReport = () => {
    const reportContent = `Business Waste Report
Business: ${profile.name}
Business Type: ${profile.businessType}
Total Waste: ${stats.totalWaste} kg
Completed Pickups: ${stats.completedPickups}
Eco Points: ${stats.ecoPoints}
Generated: ${new Date().toLocaleDateString()}`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waste-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully!');
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
          <BarChart3 className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.totalWaste.toFixed(1)} kg</h3>
            <p>Total Waste Managed</p>
          </div>
        </div>
        <div className="stat-card">
          <CreditCard className="stat-icon" />
          <div className="stat-content">
            <h3>₹{stats.monthlySpend.toFixed(0)}</h3>
            <p>Monthly Spend</p>
          </div>
        </div>
        <div className="stat-card">
          <Calendar className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.completedPickups}</h3>
            <p>Completed Pickups</p>
          </div>
        </div>
        <div className="stat-card">
          <BarChart3 className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.ecoPoints}</h3>
            <p>Eco Points Earned</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Recent Eco Rewards</h3>
          <div className="rewards-list">
            {recentRewards.length > 0 ? (
              recentRewards.map((reward, index) => (
                <div key={index} className="reward-item">
                  <h4>{reward.pointsEarned} Points Earned</h4>
                  <p>From {reward.pickupRequest?.wasteType} pickup</p>
                  <small>{new Date(reward.earnedAt).toLocaleDateString()}</small>
                </div>
              ))
            ) : (
              <p style={{ padding: '1rem', color: '#6b7280' }}>No rewards earned yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPickups = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Bulk Pickup Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setScheduleForm({ wasteType: 'ORGANIC_WASTE', pickupFrequency: 'WEEKLY', scheduledDate: '', scheduledTime: '', notes: '' });
            setErrors({});
            setShowScheduleForm(true);
          }}
        >
          <Plus size={16} />
          Schedule Bulk Pickup
        </button>
      </div>

      <div className="pickup-table">
        <div className="table-header">
          <span>Waste Type</span>
          <span>Date & Time</span>
          <span>Status</span>
          <span>Collector</span>
          <span>Actions</span>
        </div>
        {pickups.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            No pickup requests yet. Schedule your first bulk pickup!
          </div>
        ) : (
          pickups.map(pickup => (
            <div key={pickup.pickupId} className="table-row">
              <span data-label="Waste Type" className="waste-type">{pickup.wasteType}</span>
              <span data-label="Date & Time">{pickup.scheduledDate} at {pickup.scheduledTime}</span>
              <span data-label="Status" className={`status status-${pickup.pickupStatus.toLowerCase()}`}>
                {pickup.pickupStatus}
              </span>
              <span data-label="Collector">{pickup.collectorName || '-'}</span>
              <span data-label="Actions" className="actions">
                {pickup.pickupStatus === 'PAYMENT_PENDING' && (
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => handlePayBill(pickup.pickupId)}
                  >
                    Pay Now 💳
                  </button>
                )}
                {/* Tracking Button - Show for active pickups */}
                {['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'PAYMENT_PENDING', 'PAID', 'COMPLETED'].includes(pickup.pickupStatus) && (
                  <button
                    className="btn-icon btn-view"
                    onClick={() => handleTrackPickup(pickup.pickupId)}
                    title={pickup.pickupStatus === 'PENDING' ? "View Location" : "Track Collector"}
                    style={{ color: '#10b981', marginRight: '0.5rem' }}
                  >
                    <MapPin size={16} />
                  </button>
                )}

                {canModifyPickup(pickup) ? (
                  <>
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEditPickup(pickup)}
                      title="Edit pickup"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeletePickup(pickup.pickupId)}
                      title="Delete pickup"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  null
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Billing & Payments</h2>
      </div>

      <div className="dashboard-grid">
        {/* Pending Bills Section */}
        {payments.some(p => p.status === 'PENDING') && (
          <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid #f59e0b' }}>
            <h3 style={{ color: '#d97706' }}>⚠️ Pending Bills</h3>
            <div className="payment-history">
              {payments.filter(p => p.status === 'PENDING').map(payment => (
                <div key={payment.paymentId} className="payment-item">
                  <div className="payment-details">
                    <h4>₹{payment.amount}</h4>
                    <p>Bill for {payment.pickupRequest?.wasteType || 'Pickup'}</p>
                    <p>{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`payment-status status-${payment.status.toLowerCase()}`}>
                      {payment.status}
                    </span>
                    {payment.pickupRequest?.pickupId && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handlePayBill(payment.pickupRequest.pickupId)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Pay Now 💳
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <h3>Payment History</h3>
          <div className="payment-history">
            {payments.filter(p => p.status !== 'PENDING').length === 0 ? (
              <p style={{ padding: '1rem', color: '#6b7280' }}>No completed payments yet</p>
            ) : (
              payments.filter(p => p.status !== 'PENDING').map(payment => (
                <div key={payment.paymentId} className="payment-item">
                  <div className="payment-details">
                    <h4>₹{payment.amount}</h4>
                    <p>{new Date(payment.createdAt).toLocaleDateString()}</p>
                    <p>Razorpay</p>
                  </div>
                  <span className={`payment-status status-${payment.status.toLowerCase()}`}>
                    {payment.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRewards = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Eco Rewards</h2>
        <div className="current-points">
          <Award className="points-icon" />
          <span>{stats.ecoPoints} Points</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Environmental Impact</h3>
          <div className="report-stats">
            <div className="report-stat">
              <h4>Total Waste Managed</h4>
              <p>{stats.totalWaste.toFixed(1)} kg</p>
            </div>
            <div className="report-stat">
              <h4>Eco Points Earned</h4>
              <p>{stats.ecoPoints} points</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Recent Rewards Earned</h3>
          <div className="rewards-list">
            {recentRewards.length > 0 ? (
              recentRewards.map((reward, index) => (
                <div key={index} className="reward-item">
                  <div className="reward-info">
                    <h4>{reward.pointsEarned} Eco Points</h4>
                    <p>Earned from bulk waste collection</p>
                    <small>{new Date(reward.earnedAt).toLocaleDateString()}</small>
                  </div>
                  <Award className="reward-icon" style={{ color: '#10b981' }} />
                </div>
              ))
            ) : (
              <p style={{ padding: '1rem', color: '#6b7280' }}>No rewards records found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Reports & Analytics</h2>
        <button className="btn btn-primary" onClick={downloadReport}>
          <Download size={16} />
          Download Report
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Monthly Summary</h3>
          <div className="report-stats">
            <div className="report-stat">
              <h4>Waste Collected</h4>
              <p>{stats.totalWaste.toFixed(1)} kg</p>
            </div>
            <div className="report-stat">
              <h4>Carbon Saved</h4>
              <p>{(stats.totalWaste * 0.5).toFixed(1)} kg CO₂</p>
            </div>
            <div className="report-stat">
              <h4>Total Spend</h4>
              <p>₹{stats.monthlySpend.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Business Profile</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            fetchProfile();
            setShowProfileForm(true);
          }}
        >
          <Edit size={16} />
          Update Profile
        </button>
      </div>

      <div className="profile-info">
        <div className="profile-card">
          <div className="profile-avatar">
            <Building size={40} />
          </div>
          <div className="profile-details">
            <h3>{profile.name || 'N/A'}</h3>
            <p>{profile.businessType || 'N/A'}</p>
            <p>{profile.email || 'N/A'}</p>
            <p>{profile.phone || 'N/A'}</p>
            <p>{profile.address || 'N/A'}, {profile.city || 'N/A'}</p>
            <p>Pickup Frequency: {profile.pickupFrequency}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'pickups':
        return renderPickups();
      case 'billing':
        return renderBilling();
      case 'rewards':
        return renderRewards();
      case 'reports':
        return renderReports();
      case 'profile':
        return renderProfile();
      default:
        return renderOverview();
    }
  };

  return (
    <>
      <div className="dashboard">
        <DashboardNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
        />

        <div className="dashboard-content">
          {renderTabContent()}
        </div>
      </div>

      {(showScheduleForm || showEditForm) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowScheduleForm(false);
              setShowEditForm(false);
              setEditingPickup(null);
              setErrors({});
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{showEditForm ? 'Edit Bulk Pickup' : 'Schedule Bulk Pickup'}</h3>
            <form onSubmit={showEditForm ? handleUpdatePickup : handleScheduleSubmit}>
              <div className="form-group">
                <label>Waste Type *</label>
                <select
                  value={scheduleForm.wasteType}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, wasteType: e.target.value })}
                  required
                >
                  <option value="ORGANIC_WASTE">🌱 Organic Waste</option>
                  <option value="RECYCLABLE_WASTE">♻️ Recyclable Waste</option>
                  <option value="E_WASTE">📱 E-Waste</option>
                  <option value="CHEMICAL_WASTE">⚗️ Chemical Waste</option>
                  <option value="HAZARDOUS_WASTE">⚠️ Hazardous Waste</option>
                  <option value="CONSTRUCTION_WASTE">🏗️ Construction/Industrial Waste</option>
                  <option value="NON_RECYCLABLE_COMMERCIAL">🗑️ Non-Recyclable Commercial Waste</option>
                </select>
              </div>
              <div className="form-group">
                <label>Pickup Frequency *</label>
                <select
                  value={scheduleForm.pickupFrequency}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, pickupFrequency: e.target.value })}
                  required
                >
                  <option value="DAILY">📅 Daily</option>
                  <option value="WEEKLY">📅 Weekly</option>
                  <option value="MONTHLY">📅 Monthly</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date *</label>
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    id="business-schedule-date"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => {
                      setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value });
                      setErrors({ ...errors, scheduledDate: '' });
                    }}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="date-time-input"
                  />
                  <button
                    type="button"
                    className="date-time-icon-btn"
                    onClick={() => document.getElementById('business-schedule-date')?.showPicker?.() || document.getElementById('business-schedule-date')?.click()}
                    aria-label="Open date picker"
                  >
                    <Calendar size={20} />
                  </button>
                </div>
                {errors.scheduledDate && <span className="error-text">{errors.scheduledDate}</span>}
              </div>
              <div className="form-group">
                <label>Preferred Time *</label>
                <div className="time-input-wrapper">
                  <input
                    type="time"
                    id="business-schedule-time"
                    value={scheduleForm.scheduledTime}
                    onChange={(e) => {
                      setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value });
                      setErrors({ ...errors, scheduledTime: '' });
                    }}
                    required
                    className="date-time-input"
                  />
                  <button
                    type="button"
                    className="date-time-icon-btn"
                    onClick={() => document.getElementById('business-schedule-time')?.showPicker?.() || document.getElementById('business-schedule-time')?.click()}
                    aria-label="Open time picker"
                  >
                    <Clock size={20} />
                  </button>
                </div>
                {errors.scheduledTime && <span className="error-text">{errors.scheduledTime}</span>}
              </div>
              <div className="form-group">
                <label>Pickup Location *</label>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Click on the map to set your pickup location
                </p>
                <MapContainer
                  apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                  center={{ lat: scheduleForm.latitude, lng: scheduleForm.longitude }}
                  onLocationSelect={(pos) => setScheduleForm(prev => ({ ...prev, latitude: pos.lat, longitude: pos.lng }))}
                />
              </div>
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  placeholder="Any special instructions..."
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleForm(false);
                    setShowEditForm(false);
                    setEditingPickup(null);
                    setErrors({});
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {showEditForm ? 'Update Pickup' : 'Schedule Pickup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTrackingMap && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowTrackingMap(false);
            setActiveTrackingId(null);
            setTrackingInfo(null);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Live Bulk Pickup Tracking</h3>
              <button onClick={() => setShowTrackingMap(false)} className="btn-icon">
                <XCircle size={24} />
              </button>
            </div>

            {trackingInfo ? (
              <div className="tracking-display">
                <div className="tracking-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="stat-card" style={{ padding: '1rem', background: '#f8fafc' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Status</p>
                    <p style={{ fontWeight: 'bold' }}>{trackingInfo.status}</p>
                  </div>
                  <div className="stat-card" style={{ padding: '1rem', background: '#f8fafc' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Collector</p>
                    <p style={{ fontWeight: 'bold' }}>{trackingInfo.collectorName || 'Assigning...'}</p>
                  </div>
                  {trackingInfo.collectorPhone && (
                    <div className="stat-card" style={{ padding: '1rem', background: '#f8fafc' }}>
                      <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Contact</p>
                      <p style={{ fontWeight: 'bold' }}>{trackingInfo.collectorPhone}</p>
                    </div>
                  )}
                </div>

                <MapContainer
                  center={trackingInfo.pickupLocation}
                  markers={[
                    {
                      position: trackingInfo.pickupLocation,
                      label: "Business Location",
                      details: "Pickup point for bulk waste"
                    },
                    trackingInfo.collectorLocation ? {
                      position: trackingInfo.collectorLocation,
                      label: "Collector",
                      details: `${trackingInfo.collectorName} is on the way`,
                      icon: "https://maps.google.com/mapfiles/ms/icons/truck.png"
                    } : null
                  ].filter(Boolean)}
                  trackingCollector={true}
                />
              </div>
            ) : (
              <div className="loading">Fetching tracking information...</div>
            )}
          </div>
        </div>
      )}

      {showTrackingMap && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowTrackingMap(false);
            setActiveTrackingId(null);
            setTrackingInfo(null);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Live Bulk Pickup Tracking</h3>
              <button onClick={() => setShowTrackingMap(false)} className="btn-icon">
                <XCircle size={24} />
              </button>
            </div>

            {trackingInfo ? (
              <div className="tracking-display">
                <div className="tracking-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="stat-card" style={{ padding: '1rem', background: '#f8fafc' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Status</p>
                    <p style={{ fontWeight: 'bold' }}>{trackingInfo.status}</p>
                  </div>
                  <div className="stat-card" style={{ padding: '1rem', background: '#f8fafc' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Collector</p>
                    <p style={{ fontWeight: 'bold' }}>{trackingInfo.collectorName || 'Assigning...'}</p>
                  </div>
                  {trackingInfo.collectorPhone && (
                    <div className="stat-card" style={{ padding: '1rem', background: '#f8fafc' }}>
                      <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Contact</p>
                      <p style={{ fontWeight: 'bold' }}>{trackingInfo.collectorPhone}</p>
                    </div>
                  )}
                </div>

                <MapContainer
                  center={trackingInfo.pickupLocation}
                  markers={[
                    {
                      position: trackingInfo.pickupLocation,
                      label: "Business Location",
                      details: "Pickup point for bulk waste"
                    },
                    trackingInfo.collectorLocation ? {
                      position: trackingInfo.collectorLocation,
                      label: "Collector",
                      details: `${trackingInfo.collectorName} is on the way`,
                      icon: "https://maps.google.com/mapfiles/ms/icons/truck.png"
                    } : null
                  ].filter(Boolean)}
                  trackingCollector={true}
                />
              </div>
            ) : (
              <div className="loading">Fetching tracking information...</div>
            )}
          </div>
        </div>
      )}

      {showProfileForm && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowProfileForm(false);
          }
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Business Profile</h3>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Business Name *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => {
                    setProfile({ ...profile, name: e.target.value });
                    if (profileErrors.name) setProfileErrors({ ...profileErrors, name: '' });
                  }}
                  onBlur={(e) => setProfileErrors({ ...profileErrors, name: validateProfileField('name', e.target.value) })}
                  className={profileErrors.name ? 'error' : ''}
                  required
                />
                {profileErrors.name && <span className="error-text">{profileErrors.name}</span>}
              </div>
              <div className="form-group">
                <label>Business Type *</label>
                <input
                  type="text"
                  value={profile.businessType}
                  onChange={(e) => {
                    setProfile({ ...profile, businessType: e.target.value });
                    if (profileErrors.businessType) setProfileErrors({ ...profileErrors, businessType: '' });
                  }}
                  onBlur={(e) => setProfileErrors({ ...profileErrors, businessType: validateProfileField('businessType', e.target.value) })}
                  className={profileErrors.businessType ? 'error' : ''}
                  required
                  placeholder="Restaurant, Hotel, Office, etc."
                />
                {profileErrors.businessType && <span className="error-text">{profileErrors.businessType}</span>}
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => {
                    setProfile({ ...profile, phone: e.target.value });
                    if (profileErrors.phone) setProfileErrors({ ...profileErrors, phone: '' });
                  }}
                  onBlur={(e) => setProfileErrors({ ...profileErrors, phone: validateProfileField('phone', e.target.value) })}
                  className={profileErrors.phone ? 'error' : ''}
                  required
                />
                {profileErrors.phone && <span className="error-text">{profileErrors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Address *</label>
                <textarea
                  value={profile.address}
                  onChange={(e) => {
                    setProfile({ ...profile, address: e.target.value });
                    if (profileErrors.address) setProfileErrors({ ...profileErrors, address: '' });
                  }}
                  onBlur={(e) => setProfileErrors({ ...profileErrors, address: validateProfileField('address', e.target.value) })}
                  className={profileErrors.address ? 'error' : ''}
                  required
                  rows="3"
                />
                {profileErrors.address && <span className="error-text">{profileErrors.address}</span>}
              </div>
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => {
                    setProfile({ ...profile, city: e.target.value });
                    if (profileErrors.city) setProfileErrors({ ...profileErrors, city: '' });
                  }}
                  onBlur={(e) => setProfileErrors({ ...profileErrors, city: validateProfileField('city', e.target.value) })}
                  className={profileErrors.city ? 'error' : ''}
                  required
                />
                {profileErrors.city && <span className="error-text">{profileErrors.city}</span>}
              </div>
              <div className="form-group">
                <label>Pickup Frequency *</label>
                <select
                  value={profile.pickupFrequency}
                  onChange={(e) => setProfile({ ...profile, pickupFrequency: e.target.value })}
                  required
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowProfileForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={paymentAmount}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default BusinessDashboard;