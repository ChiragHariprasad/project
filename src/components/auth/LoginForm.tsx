                                                                                                              import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';

const LoginForm: React.FC = () => {
  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!uid.trim() || !password.trim()) {
      setLoginError('UID and password are required');
      return;
    }
    
    const success = await login(uid, password);
    if (success) {
      navigate(uid === 'admin' ? '/admin' : '/inventory');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4">
        <Input
          id="uid"
          label="UID"
          type="text"
          placeholder="Enter your UID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          required
          error={loginError && !uid.trim() ? 'UID is required' : ''}
        />
      </div>
      
      <div className="mb-6">
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          error={loginError && !password.trim() ? 'Password is required' : ''}
        />
      </div>
      
      {(error || loginError) && (
        <div className="text-red-500 text-sm mb-4">
          {error || loginError}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;