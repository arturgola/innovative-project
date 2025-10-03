# EcoScan - User Account Implementation

This project now includes a complete user account system with database storage.

## Features Implemented

### Backend (Node.js + Express + SQLite)

- **User Management API**: Full CRUD operations for user accounts
- **Database Schema**: SQLite database with users table
- **No Password Required**: Simple name-based user creation
- **User Profile Storage**: Stores name, level, points, scans, and join date

### Frontend (React Native + Expo)

- **User Profile Management**: Create, view, and update user profiles
- **API Integration**: Connected to backend for data persistence
- **Loading States**: Proper loading indicators for async operations
- **Error Handling**: User-friendly error messages and alerts

## API Endpoints

### Users

- `POST /users` - Create a new user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user

### Request/Response Format

```json
{
  "id": 1,
  "name": "John Doe",
  "level": 2,
  "totalPoints": 150,
  "scansToday": 3,
  "joinedDate": "2024-01-15T10:30:00.000Z"
}
```

## Database Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  scans_today INTEGER DEFAULT 0,
  joined_date TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

   The server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

## Usage

### Creating a New User

The app will automatically attempt to load existing users when started. If no users exist, you can create a new user profile.

### User Profile Management

- Navigate to the user profile section in the app
- Edit your name by tapping the edit icon
- View your level, points, and scan statistics
- Changes are automatically saved to the database

### API Integration

The frontend automatically syncs user data with the backend:

- User creation is saved to the database
- Profile updates are persisted
- Scan statistics are updated in real-time

## Key Components

### Backend

- `server.js` - Express server with user API endpoints
- `data.db` - SQLite database file (auto-created)

### Frontend

- `services/api.ts` - API service for backend communication
- `app/contexts/app-context.tsx` - Global state management with API integration
- `components/user-profile.tsx` - User profile display and editing
- `components/create-user.tsx` - New user creation form
- `app/user-profile.tsx` - User profile page wrapper

## Next Steps

You can extend this implementation by:

1. Adding user authentication (if needed)
2. Implementing user switching/selection
3. Adding more user profile fields
4. Implementing data export/import
5. Adding user achievements and badges
6. Implementing social features (leaderboards, sharing)

## Notes

- The system currently uses a simple name-based approach without passwords
- User data is stored locally in SQLite database
- The first user is automatically loaded on app start
- All user operations include proper error handling and loading states
