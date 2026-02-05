import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Award, TrendingUp, Plus, Clock, CheckCircle, User, Settings, BarChart3, Trash2, Edit, Eye, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/datetime-inputs.css';
import DashboardNavbar from '../components/DashboardNavbar';
import { useAuth } from '../contexts/AuthContext';
import { pickupAPI, leaderboardAPI, userAPI, householdAPI, trackingAPI, paymentAPI } from '../utils/api';
import MapContainer from '../components/MapContainer';

const HouseholdDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [pickupRequests, setPickupRequests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalWaste: 0,
    ecoPoints: 0,
    rank: 0,
    completedPickups: 0
  });

  const [recentRewards, setRecentRewards] = useState([]);

  const [scheduleForm, setScheduleForm] = useState({
    wasteType: 'BIODEGRADABLE',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
    latitude: 18.5204,
    longitude: 73.8567
  });

  const [trackingInfo, setTrackingInfo] = useState(null);
  const [showTrackingMap, setShowTrackingMap] = useState(false);
  const [activeTrackingId, setActiveTrackingId] = useState(null);
  const [eta, setEta] = useState(null);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPickup, setEditingPickup] = useState(null);
  const [errors, setErrors] = useState({});

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });

  const [profileErrors, setProfileErrors] = useState({});

  // Profile validation functions
  const validateProfileField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (!/^[a-zA-Z\s]{2,50}$/.test(value.trim())) return 'Name must be 2-50 characters, letters and spaces only';
        return '';
      case 'phone':
        if (value && !/^[0-9]{10}$/.test(value)) return 'Phone must be exactly 10 digits';
        return '';
      case 'address':
        if (value && value.length > 200) return 'Address must not exceed 200 characters';
        return '';
      case 'city':
        if (value && !/^[a-zA-Z\s]{2,50}$/.test(value)) return 'City must be 2-50 characters, letters and spaces only';
        return '';
      default:
        return '';
    }
  };

  const validateProfileForm = () => {
    const newErrors = {
      name: validateProfileField('name', profile.name),
      phone: validateProfileField('phone', profile.phone),
      address: validateProfileField('address', profile.address),
      city: validateProfileField('city', profile.city)
    };

    setProfileErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { id: 'pickups', label: 'My Pickups', icon: <Calendar size={16} /> },
    { id: 'rewards', label: 'Rewards', icon: <Award size={16} /> },
    { id: 'profile', label: 'Profile', icon: <User size={16} /> }
  ];

  const fetchProfile = async () => {
    try {
      const response = await householdAPI.getProfile();
      setProfile(response.data);
    } catch (error) {

    }
  };

  // Fetch eco points
  const fetchEcoPoints = async () => {
    try {
      const response = await householdAPI.getEcoPoints();
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    try {
      await householdAPI.updateProfile(profile);
      toast.success('Profile updated successfully! 🌿');
      setShowProfileForm(false);
      setProfileErrors({});
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  // Fetch pickup requests
  const fetchPickups = async () => {
    try {
      const response = await householdAPI.getMyPickups();
      setPickupRequests(response.data || []);
      const completed = (response.data || []).filter(p => p.pickupStatus === 'COMPLETED').length;
      setStats(prev => ({ ...prev, completedPickups: completed }));
    } catch (error) {

      // Don't show error toast to avoid redirect issues
      setPickupRequests([]);
    }
  };

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.getHouseholdLeaderboard();
      setLeaderboard(response.data || []);
    } catch (error) {

      // Set empty array on error to avoid redirect
      setLeaderboard([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchPickups(),
          fetchLeaderboard(),
          fetchProfile(),
          fetchEcoPoints()
        ]);

      } catch (error) {

      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
      // Set up interval to refresh eco-points every 3 seconds
      const interval = setInterval(() => {
        fetchEcoPoints();
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

  const fetchTrackingInfo = async (pickupId) => {
    try {
      const response = await trackingAPI.getTracking(pickupId);
      setTrackingInfo(response.data);
    } catch (error) {
      console.error("Failed to fetch tracking info");
      setTrackingInfo(null);
      // Optional: Set a specific error state to show a message to the user? 
      // For now, let's at least close the modal or show a toast
      toast.error("Failed to load tracking info. Please try again.");
      setShowTrackingMap(false); // Close the modal on error to prevent being stuck
    }
  };

  const handleTrackPickup = (pickupId) => {
    setActiveTrackingId(pickupId);
    setEta(null);
    fetchTrackingInfo(pickupId);
    setShowTrackingMap(true);
  };

  // Validate schedule form
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
    } else if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();
      const [hours, minutes] = scheduleForm.scheduledTime.split(':').map(Number);
      const scheduledDateTime = new Date();
      scheduledDateTime.setHours(hours, minutes, 0, 0);
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      if (scheduledDateTime <= twoHoursLater) {
        newErrors.scheduledTime = 'Pickup time must be at least 2 hours from now for same-day pickups';
      }
    }

    if (!scheduleForm.scheduledTime) {
      newErrors.scheduledTime = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      await householdAPI.updatePickup(editingPickup.pickupId, scheduleForm);
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
      await householdAPI.deletePickup(pickupId);
      toast.success('Pickup deleted successfully! 🗑️');
      await fetchPickups();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete pickup';
      toast.error(errorMessage);
    }
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
            await fetchPickups();
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
      console.error(error);
      toast.error(error.response?.data || 'Failed to initiate payment');
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
        notes: scheduleForm.notes || '',
        latitude: scheduleForm.latitude,
        longitude: scheduleForm.longitude
      };


      await householdAPI.createPickup(payload);
      toast.success('Pickup scheduled successfully! 🌿');
      setScheduleForm({
        wasteType: 'BIODEGRADABLE',
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
          <TrendingUp className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.totalWaste.toFixed(1)} kg</h3>
            <p>Total Waste Contributed</p>
          </div>
        </div>
        <div className="stat-card">
          <Award className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.ecoPoints}</h3>
            <p>Eco Points Earned</p>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp className="stat-icon" />
          <div className="stat-content">
            <h3>#{stats.rank || 'N/A'}</h3>
            <p>Leaderboard Rank</p>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.completedPickups}</h3>
            <p>Completed Pickups</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {pickupRequests.slice(0, 5).map(request => (
              <div key={request.pickupId} className="activity-item">
                <div className="activity-info">
                  <h4>{request.wasteType} Pickup</h4>
                  <p>{request.scheduledDate} at {request.scheduledTime}</p>
                </div>
                <div className={`activity-status status-${request.pickupStatus.toLowerCase()}`}>
                  {request.pickupStatus}
                </div>
              </div>
            ))}
            {pickupRequests.length === 0 && (
              <p style={{ padding: '1rem', color: '#6b7280' }}>No pickup requests yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2>Environmental Impact</h2>
          <div className="impact-stats">
            <div className="impact-item">
              <h4>Carbon Saved</h4>
              <p>{(stats.totalWaste * 0.5).toFixed(1)} kg CO₂</p>
            </div>
            <div className="impact-item">
              <h4>Trees Equivalent</h4>
              <p>{(stats.totalWaste * 0.1).toFixed(1)} trees</p>
            </div>
            <div className="impact-item">
              <h4>Water Saved</h4>
              <p>{(stats.totalWaste * 50).toFixed(0)} liters</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPickups = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>My Pickup Requests</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setScheduleForm({ wasteType: 'BIODEGRADABLE', scheduledDate: '', scheduledTime: '', notes: '' });
            setErrors({});
            setShowScheduleForm(true);
          }}
        >
          <Plus size={16} />
          Schedule New Pickup
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
        {pickupRequests.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
            No pickup requests yet. Schedule your first pickup!
          </div>
        ) : (
          pickupRequests.map(request => (
            <div key={request.pickupId} className="table-row">
              <span data-label="Waste Type" className="waste-type">{request.wasteType}</span>
              <span data-label="Date & Time">{request.scheduledDate} at {request.scheduledTime}</span>
              <span data-label="Status" className={`status status-${request.pickupStatus.toLowerCase()}`}>
                {request.pickupStatus}
              </span>
              <span data-label="Collector">{request.collector?.name || '-'}</span>
              <span data-label="Actions" className="actions">
                {request.pickupStatus === 'PAYMENT_PENDING' && (
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => handlePayBill(request.pickupId)}
                  >
                    Pay Now 💳
                  </button>
                )}
                {/* Tracking Button - Show for active pickups */}
                {['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'PAYMENT_PENDING', 'PAID', 'COMPLETED'].includes(request.pickupStatus) && (
                  <button
                    className="btn-icon btn-view"
                    onClick={() => handleTrackPickup(request.pickupId)}
                    title={request.pickupStatus === 'PENDING' ? "View Location" : "Track Collector"}
                    style={{ color: '#10b981', marginRight: '0.5rem' }}
                  >
                    <MapPin size={16} />
                  </button>
                )}

                {canModifyPickup(request) ? (
                  <>
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEditPickup(request)}
                      title="Edit pickup"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeletePickup(request.pickupId)}
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

  const renderRewards = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Eco Rewards & Leaderboard</h2>
        <div className="current-points">
          <Award className="points-icon" />
          <span>{stats.ecoPoints} Points</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Community Leaderboard</h3>
          <div className="leaderboard">
            {leaderboard.slice(0, 10).map((entry, index) => (
              <div key={entry.householdId} className="leaderboard-item">
                <span className="rank">#{index + 1}</span>
                <span className="name">{entry.name || 'Anonymous'}</span>
                <span className="points">{entry.ecoPoints} pts</span>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p style={{ padding: '1rem', color: '#6b7280' }}>No leaderboard data available</p>
            )}
          </div>
        </div>

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

  const renderProfile = () => (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Profile Information</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowProfileForm(true)}
        >
          <Edit size={16} />
          Update Profile
        </button>
      </div>
      <div className="profile-info">
        <div className="profile-card">
          <div className="profile-avatar">
            <User size={40} />
          </div>
          <div className="profile-details">
            <h3>{profile.name || 'N/A'}</h3>
            <p>{profile.email || 'N/A'}</p>
            <p>Role: Household User</p>
            <p>Phone: {profile.phone || 'Not provided'}</p>
            <p>Address: {profile.address || 'Not provided'}</p>
            <p>City: {profile.city || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="dashboard">
        <DashboardNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
        />

        <div className="dashboard-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'pickups' && renderPickups()}
          {activeTab === 'rewards' && renderRewards()}
          {activeTab === 'profile' && renderProfile()}
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
              <h3>{showEditForm ? 'Edit Pickup' : 'Schedule New Pickup'}</h3>
              <form onSubmit={showEditForm ? handleUpdatePickup : handleScheduleSubmit}>
                <div className="form-group">
                  <label>Waste Type *</label>
                  <select
                    value={scheduleForm.wasteType}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, wasteType: e.target.value })}
                    required
                  >
                    <option value="BIODEGRADABLE">🌱 Biodegradable Waste</option>
                    <option value="NON_BIODEGRADABLE">♻️ Non-Biodegradable Waste</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <div className="date-input-wrapper">
                    <input
                      type="date"
                      id="schedule-date"
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
                      onClick={() => document.getElementById('schedule-date')?.showPicker?.() || document.getElementById('schedule-date')?.click()}
                      aria-label="Open date picker"
                    >
                      <Calendar size={20} />
                    </button>
                  </div>
                  {errors.scheduledDate && <span className="error-text">{errors.scheduledDate}</span>}
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <div className="time-input-wrapper">
                    <input
                      type="time"
                      id="schedule-time"
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
                      onClick={() => document.getElementById('schedule-time')?.showPicker?.() || document.getElementById('schedule-time')?.click()}
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
                <h3>Live Pickup Tracking</h3>
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
                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    center={trackingInfo.pickupLocation}
                    markers={[
                      {
                        position: trackingInfo.pickupLocation,
                        label: "Pickup Location",
                        details: "This is where waste will be collected"
                      },
                      trackingInfo.collectorLocation ? {
                        position: trackingInfo.collectorLocation,
                        label: "Collector",
                        details: `${trackingInfo.collectorName} is on the way`
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
                setShowProfileForm(false);
              }
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Update Profile</h3>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label>Name *</label>
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
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => {
                      setProfile({ ...profile, phone: e.target.value });
                      if (profileErrors.phone) setProfileErrors({ ...profileErrors, phone: '' });
                    }}
                    onBlur={(e) => setProfileErrors({ ...profileErrors, phone: validateProfileField('phone', e.target.value) })}
                    className={profileErrors.phone ? 'error' : ''}
                  />
                  {profileErrors.phone && <span className="error-text">{profileErrors.phone}</span>}
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => {
                      setProfile({ ...profile, address: e.target.value });
                      if (profileErrors.address) setProfileErrors({ ...profileErrors, address: '' });
                    }}
                    onBlur={(e) => setProfileErrors({ ...profileErrors, address: validateProfileField('address', e.target.value) })}
                    className={profileErrors.address ? 'error' : ''}
                    rows="3"
                  />
                  {profileErrors.address && <span className="error-text">{profileErrors.address}</span>}
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => {
                      setProfile({ ...profile, city: e.target.value });
                      if (profileErrors.city) setProfileErrors({ ...profileErrors, city: '' });
                    }}
                    onBlur={(e) => setProfileErrors({ ...profileErrors, city: validateProfileField('city', e.target.value) })}
                    className={profileErrors.city ? 'error' : ''}
                  />
                  {profileErrors.city && <span className="error-text">{profileErrors.city}</span>}
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
      </div>
    </>
  );
};

export default HouseholdDashboard;
