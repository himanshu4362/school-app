import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Users, Lock, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../../../services/api'; // Aapka axios instance

const SeatManagement: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchSeatInventory = async () => {
    try {
      setIsLoading(true);
      // Backend ke sahi route ko hit karein
      const res = await api.get('/api/master-data/seats'); 
      if (res.data.success) {
        
        // Backend se aaye complex quota array ko flat format me convert karein
        const formattedSeats = res.data.data.map((inventory: any) => {
          let totalConsumed = 0;
          let totalBlocked = 0;
          
          // Sabhi categories (GENERAL, OBC, etc.) ki seats ko jod (sum) lein
          if (inventory.quotas) {
            Object.values(inventory.quotas).forEach((q: any) => {
              totalConsumed += (q.consumedSeats || 0);
              totalBlocked += (q.blockedSeats || 0);
            });
          }

          return {
            _id: inventory._id,
            gradeId: inventory.gradeId?._id,
            name: inventory.gradeId?.name || 'Unknown Class',
            section: inventory.gradeId?.section || 'Standard',
            totalSeats: inventory.totalCapacity,
            occupiedSeats: totalConsumed,
            lockedSeats: totalBlocked,
            availableSeats: inventory.totalCapacity - totalConsumed - totalBlocked,
            admissionOpen: true // Agar API me toggle flag ho toh wo use karein
          };
        });

        setClasses(formattedSeats);
      }
    } catch (err) {
      console.error("Seat inventory load karne me error aayi", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatInventory();
  }, []);

  const handleToggleStatus = async (cls: any) => {
    try {
      const newStatus = !cls.admissionOpen;
      // Backend par admission status toggle ka patch request bhejien
      const res = await api.patch(`/api/master-data/grades/${cls._id || cls.id}/toggle-admission`, {
        admissionOpen: newStatus
      });
      
      if (res.data.success) {
        // State ko instantly update karo reload kiye bina
        setClasses(prev => prev.map(c => (c._id === cls._id || c.id === cls.id) ? { ...c, admissionOpen: newStatus } : c));
      }
    } catch (err) {
      alert("Failed to update admission status.");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Seat Status Dashboard" pageDescription="Loading live data...">
        <div className="flex h-64 items-center justify-center gap-2 text-slate-500 font-bold">
          <Loader2 className="animate-spin" size={24} /> Fetching Real-Time Seat Inventory...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      pageTitle="Seat Status Dashboard" 
      pageDescription="Monitor class occupancy, locked applications, and control enrollment availability."
      breadcrumbs={[{ label: 'System Config' }, { label: 'Seat Status' }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {classes.map((cls) => {
          const total = cls.totalSeats || 0;
          const occupied = cls.occupiedSeats || 0;
          const locked = cls.lockedSeats || 0;
          const available = cls.availableSeats !== undefined ? cls.availableSeats : Math.max(0, total - occupied - locked);
          
          const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;
          const lockedRate = total > 0 ? (locked / total) * 100 : 0;
          const isFull = available <= 0;
          
          return (
            <div key={cls._id || cls.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${isFull ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                  <Users size={20} />
                </div>
                <button 
                  onClick={() => handleToggleStatus(cls)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cls.admissionOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cls.admissionOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-1">{cls.name}</h3>
              <p className="text-xs font-bold text-slate-400 mb-4">Section: {cls.section || 'Standard'}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-slate-400">Total Filled</span>
                  <span className={isFull ? 'text-rose-600' : 'text-slate-600'}>
                    {Math.round(occupancyRate + lockedRate)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${Math.min(occupancyRate, 100)}%` }} />
                  <div className="bg-amber-400 h-full transition-all duration-700" style={{ width: `${Math.min(lockedRate, 100 - occupancyRate)}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center border-t border-slate-100 pt-4">
                <div>
                  <div className="flex justify-center items-center gap-1 mb-1 text-emerald-600"><CheckCircle size={10} /></div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Enrolled</p>
                  <p className="text-sm font-black text-slate-800">{occupied}</p>
                </div>
                <div>
                  <div className="flex justify-center items-center gap-1 mb-1 text-amber-500"><Lock size={10} /></div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Locked</p>
                  <p className="text-sm font-black text-slate-800">{locked}</p>
                </div>
                <div>
                  <div className="flex justify-center items-center gap-1 mb-1 text-blue-500"><Users size={10} /></div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Available</p>
                  <p className={`text-sm font-black ${isFull ? 'text-rose-600' : 'text-blue-600'}`}>{available}</p>
                </div>
              </div>
              
              {isFull && <div className="absolute top-0 right-0 w-full h-1 bg-rose-500" />}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default SeatManagement;