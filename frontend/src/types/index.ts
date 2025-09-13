export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt?: string;
}

export interface Booking {
  id: number;
  user_id: number;
  booking_date: string;
  time_slot: string;
  number_of_players: number;
  equipment: 'included' | 'own';
  total_price: number;
  payment_receipt?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface Weather {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  city: string;
}

export interface WeatherForecast {
  date: string;
  temperature: number;
  description: string;
  icon: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  loading: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface BookingFormData {
  bookingDate: string;
  timeSlot: string;
  numberOfPlayers: number;
  equipment: 'included' | 'own';
}