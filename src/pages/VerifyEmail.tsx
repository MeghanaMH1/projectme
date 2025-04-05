import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <Mail className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          Check your email
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          We've sent you an email with a link to verify your account.
        </p>
        <div className="mt-6">
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
}