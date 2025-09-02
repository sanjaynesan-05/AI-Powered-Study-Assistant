import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthFormsProps {
  type: 'login' | 'signup' | null;
  onClose: () => void;
}


export const AuthForms: React.FC<AuthFormsProps> = ({ type, onClose }) => {
  const [formType, setFormType] = useState<'login' | 'signup'>(type || 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formType === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match!');
          setLoading(false);
          return;
        }
        await signup(formData.username, formData.email, formData.password);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
          navigate('/profile');
        }, 1200);
        return;
      } else {
        await login(formData.username, formData.password);
        onClose();
        navigate('/profile');
        return;
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!type) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md relative 
                      transform transition-all duration-300 scale-100 hover:scale-[1.02]">
        {showSuccess && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-green-500 text-white text-center rounded-t-2xl z-50 font-semibold animate-fade-in">
            Signed up successfully!
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                     rounded-lg transition-colors duration-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 
                       bg-clip-text text-transparent">
          {formType === 'login' ? 'Welcome Back' : 'Join K Mentor'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Username {formType === 'login' && '/ Email'}
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         transition-all duration-200"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>

          {formType === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           transition-all duration-200"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           transition-all duration-200"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 
                           text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {formType === 'signup' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             transition-all duration-200"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 
                             text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 
                       rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 
                       transform hover:scale-105 active:scale-95 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              formType === 'login' ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-600 dark:text-gray-400">
            {formType === 'login' ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => setFormType(formType === 'login' ? 'signup' : 'login')}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            {formType === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};