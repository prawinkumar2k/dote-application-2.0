import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Plus, Search, Filter, Edit, Trash2, Building, MapPin, Globe, X, Eye } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';

const initialFormData = {
  ins_code: '',
  ins_name: '',
  ins_type: '',
  ins_type_id: '',
  ins_status: 'A',
  ins_district: '',
  ins_city: '',
  ins_state: '',
  ins_country: '',
  ins_pincode: '',
  ins_address: '',
  ins_principal: '',
  ins_phone_number: '',
  ins_principal_whatsapp_number: '',
  ins_principal_contact_number: '',
  ins_email_id_office: '',
  ins_email_id_principal: '',
  ins_website_url: '',
  ins_logo_url: '',
};

const ManageColleges = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [formData, setFormData] = useState({ ...initialFormData });
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/colleges');
      if (response.data.success) {
        setColleges(response.data.colleges);
      }
    } catch (err) {
      console.error('Failed to fetch colleges:', err);
      toast.error('Failed to load colleges');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData({ ...initialFormData });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ins_code || !formData.ins_name) {
      toast.error('Institution Code and Name are required');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/add-college', formData);
      if (response.data.success) {
        toast.success(response.data.message);
        handleCloseModal();
        fetchColleges();
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add college';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Colleges</h1>
            <p className="text-slate-500">{total} active institutions in the system</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by name, code or location..." className="input-field pr-10" />
          </div>
          <div className="flex gap-2">
            <select className="input-field w-auto min-w-[140px]">
              <option value="">All Regions</option>
              {[...new Set(colleges.map(c => c.ins_district).filter(Boolean))].sort().map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">
              <Filter size={18} /> Filter
            </button>
          </div>
          <select
            className="input-field w-auto min-w-[180px]"
            value={district}
            onChange={e => { setDistrict(e.target.value); setPage(1); }}
          >
            <option value="">All Districts</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">College Name & Code</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">District</th>
                  <th className="px-6 py-4">Principal</th>
                  <th className="px-6 py-4">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {colleges.map((college) => (
                  <tr key={college.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <Building size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{college.ins_name}</p>
                          <p className="text-xs font-semibold text-blue-600 mt-0.5">{college.ins_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <MapPin size={14} className="text-slate-400" />
                        {college.ins_city || college.ins_district || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <Globe size={14} className="text-slate-400" />
                        {college.ins_district || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        college.ins_status === 'A' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-slate-100 text-slate-500'
                      }`}>
                        {college.ins_status === 'A' ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedCollege(college); setShowViewModal(true); }}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all shadow-none hover:shadow-sm"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-none hover:shadow-sm" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all shadow-none hover:shadow-sm border border-transparent hover:border-rose-100" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No colleges found in the database.
                    </td>
                  </tr>
                ) : (
                  paginated.map((college, i) => (
                    <tr key={college.ins_code || i} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                            <Building size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">{college.ins_name}</p>
                            <p className="text-xs font-semibold text-blue-600 mt-0.5">{college.ins_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">{college.ins_type || '—'}</td>
                      <td className="px-6 py-5 text-sm text-slate-600">{college.ins_district || '—'}</td>
                      <td className="px-6 py-5 text-sm text-slate-600">{college.ins_principal || '—'}</td>
                      <td className="px-6 py-5 text-sm text-slate-600">{college.ins_phone_number || college.ins_email_id_office || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <p className="text-xs text-slate-500 font-medium">Showing {colleges.length} colleges</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * PAGE_SIZE >= total}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add New College Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseModal}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.25 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden z-10 border border-slate-100"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Add New College</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Fill in the institution details below</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(85vh-160px)] px-8 py-6">
                
                {/* Section 1: Basic Information */}
                <SectionHeader title="Basic Information" />
                <div className="grid md:grid-cols-2 gap-5 mb-8">
                  <FormField label="Institution Code" name="ins_code" value={formData.ins_code} onChange={handleInputChange} required placeholder="e.g. GCT001" />
                  <FormField label="Institution Name" name="ins_name" value={formData.ins_name} onChange={handleInputChange} required placeholder="e.g. Government College of Technology" />
                  <FormField label="Institution Type" name="ins_type" value={formData.ins_type} onChange={handleInputChange} required placeholder="e.g. Polytechnic / Engineering" />
                  <FormField label="Institution Type ID" name="ins_type_id" value={formData.ins_type_id} onChange={handleInputChange} required type="number" placeholder="e.g. 1" />
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status <span className="text-rose-500">*</span></label>
                    <select name="ins_status" value={formData.ins_status} onChange={handleInputChange} required className="input-field">
                      <option value="A">Active</option>
                      <option value="I">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Section 2: Location Details */}
                <SectionHeader title="Location Details" />
                <div className="grid md:grid-cols-2 gap-5 mb-8">
                  <FormField label="District" name="ins_district" value={formData.ins_district} onChange={handleInputChange} required placeholder="e.g. Coimbatore" />
                  <FormField label="City" name="ins_city" value={formData.ins_city} onChange={handleInputChange} required placeholder="e.g. Coimbatore" />
                  <FormField label="State" name="ins_state" value={formData.ins_state} onChange={handleInputChange} required placeholder="e.g. Tamil Nadu" />
                  <FormField label="Country" name="ins_country" value={formData.ins_country} onChange={handleInputChange} required placeholder="e.g. India" />
                  <FormField label="Pincode" name="ins_pincode" value={formData.ins_pincode} onChange={handleInputChange} required placeholder="e.g. 641013" maxLength={10} />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Address <span className="text-rose-500">*</span></label>
                    <textarea name="ins_address" value={formData.ins_address} onChange={handleInputChange} required className="input-field min-h-[80px]" placeholder="Enter the complete institution address" />
                  </div>
                </div>

                {/* Section 3: Contact Information */}
                <SectionHeader title="Contact Information" />
                <div className="grid md:grid-cols-2 gap-5 mb-8">
                  <FormField label="Principal Name" name="ins_principal" value={formData.ins_principal} onChange={handleInputChange} required placeholder="e.g. Dr. Ramesh Kumar" />
                  <FormField label="Phone Number" name="ins_phone_number" value={formData.ins_phone_number} onChange={handleInputChange} required placeholder="e.g. 0422-2572177" />
                  <FormField label="Principal WhatsApp" name="ins_principal_whatsapp_number" value={formData.ins_principal_whatsapp_number} onChange={handleInputChange} required placeholder="e.g. 9876543210" />
                  <FormField label="Principal Contact Number" name="ins_principal_contact_number" value={formData.ins_principal_contact_number} onChange={handleInputChange} required placeholder="e.g. 9876543210" />
                </div>

                {/* Section 4: Digital Information */}
                <SectionHeader title="Digital Information" />
                <div className="grid md:grid-cols-2 gap-5 mb-4">
                  <FormField label="Office Email" name="ins_email_id_office" value={formData.ins_email_id_office} onChange={handleInputChange} required type="email" placeholder="e.g. office@gct.ac.in" />
                  <FormField label="Principal Email" name="ins_email_id_principal" value={formData.ins_email_id_principal} onChange={handleInputChange} required type="email" placeholder="e.g. principal@gct.ac.in" />
                  <FormField label="Website URL" name="ins_website_url" value={formData.ins_website_url} onChange={handleInputChange} required placeholder="e.g. https://www.gct.ac.in" />
                  <FormField label="Logo URL" name="ins_logo_url" value={formData.ins_logo_url} onChange={handleInputChange} required placeholder="e.g. https://www.gct.ac.in/logo.png" />
                </div>

              </form>

              {/* Modal Footer - Fixed */}
              <div className="sticky bottom-0 bg-white border-t border-slate-100 px-8 py-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary px-8 py-2.5 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Plus size={18} /> {loading ? 'Adding...' : 'Add College'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View College Details Modal */}
      <AnimatePresence>
        {showViewModal && selectedCollege && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} transition={{ duration: 0.25 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden z-10 border border-slate-100">
              <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">College Details</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{selectedCollege.ins_name}</p>
                </div>
                <button onClick={() => setShowViewModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"><X size={22} /></button>
              </div>
              <div className="overflow-y-auto max-h-[calc(85vh-90px)] px-8 py-6 space-y-8">
                <div>
                  <SectionHeader title="Basic Information" />
                  <div className="grid grid-cols-2 gap-4">
                     <DetailRow label="Institution Name" value={selectedCollege.ins_name} />
                     <DetailRow label="Institution Code" value={selectedCollege.ins_code} />
                     <DetailRow label="Institution Type" value={selectedCollege.ins_type} />
                     <DetailRow label="Type ID" value={selectedCollege.ins_type_id} />
                     <DetailRow label="Status" value={selectedCollege.ins_status === 'A' ? 'Active' : 'Inactive'} />
                  </div>
                </div>

                <div>
                  <SectionHeader title="Location Details" />
                  <div className="grid grid-cols-2 gap-4">
                     <DetailRow label="Address" value={selectedCollege.ins_address} fullWidth />
                     <DetailRow label="City" value={selectedCollege.ins_city} />
                     <DetailRow label="District" value={selectedCollege.ins_district} />
                     <DetailRow label="State" value={selectedCollege.ins_state} />
                     <DetailRow label="Country" value={selectedCollege.ins_country} />
                     <DetailRow label="Pincode" value={selectedCollege.ins_pincode} />
                  </div>
                </div>

                <div>
                  <SectionHeader title="Contact Information" />
                  <div className="grid grid-cols-2 gap-4">
                     <DetailRow label="Principal Name" value={selectedCollege.ins_principal} />
                     <DetailRow label="Phone Number" value={selectedCollege.ins_phone_number} />
                     <DetailRow label="Principal WhatsApp" value={selectedCollege.ins_principal_whatsapp_number} />
                     <DetailRow label="Principal Contact" value={selectedCollege.ins_principal_contact_number} />
                  </div>
                </div>

                <div>
                  <SectionHeader title="Digital Information" />
                  <div className="grid grid-cols-2 gap-4">
                     <DetailRow label="Office Email" value={selectedCollege.ins_email_id_office} />
                     <DetailRow label="Principal Email" value={selectedCollege.ins_email_id_principal} />
                     <DetailRow label="Website" value={selectedCollege.ins_website_url} isLink />
                     <DetailRow label="Logo URL" value={selectedCollege.ins_logo_url} isLink />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </MainLayout>
  );
};

export default ManageColleges;

// --- Sub-components ---

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-3 mb-4">
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    <div className="flex-1 h-px bg-slate-100"></div>
  </div>
);

const FormField = ({ label, name, value, onChange, type = 'text', required = false, placeholder = '', maxLength }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label}
      {required && <span className="text-rose-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      maxLength={maxLength}
      className="input-field"
    />
  </div>
);

const DetailRow = ({ label, value, fullWidth = false, isLink = false }) => (
  <div className={`flex flex-col ${fullWidth ? 'col-span-2' : ''}`}>
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</span>
    {isLink && value ? (
      <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline break-all">{value}</a>
    ) : (
      <span className="text-sm font-medium text-slate-900 break-all">{value || 'N/A'}</span>
    )}
  </div>
);
