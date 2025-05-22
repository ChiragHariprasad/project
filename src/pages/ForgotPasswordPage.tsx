import React from 'react';
import { Link } from 'react-router-dom';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import { Store } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Store className="mx-auto h-12 w-12 text-blue-900" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-blue-900 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 