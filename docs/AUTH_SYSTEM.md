# Authentication System Documentation

This document outlines how to use the authentication system in the AI-Powered Study Assistant application.

## Backend Authentication System

The backend uses JSON Web Tokens (JWT) for authentication with enhanced security features. User credentials are stored in MongoDB with passwords hashed using bcrypt, and all user data is properly isolated.

### Key Components:

1. **User Model** (`userModel.js`):
   - Stores comprehensive user information including professional profile data
   - Implements password hashing using bcrypt with salt rounds
   - Provides methods for password comparison and JWT generation
   - Includes profile fields like headline, bio, location, and social links

2. **Authentication Middleware** (`authMiddleware.js`):
   - `protect`: Verifies JWT tokens and attaches user to request object
   - `admin`: Restricts routes to admin users only
   - Handles token refresh and expiration
   - Implements rate limiting for authentication attempts

3. **User Controller** (`userController.js`):
   - `registerUser`: Creates new user accounts with validation
   - `loginUser`: Authenticates users and issues JWT with user profile data
   - `getUserProfile`: Gets authenticated user profile with all fields
   - `updateUserProfile`: Updates user information including professional details
   - `uploadProfileImage`: Handles profile picture uploads

### Enhanced Security Features:

- **Rate Limiting**: Prevents brute force attacks on login endpoints
- **Input Validation**: Comprehensive validation using express-validator
- **Password Strength**: Enforces minimum password requirements
- **JWT Expiration**: Configurable token expiration times
- **Secure Headers**: Implements security headers with helmet.js

## Frontend Authentication System

The frontend uses React Context API to manage authentication state across the application with responsive design support.

### Key Components:

1. **AuthContext** (`AuthContext.tsx`):
   - Provides authentication state to all components
   - Handles login, signup, logout and comprehensive profile updates
   - Stores user data in localStorage for persistence
   - Manages profile picture uploads and professional information
   - Supports responsive profile management features

2. **API Service** (`api.ts`):
   - Manages API requests with JWT authentication
   - Handles token storage and authentication headers
   - Intercepts 401 errors for automatic logout
   - Supports file uploads for profile pictures
   - Implements retry logic for failed requests

3. **Protected Route** (`ProtectedRoute.tsx`):
   - Higher-order component for route protection
   - Redirects unauthenticated users to login
   - Works seamlessly across all device sizes
   - Supports responsive navigation patterns

### Enhanced Frontend Features:

- **Professional Profile Management**: LinkedIn-style profile with image upload
- **Responsive Design**: Authentication flows work on all device sizes
- **Form Validation**: Client-side validation with error messaging
- **Loading States**: Professional loading spinners and feedback
- **Error Handling**: User-friendly error messages and recovery options

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
  const { user, logout, updateUser } = useAuth();
  
  return (
    <div className="p-4">
      <div className="flex items-center space-x-3">
        {user?.profilePicture && (
          <img 
            src={user.profilePicture} 
            alt={user.name}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm text-gray-600">{user?.headline}</p>
        </div>
      </div>
      <button 
        onClick={logout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};
```

### Making Authenticated API Requests:

```tsx
import api from '../services/api';

// The API service will automatically include the token
const fetchUserData = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

// Updating user profile with new information
const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', {
      name: profileData.name,
      headline: profileData.headline,
      bio: profileData.bio,
      skills: profileData.skills,
      profilePicture: profileData.profilePicture
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};
```

### Professional Profile Management:

```tsx
import { useAuth } from '../contexts/AuthContext';

const ProfileManagement = () => {
  const { user, updateUser } = useAuth();
  
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateUser({ profilePicture: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleProfileUpdate = (newData) => {
    updateUser({
      ...newData,
      skills: [...(user?.skills || []), ...newData.skills]
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Profile Image Upload */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <img
          src={user?.profilePicture || '/default-avatar.png'}
          alt={user?.name || 'User'}
          className="w-full h-full rounded-full object-cover"
        />
        <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          📷
        </label>
      </div>
      
      {/* Profile Information */}
      <div className="text-center">
        <h2 className="text-xl font-semibold">{user?.name}</h2>
        <p className="text-gray-600">{user?.headline}</p>
        <p className="text-sm text-gray-500">{user?.location}</p>
      </div>
    </div>
  );
};
```

## Security Considerations:

### Current Implementation:
1. **JWT Storage**: Tokens stored in localStorage (accessible but convenient)
2. **Token Expiration**: Configurable expiration times (default: 7 days)
3. **Password Security**: Bcrypt hashing with salt rounds
4. **Input Validation**: Server-side validation for all inputs
5. **Rate Limiting**: Authentication endpoints protected against brute force

### Security Best Practices Implemented:
1. **HTTPS**: Use HTTPS in production for token transmission
2. **Token Refresh**: Implement refresh tokens for enhanced security
3. **XSS Protection**: Content Security Policy headers
4. **CSRF Protection**: CSRF tokens for state-changing operations
5. **Data Validation**: Comprehensive input sanitization

### Recommended Improvements:
- Consider implementing refresh tokens for longer sessions
- Add two-factor authentication for enhanced security
- Implement session management for better user tracking
- Add device fingerprinting for suspicious activity detection

## Environment Configuration:

```env
# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Security Settings
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCK_TIME=900000  # 15 minutes

# CORS Settings
FRONTEND_URL=http://localhost:5173
```

## Error Handling:

### Common Authentication Errors:
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Insufficient permissions
- `429 Too Many Requests`: Rate limit exceeded
- `400 Bad Request`: Validation errors

### Frontend Error Handling:
```tsx
const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    // Token expired or invalid
    logout();
    navigate('/login');
  } else if (error.response?.status === 429) {
    // Rate limit exceeded
    setError('Too many attempts. Please try again later.');
  } else {
    // General error
    setError('Authentication failed. Please try again.');
  }
};
```
