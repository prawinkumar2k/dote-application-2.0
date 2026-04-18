import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Database, Plus, Search, ChevronRight, Hash, Layers, List } from 'lucide-react';

const MasterData = () => {
  const [activeTab, setActiveTab] = useState('communities');

  const categories = [
    { id: 'communities', title: 'Communities', icon: <Layers size={18} />, count: 12 },
    { id: 'castes', title: 'Castes', icon: <List size={18} />, count: 450 },
    { id: 'religions', title: 'Religions', icon: <Hash size={18} />, count: 6 },
    { id: 'boards', title: 'Qualifying Boards', icon: <Database size={18} />, count: 8 },
  ];

  return (
    <MainLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Master Data Management</h1>
          <p className="text-slate-500">Maintain core system tables and lookup values</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 space-y-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                  activeTab === cat.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {cat.icon}
                  <span className="font-bold">{cat.title}</span>
                </div>
                <div className={`px-2 py-0.5 rounded-lg text-xs font-bold ${activeTab === cat.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                  {cat.count}
                </div>
              </button>
            ))}
          </div>

          {/* Table Content */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input type="text" placeholder={`Search ${activeTab}...`} className="input-field pl-10" />
                </div>
                <button className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
                  <Plus size={18} /> Add Entry
                </button>
              </div>

              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-sm">{i}</div>
                      <div>
                        <p className="font-bold text-slate-800">Sample {activeTab.slice(0, -1)} Value {i}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">Code: VAL-00{i}</p>
                      </div>
                    </div>
                    <button className="text-slate-400 group-hover:text-blue-600 transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <button className="text-blue-600 font-bold text-sm hover:underline">Load more results</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MasterData;
