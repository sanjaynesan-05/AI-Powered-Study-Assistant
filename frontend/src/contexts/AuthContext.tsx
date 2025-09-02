import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  googleLogin: (credential: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Initialize loading to true while we check localStorage for saved user
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('AuthContext: Logging in user with email and password');
      const userData = await authService.login({ email, password });
      console.log('AuthContext: Login response received');
      
      if (!userData || !userData._id) {
        console.error('AuthContext: Invalid user data received during login', userData);
        setError('Failed to login: Invalid response from server');
        return false;
      }
      
      // Map the backend user data to our frontend User type
      const loggedInUser: User = {
        id: userData._id,
        username: userData.name,
        email: userData.email,
        education: 'student', // Default value, can be updated later
        skills: userData.skills || [],
        interests: userData.interests || [],
        profilePhoto: userData.profilePicture,
        role: userData.role,
        token: userData.token
      };
      
      setUser(loggedInUser);
      return true;
    } catch (err: unknown) {
      console.error('AuthContext: Login error', err);
      
      if (err instanceof Error) {
        setError(err.message || 'Failed to login');
      } else {
        setError('Failed to login');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('AuthContext: Registering user with name, email, password');
      const userData = await authService.register({ name, email, password });
      console.log('AuthContext: Registration response received');
      
      if (!userData || !userData._id) {
        console.error('AuthContext: Invalid user data received', userData);
        setError('Failed to sign up: Invalid response from server');
        return false;
      }
      
      const newUser: User = {
        id: userData._id,
        username: userData.name,
        email: userData.email,
        education: 'student', // Default value, can be updated later
        skills: userData.skills || [],
        interests: userData.interests || [],
        role: userData.role,
        token: userData.token
      };
      
      setUser(newUser);
      return true;
    } catch (err: unknown) {
      console.error('AuthContext: Signup error', err);
      
      if (err instanceof Error) {
        setError(err.message || 'Failed to sign up');
      } else {
        setError('Failed to sign up');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('AuthContext: Logging in user with Google credential');
      const userData = await authService.googleLogin(credential);
      console.log('AuthContext: Google login response received');
      
      if (!userData || !userData._id) {
        console.error('AuthContext: Invalid user data received during Google login', userData);
        setError('Failed to login: Invalid response from server');
        return false;
      }
      
      // Map the backend user data to our frontend User type
      const loggedInUser: User = {
        id: userData._id,
        username: userData.name,
        email: userData.email,
        education: 'student', // Default value, can be updated later
        skills: userData.skills || [],
        interests: userData.interests || [],
        profilePhoto: userData.profilePicture,
        role: userData.role,
        token: userData.token
      };
      
      console.log('Google Auth successful - User authenticated:', loggedInUser.email);
      localStorage.setItem('user', JSON.stringify(userData)); // Ensure user data is saved
      localStorage.setItem('token', userData.token); // Ensure token is saved
      setUser(loggedInUser);
      return true;
    } catch (err: unknown) {
      console.error('AuthContext: Google login error', err);
      
      if (err instanceof Error) {
        setError(err.message || 'Failed to login with Google');
      } else {
        setError('Failed to login with Google');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setLoading(true);
      
      // Convert from User type to backend expected format
      const backendUpdates = {
        name: updates.username,
        email: updates.email,
        profilePicture: updates.profilePhoto,
        skills: updates.skills,
        interests: updates.interests
      };
      
      authService.updateProfile(backendUpdates)
        .then(response => {
          const updatedUser: User = {
            ...user,
            ...updates,
            token: response.token || user.token
          };
          setUser(updatedUser);
        })
        .catch(error => {
          console.error('Error updating profile:', error);
          if (error instanceof Error) {
            setError(error.message || 'Failed to update profile');
          } else {
            setError('Failed to update profile');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // Check for saved user on mount
  React.useEffect(() => {
    const checkSavedUser = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (savedUser && token) {
          try {
            const userData = JSON.parse(savedUser);
            
            const mappedUser: User = {
              id: userData._id,
              username: userData.name,
              email: userData.email,
              education: 'student', // Default value
              skills: userData.skills || [],
              interests: userData.interests || [],
              profilePhoto: userData.profilePicture,
              role: userData.role,
              token: userData.token || token
            };
            
            setUser(mappedUser);
          } catch (error) {
            // If there's an error parsing, clear the localStorage
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
      } finally {
        // Set loading to false regardless of the outcome
        setLoading(false);
      }
    };
    
    checkSavedUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, googleLogin, logout, updateUser, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};