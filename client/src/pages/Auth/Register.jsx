import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, ChevronRight } from 'lucide-react';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="mb-10 text-center">
          <div className="inline-flex p-4 bg-blue-100 text-blue-600 rounded-2xl mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Create Account</h1>
          <p className="text-slate-500 mt-2">Join the DOTE Admission Portal</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-4">
            <input type="text" placeholder="Full Name" className="input-field" required />
            <input type="email" placeholder="Email Address" className="input-field" required />
            <input type="password" placeholder="Create Password" className="input-field" required />
            <input type="password" placeholder="Confirm Password" className="input-field" required />
          </div>

          <button type="submit" className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-lg">
            Register <ChevronRight size={20} />
          </button>
        </form>

        <div className="mt-8 text-center text-slate-600">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
