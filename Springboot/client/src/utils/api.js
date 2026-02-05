import axios from 'axios';
import toast from 'react-hot-toast';

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Use token from user object if main token is missing
    const authToken = token || user.token;

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
      // Sync tokens if they're different
      if (token !== user.token && user.token) {
        localStorage.setItem('token', user.token);
      }
    }


    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect for payment API calls or household test - let component handle the error
      const isPaymentCall = error.config?.url?.includes('/payment/');
      const isHouseholdTest = error.config?.url?.includes('/household/create-test-reward');

      if (window.location.pathname !== '/login' && !isPaymentCall && !isHouseholdTest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateStatus: (userId, status) => api.put(`/user/${userId}/status?status=${status}`),
  getCollectors: () => api.get('/user/collectors'),
};

// Pickup API calls
export const pickupAPI = {
  createRequest: (requestData) => api.post('/pickup/request', requestData),
  getMyRequests: () => api.get('/pickup/my-requests'),
  getCollectorRequests: () => api.get('/pickup/collector-requests'),
  updateStatus: (pickupId, status) => api.put(`/pickup/${pickupId}/status?status=${status}`),
};

// Household API calls
export const householdAPI = {
  createPickup: (requestData) => api.post('/household/pickup', requestData),
  updatePickup: (pickupId, data) => api.put(`/household/pickup/${pickupId}`, data),
  deletePickup: (pickupId) => api.delete(`/household/pickup/${pickupId}`),
  getMyPickups: () => api.get('/household/pickups'),
  getEcoPoints: () => api.get('/household/eco-points'),
  getProfile: () => api.get('/household/profile'),
  updateProfile: (profileData) => api.put('/household/profile', profileData),
};

export const businessAPI = {
  getProfile: () => api.get('/business/profile'),
  updateProfile: (profileData) => api.put('/business/profile', profileData),
  getPickups: () => api.get('/business/pickups'),
  getEcoPoints: () => api.get('/business/eco-points'),
  createPickup: (requestData) => api.post('/business/pickup', requestData),
  updatePickup: (pickupId, data) => api.put(`/business/pickup/${pickupId}`, data),
  deletePickup: (pickupId) => api.delete(`/business/pickup/${pickupId}`),
  getPayments: () => api.get('/business/payments'),
  createPayment: (paymentData) => api.post('/business/payment', paymentData),
  getLeaderboard: () => api.get('/business/leaderboard'),
};

export const collectorAPI = {
  getProfile: () => api.get('/collector/profile'),
  updateProfile: (profileData) => api.put('/collector/profile', profileData),
  getAllRequests: () => api.get('/collector/requests'),
  getMyRequests: () => api.get('/collector/my-requests'),
  acceptRequest: (requestId) => api.put(`/collector/requests/${requestId}/accept`),
  rejectRequest: (requestId) => api.put(`/collector/requests/${requestId}/reject`),
  completeRequest: (requestId, completionData) => api.put(`/collector/requests/${requestId}/complete`, completionData),
  updateLocation: (locationData) => api.put('/collector/location', locationData),
  generateBill: (requestId, billData) => api.post(`/collector/requests/${requestId}/generate-bill`, billData),
};

export const trackingAPI = {
  getTracking: (pickupId) => api.get(`/tracking/${pickupId}`),
};

export const ngoAPI = {
  getProfile: () => api.get('/ngo/profile'),
  updateProfile: (profileData) => api.put('/ngo/profile', profileData),
  getAnalytics: () => api.get('/ngo/analytics'),
  getCityAnalytics: (city) => api.get(`/ngo/analytics/city/${city}`),
};

// Waste Log API calls
export const wasteLogAPI = {
  createLog: (pickupId, weight, photoUrl, notes) =>
    api.post(`/waste-log/create?pickupId=${pickupId}&weight=${weight}&photoUrl=${photoUrl || ''}&notes=${notes || ''}`),
  getUserLogs: (userId) => api.get(`/waste-log/user/${userId}`),
};

// Leaderboard API calls
export const leaderboardAPI = {
  getHouseholdLeaderboard: () => api.get('/leaderboard/household'),
  getHouseholdLeaderboardByCity: (city) => api.get(`/leaderboard/household/city/${city}`),
  getBusinessLeaderboard: () => api.get('/leaderboard/business'),
  getBusinessLeaderboardByCity: (city) => api.get(`/leaderboard/business/city/${city}`),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  getAllPickups: () => api.get('/admin/pickups'),
  getAllMessages: () => api.get('/admin/messages'),
  updateUserStatus: (userId, status) => api.put(`/admin/users/${userId}/status`, { status }),
  updateMessageStatus: (messageId, status) => api.put(`/admin/messages/${messageId}/status`, { status }),
  replyToMessage: (messageId, reply) => api.post(`/admin/messages/${messageId}/reply`, { reply }),
};

export const paymentAPI = {
  createOrder: (amount) => api.post('/payment/create-order', { amount }),
  verifyPayment: (data) => api.post('/payment/verify', data),
  getHistory: () => api.get('/payment/history'),
  payBill: (pickupId) => api.post(`/payment/pay-bill/${pickupId}`),
};

export default api;
