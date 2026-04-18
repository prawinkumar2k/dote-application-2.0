import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Shield, Users, GraduationCap } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <MainLayout>
      <div className="py-12 md:py-20 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center max-w-4xl">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Streamlined <span className="gradient-text">Admission</span> Portal <br /> for Technical Education
          </motion.h1>
          <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
            A state-of-the-art platform connecting students with the right colleges. Transparent, efficient, and user-friendly.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-lg px-8 py-3">
              Get Started <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="px-8 py-3 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-all text-lg">
              Login to Portal
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid md:grid-cols-3 gap-8 w-full">
          <FeatureCard 
            icon={<GraduationCap className="text-blue-600" size={32} />}
            title="Student-Centric"
            description="Easy application process with step-by-step guidance and real-time tracking."
          />
          <FeatureCard 
            icon={<Shield className="text-emerald-600" size={32} />}
            title="Secure & Verified"
            description="Robust verification system ensures data integrity and prevents fraudulent submissions."
          />
          <FeatureCard 
            icon={<BookOpen className="text-amber-600" size={32} />}
            title="Resource Rich"
            description="Access comprehensive information about colleges, courses, and eligibility criteria."
          />
        </div>

        {/* Roles Section */}
        <div className="mt-32 bg-white rounded-3xl p-8 md:p-12 w-full shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-900">One Portal, Different Roles</h2>
            <p className="mt-4 text-slate-600 text-lg">
              Whether you are a student aspiring for greatness, a college managing admissions, or an administrator overseeing the system, we have tailored experiences for you.
            </p>
            <div className="mt-8 space-y-4">
              <RolePoint icon={<Users size={20} />} text="Admin: Full control over colleges and master data." />
              <RolePoint icon={<Users size={20} />} text="College: Manage applications and update status." />
              <RolePoint icon={<Users size={20} />} text="Student: Multi-step comprehensive application process." />
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 h-40 rounded-2xl flex items-center justify-center border border-blue-100">
               <span className="text-blue-700 font-bold">Admin Portal</span>
            </div>
            <div className="bg-emerald-50 h-40 rounded-2xl flex items-center justify-center border border-emerald-100 mt-8">
               <span className="text-emerald-700 font-bold">College View</span>
            </div>
            <div className="bg-amber-50 h-40 rounded-2xl flex items-center justify-center border border-amber-100 -mt-8">
               <span className="text-amber-700 font-bold">Student App</span>
            </div>
            <div className="bg-slate-50 h-40 rounded-2xl flex items-center justify-center border border-slate-100">
               <span className="text-slate-700 font-bold">Secure Auth</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
    <div className="bg-slate-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </div>
);

const RolePoint = ({ icon, text }) => (
  <div className="flex items-center gap-3">
    <div className="bg-blue-100 p-1 rounded-full text-blue-600">
      {icon}
    </div>
    <span className="text-slate-700 font-medium">{text}</span>
  </div>
);

export default Home;
