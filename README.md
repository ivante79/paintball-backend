# Paintball Reservation System

Web application for managing paintball facility reservations built with React, Node.js, and PostgreSQL.

## Features

### Frontend

- Homepage with weather widget and booking form
- User bookings management (view, edit, cancel)
- User profile and statistics
- Authentication system
- Responsive design
- Real-time updates via Socket.io

### Backend

- JWT authentication
- RESTful API for bookings management
- File upload for payment receipts
- Weather API integration
- PostgreSQL database
- Socket.io for real-time communication

## Tech Stack

**Frontend:** React 18, TypeScript, React Router, Axios, Socket.io-client  
**Backend:** Node.js, Express.js, PostgreSQL, JWT, Socket.io, Multer  
**Database:** PostgreSQL

## Prerequisites

- Node.js v18+
- PostgreSQL v12+
- OpenWeatherMap API key (optional)

## Installation

1. Clone repository

```bash
git clone <repo-url>
cd paintball-backend
```

2. Install dependencies

```bash
npm install
npm run install-all
```

3. Create PostgreSQL database

```sql
CREATE DATABASE paintball_reservations;
```

4. Configure environment variables

Backend `.env`:

```
PORT=5000
JWT_SECRET=your_jwt_secret
DB_USER=postgres_user
DB_PASSWORD=postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paintball_reservations
WEATHER_API_KEY=your_weather_api_key
```

Frontend `.env`:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

5. Start development servers

```bash
npm run dev
```

Frontend: http://localhost:3000  
Backend: http://localhost:5000

## Database Schema

**Users:**

- id, email, password, first_name, last_name, phone, role, created_at

**Bookings:**

- id, user_id, booking_date, time_slot, number_of_players, equipment, total_price, payment_receipt, status, created_at

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/profile` - Update profile

### Bookings

- GET `/api/bookings` - Get user bookings
- POST `/api/bookings` - Create booking
- PUT `/api/bookings/:id` - Update booking
- DELETE `/api/bookings/:id` - Cancel booking
- POST `/api/bookings/:id/receipt` - Upload receipt
- GET `/api/bookings/availability/:date` - Available slots

### Weather

- GET `/api/weather/current` - Current weather
- GET `/api/weather/forecast` - Weather forecast

## Deployment

Deploy to Heroku:

```bash
heroku create app-name
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=production_secret
git push heroku main
```

## License

ISC License
