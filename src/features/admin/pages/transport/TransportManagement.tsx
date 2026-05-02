import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Truck, Plus, Wrench, User, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react';


const mockFleet = [
  { 
    id: 'BUS-04', 
    route: 'Route 04 - City Center', 
    driver: 'Manoj Singh', 
    contact: '+91 98765 22004', 
    capacity: '52 Seater', 
    status: 'On Route', 
    maintenance: 'Good' 
  },
  { 
    id: 'BUS-09', 
    route: 'Route 09 - Sector 4', 
    driver: 'Rajesh Kumar', 
    contact: '+91 98765 22009', 
    capacity: '42 Seater', 
    status: 'Maintenance', 
    maintenance: 'Engine Overhaul' 
  },
  { 
    id: 'BUS-12', 
    route: 'Route 12 - Bariatu', 
    driver: 'Suresh Pal', 
    contact: '+91 98765 22012', 
    capacity: '52 Seater', 
    status: 'Standby', 
    maintenance: 'Service Due' 
  },
];

const TransportManagement: React.FC = () => {
  return (
    <AdminLayout 
      pageTitle="Transport & Fleet" 
      pageDescription="Manage school bus routes, driver assignments, and vehicle maintenance logs."
      headerActions={
        <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg">
          <Plus size={18}/> Add Vehicle
        </button>
      }
    >
      {/* High-Level Fleet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <Truck size={20}/> 
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Fleet</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">18 Buses</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <CheckCircle2 size={20}/> 
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Routes</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">15 Operational</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center gap-3 text-rose-600 mb-2">
            <Wrench size={20}/> 
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">In Maintenance</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">3 Vehicles</p>
        </div>
      </div>

      {/* Fleet Data Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-900/5">
        <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
          <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Fleet Status Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px] tracking-widest border-b">
                <th className="px-6 py-4 text-left font-semibold">Vehicle & Route</th>
                <th className="px-6 py-4 text-left font-semibold">Staff Assignment</th>
                <th className="px-6 py-4 text-left font-semibold">Logistics</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockFleet.map(bus => (
                <tr key={bus.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-600 font-black text-[10px]">{bus.id}</div>
                      <div>
                        <p className="font-bold text-slate-900 leading-none">{bus.route}</p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 uppercase font-bold"><Navigation size={10}/> Tracking Active</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400"/>
                      <div>
                        <p className="text-slate-900 font-semibold">{bus.driver}</p>
                        <p className="text-xs text-slate-400 font-mono">{bus.contact}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium italic">
                    {bus.capacity}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ring-1 ring-inset ${
                      bus.status === 'Maintenance' ? 'bg-rose-50 text-rose-700 ring-rose-600/20' : 
                      bus.status === 'On Route' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                      'bg-slate-100 text-slate-600 ring-slate-400/20'
                    }`}>
                      {bus.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">{bus.maintenance}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 font-bold hover:underline text-xs">Route Map</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TransportManagement;