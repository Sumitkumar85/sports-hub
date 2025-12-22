# SportHub - Sports Facility Booking Platform

A comprehensive full-stack web application for sports facility management including court reservations, equipment rental, membership management, league organization, and tournament planning.

## Features

- **Court Bookings**: Browse and reserve sports courts with real-time availability
- **Equipment Rental**: Rent sports equipment for your activities
- **Membership Management**: Subscribe to membership plans for exclusive benefits
- **League Organization**: Join competitive leagues with standings and schedules
- **Tournament Planning**: Participate in tournaments with bracket systems
- **User Dashboard**: Track your bookings, rentals, and activities

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- bcryptjs for password hashing
- Express Validator for input validation

### Frontend
- React 18
- React Router DOM 6
- Axios for API calls
- React Toastify for notifications
- React Icons
- Date-fns for date handling

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
cd nodeProject
```

2. Install all dependencies
```bash
npm run install-all
```

3. Configure environment variables
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/sportshub
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
```

4. Run the application

**Development mode (both server and client):**
```bash
npm run dev
```

**Server only:**
```bash
npm run server
```

**Client only:**
```bash
npm run client
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Courts
- `GET /api/courts` - Get all courts
- `GET /api/courts/:id` - Get single court
- `GET /api/courts/:id/availability` - Get court availability
- `POST /api/courts` - Create court (Admin)
- `PUT /api/courts/:id` - Update court (Admin)
- `DELETE /api/courts/:id` - Delete court (Admin)

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/my` - Get user's bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Equipment
- `GET /api/equipment` - Get all equipment
- `GET /api/equipment/rentals/my` - Get user's rentals
- `POST /api/equipment/:id/rent` - Rent equipment
- `PUT /api/equipment/rentals/:id/return` - Return equipment

### Memberships
- `GET /api/memberships` - Get all membership plans
- `GET /api/memberships/my` - Get user's membership
- `POST /api/memberships/:id/subscribe` - Subscribe to plan

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/:id` - Get tournament details
- `POST /api/tournaments/:id/register` - Register for tournament

### Leagues
- `GET /api/leagues` - Get all leagues
- `GET /api/leagues/:id` - Get league details
- `POST /api/leagues/:id/register` - Register for league

## Project Structure

```
nodeProject/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/     # Reusable components
│       ├── context/        # React context (Auth)
│       ├── pages/          # Page components
│       ├── services/       # API service
│       ├── App.js
│       └── index.js
├── server/                 # Express backend
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── index.js           # Server entry point
├── .env                   # Environment variables
└── package.json           # Root package.json
```

## User Roles

- **User**: Regular members who can book courts, rent equipment, join leagues/tournaments
- **Staff**: Can manage bookings and assist users
- **Coach**: Can organize training sessions
- **Admin**: Full access to all features and management

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
