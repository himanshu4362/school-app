import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { navToVideoConsent } from '../../../../store/slices/gatePassSlice';
import { FileText, MapPin, Truck, ChevronRight } from 'lucide-react';

const REASONS = ['Medical Issue', 'Family Emergency', 'Official Work', 'Feeling Unwell', 'Personal Reason'];
const DESTINATIONS = ['Home', 'Hospital', 'Relatives House', 'Other'];
const TRANSPORT_MODES = [
  { id: 'OWN', label: 'Own Vehicle', desc: 'Cycle / Scooty' },
  { id: 'SHARED', label: 'Sharing', desc: 'Auto / Van' },
  { id: 'WALK', label: 'By Walk', desc: 'Self Departure' },
  { id: 'PARENT', label: 'Guardian', desc: 'Parent Pickup' }
];

const GatePassForm: React.FC = () => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ reason: 'Medical Issue', destination: 'Home', transportMode: 'OWN', remarks: '' });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(navToVideoConsent(form));
  };

  return (
    <form onSubmit={handleNext} className="flex-1 flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* 1. REASON SELECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
          <FileText size={14}/> Reason for Leaving
        </label>
        <div className="flex flex-wrap gap-2">
          {REASONS.map(r => (
            <button key={r} type="button" onClick={() => setForm({...form, reason: r})}
              className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${form.reason === r ? 'bg-rose-600 border-rose-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-rose-200'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 2. DESTINATION & TRANSPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
            <MapPin size={14}/> Destination
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DESTINATIONS.map(d => (
              <button key={d} type="button" onClick={() => setForm({...form, destination: d})}
                className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${form.destination === d ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-500'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
            <Truck size={14}/> Transport Mode
          </label>
          <div className="grid grid-cols-1 gap-2">
            {TRANSPORT_MODES.map(t => (
              <button key={t.id} type="button" onClick={() => setForm({...form, transportMode: t.id})}
                className={`px-4 py-3 rounded-xl flex justify-between items-center border-2 transition-all ${form.transportMode === t.id ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-100'}`}
              >
                <div className="text-left">
                  <p className={`text-xs font-black ${form.transportMode === t.id ? 'text-rose-700' : 'text-slate-700'}`}>{t.label}</p>
                  <p className="text-[10px] font-bold text-slate-400">{t.desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.transportMode === t.id ? 'border-rose-500 bg-rose-500' : 'border-slate-200'}`}>
                  {form.transportMode === t.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. REMARKS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Detailed Remarks (Optional)</label>
        <textarea 
          placeholder="Type specific details here..." 
          value={form.remarks}
          onChange={(e) => setForm({...form, remarks: e.target.value})}
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:border-rose-400 transition-colors h-24 resize-none"
        />
      </div>

      <button type="submit" className="w-full py-5 rounded-[24px] bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-600/20 transition-all flex items-center justify-center gap-3">
        Next: Digital Signature <ChevronRight size={20} />
      </button>

    </form>
  );
};

export default GatePassForm;