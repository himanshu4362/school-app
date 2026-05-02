import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { Package, Plus, AlertCircle, MapPin, Monitor, Book } from 'lucide-react';

const mockAssets = [
  { id: 'AST-001', name: 'Dell Latitude 3420', category: 'IT', status: 'Assigned', location: 'Lab 1', condition: 'Excellent' },
  { id: 'AST-042', name: 'Microscope - Biological', category: 'Science', status: 'In Stock', location: 'Biology Lab', condition: 'Under Repair' },
  { id: 'AST-109', name: 'Library Bench - Oak', category: 'Furniture', status: 'Assigned', location: 'Library', condition: 'Good' },
];

const Inventory: React.FC = () => {
  return (
    <AdminLayout 
      pageTitle="Inventory & Assets" 
      pageDescription="Track school property, equipment condition, and room assignments."
      headerActions={<button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg"><Plus size={18}/> Add Asset</button>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 ring-1 ring-slate-900/5">
           <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Package size={24}/></div>
           <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Items</p><p className="text-2xl font-bold text-slate-900">1,240</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm flex items-center gap-4 ring-1 ring-slate-900/5">
           <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><AlertCircle size={24}/></div>
           <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Damaged/Repair</p><p className="text-2xl font-bold text-slate-900">14</p></div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-900/5">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-[10px] tracking-widest">Asset Info</th>
              <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-[10px] tracking-widest">Category</th>
              <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-[10px] tracking-widest">Location</th>
              <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-[10px] tracking-widest">Condition</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockAssets.map(asset => (
              <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900">{asset.name}</p>
                  <p className="text-[10px] font-mono text-slate-400 uppercase">{asset.id}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-2 text-slate-600 font-medium italic">
                    {asset.category === 'IT' ? <Monitor size={14}/> : asset.category === 'Science' ? <AlertCircle size={14}/> : <Book size={14}/>}
                    {asset.category}
                  </span>
                </td>
                <td className="px-6 py-4 flex items-center gap-1.5 text-slate-500 font-medium">
                  <MapPin size={14} className="text-slate-300"/> {asset.location}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ring-1 ring-inset ${
                    asset.condition === 'Under Repair' ? 'bg-rose-50 text-rose-700 ring-rose-600/20' : 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                  }`}>{asset.condition}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 font-bold hover:underline text-xs">Assign</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};
export default Inventory;