import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ChevronRight, User, Mail, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

import FormField from '../../components/Common/FormField';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Full name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (form.password && form.password.length < 8) newErrors.password = 'Min 8 characters';
    if (form.confirmPassword !== form.password) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { ...form, role: 'student' }, { withCredentials: true });
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Account created successfully!');
        navigate('/student/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-primary">
      <div className="w-full max-w-lg bg-white p-8 md:p-10 border border-slate-300 shadow-sm rounded-lg">
        <div className="mb-8 text-center border-b border-slate-100 pb-6">
          <h1 className="text-2xl font-bold text-slate-900">Student Registration</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">DOTE Government Admission Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Full Name" required error={errors.name} tooltip="Enter your name as per SSLC marksheet">
            <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="w-full border border-slate-300 rounded p-2.5 text-sm" />
          </FormField>

          <FormField label="Email Address" required error={errors.email} tooltip="Verification link will be sent here">
            <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} className="w-full border border-slate-300 rounded p-2.5 text-sm" />
          </FormField>
          
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Password" required error={errors.password}>
              <input type="password" name="password" placeholder="Create Password" value={form.password} onChange={handleChange} className="w-full border border-slate-300 rounded p-2.5 text-sm" />
            </FormField>

            <FormField label="Confirm Password" required error={errors.confirmPassword}>
              <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} className="w-full border border-slate-300 rounded p-2.5 text-sm" />
            </FormField>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-colors mt-2">
            {loading ? 'Creating Account...' : 'Continue to Dashboard'}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-600 text-sm font-medium">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

