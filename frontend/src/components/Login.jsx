import React from 'react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600">
          Please sign in to continue
        </p>
      </div>
    </div>
  );
};

export default Login;