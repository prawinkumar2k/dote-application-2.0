import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import FormField from '../../components/Common/FormField';

const Login = () => {
  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', {
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
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-primary">
      <div className="w-full max-w-md bg-white p-8 md:p-10 border border-slate-300 shadow-sm rounded-lg">
        <div className="mb-8 text-center border-b border-slate-100 pb-6">
          <Link to="/" className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-4 inline-flex items-center gap-1 hover:underline">
            ← Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Portal Login</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">DOTE Government Admission System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="flex bg-slate-100 p-1 rounded border border-slate-200">
            {['student', 'college', 'admin'].map((r) => (
              <button 
                key={r} 
                type="button" 
                onClick={() => { setRole(r); setIdentifier(''); setError(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded capitalize tracking-wider transition-all ${role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                {r}
              </button>
            ))}
          </div>

          <FormField 
            label={`${role} Login ID / Email`} 
            required 
            error={error && !identifier ? 'Required' : null}
          >
            <input 
              type="text" 
              placeholder={`Enter your ${role} ID`}
              className="w-full border border-slate-300 rounded p-2.5 text-sm"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </FormField>

          <FormField 
            label="Password" 
            required 
            error={error && !password ? 'Required' : null}
          >
            <input 
              type="password" 
              placeholder="Enter password"
              className="w-full border border-slate-300 rounded p-2.5 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-colors mt-2">
            {loading ? 'Connecting...' : 'Login to Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-600 text-sm font-medium">
          New applicant? <Link to="/student-register" className="text-blue-600 font-bold hover:underline">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
