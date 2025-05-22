import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';

const RegisterForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [generatedUid, setGeneratedUid] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const result = await register(password);
    if (result.success && result.uid) {
      setGeneratedUid(result.uid);
    }
  };

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div>
      {generatedUid ? (
        <div className="text-center">
          <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-md">
            <h3 className="text-lg font-medium text-green-800 mb-2">Registration Successful!</h3>
            <p className="text-green-700 mb-4">Your account has been created.</p>
            <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-4">
              <p className="text-sm text-gray-500 mb-1">Your UID (save this!):</p>
              <p className="text-lg font-mono font-bold text-blue-900">{generatedUid}</p>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Please save your UID as you will need it to log in. This UID will not be shown again.
            </p>
            <Button onClick={handleContinue} variant="primary">
              Continue to Login
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={error && !password.trim() ? 'Password is required' : ''}
            />
          </div>
          
          <div className="mb-6">
            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              error={error && password !== confirmPassword ? 'Passwords do not match' : ''}
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mb-4">
              {error}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RegisterForm;