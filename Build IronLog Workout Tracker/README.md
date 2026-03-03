# IronLog - Workout Tracker Application

A comprehensive fitness tracking web application built with React, TypeScript, and Tailwind CSS.

## 🎯 Features

### Authentication
- ✅ Real user registration and login
- ✅ JWT token-based authentication
- ✅ Password validation
- ✅ Protected routes - no auto-login
- ✅ Persistent sessions with localStorage

### Dashboard
- 📊 Real-time statistics
  - Total workouts count
  - Weekly workouts (last 7 days)
  - Current workout streak
  - Monthly goal progress
- 👤 Personalized welcome message
- 📈 All data calculated from real user records

### Workouts
- ➕ Log workout sessions
- 📝 Track exercises, duration, and notes
- 📅 Date-based organization
- 🗑️ Delete workouts
- 📋 Complete workout history

### Workout Plans
- 📚 Pre-built system templates:
  - 5x5 Strength Program
  - Push Pull Legs Split
  - Upper Lower Split
  - Full Body 3x/Week
- ✏️ Create custom workout plans
- 💾 Save templates to your library
- 🗑️ Manage personal plans

### Exercise Library
- 🏋️ Reference exercises by category:
  - Chest, Back, Legs, Shoulders, Arms, Core
- ➕ Add custom exercises
- 🏷️ Category and equipment tracking

### Nutrition Tracking
- 🍎 Log daily calories and macros
- 📊 Macro breakdown pie chart
- 📈 Track protein, carbs, and fats
- 📅 Historical nutrition data
- 🗑️ Delete entries

### Body Metrics
- ⚖️ Track weight over time
- 📏 Record body measurements:
  - Chest, Waist, Hips, Arms, Thighs
- 📊 Weight progress visualization
- 📈 Trend analysis

### Progress Analytics
- 📊 Weekly workout frequency chart
- 📈 Weight trend visualization
- 🔥 Calorie intake trends
- 📉 Summary statistics

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **React Router 7** for navigation
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Radix UI** for accessible components
- **Vite** for build tooling

### State Management
- React Hooks (useState, useEffect)
- localStorage for data persistence

### Authentication
- JWT token simulation
- Base64 encoding (production ready for real JWT integration)

## 📁 Project Structure

```
src/app/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── Layout.tsx       # Main app layout with navigation
│   └── ProtectedRoute.tsx # Auth guard for private routes
├── pages/
│   ├── Login.tsx        # Login page
│   ├── Signup.tsx       # Registration page
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Workouts.tsx     # Workout logging
│   ├── WorkoutPlans.tsx # Workout plan management
│   ├── Exercises.tsx    # Exercise library
│   ├── Nutrition.tsx    # Nutrition tracking
│   ├── BodyMetrics.tsx  # Body measurements
│   └── Progress.tsx     # Analytics and charts
├── services/
│   └── api.ts           # API service layer
├── routes.tsx           # Application routing
└── App.tsx              # Root component
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

### Installation

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)

### First Time Setup

1. **Create an account**
   - Click "Sign up" on the login page
   - Fill in your name, email, and password
   - Password must be at least 6 characters

2. **Login**
   - Use your email and password to log in
   - You'll be redirected to the dashboard

3. **Start tracking**
   - Log your first workout
   - Add nutrition entries
   - Record body metrics
   - View your progress

## 🔐 Authentication Flow

1. **Signup**: User creates account → Password is encoded → JWT token generated → Auto login
2. **Login**: User enters credentials → Credentials verified → JWT token generated → Session stored
3. **Protected Routes**: Every private page checks for valid token → Redirects to login if missing
4. **Logout**: Token removed → User redirected to login

## 💾 Data Storage

Currently, the app uses **localStorage** for data persistence:

- All user data is stored in browser storage
- Data persists across sessions
- Each user's data is isolated by their JWT token

### Migrating to a Real Backend

The app is architected to make backend integration simple:

**File to modify**: `/src/app/services/api.ts`

Replace the `mockApiCall` function with real API calls:

```typescript
const apiCall = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return await response.json();
};
```

**Backend Requirements**:
- JWT authentication
- RESTful API endpoints matching the current structure
- User data isolation
- CORS configuration

**Recommended Backend Options**:
1. **Node.js + Express + MongoDB**
2. **Node.js + Express + PostgreSQL**
3. **Supabase** (Backend-as-a-Service)
4. **Firebase**
5. **AWS Amplify**

## 📊 Data Models

### User
```typescript
{
  id: string;
  name: string;
  email: string;
  password: string; // hashed in production
  createdAt: string;
}
```

### Workout
```typescript
{
  id: string;
  userId: string;
  name: string;
  date: string;
  duration: number; // minutes
  exercises: string;
  notes: string;
  createdAt: string;
}
```

### Workout Plan
```typescript
{
  id: string;
  userId: string;
  name: string;
  description: string;
  exercises: string;
  createdAt: string;
}
```

### Exercise
```typescript
{
  id: string;
  userId: string;
  name: string;
  category: string;
  equipment?: string;
  createdAt: string;
}
```

### Nutrition Entry
```typescript
{
  id: string;
  userId: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  createdAt: string;
}
```

### Body Metric
```typescript
{
  id: string;
  userId: string;
  date: string;
  weight: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  createdAt: string;
}
```

## 🎨 Customization

### Styling
- Tailwind CSS classes can be modified in components
- Global styles in `/src/styles/`
- Theme customization in `/src/styles/theme.css`

### Features
- Add new pages by creating components in `/src/app/pages/`
- Add routes in `/src/app/routes.tsx`
- Add API methods in `/src/app/services/api.ts`

## 🐛 Troubleshooting

### Login not working
- Check browser console for errors
- Ensure localStorage is not disabled
- Try clearing browser storage and creating a new account

### Charts not displaying
- Ensure you have logged sufficient data
- Weight and calorie charts require 2+ entries
- Weekly workout chart shows last 8 weeks

### Data not persisting
- Check if localStorage is enabled in your browser
- Don't use private/incognito mode (data won't persist)
- Check browser storage limits

## 🔒 Security Notes

**Current Implementation (Development)**:
- Uses localStorage for simplicity
- Passwords are base64 encoded (NOT SECURE)
- JWT tokens are simulated

**Production Requirements**:
1. Replace base64 with bcrypt for password hashing
2. Use real JWT tokens with secret keys
3. Implement HTTPS
4. Add rate limiting
5. Implement CSRF protection
6. Use secure HTTP-only cookies for tokens
7. Add input validation and sanitization
8. Implement proper error handling

## 📱 Responsive Design

The app is fully responsive and works on:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (320px - 767px)

## 🚀 Building for Production

```bash
npm run build
# or
pnpm build
```

This creates an optimized production build in the `dist/` folder.

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📧 Support

For questions or issues, please create an issue in the repository.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
