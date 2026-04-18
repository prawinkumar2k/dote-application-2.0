import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import AdminDashboard from '../pages/Admin/Dashboard';
import ManageColleges from '../pages/Admin/ManageColleges';
import MasterData from '../pages/Admin/MasterData';
import CollegeDashboard from '../pages/College/Dashboard';
import ApplicationsList from '../pages/College/ApplicationsList';
import ApplicationDetail from '../pages/College/ApplicationDetail';
import StudentDashboard from '../pages/Student/Dashboard';
import ApplicationForm from '../pages/Student/ApplicationForm';
import MyApp from '../pages/Student/MyApp';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route element={<ProtectedRoute role="admin" />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/colleges" element={<ManageColleges />} />
      <Route path="/admin/master-data" element={<MasterData />} />
    </Route>

    <Route element={<ProtectedRoute role="college" />}>
      <Route path="/college/dashboard" element={<CollegeDashboard />} />
      <Route path="/college/applications" element={<ApplicationsList />} />
      <Route path="/college/applications/:id" element={<ApplicationDetail />} />
    </Route>

    <Route element={<ProtectedRoute role="student" />}>
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/apply" element={<ApplicationForm />} />
      <Route path="/student/my-application" element={<MyApp />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
