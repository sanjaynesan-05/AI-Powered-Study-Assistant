# Authentication System Documentation

This document outlines how to use the authentication system in this application.

## Backend Authentication System

The backend uses JSON Web Tokens (JWT) for authentication. User credentials are stored in MongoDB with passwords hashed using bcrypt.

### Key Components:

1. **User Model** (`userModel.js`):
   - Stores user information including name, email, hashed password
   - Implements password hashing using bcrypt
   - Provides methods for password comparison and JWT generation

2. **Authentication Middleware** (`authMiddleware.js`):
   - `protect`: Verifies JWT tokens and attaches user to request
   - `admin`: Restricts routes to admin users only

3. **User Controller** (`userController.js`):
   - `registerUser`: Creates new user accounts
   - `loginUser`: Authenticates users and issues JWT
   - `getUserProfile`: Gets authenticated user profile
   - `updateUserProfile`: Updates user information

## Frontend Authentication System

The frontend uses React Context API to manage authentication state across the application.

### Key Components:

1. **AuthContext** (`AuthContext.tsx`):
   - Provides authentication state to all components
   - Handles login, signup, logout and profile updates
   - Stores user data in localStorage for persistence

2. **API Service** (`api.ts`):
   - Manages API requests with JWT authentication
   - Handles token storage and authentication headers
   - Intercepts 401 errors for automatic logout

3. **Protected Route** (`ProtectedRoute.tsx`):
   - Higher-order component for route protection
   - Redirects unauthenticated users to login

## How to Use:

### Protecting Routes:

```tsx
import { ProtectedRoute } from '../components/ProtectedRoute';

<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  } 
/>
```

### Accessing User Data:

```tsx
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <p>Welcome, {user?.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Making Authenticated API Requests:

```tsx
import api from '../services/api';

// The API service will automatically include the token
const fetchData = async () => {
  try {
    const response = await api.get('/some-protected-endpoint');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
```

## Security Considerations:

1. JWT tokens are stored in localStorage which is vulnerable to XSS attacks
2. Consider implementing refresh tokens for better security
3. Set appropriate token expiration times in your environment variables
