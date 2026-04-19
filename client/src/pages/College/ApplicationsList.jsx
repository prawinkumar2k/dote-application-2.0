import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../../components/layout/MainLayout';
import { Search, Eye, CheckCircle, Clock, XCircle, Download, X } from 'lucide-react';
import { toast } from 'react-toastify';

const StatusBadge = ({ status }) => {
  const styles = {
    Approved: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-rose-100 text-rose-700',
    Pending: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
};

const ApplicationsList = () => {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [viewerUrl, setViewerUrl] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data } = await axios.get('/api/college/applications', { withCredentials: true });
        if (data.success && data.applications) {
          const formattedApps = data.applications.map(app => ({
            db_id: app.id,
            id: app.application_no || `APP-${app.id}`,
            name: app.student_name || 'Anonymous',
            course: 'General Degree',
            mark: '88%',
            status: app.application_status || 'Pending',
            date: app.created_at ? new Date(app.created_at).toISOString().split('T')[0] : '2026-04-10',
            email: app.email,
            mobile: app.mobile,
            raw: app
          }));
          setApps(formattedApps);
        }
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const handleStatusChange = async (db_id, id_display, newStatus) => {
    try {
      await axios.put(`/api/college/applications/${db_id}/status`, { status: newStatus }, { withCredentials: true });
      setApps(apps.map(app => app.db_id === db_id ? { ...app, status: newStatus } : app));
      setSelectedApp(null);
      if (newStatus === 'Approved') toast.success('Application Approved successfully!');
      if (newStatus === 'Rejected') toast.error('Application has been Rejected.');
    } catch (err) {
      console.error('Failed to change status:', err);
      toast.error('Could not save the application status to the database.');
    }
  };

  const filteredApps = apps.filter(app => {
    const matchesFilter = filter === 'All' || app.status === filter;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const total = filteredApps.length;
  const paginated = filteredApps.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDownloadProfile = (app) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Application - ${app.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; padding: 40px; color: #1e293b; }
            h2 { border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
            th, td { padding: 12px; text-align: left; border: 1px solid #cbd5e1; }
            th { background-color: #f8fafc; width: 25%; color: #475569; }
            .status { display: inline-block; padding: 6px 12px; border-radius: 4px; font-weight: bold; background: #f1f5f9; }
          </style>
        </head>
        <body>
          <h2>Application Profile: ${app.name} (${app.id})</h2>
          <table>
            <tbody>
              <tr><th>Applied Course</th><td>${app.course}</td><th>Merit Score</th><td>${app.mark}</td></tr>
              <tr><th>Date of Birth</th><td>${app.raw.dob || '-'}</td><th>Gender</th><td>${app.raw.gender || '-'}</td></tr>
              <tr><th>Age</th><td>${app.raw.age || '-'}</td><th>Aadhar Number</th><td>${app.raw.aadhar_number || '-'}</td></tr>
              <tr><th>Father's Name</th><td>${app.raw.father_name || '-'}</td><th>Mother's Name</th><td>${app.raw.mother_name || '-'}</td></tr>
              <tr><th>Religion / Community</th><td>${app.raw.religion || '-'} / ${app.raw.community || '-'}</td><th>Caste</th><td>${app.raw.caste || '-'}</td></tr>
              <tr><th>Mobile Number</th><td>${app.raw.mobile || app.mobile || '-'}</td><th>Email Address</th><td>${app.raw.email || app.email || '-'}</td></tr>
              <tr><th>Communication Address</th><td colspan="3">${app.raw.communication_address || '-'}</td></tr>
              <tr><th>Last Institution Attended</th><td colspan="3">${app.raw.last_studied_school_name || '-'}</td></tr>
            </tbody>
          </table>
          <p>Current Application Status: <span class="status">${app.status}</span></p>
          <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <MainLayout role="college">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Incoming Applications</h1>
            <p className="text-slate-500">{apps.length} submitted application{apps.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or app ID..."
                className="w-full bg-slate-50 border border-slate-200 py-3 pl-12 pr-4 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {['All', 'Pending', 'Approved', 'Rejected'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="px-4 py-4">Student</th>
                  <th className="px-4 py-4">App ID</th>
                  <th className="px-4 py-4">Community</th>
                  <th className="px-4 py-4 text-center">HSC %</th>
                  <th className="px-4 py-4">Special</th>
                  <th className="px-4 py-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading student applications...</td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">No applications match your criteria.</td>
                  </tr>
                ) : paginated.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {app.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{app.name}</p>
                          <p className="text-xs text-slate-400">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-sm font-semibold text-blue-600">{app.id}</td>
                    <td className="px-4 py-5 font-medium text-slate-700">{app.raw?.community || '—'}</td>
                    <td className="px-4 py-5 text-center">
                      <span className="font-bold text-blue-600">{app.raw?.hsc_percentage ? `${app.raw.hsc_percentage}%` : '—'}</span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex gap-1 flex-wrap">
                        {app.raw?.differently_abled === 'yes' && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">DA</span>}
                        {app.raw?.ex_servicemen === 'yes' && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">EX</span>}
                        {app.raw?.eminent_sports === 'yes' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">SP</span>}
                      </div>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-none hover:shadow-sm"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > PAGE_SIZE && (
            <div className="mt-6 flex justify-between items-center">
              <p className="text-xs text-slate-500">Showing {paginated.length} of {total}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 disabled:opacity-40">Prev</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page * PAGE_SIZE >= total}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h2 className="text-xl font-bold text-slate-800">Application Details</h2>
              <div className="flex gap-3">
                <button onClick={() => handleDownloadProfile(selectedApp)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm">
                  <Download size={16} /> Print / Download
                </button>
                <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600 hover:bg-white hover:shadow-sm p-2 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
              {/* Profile Header */}
              <div className="flex items-center gap-5 border-b border-slate-100 pb-8">
                {selectedApp?.raw?.photo ? (
                  <img
                    src={selectedApp.raw.photo}
                    alt={selectedApp.name}
                    className="w-20 h-20 rounded-[1.25rem] object-cover shadow-sm shrink-0 border border-slate-200"
                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                  />
                ) : null}
                <div
                  className={`w-20 h-20 rounded-[1.25rem] bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl shadow-inner shrink-0 ${selectedApp?.raw?.photo ? 'hidden' : 'flex'}`}
                >
                  {selectedApp.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedApp.name}</h3>
                  <div className="text-blue-600 font-bold mt-1 flex items-center gap-3">
                    {selectedApp.id}
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span className="text-slate-500 font-semibold">{selectedApp.course} (Merit: {selectedApp.mark})</span>
                  </div>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={selectedApp.status} />
                </div>
              </div>

              {/* Data Grid Sections */}
              <div className="space-y-10">
                {/* Personal Information */}
                <div>
                  <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 mb-5 flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>Personal Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                    <div><div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">DOB / Age</div><div className="font-semibold text-slate-800">{selectedApp?.raw?.dob || '-'} <span className="text-slate-400 font-normal ml-1">({selectedApp?.raw?.age ? selectedApp.raw.age + 'y' : '-'})</span></div></div>
                    <div><div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Gender</div><div className="font-semibold text-slate-800">{selectedApp?.raw?.gender || '-'}</div></div>
                    <div><div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Aadhar No.</div><div className="font-semibold text-slate-800">{selectedApp?.raw?.aadhar_number || '-'}</div></div>
                    <div><div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Citizenship</div><div className="font-semibold text-slate-800">{selectedApp?.raw?.citizenship || '-'}</div></div>
                    <div><div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Religion</div><div className="font-semibold text-slate-800">{selectedApp?.raw?.religion || '-'}</div></div>
                    <div><div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Community</div><div className="font-semibold text-slate-800">{selectedApp?.raw?.community || '-'}</div></div>
                    <div><div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Caste</div><div className="font-semibold text-slate-800 text-sm truncate" title={selectedApp?.raw?.caste}>{selectedApp?.raw?.caste || '-'}</div></div>
                    <div><div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Mother Tongue</div><div className="font-semibold text-slate-800">{selectedApp?.raw?.mother_tongue || '-'}</div></div>
                  </div>
                </div>

                {/* Family & Contact Data */}
                <div>
                  <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 mb-5 flex items-center"><span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>Family & Contact Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-4">
                    <div><div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Father's Name</div><div className="font-semibold text-slate-800">{selectedApp?.raw?.father_name || '-'}</div></div>
                    <div><div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Mother's Name</div><div className="font-semibold text-slate-800">{selectedApp?.raw?.mother_name || '-'}</div></div>
                    <div><div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Annual Income</div><div className="font-semibold text-slate-800">{selectedApp?.raw?.parent_annual_income || '-'}</div></div>
                    <div><div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Mobile Number</div><div className="font-semibold text-slate-800">{selectedApp?.raw?.mobile || selectedApp.mobile || '-'}</div></div>
                    <div className="col-span-2"><div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Email Address</div><div className="font-semibold text-slate-800">{selectedApp?.raw?.email || selectedApp.email || '-'}</div></div>
                    <div className="col-span-full"><div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Communication Address</div><div className="font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">{selectedApp?.raw?.communication_address || '-'}</div></div>
                  </div>
                </div>

                {/* Academic & Documents */}
                <div>
                  <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 mb-5 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Academic & Certificates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                    <div className="col-span-full"><div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Last School Attended</div><div className="font-semibold text-slate-800">{selectedApp?.raw?.last_studied_school_name || '-'}</div></div>

                    <div className="col-span-full mt-2">
                      <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Student Attachments</div>
                      <div className="flex flex-wrap gap-3">
                        {selectedApp?.raw?.marksheet_certificate && (
                          <button onClick={() => setViewerUrl(selectedApp.raw.marksheet_certificate)} className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 hover:bg-amber-100 transition-colors rounded-lg text-sm font-bold border border-amber-100">
                            View Marksheet
                          </button>
                        )}
                        {selectedApp?.raw?.transfer_certificate && (
                          <button onClick={() => setViewerUrl(selectedApp.raw.transfer_certificate)} className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 hover:bg-emerald-100 transition-colors rounded-lg text-sm font-bold border border-emerald-100">
                            View Transfer Certificate
                          </button>
                        )}
                        {selectedApp?.raw?.community_certificate && (
                          <button onClick={() => setViewerUrl(selectedApp.raw.community_certificate)} className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 hover:bg-purple-100 transition-colors rounded-lg text-sm font-bold border border-purple-100">
                            View Community Certificate
                          </button>
                        )}
                        {(!selectedApp?.raw?.photo && !selectedApp?.raw?.marksheet_certificate) && <span className="text-slate-400 text-sm">No attachments found in the database.</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => handleStatusChange(selectedApp.db_id, selectedApp.id, 'Approved')}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-500/30"
                >
                  Approve Candidate
                </button>
                <button
                  onClick={() => handleStatusChange(selectedApp.db_id, selectedApp.id, 'Rejected')}
                  className="flex-1 bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 font-bold py-4 rounded-xl transition-all"
                >
                  Reject Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Attachment Viewer Modal */}
      {viewerUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" onClick={() => setViewerUrl(null)}>
          <div className="relative bg-white p-2 rounded-2xl shadow-2xl flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end p-2 absolute right-4 top-4 z-10 bg-white/50 shadow rounded-full backdrop-blur">
              <button onClick={() => setViewerUrl(null)} className="text-slate-800 hover:text-red-600 hover:bg-white rounded-full p-1 transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="overflow-auto rounded-xl bg-slate-100 flex items-center justify-center w-[800px] h-[600px] max-w-full max-h-[85vh]">
              <img
                src={viewerUrl}
                className="max-w-full max-h-full object-contain"
                alt="Document Preview"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/800x600/f1f5f9/94a3b8?text=Image+Not+Found';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ApplicationsList;
