import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, LogIn, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Login = () => {
  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        identifier,
        password,
        role
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success(`Welcome back, ${response.data.user.name}!`);
        navigate(`/${role}/dashboard`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-blue-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(135deg,#2563eb_0%,#60a5fa_100%)] opacity-90"></div>
        <div className="relative z-10 text-white max-w-md">
          <div className="bg-white/20 backdrop-blur-lg w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
            <LogIn size={32} />
          </div>
          <h2 className="text-4xl font-bold mb-6">Integrated Management System</h2>
          <p className="text-blue-100 text-lg mb-8">Access your dashboard to manage applications, track progress, and stay updated with the latest DOTE announcements.</p>
          <div className="flex gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-lg text-sm font-medium">Verified</div>
            <div className="bg-white/10 px-4 py-2 rounded-lg text-sm font-medium">Secure SSL</div>
          </div>
        </div>
      </div>

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
                  <button key={r} type="button" onClick={() => { setRole(r); setIdentifier(''); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize ${role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    {r}
                  </button>
                ))}
              </div>



              <div className="space-y-4">
                <div className="flex items-center border border-slate-200 rounded-lg bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <span className="pl-3 pr-2 flex items-center text-slate-400 shrink-0">
                    <User size={18} />
                  </span>
                  <input 
                    type="text" 
                    placeholder="User ID" 
                    className="flex-1 py-3 pr-4 bg-transparent outline-none text-slate-800 placeholder-slate-400 text-sm"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center border border-slate-200 rounded-lg bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <span className="pl-3 pr-2 flex items-center text-slate-400 shrink-0">
                    <Lock size={18} />
                  </span>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    className="flex-1 py-3 pr-4 bg-transparent outline-none text-slate-800 placeholder-slate-400 text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? 'Connecting...' : 'Login'} <ChevronRight size={20} />
              </button>
            </form>

            <div className="mt-8 text-center text-slate-600">
              Don't have an account? <Link to="/student-register" className="text-blue-600 font-bold hover:underline">Register now</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
