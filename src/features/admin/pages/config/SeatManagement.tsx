import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../store/store';
import { toggleAdmissionStatus } from '../../../../store/slices/configSlice';
import AdminLayout from '../../components/layout/AdminLayout';
import { Users, ShieldAlert } from 'lucide-react';

const SeatManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { classes } = useSelector((state: RootState) => state.config);

  const handleToggleStatus = (cls: any) => {
    const newStatus = !cls.admissionOpen;

    const apiPayload = {
      admissionOpen: newStatus
    };
    console.log(JSON.stringify(apiPayload, null, 2));

    dispatch(toggleAdmissionStatus(cls.id!));
  };

  return (
    <AdminLayout 
      pageTitle="Seat Status Dashboard" 
      pageDescription="Monitor class occupancy and control enrollment availability."
      breadcrumbs={[{ label: 'System Config' }, { label: 'Seat Status' }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {classes.map((cls) => {
          const occupancyRate = (cls.occupiedSeats / cls.totalSeats) * 100;
          const isFull = cls.occupiedSeats >= cls.totalSeats;
          
          return (
            <div key={cls.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-700">
                  <Users size={20} />
                </div>
                <button 
                  onClick={() => handleToggleStatus(cls)}
                  className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border transition-colors ${
                    cls.admissionOpen 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {cls.admissionOpen ? 'Open' : 'Closed'}
                </button>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-1">{cls.name}</h3>
              <p className="text-xs font-bold text-slate-400 mb-4">Section: {cls.section || 'N/A'}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-slate-400">Occupancy</span>
                  <span className={occupancyRate > 90 ? 'text-rose-600' : 'text-slate-600'}>
                    {Math.round(occupancyRate)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${
                      occupancyRate > 90 ? 'bg-rose-500' : occupancyRate > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-bold text-slate-900">{cls.occupiedSeats} / {cls.totalSeats}</span>
                  {isFull && <ShieldAlert size={14} className="text-rose-500" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default SeatManagement;