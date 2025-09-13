# 🎯 Paintball Reservation System

A complete web application for managing paintball facility reservations built with React, Node.js, and PostgreSQL.

## 🚀 Features

### Frontend (React + TypeScript)
- **🏠 Homepage**: Weather widget, booking form, facility information
- **📅 My Bookings**: View, edit, cancel bookings with real-time updates
- **👤 Profile**: User management and booking statistics
- **🔐 Authentication**: Login/Register with JWT tokens
- **📱 Responsive Design**: Mobile-friendly with CSS Grid/Flexbox
- **⚡ Real-time Updates**: Socket.io integration for live notifications

### Backend (Node.js + Express)
- **🛡️ JWT Authentication**: Secure user authentication and authorization
- **📊 CRUD Operations**: Full booking management system
- **📁 File Upload**: Payment receipt upload with Multer
- **🌤️ Weather API**: OpenWeatherMap integration
- **🔄 Real-time Communication**: Socket.io for live updates
- **🗄️ PostgreSQL Database**: Users and bookings data management

### Key Requirements Met
- ✅ **3 Frontend Pages**: Homepage, My Bookings, Profile
- ✅ **Responsive Design**: CSS Grid/Flexbox + media queries
- ✅ **Backend API**: Node.js/Express with PostgreSQL
- ✅ **Full CRUD**: Create, Read, Update, Delete operations
- ✅ **External API**: OpenWeatherMap weather data
- ✅ **Authentication**: JWT-based auth system
- ✅ **File Upload/Download**: Payment receipt management
- ✅ **Real-time Communication**: Socket.io for live updates
- ✅ **Database**: 2 entities (Users, Bookings)
- ✅ **Deployment Ready**: Heroku configuration

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Axios for HTTP requests
- Socket.io-client for real-time updates
- CSS3 with Grid/Flexbox for responsive design

### Backend
- Node.js with Express.js
- PostgreSQL database
- JWT for authentication
- Socket.io for real-time communication
- Multer for file uploads
- Bcrypt for password hashing
- Axios for external API calls

## 📋 Prerequisites

- Node.js (v18+)
- PostgreSQL (v12+)
- NPM or Yarn
- OpenWeatherMap API key (optional)

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd paintball-app
```

### 2. Install root dependencies
```bash
npm install
```

### 3. Install all project dependencies
```bash
npm run install-all
```

### 4. Set up PostgreSQL Database
Create a PostgreSQL database named `paintball_reservations`:
```sql
CREATE DATABASE paintball_reservations;
```

### 5. Environment Configuration

#### Backend (.env in /backend folder)
```bash
cp .env.example backend/.env
```
Edit `backend/.env`:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paintball_reservations
WEATHER_API_KEY=your_openweathermap_api_key
```

#### Frontend (.env in /frontend folder)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 6. Start Development Servers
```bash
npm run dev
```

This runs both frontend (port 3000) and backend (port 5000) concurrently.

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  number_of_players INTEGER NOT NULL,
  equipment VARCHAR(20) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  payment_receipt VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get specific booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `POST /api/bookings/:id/receipt` - Upload payment receipt
- `GET /api/bookings/availability/:date` - Get available time slots

### Weather
- `GET /api/weather/current` - Get current weather
- `GET /api/weather/forecast` - Get weather forecast

## 🌐 Real-time Features

The application uses Socket.io for real-time communication:

- **New Bookings**: Live notifications when bookings are created
- **Booking Updates**: Real-time updates when bookings are modified
- **Status Changes**: Instant notifications when booking status changes
- **Receipt Uploads**: Live updates when payment receipts are uploaded

## 🚀 Deployment to Heroku

### 1. Create Heroku App
```bash
heroku create your-paintball-app
```

### 2. Add PostgreSQL Add-on
```bash
heroku addons:create heroku-postgresql:mini
```

### 3. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_production_jwt_secret
heroku config:set WEATHER_API_KEY=your_api_key
```

### 4. Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

The app will be available at `https://your-paintball-app.herokuapp.com`

## 🎮 Usage

### For Customers
1. **Register/Login**: Create account or sign in
2. **Check Weather**: View current weather on homepage
3. **Book Session**: Select date, time, players, and equipment
4. **Manage Bookings**: View, edit, or cancel reservations
5. **Upload Receipt**: Submit payment confirmation
6. **Track Status**: Monitor booking confirmation status

### For Admins
- Access all bookings through API
- Update booking statuses
- View user information
- Monitor real-time booking activities

## 📝 Features Breakdown

### CRUD Operations
- **Create**: User registration, booking creation
- **Read**: View bookings, user profiles, available slots
- **Update**: Edit bookings, update user profiles, change booking status
- **Delete**: Cancel bookings, remove user accounts

### File Upload/Download
- Upload payment receipt images (JPG, PNG)
- Download booking confirmations
- Secure file storage with validation

### External API Integration
- **OpenWeatherMap**: Current weather and 5-day forecast
- Fallback to mock data if API is unavailable
- Weather-based booking recommendations

### Real-time Communication
- Socket.io integration for live updates
- User-specific notification rooms
- Booking status change notifications
- Receipt upload confirmations

## 🛡️ Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes and API endpoints
- File upload validation
- CORS configuration
- Environment variable protection

## 📱 Responsive Design

The application is fully responsive with:
- CSS Grid and Flexbox layouts
- Mobile-first approach
- Breakpoints at 768px and 480px
- Touch-friendly interfaces
- Optimized typography and spacing

## 🧪 Testing

To test the application:

1. **Register** a new account
2. **Create bookings** for different dates
3. **Upload receipt** images
4. **Check real-time updates** in multiple browser tabs
5. **Test responsive design** on mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ for paintball enthusiasts!