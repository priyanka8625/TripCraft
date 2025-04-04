import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else {
      if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Password must contain at least one uppercase letter';
      if (!/[a-z]/.test(formData.password)) newErrors.password = 'Password must contain at least one lowercase letter';
      if (!/[0-9]/.test(formData.password)) newErrors.password = 'Password must contain at least one number';
      if (!/[^A-Za-z0-9]/.test(formData.password)) newErrors.password = 'Password must contain at least one special character';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      toast.success('Account created successfully!');
      console.log(JSON.stringify(formData));
    } else {
      setErrors(validationErrors);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };




    const handleGoogleSignup = async (response) => {
      try {
        window.location.href = `http://localhost:8080/oauth2/authorization/google`; // Backend handles OAuth
        toast.success("Google signin successful!");
      } catch (error) {
          toast.error("Google signin failed!");
      }
  };

  return (
    <div className="min-h-screen pt-29 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500">Join us and start planning your next adventure</p>
        </div>

        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          <span className="text-gray-700">Continue with Google</span>
        </button> 
       

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'email', 'phone', 'password', 'confirmPassword'].map((field, index) => (
            <div className="space-y-2" key={index}>
              <label className="text-sm font-medium text-gray-700" htmlFor={field}>
                {field === 'confirmPassword' ? 'Confirm Password' : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <div className="relative">
                {field === 'name' && <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />}
                {field === 'email' && <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />}
                {field === 'phone' && <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />}
                {(field === 'password' || field === 'confirmPassword') && <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />}
                <input
                  type={field.includes('password') ? 'password' : 'text'}
                  name={field}
                  id={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder={field === 'confirmPassword' ? 'Confirm your password' : `Enter your ${field}`}
                />
              </div>
              {errors[field] && <p className="text-sm text-red-500">{errors[field]}</p>}
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition duration-150 flex items-center justify-center gap-2"
          >
            Create Account
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
