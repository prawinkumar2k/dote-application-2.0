import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import AdminDashboard from '../pages/Admin/Dashboard';
import ManageColleges from '../pages/Admin/ManageColleges';
import MasterData from '../pages/Admin/MasterData';
import CollegeDashboard from '../pages/College/Dashboard';
import ApplicationsList from '../pages/College/ApplicationsList';
import StudentDashboard from '../pages/Student/Dashboard';
import ApplicationForm from '../pages/Student/ApplicationForm';
import MyApp from '../pages/Student/MyApp';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student-register" element={<Register />} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/colleges" element={<ManageColleges />} />
      <Route path="/admin/master-data" element={<MasterData />} />
      
      {/* College Routes */}
      <Route path="/college/dashboard" element={<CollegeDashboard />} />
      <Route path="/college/applications" element={<ApplicationsList />} />
      
      {/* Student Routes */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/apply" element={<ApplicationForm />} />
      <Route path="/student/my-application" element={<MyApp />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
