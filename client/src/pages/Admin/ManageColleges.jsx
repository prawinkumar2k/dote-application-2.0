import FormField from '../../components/Common/FormField';

const ManageColleges = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [formData, setFormData] = useState({ ...initialFormData });
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/auth/colleges', { withCredentials: true });
      if (response.data.success) {
        setColleges(response.data.colleges);
      }
    } catch (err) {
      toast.error('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'College Name & Code',
      accessor: 'ins_name',
      sortable: true,
      filterable: true,
      width: '300px',
      render: (value, row) => (
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
            <Building size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-800 leading-tight">{value}</p>
            <p className="text-xs font-semibold text-blue-600 mt-0.5">{row.ins_code}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'ins_type',
      sortable: true,
      filterable: true,
      width: '150px',
    },
    {
      header: 'District',
      accessor: 'ins_district',
      sortable: true,
      filterable: true,
      width: '180px',
      render: (value) => (
        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
          <MapPin size={14} className="text-slate-400" />
          {value || '—'}
        </div>
      )
    },
    {
      header: 'Principal',
      accessor: 'ins_principal',
      sortable: true,
      filterable: true,
      width: '200px',
    },
    {
      header: 'Contact',
      accessor: 'ins_phone_number',
      width: '200px',
      render: (value, row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Globe size={13} className="text-slate-400" />
            <span className="text-xs font-semibold">{value || '—'}</span>
          </div>
          {row.ins_email_id_office && (
             <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{row.ins_email_id_office}</span>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'ins_code',
      width: '150px',
      render: (_, college) => (
        <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setSelectedCollege(college); setShowViewModal(true); }}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all hover:shadow-sm"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all hover:shadow-sm" title="Edit">
            <Edit size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all hover:shadow-sm border border-transparent hover:border-rose-100" title="Delete">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }));
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData({ ...initialFormData });
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.ins_code) newErrors.ins_code = 'Institution Code is required';
    if (!formData.ins_name) newErrors.ins_name = 'Institution Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/add-college', formData, { withCredentials: true });
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
            <p className="text-slate-500">{colleges.length} active institutions in the system</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 px-5 py-2.5"
          >
            <Plus size={18} /> Add College
          </button>
        </div>

        {/* Colleges Table - Now using the premium DataTable component */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <DataTable 
            columns={columns}
            data={colleges}
            isLoading={loading}
            stickyColumnCount={1}
            onRowClick={(college) => { setSelectedCollege(college); setShowViewModal(true); }}
          />
        </div>
      </div>

      {/* Add New College Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.25 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden z-10 border border-slate-100"
            >
              <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Add New College</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Fill in the institution details below</p>
                </div>
                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(85vh-160px)] px-8 py-6">
                <SectionHeader title="Basic Information" />
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                  <FormField label="Institution Code" required error={errors.ins_code}>
                    <input type="text" name="ins_code" value={formData.ins_code} onChange={handleInputChange} placeholder="e.g. GCT001" className="input-field" />
                  </FormField>
                  <FormField label="Institution Name" required error={errors.ins_name}>
                    <input type="text" name="ins_name" value={formData.ins_name} onChange={handleInputChange} placeholder="e.g. Government College of Technology" className="input-field" />
                  </FormField>
                  <FormField label="Institution Type">
                    <input type="text" name="ins_type" value={formData.ins_type} onChange={handleInputChange} placeholder="e.g. Polytechnic / Engineering" className="input-field" />
                  </FormField>
                  <FormField label="Institution Type ID">
                    <input type="number" name="ins_type_id" value={formData.ins_type_id} onChange={handleInputChange} placeholder="e.g. 1" className="input-field" />
                  </FormField>
                  <FormField label="Current Status">
                    <select name="ins_status" value={formData.ins_status} onChange={handleInputChange} className="input-field">
                      <option value="A">Active</option>
                      <option value="I">Inactive</option>
                    </select>
                  </FormField>
                </div>

                <SectionHeader title="Location Details" />
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                  <FormField label="District">
                    <input type="text" name="ins_district" value={formData.ins_district} onChange={handleInputChange} placeholder="e.g. Coimbatore" className="input-field" />
                  </FormField>
                  <FormField label="City">
                    <input type="text" name="ins_city" value={formData.ins_city} onChange={handleInputChange} placeholder="e.g. Coimbatore" className="input-field" />
                  </FormField>
                  <FormField label="State">
                    <input type="text" name="ins_state" value={formData.ins_state} onChange={handleInputChange} placeholder="e.g. Tamil Nadu" className="input-field" />
                  </FormField>
                  <FormField label="Country">
                    <input type="text" name="ins_country" value={formData.ins_country} onChange={handleInputChange} placeholder="e.g. India" className="input-field" />
                  </FormField>
                  <FormField label="Pincode">
                    <input type="text" name="ins_pincode" value={formData.ins_pincode} onChange={handleInputChange} placeholder="e.g. 641013" maxLength={6} className="input-field" />
                  </FormField>
                  <div className="md:col-span-2">
                    <FormField label="Full Postal Address">
                      <textarea name="ins_address" value={formData.ins_address} onChange={handleInputChange} className="input-field min-h-24" placeholder="Enter the complete institution address" />
                    </FormField>
                  </div>
                </div>

                <SectionHeader title="Contact Information" />
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                  <FormField label="Principal Name">
                    <input type="text" name="ins_principal" value={formData.ins_principal} onChange={handleInputChange} placeholder="e.g. Dr. Ramesh Kumar" className="input-field" />
                  </FormField>
                  <FormField label="Official Phone">
                    <input type="text" name="ins_phone_number" value={formData.ins_phone_number} onChange={handleInputChange} placeholder="e.g. 0422-2572177" className="input-field" />
                  </FormField>
                  <FormField label="Principal WhatsApp">
                    <input type="text" name="ins_principal_whatsapp_number" value={formData.ins_principal_whatsapp_number} onChange={handleInputChange} placeholder="e.g. 9876543210" className="input-field" />
                  </FormField>
                  <FormField label="Principal Mobile">
                    <input type="text" name="ins_principal_contact_number" value={formData.ins_principal_contact_number} onChange={handleInputChange} placeholder="e.g. 9876543210" className="input-field" />
                  </FormField>
                </div>

                <SectionHeader title="Digital Identity" />
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mb-4">
                  <FormField label="Official Email">
                    <input type="email" name="ins_email_id_office" value={formData.ins_email_id_office} onChange={handleInputChange} placeholder="e.g. office@gct.ac.in" className="input-field" />
                  </FormField>
                  <FormField label="Principal Email">
                    <input type="email" name="ins_email_id_principal" value={formData.ins_email_id_principal} onChange={handleInputChange} placeholder="e.g. principal@gct.ac.in" className="input-field" />
                  </FormField>
                  <FormField label="Web URL">
                    <input type="text" name="ins_website_url" value={formData.ins_website_url} onChange={handleInputChange} placeholder="e.g. https://www.gct.ac.in" className="input-field" />
                  </FormField>
                  <FormField label="Logo Reference">
                    <input type="text" name="ins_logo_url" value={formData.ins_logo_url} onChange={handleInputChange} placeholder="e.g. https://www.gct.ac.in/logo.png" className="input-field" />
                  </FormField>
                </div>
              </form>

              <div className="sticky bottom-0 bg-white border-t border-slate-100 px-8 py-4 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" onClick={handleSubmit} disabled={loading} className="btn-primary px-8 py-2.5 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  <Plus size={18} /> {loading ? 'Adding Institution...' : 'Create College Entry'}
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
                  <h2 className="text-2xl font-bold text-slate-900">Institution Details</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{selectedCollege.ins_name}</p>
                </div>
                <button onClick={() => setShowViewModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"><X size={22} /></button>
              </div>
              <div className="overflow-y-auto max-h-[calc(85vh-90px)] px-8 py-6 space-y-8">
                <div>
                  <SectionHeader title="Basic Information" />
                  <div className="grid grid-cols-2 gap-6">
                    <DetailRow label="Institution Name" value={selectedCollege.ins_name} />
                    <DetailRow label="Institution Code" value={selectedCollege.ins_code} />
                    <DetailRow label="Institution Type" value={selectedCollege.ins_type} />
                    <DetailRow label="Type ID" value={selectedCollege.ins_type_id} />
                    <DetailRow label="Status" value={selectedCollege.ins_status === 'A' ? 'Active' : 'Inactive'} />
                  </div>
                </div>
                <div>
                  <SectionHeader title="Location Details" />
                  <div className="grid grid-cols-2 gap-6">
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
                  <div className="grid grid-cols-2 gap-6">
                    <DetailRow label="Principal Name" value={selectedCollege.ins_principal} />
                    <DetailRow label="Phone Number" value={selectedCollege.ins_phone_number} />
                    <DetailRow label="Principal WhatsApp" value={selectedCollege.ins_principal_whatsapp_number} />
                    <DetailRow label="Principal Contact" value={selectedCollege.ins_principal_contact_number} />
                  </div>
                </div>
                <div>
                  <SectionHeader title="Digital Information" />
                  <div className="grid grid-cols-2 gap-6">
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

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-1 h-6 bg-blue-600 rounded-full" />
    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{title}</h3>
    <div className="flex-1 h-px bg-slate-100"></div>
  </div>
);

const DetailRow = ({ label, value, fullWidth = false, isLink = false }) => (
  <div className={`flex flex-col ${fullWidth ? 'col-span-2' : ''}`}>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</span>
    {isLink && value ? (
      <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline break-all">{value}</a>
    ) : (
      <span className="text-sm font-bold text-slate-800 break-all">{value || 'N/A'}</span>
    )}
  </div>
);
