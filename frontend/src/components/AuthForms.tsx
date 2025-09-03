import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

interface AuthFormsProps {
  type: 'login' | 'signup' | null;
  onClose: () => void;
}


export const AuthForms: React.FC<AuthFormsProps> = ({ type, onClose }) => {
  const [formType, setFormType] = useState<'login' | 'signup'>(type || 'login');

  // Sync formType with type prop
  React.useEffect(() => {
    if (type && type !== formType) {
      setFormType(type);
    }
  }, [type]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { login, signup, googleLogin } = useAuth();
  // Google One Tap/GoogleLogin handler
  const handleGoogleLoginSuccess = async (credentialResponse: { credential?: string }) => {
    setLoading(true);
    try {
      const credential = credentialResponse.credential;
      if (!credential) {
        setError('Google login failed: No credential received.');
        setLoading(false);
        return;
      }
      const success = await googleLogin(credential);
      if (success) {
        setShowSuccess(true);
        navigate('/profile');
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 1200);
      } else {
        setError('Google login failed. Please try again.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError('Google login failed: ' + (err.message || 'Unknown error'));
      } else {
        setError('Google login failed: Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLoginError = () => setError('Google login failed. Please try again.');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form fields with more detailed validation
      if (formType === 'login') {
        if (!formData.email) {
          setError('Email is required');
          setLoading(false);
          return;
        }
        if (!formData.password) {
          setError('Password is required');
          setLoading(false);
          return;
        }
      } else { // Signup validation
        if (!formData.name || formData.name.trim() === '') {
          setError('Name is required');
          setLoading(false);
          return;
        }
        
        if (!formData.email) {
          setError('Email is required');
          setLoading(false);
          return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Please enter a valid email address');
          setLoading(false);
          return;
        }
        
        if (!formData.password) {
          setError('Password is required');
          setLoading(false);
          return;
        }
        
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match!');
          setLoading(false);
          return;
        }
      }
      
      if (formType === 'signup') {
        console.log('Submitting signup form with data:', { 
          name: formData.name.trim(), // Trim to remove any extra spaces
          email: formData.email.trim().toLowerCase(), // Standardize email
          password: formData.password ? '[MASKED]' : 'empty'
        });
        
        try {
          // Clean the input data before sending
          const success = await signup(
            formData.name.trim(),
            formData.email.trim().toLowerCase(),
            formData.password
          );
          
          if (success) {
            console.log('Signup successful');
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
              onClose();
              navigate('/profile');
            }, 1200);
          } else {
            console.error('Signup returned false');
            setError('Failed to sign up. Please check your information and try again.');
          }
        } catch (err: unknown) {
          console.error('Error during signup:', err);
          if (err instanceof Error) {
            setError(err.message || 'An unexpected error occurred during signup');
          } else {
            setError('An unexpected error occurred during signup');
          }
        }
      } else {
        // Login flow
        console.log('Attempting login with email:', formData.email);
        try {
          const success = await login(formData.email.trim().toLowerCase(), formData.password);
          
          if (success) {
            onClose();
            navigate('/profile');
          } else {
            setError('Invalid email or password');
          }
        } catch (err: unknown) {
          console.error('Error during login:', err);
          if (err instanceof Error) {
            setError(err.message || 'An unexpected error occurred during login');
          } else {
            setError('An unexpected error occurred during login');
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md relative 
                      transform transition-all duration-300 scale-100 hover:scale-[1.02]">
        {showSuccess && (
          <div className="absolute top-0 left-0 right-0 z-50 p-4 font-semibold text-center text-white bg-green-500 rounded-t-2xl animate-fade-in">
            Signed up successfully!
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute p-2 transition-colors duration-200 rounded-lg top-4 right-4 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-center text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
          {formType === 'login' ? 'Welcome Back' : 'Join K Mentor'}
        </h2>
        
        {error && (
          <div className="p-3 mb-4 text-red-800 bg-red-100 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {formType === 'login' ? 'Email' : 'Name'}
            </label>
            <input
              type={formType === 'login' ? 'email' : 'text'}
              required
              className="w-full px-4 py-3 text-gray-900 transition-all duration-200 bg-white border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              value={formType === 'login' ? formData.email : formData.name}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                [formType === 'login' ? 'email' : 'name']: e.target.value 
              }))}
              placeholder={formType === 'login' ? "Enter your email address" : "Enter your full name"}
              autoComplete={formType === 'login' ? "email" : "name"}
            />
          </div>

          {formType === 'signup' && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 text-gray-900 transition-all duration-200 bg-white border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email address"
                autoComplete="email"
              />
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full px-4 py-3 pr-12 text-gray-900 transition-all duration-200 bg-white border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Minimum 6 characters"
                autoComplete={formType === 'login' ? "current-password" : "new-password"}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {formType === 'signup' && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-3 pr-12 text-gray-900 transition-all duration-200 bg-white border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute text-gray-500 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white transition-all duration-200 transform rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              formType === 'login' ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative px-4 bg-white dark:bg-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <div style={{ width: '100%' }}>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              text="signin_with"
              width="100%"
              // The button will fill the parent div, which matches the login button's width
            />
          </div>
        </div>

        <div className="mt-6 text-center">
          <span className="text-gray-600 dark:text-gray-400">
            {formType === 'login' ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => setFormType(formType === 'login' ? 'signup' : 'login')}
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {formType === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};