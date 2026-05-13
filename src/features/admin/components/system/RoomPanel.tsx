import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';

import { RootState } from '../../../../store/store';
import { upsertRoom } from '../../../../store/slices/systemConfigSlice';
import { RoomSchema, Room } from '../../../../types/core/systemConfig.schema';
import { createPortal } from 'react-dom';

const RoomPanel: React.FC = () => {
  const dispatch = useDispatch();
  const rooms = useSelector((state: RootState) => state.systemConfig.rooms);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Room>({
    resolver: zodResolver(RoomSchema.omit({ id: true })) as any,
    defaultValues: { status: 'draft', capacity: 30 }
  });

  // ADD THIS: The Silent Bug Catcher
  const onError = (validationErrors: any) => {
    console.warn("Form Validation Failed:", validationErrors);
  };;

  const onSubmit = (data: Room) => {
    const apiPayload = {
      roomNumber: data.roomNumber,
      capacity: data.capacity,
      buildingWing: data.buildingWing || null,
      roomType: data.roomType,
      status: data.status || 'draft'
    };
    console.log(JSON.stringify(apiPayload, null, 2));

    const newRoom: Room = { ...data, id: crypto.randomUUID() };
    dispatch(upsertRoom(newRoom));
    setTimeout(() => { setIsDrawerOpen(false); reset(); }, 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-slate-900">Infrastructure & Rooms</h3>
          <p className="text-xs font-bold text-slate-500">Manage physical capacities to prevent overcrowding.</p>
        </div>
        <button onClick={() => setIsDrawerOpen(true)} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm">
          <Plus size={16} /> New Room
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Object.values(rooms).length === 0 ? (
          <div className="col-span-full p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-bold text-sm">No infrastructure logged.</div>
        ) : (
          Object.values(rooms).map(room => (
            <div key={room.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-base font-black text-slate-900">{room.roomNumber}</h4>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${room.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{room.status}</span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Wing: {room.buildingWing}</p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-black text-indigo-600 uppercase">{room.roomType.replace('_', ' ')}</span>
                <span className="text-xs font-bold text-slate-500">Cap: {room.capacity}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {isDrawerOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] flex justify-end p-2 sm:p-4">
          <div className="bg-white w-full max-w-md h-full shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-right-8 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between bg-slate-50">
              <h3 className="text-sm font-black text-slate-900">Register New Room</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit, onError)} className="p-6 flex-1 overflow-y-auto space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Room Number *</label>
                  <input {...register('roomNumber')} placeholder="e.g. 101" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold uppercase" />
                  {errors.roomNumber && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.roomNumber.message as string}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Capacity *</label>
                  <input type="number" {...register('capacity', { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Building / Wing</label>
                <input {...register('buildingWing')} placeholder="e.g. North Wing" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Room Type</label>
                <select {...register('roomType')} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold">
                  <option value="classroom">Standard Classroom</option>
                  <option value="laboratory">Laboratory</option>
                  <option value="computer_lab">Computer Lab</option>
                  <option value="auditorium">Auditorium</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-black text-xs uppercase tracking-widest mt-4">Save Room</button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default RoomPanel;