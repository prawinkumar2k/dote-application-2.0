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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 uppercase">DOTE Admission Portal</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {role === 'guest' ? (
              <>
                <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium text-sm">Login</Link>
                <Link to="/student-register" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700">New Registration</Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                  <User size={16} className="text-slate-500" />
                  <span className="text-sm font-bold text-slate-700">{user.name || role}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 px-3 py-1.5 rounded hover:bg-red-50">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 hover:bg-slate-50 rounded">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 pt-16">
        {/* Fixed Sidebar */}
        {role !== 'guest' && (
          <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
              <div className="fixed inset-0 bg-slate-900/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}
            
            <aside className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-50 border-r border-slate-200 transition-transform duration-200 ease-in-out overflow-y-auto
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
              <div className="p-4 space-y-1">
                <div className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 mb-2">Main Menu</div>
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
                    <SidebarItem to="/student/my-application" icon={<FileText size={18} />} label="View Status" />
                  </>
                )}
                {role === 'college' && (
                  <SidebarItem to="/college/applications" icon={<ClipboardList size={18} />} label="Applications" />
                )}
              </div>
            </aside>
          </>
        )}

        {/* Scrollable Content Column */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${role !== 'guest' ? 'md:ml-64' : ''}`}>
          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            <div className="w-full">
              {children}
            </div>
          </main>

          <footer className="bg-slate-50 border-t border-slate-200 py-8">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">© 2026 Directorate of Technical Education</p>
              <p className="text-slate-500 text-xs font-medium mt-2">Government of Tamil Nadu • Admission Portal</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-3 px-4 py-2.5 rounded text-slate-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all font-semibold text-sm">
    <span className="text-slate-400">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default MainLayout;
