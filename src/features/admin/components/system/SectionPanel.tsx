import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Plus, X, Save, Presentation, Users } from 'lucide-react';
import { createPortal } from 'react-dom';

import { RootState } from '../../../../store/store';
import { upsertSection } from '../../../../store/slices/systemConfigSlice';
import api from '../../../../services/api';

type SectionFormData = {
  academicYearId: string;
  gradeId: string;
  roomId?: string;
  name: string;
  targetCapacity: number;
};

const SectionPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { sections, rooms, academicYears, grades } = useSelector((state: RootState) => state.systemConfig);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Using 'any' temporarily to handle strict Zod mappings while we map to backend payload
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SectionFormData>({
    defaultValues: {
      targetCapacity: 40,
    },
  });

  const watchRoomId = watch("roomId");

  const selectedRoom = watchRoomId
    ? rooms[watchRoomId]
    : null;
  const onSubmit = async (data: any) => {
    // 🟢 Condition Check: Frontend Guard against Room Overcapacity
    if (selectedRoom && data.targetCapacity > selectedRoom.capacity) {
      alert(`Physical Limit Breach: Room ${selectedRoom.roomNumber} only has ${selectedRoom.capacity} seats.`);
      return;
    }

    try {
      // 🟢 Exactly matching your successful Postman payload
      const apiPayload = {
        academicYearId: data.academicYearId,
        gradeId: data.gradeId,
        roomId: data.roomId,
        name: data.name,
        targetCapacity: data.targetCapacity
      };

      const response = await api.post('/api/master-data/sections', apiPayload);

      // Map _id to id for Redux
      const newSec = { ...response.data.data, id: response.data.data._id };

      dispatch(upsertSection(newSec));
      setIsDrawerOpen(false);
      reset();
    } catch (error: any) {
      alert(error.response?.data?.message || "Section creation failed.");
    }
  };

  return (
    <div className="h-full flex flex-col relative animate-in fade-in duration-300">

      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Presentation className="text-indigo-600" /> Sections (Classes)
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">Manage class sections, room allocations, and capacities.</p>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <Plus size={16} /> Add Section
        </button>
      </div>

      {/* LIST SECTION */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {Object.values(sections).map(section => {
          const gradeName = grades[section.gradeId]?.name || 'Unknown Grade';
          const roomName = section.roomId
            ? rooms[section.roomId]?.roomNumber || 'Unassigned'
            : 'Unassigned';

          return (
            <div key={section.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center group hover:border-indigo-300 transition-all shadow-sm">
              <div>
                <h3 className="text-sm font-black text-slate-900">{gradeName} - {section.name}</h3>
                <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-2">
                  <span>Room: {roomName}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="flex items-center gap-1"><Users size={12} /> Target Cap: {section.targetCapacity || (section as any).maxCapacity}</span>
                </p>
              </div>
              <div className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">
                Active
              </div>
            </div>
          );
        })}

        {Object.keys(sections).length === 0 && (
          <div className="text-center py-10 bg-white border border-slate-200 border-dashed rounded-3xl">
            <Presentation size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">No sections configured yet.</p>
          </div>
        )}
      </div>

      {/* SLIDE-OVER DRAWER (PORTAL) */}
      {isDrawerOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 flex items-center gap-2"><Plus size={18} className="text-indigo-600" /> New Section</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex-1 overflow-y-auto space-y-6">

              {/* DROPDOWNS FOR HIERARCHY */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Academic Year *</label>
                  <select {...register('academicYearId', { required: true })} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500">
                    <option value="">Select Year...</option>
                    {Object.values(academicYears).map(year => (
                      <option key={year.id} value={year.id}>{year.name || (year as any).code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Target Grade *</label>
                  <select {...register('gradeId', { required: true })} className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500">
                    <option value="">Select Grade...</option>
                    {Object.values(grades).map(grade => (
                      <option key={grade.id} value={grade.id}>{grade.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Section Name *</label>
                <input {...register('name', { required: true })} placeholder="e.g. Section A" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" />
                {errors.name && <p className="text-xs text-rose-500 mt-1 font-bold">Required.</p>}
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-4">
                <div>
                  <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1.5 block">Physical Room Assignment</label>
                  <select {...register('roomId', { required: true })} className="w-full p-3 bg-white border-2 border-amber-100 rounded-xl text-sm font-bold outline-none focus:border-amber-400">
                    <option value="">-- Assign a Room --</option>
                    {Object.values(rooms).map(room => (
                      <option key={room.id} value={room.id}>Room {room.roomNumber} (Capacity: {room.capacity})</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-amber-600 mt-1 font-bold">Assigning a room limits max capacity automatically.</p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1.5 block">
                    Target Capacity {selectedRoom && `(Limit: ${selectedRoom.capacity})`}
                  </label>
                  <input
                    type="number"
                    {...register('targetCapacity', { valueAsNumber: true, required: true })}
                    className={`w-full p-3 bg-white border-2 rounded-xl text-sm font-bold outline-none transition-colors ${selectedRoom && watch('targetCapacity') > selectedRoom.capacity
                      ? 'border-rose-500 text-rose-600 focus:border-rose-600'
                      : 'border-amber-100 focus:border-amber-400'
                      }`}
                  />
                  {selectedRoom && watch('targetCapacity') > selectedRoom.capacity && (
                    <p className="text-[10px] font-bold text-rose-500 mt-1 animate-in fade-in">This exceeds the physical room capacity!</p>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black text-xs uppercase tracking-widest mt-8 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-200">
                <Save size={16} /> Save & Validate Section
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SectionPanel;