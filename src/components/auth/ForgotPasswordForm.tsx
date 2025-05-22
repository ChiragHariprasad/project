import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Input from '../ui/Input';
import Button from '../ui/Button';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ForgotPasswordForm: React.FC = () => {
  const [uid, setUid] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!uid.trim()) {
      setError('UID is required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/forgot-password`, { uid });
      
      if (response.data.success) {
        // In development, show the code. In production, this would be sent via email/SMS
        alert(`Your authentication code is: ${response.data.code}\nThis code is valid for 1 minute only.`);
        setStep('verify');
      } else {
        setError(response.data.message || 'Failed to generate reset code');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate reset code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!authCode.trim()) {
      setError('Authentication code is required');
      setIsLoading(false);
      return;
    }

    try {
      // Verify the code by attempting to reset the password with a temporary one
      const response = await axios.post(`${API_URL}/users/reset-password`, {
        uid,
        code: authCode,
        newPassword: 'temporary_password_for_verification'
      });

      if (response.data.success) {
        setStep('reset');
      } else {
        setError(response.data.message || 'Invalid code');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/reset-password`, {
        uid,
        code: authCode,
        newPassword
      });

      if (response.data.success) {
        alert('Password reset successful! Please login with your new password.');
        navigate('/login');
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === 'request' && (
        <form onSubmit={handleRequestCode}>
          <Input
            id="uid"
            label="UID"
            type="text"
            placeholder="Enter your UID"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            required
            error={error && !uid.trim() ? 'UID is required' : ''}
          />
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Requesting Code...' : 'Request Authentication Code'}
          </Button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerifyCode}>
          <Input
            id="authCode"
            label="Authentication Code"
            type="text"
            placeholder="Enter the code sent to you"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            required
            error={error}
          />
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleResetPassword}>
          <Input
            id="newPassword"
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            error={error && !newPassword.trim() ? 'New password is required' : ''}
          />
          <Input
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={error && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
          />
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </form>
      )}

      {error && (
        <div className="text-red-500 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordForm; 