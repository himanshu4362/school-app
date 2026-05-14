import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Plus, X, Save, Library } from 'lucide-react';

import { RootState } from '../../../../store/store';
import { upsertRoom } from '../../../../store/slices/systemConfigSlice';
import { createPortal } from 'react-dom';
import api from '../../../../services/api';

const RoomPanel: React.FC = () => {
  const dispatch = useDispatch();
  const rooms = useSelector((state: RootState) => state.systemConfig.rooms);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // State for dynamic dropdown
  const [roomTypeOptions, setRoomTypeOptions] = useState<{ value: string, label: string }[]>([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await api.get('/api/master-data/config/room-types');
        const rawData = response.data.data;

        // 🟢 BULLETPROOF FORMATTER: Handles both Array of Strings and Array of Objects
        if (Array.isArray(rawData)) {
          const formattedOptions = rawData.map((item: any) => {
            // If backend sends strings: "STANDARD_CLASSROOM"
            if (typeof item === 'string') {
              return {
                value: item,
                label: item.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
              };
            }
            // If backend already sends objects: { value, label }
            return item; 
          });
          setRoomTypeOptions(formattedOptions);
        }
      } catch (err) {
        console.error("Failed to fetch room types from database:", err);
      }
    };
    fetchMetadata();
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    defaultValues: { status: 'draft', capacity: 30 }
  });

  const onSubmit = async (data: any) => {
    try {
      const apiPayload = {
        roomNumber: data.roomNumber,
        capacity: data.capacity,
        building: data.building || data.buildingWing,
        roomType: data.roomType 
      };

      const response = await api.post('/api/master-data/rooms', apiPayload);

      const newRoom = { 
        ...response.data.data, 
        id: response.data.data._id,
        buildingWing: response.data.data.building
      };
      
      dispatch(upsertRoom(newRoom));
      setIsDrawerOpen(false);
      reset();
    } catch (error: any) {
      alert(error.response?.data?.message || "Room registration failed.");
    }
  };

  return (
    <div className="h-full flex flex-col relative animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Library className="text-indigo-600" /> Infrastructure
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">Manage physical classrooms, labs, and facilities.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <Plus size={16} /> Add Room
        </button>
      </div>

      {/* LIST SECTION */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {Object.values(rooms).map(room => (
          <div key={room.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center group hover:border-indigo-300 transition-all shadow-sm">
            <div>
              <h3 className="text-sm font-black text-slate-900">Room {room.roomNumber}</h3>
              <p className="text-xs font-bold text-slate-400 mt-1">
                Cap: {room.capacity} | Type: {room.roomType ? room.roomType.replace(/_/g, ' ') : 'N/A'} | {room.building || (room as any).buildingWing}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
              (room as any).status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
            }`}>
              {(room as any).status || 'Active'}
            </div>
          </div>
        ))}
        {Object.keys(rooms).length === 0 && (
          <div className="text-center py-10 bg-white border border-slate-200 border-dashed rounded-3xl">
            <Library size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">No rooms configured.</p>
          </div>
        )}
      </div>

      {/* SLIDE-OVER DRAWER (PORTAL) */}
      {isDrawerOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end py-5">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 flex items-center gap-2"><Plus size={18} className="text-indigo-600" /> New Room</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex-1 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Room Number *</label>
                  <input {...register('roomNumber', { required: true })} placeholder="e.g. 101" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" />
                  {errors.roomNumber && <p className="text-xs text-rose-500 mt-1 font-bold">Required.</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Capacity *</label>
                  <input type="number" {...register('capacity', { valueAsNumber: true, required: true })} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" />
                  {errors.capacity && <p className="text-xs text-rose-500 mt-1 font-bold">Required.</p>}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Building / Block</label>
                <input {...register('building')} placeholder="e.g. East Block" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" />
              </div>

              {/* 🟢 FULLY DYNAMIC DROPDOWN */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Room Type</label>
                <select {...register('roomType', { required: true })} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500">
                  <option value="">Select Type...</option>
                  {roomTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.roomType && <p className="text-xs text-rose-500 mt-1 font-bold">Please select a type.</p>}
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black text-xs uppercase tracking-widest mt-8 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-200">
                <Save size={16} /> Save Room
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default RoomPanel;