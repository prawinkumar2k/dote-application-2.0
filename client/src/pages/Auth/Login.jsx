import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, LogIn, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Login = () => {
  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState(''); // Email for student, User ID for others
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      toast.error('Please enter all credentials');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        identifier, // Email for student, User ID for admin/college
        password,
        role
      }, {
        withCredentials: true // Important for cookies
      });

      if (response.data.success) {
        toast.success(`Welcome back, ${response.data.user.name}!`);
        navigate(`/${role}/dashboard`);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex bg-blue-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(135deg,#2563eb_0%,#60a5fa_100%)] opacity-90"></div>
        <div className="relative z-10 text-white max-w-md">
          <div className="bg-white/20 backdrop-blur-lg w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
            <LogIn size={32} />
          </div>
          <h2 className="text-4xl font-bold mb-6">Integrated Management System</h2>
          <p className="text-blue-100 text-lg mb-8">
            Access your dashboard to manage applications, track progress, and stay updated with the latest DOTE announcements.
          </p>
          <div className="flex gap-4">
             <div className="bg-white/10 px-4 py-2 rounded-lg text-sm font-medium">Verified</div>
             <div className="bg-white/10 px-4 py-2 rounded-lg text-sm font-medium">Secure SSL</div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
            <div className="mb-10">
              <Link to="/" className="text-blue-600 font-bold mb-4 inline-block hover:-translate-x-1 transition-transform">← Back to website</Link>
              <h1 className="text-3xl font-bold text-slate-800">Login</h1>
              <p className="text-slate-500 mt-2">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                {['student', 'college', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize ${role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {role === 'student' && (
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex gap-3 text-blue-800 text-sm animate-fade-in">
                  <AlertCircle size={18} className="shrink-0" />
                  <p>Login with your <strong>email</strong> and password</p>
                </div>
              )}
              {role === 'admin' && (
                <div className="bg-purple-50 border border-purple-100 p-3 rounded-xl flex gap-3 text-purple-800 text-sm animate-fade-in">
                  <AlertCircle size={18} className="shrink-0" />
                  <p>Login with user ID: <strong>admin_dote</strong></p>
                </div>
              )}
              {role === 'college' && (
                <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex gap-3 text-green-800 text-sm animate-fade-in">
                  <AlertCircle size={18} className="shrink-0" />
                  <p>Login with your college user ID</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type={role === 'student' ? 'email' : 'text'}
                    placeholder={role === 'student' ? 'Email Address' : 'User ID'}
                    className="input-field pl-10"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    className="input-field pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500" />
                  <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-blue-600 font-bold hover:underline">Forgot password?</a>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Connecting...' : 'Login'} <ChevronRight size={20} />
              </button>
            </form>

            <div className="mt-8 text-center text-slate-600">
              Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register now</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
