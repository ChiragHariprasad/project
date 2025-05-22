import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { Store } from 'lucide-react';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Store className="mx-auto h-12 w-12 text-blue-900" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to Store Inventory
          </h2>
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-600">
              Or{' '}
              <Link to="/register" className="font-medium text-blue-900 hover:text-blue-800">
                create a new account
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link to="/forgot-password" className="font-medium text-blue-900 hover:text-blue-800">
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;