# Expense Tracker

A full-stack expense tracking application built with React and Node.js.

## Features

- **User Authentication**: Secure login and registration with JWT
- **Transaction Management**: Add, edit, delete income and expense transactions
- **Dashboard**: Overview with summary cards and charts
- **Reports**: Detailed analytics with date range filtering
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend

- React 18
- Vite (Build tool)
- TailwindCSS (Styling)
- React Router v6 (Routing)
- React Query (Data fetching)
- React Hook Form + Zod (Form validation)
- Recharts (Charts and graphs)

### Backend

- Node.js
- Express.js (Web framework)
- MongoDB (Database)
- Mongoose (ODM)
- JWT (Authentication)
- bcryptjs (Password hashing)
- Zod (Validation)

## Project Structure

```
expense-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── context/       # React context
│   │   └── utils/         # Utility functions
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                # Node.js backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── server.js        # Entry point
│   ├── seed.js          # Database seeding
│   └── package.json
├── .env.example         # Environment variables template
└── README.md
```

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. **Set up environment variables**

   ```bash
   # Copy the example env file
   copy .env.example .env

   # Edit .env with your settings:
   # MONGO_URI=mongodb://localhost:27017/expense-tracker
   # JWT_SECRET=your-super-secret-jwt-key-here
   # JWT_EXPIRE=30d
   # PORT=5000
   # CLIENT_URL=http://localhost:5173
   ```

3. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

4. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend development server**

   ```bash
   cd client
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Seeding Sample Data

After registering a user, you can seed sample transactions:

```bash
cd server
npm run seed
```

## Database Models

### User

```javascript
{
  username: String (required, min: 3)
  email: String (required, unique, email format)
  password: String (required, min: 6, hashed)
  timestamps: true
}
```

### Transaction

```javascript
{
  userId: ObjectId (required, ref: 'User')
  type: String (required, enum: ['income', 'expense'])
  amount: Number (required, min: 0.01)
  category: String (required)
  description: String (optional, max: 500)
  date: Date (required, default: now)
  paymentMethod: String (enum: payment methods)
  timestamps: true
}
```

## Features in Detail

### Dashboard

- Summary cards showing total income, expenses, and balance
- Pie chart for expense breakdown by category
- Line chart for monthly trends
- Recent transactions list

### Transactions

- Add/edit transactions with form validation
- Filter by type, category, and date range
- Paginated transaction table
- Real-time updates with React Query

### Reports

- Date range filtering
- Category-wise breakdown charts
- Income vs expense comparison
- Detailed analytics table

## Development

### Available Scripts

**Frontend (client/)**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend (server/)**

- `npm run dev` - Start with nodemon (auto-restart)
- `npm start` - Start production server
- `npm run seed` - Seed sample data

### Code Quality

- ESLint configured for React
- Form validation with Zod
- Error handling middleware
- Input sanitization

### Backend (Railway/Render/Heroku)

1. Set environment variables
2. Deploy the `server/` folder
3. Ensure MongoDB connection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
