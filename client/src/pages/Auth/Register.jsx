import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ChevronRight, User, Mail, Lock, Phone, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill all required fields'); return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters'); return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { ...form, role: 'student' }, { withCredentials: true });
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Account created successfully! Welcome to DOTE Portal.');
        navigate('/student/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="mb-8 text-center">
          <div className="inline-flex p-4 bg-blue-100 text-blue-600 rounded-2xl mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Create Account</h1>
          <p className="text-slate-500 mt-2">Join the DOTE Admission Portal as a student</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Account Type</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><User size={18} /></span>
              <input type="text" value="Student" readOnly className="input-field pl-10 bg-slate-50 cursor-not-allowed" />
            </div>
          </div>

          <Field icon={<User size={18} />} name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
          <Field icon={<Mail size={18} />} name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
          
          <Field icon={<Lock size={18} />} name="password" type="password" placeholder="Create Password (min 8 characters)" value={form.password} onChange={handleChange} required />
          <Field icon={<Lock size={18} />} name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />

          <button type="submit" disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-lg mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Creating Account...' : 'Register'} <ChevronRight size={20} />
          </button>
        </form>

        <div className="mt-6 text-center text-slate-600">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
};

const Field = ({ icon, name, type = 'text', placeholder, value, onChange, required }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
    <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange}
      required={required} className="input-field pl-10" />
  </div>
);

export default Register;
