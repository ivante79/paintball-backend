import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) => api.post('/auth/register', userData),
  
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  getCurrentUser: () => api.get('/auth/me'),
  
  updateProfile: (userData: {
    firstName: string;
    lastName: string;
    phone: string;
  }) => api.put('/auth/profile', userData),
};

// Bookings API
export const bookingsAPI = {
  getMyBookings: () => api.get('/bookings'),
  
  getAllBookings: () => api.get('/bookings/all'),
  
  createBooking: (bookingData: {
    bookingDate: string;
    timeSlot: string;
    numberOfPlayers: number;
    equipment: string;
    totalPrice: number;
  }) => api.post('/bookings', bookingData),
  
  getBooking: (id: string) => api.get(`/bookings/${id}`),
  
  updateBooking: (id: string, bookingData: any) =>
    api.put(`/bookings/${id}`, bookingData),
  
  cancelBooking: (id: string) => api.delete(`/bookings/${id}`),
  
  uploadReceipt: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return api.post(`/bookings/${id}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  updateBookingStatus: (id: string, status: string) =>
    api.put(`/bookings/${id}/status`, { status }),
  
  getAvailableSlots: (date: string) =>
    api.get(`/bookings/availability/${date}`),
};

// Weather API
export const weatherAPI = {
  getCurrentWeather: (city?: string) =>
    api.get(`/weather/current${city ? `?city=${city}` : ''}`),
  
  getForecast: (city?: string) =>
    api.get(`/weather/forecast${city ? `?city=${city}` : ''}`),
};

export default api;