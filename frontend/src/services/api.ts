import axios, { AxiosError, AxiosResponse } from 'axios';
import { PYTHON_AI_CONFIG } from '../config/config';

// Create an axios instance with Python Flask API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || PYTHON_AI_CONFIG.BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout for AI responses
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle token expiration and unauthorized errors
    if (error.response?.status === 401 && originalRequest) {
      // Clear the invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page if needed
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Define proper interfaces for our API responses
interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  token: string;
  interests?: string[];
  skills?: string[];
}

interface ProfileUpdateData {
  name?: string;
  email?: string;
  password?: string;
  profilePicture?: string;
  interests?: string[];
  skills?: string[];
}

// User authentication services
export const authService = {
  // Google login
  googleLogin: async (credential: string): Promise<UserResponse> => {
    try {
      console.log('Logging in user with Google credential', credential ? 'Credential provided' : 'No credential');
      
      // Check API URL for debugging
      console.log('API URL:', api.defaults.baseURL);
      
      const response = await api.post<UserResponse>('/users/google-login', { credential });
      console.log('Google login successful', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error: unknown) {
      // Detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('Google login API error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        // Throw a more descriptive error
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        } else if (error.message) {
          throw new Error(`Google login failed: ${error.message}`);
        }
      } else if (error instanceof Error) {
        console.error('Google login error:', error.message);
        throw error;
      } else {
        console.error('Google login unknown error:', error);
        throw new Error('An unexpected error occurred during Google login');
      }
      
      // This code will never be reached, but TypeScript requires it for type checking
      return {} as UserResponse;
    }
  },

  // Register a new user
  register: async (userData: { name: string, email: string, password: string }): Promise<UserResponse> => {
    try {
      // Log the actual data being sent (without password)
      console.log('Registering user with data:', { 
        name: userData.name, 
        email: userData.email,
        password: userData.password ? '***' : undefined
      });
      
      // Validation before sending to API
      if (!userData.name) {
        throw new Error('Name is required');
      }
      if (!userData.email) {
        throw new Error('Email is required');
      }
      if (!userData.password || userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Send the request
      const response = await api.post<UserResponse>('/users', userData);
      
      console.log('Registration successful:', {
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error: unknown) {
      // Detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('Registration API error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
        
        // Throw a more descriptive error
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        } else if (error.message) {
          throw new Error(`Registration failed: ${error.message}`);
        }
      } else if (error instanceof Error) {
        console.error('Registration non-Axios error:', error.message);
        throw new Error(`Registration failed: ${error.message}`);
      } else {
        console.error('Registration unknown error:', error);
        throw new Error('An unexpected error occurred during registration');
      }
      
      // This code will never be reached, but TypeScript requires it for type checking
      return {} as UserResponse;
    }
  },

  // Login user
  login: async (credentials: { email: string, password: string }): Promise<UserResponse> => {
    try {
      console.log('Logging in user with email:', credentials.email);
      
      // Validate inputs
      if (!credentials.email) {
        throw new Error('Email is required');
      }
      if (!credentials.password) {
        throw new Error('Password is required');
      }
      
      const response = await api.post<UserResponse>('/users/login', credentials);
      console.log('Login successful');
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      // Detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('Login API error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        // Throw a more descriptive error
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        } else if (error.message) {
          throw new Error(`Login failed: ${error.message}`);
        }
      } else if (error instanceof Error) {
        console.error('Login error:', error.message);
        throw error;
      } else {
        console.error('Login unknown error:', error);
        throw new Error('An unexpected error occurred during login');
      }
      
      // This code will never be reached, but TypeScript requires it for type checking
      return {} as UserResponse;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user's profile
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: ProfileUpdateData): Promise<UserResponse> => {
    try {
      console.log('Updating user profile');
      
      const response = await api.put<UserResponse>('/users/profile', userData);
      console.log('Profile update successful');
      
      if (response.data) {
        // Also update the token if it was refreshed
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      // Detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('Profile update API error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        // Throw a more descriptive error
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        } else if (error.message) {
          throw new Error(`Profile update failed: ${error.message}`);
        }
      } else if (error instanceof Error) {
        console.error('Profile update error:', error.message);
        throw error;
      } else {
        console.error('Profile update unknown error:', error);
        throw new Error('An unexpected error occurred during profile update');
      }
      
      // This code will never be reached, but TypeScript requires it for type checking
      return {} as UserResponse;
    }
  },
};

// AI Services
export const aiService = {
  // Chat with AI mentor
  chat: async (message: string): Promise<{ reply: string; timestamp: string }> => {
    try {
      const response = await api.post('/ai-chat', { message });
      return {
        reply: response.data.reply,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI chat error:', error);
      throw new Error('Failed to get AI response');
    }
  },

  // Get smart learning recommendations
  getRecommendations: async (userLevel?: string, interests?: string, goals?: string): Promise<{
    recommendations: Array<{
      title: string;
      type: string;
      difficulty: string;
      description: string;
    }>;
    success: boolean;
  }> => {
    try {
      const response = await api.post('/smart-recommendations', {
        userLevel,
        interests,
        goals
      });
      return response.data;
    } catch (error) {
      console.error('AI recommendations error:', error);
      throw new Error('Failed to get recommendations');
    }
  }
};

// Export default api for other services
export default api;
