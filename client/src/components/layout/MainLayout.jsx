import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Bell, Settings, Building, Database, GraduationCap, FileText, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const MainLayout = ({ children, role = 'guest' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();

  const handleLogout = async () => {
    try { await axios.post('/api/auth/logout', {}, { withCredentials: true }); } catch {}
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] overflow-x-hidden">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">DOTE Portal</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {role === 'guest' ? (
                <>
                  <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium">Login</Link>
                  <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">Register</Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                    <Bell size={20} />
                  </button>
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 pr-3 rounded-full border border-slate-200">
                    <div className="bg-blue-100 p-1.5 rounded-full text-blue-600"><User size={18} /></div>
                    <span className="text-sm font-semibold text-slate-700">{user.name || role}</span>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {role !== 'guest' && (
          <aside className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-white border-r border-slate-200 pt-16 md:pt-0`}>
            <div className="p-4 space-y-2">
              <SidebarItem to={`/${role}/dashboard`} icon={<Settings size={18} />} label="Dashboard" />
              {role === 'admin' && (
                <>
                  <SidebarItem to="/admin/colleges" icon={<Building size={18} />} label="Manage Colleges" />
                  <SidebarItem to="/admin/master-data" icon={<Database size={18} />} label="Master Data" />
                </>
              )}
              {role === 'student' && (
                <>
                  <SidebarItem to="/student/apply" icon={<GraduationCap size={18} />} label="Fill Application" />
                  <SidebarItem to="/student/my-application" icon={<FileText size={18} />} label="My Application" />
                </>
              )}
              {role === 'college' && (
                <SidebarItem to="/college/applications" icon={<ClipboardList size={18} />} label="Review Applications" />
              )}
            </div>
          </aside>
        )}

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full overflow-hidden">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full">
            {children}
          </motion.div>
        </main>
      </div>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© 2026 Directorate of Technical Education. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const SidebarItem = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all group">
    <span className="group-hover:scale-110 transition-transform">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);

export default MainLayout;
