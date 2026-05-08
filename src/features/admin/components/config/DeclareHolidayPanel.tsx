import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Users, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface DeclareHolidayPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeclareHolidayPanel: React.FC<DeclareHolidayPanelProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'festival',
    startDate: '',
    endDate: '',
    audience: 'all',
    scope: 'all'
  });

  const [calculatedDays, setCalculatedDays] = useState(0);
  const [reopenDate, setReopenDate] = useState('');

  // --- THE SMART TIMELINE CALCULATOR ---
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end >= start) {
        // Calculate total days off (inclusive)
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setCalculatedDays(diffDays);

        // Calculate Reopen Date (End Date + 1 Day)
        const reopen = new Date(end);
        reopen.setDate(reopen.getDate() + 1);
        
        // Skip Sundays for Reopen Date (If it reopens on Sunday, push to Monday)
        if (reopen.getDay() === 0) {
          reopen.setDate(reopen.getDate() + 1);
        }
        
        setReopenDate(reopen.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }));
      } else {
        setCalculatedDays(0);
        setReopenDate('Invalid Date Range');
      }
    } else {
      setCalculatedDays(0);
      setReopenDate('');
    }
  }, [formData.startDate, formData.endDate]);

  const handleSave = () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert("Please fill in the required fields (Title, Start Date, End Date).");
      return;
    }

    const payload = {
      ...formData,
      calculatedDaysOff: calculatedDays,
      officialReopenDate: reopenDate,
      declaredAt: new Date().toISOString()
    };

    console.log("🚀 === NEW HOLIDAY DECLARED ===");
    console.log(JSON.stringify(payload, null, 2));
    console.log("===============================");
    
    alert("Holiday declared successfully! Check console for payload.");
    onClose();
    // Reset form
    setFormData({ title: '', description: '', type: 'festival', startDate: '', endDate: '', audience: 'all', scope: 'all' });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* The Slide-Over Panel */}
      <div className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-50 w-full md:w-[450px] flex flex-col transition-transform duration-300 ease-in-out border-l border-slate-200
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-slate-900">Declare Holiday</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Academic Calendar Entry</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* General Info */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Holiday Title <span className="text-rose-500">*</span></label>
              <input 
                type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Diwali Break, Heavy Rain Alert"
                className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all placeholder:text-slate-300"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              {(['festival', 'institutional', 'emergency'] as const).map(type => (
                <button
                  key={type} onClick={() => setFormData({...formData, type})}
                  className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    formData.type === type 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  } ${type === 'emergency' && formData.type === type ? 'text-rose-600' : ''}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Internal Note (Optional)</label>
              <textarea 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Details for staff/parents..."
                className="w-full p-3 text-sm font-medium bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all" rows={2}
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Timeline & Smart Engine */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5"><CalendarIcon size={14} className="text-blue-500"/> Duration</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Start Date <span className="text-rose-500">*</span></label>
                <input 
                  type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})}
                  className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">End Date <span className="text-rose-500">*</span></label>
                <input 
                  type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})}
                  className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none transition-all ${
                    formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate) 
                      ? 'border-rose-400 focus:border-rose-500 text-rose-600' 
                      : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Smart Output Card */}
            {calculatedDays > 0 && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl animate-in slide-in-from-top-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0"><Info size={16}/></div>
                  <div>
                    <p className="text-sm font-black text-blue-900">School closed for {calculatedDays} day{calculatedDays > 1 ? 's' : ''}.</p>
                    <p className="text-[11px] font-medium text-blue-700 mt-1">
                      Operations will resume on <strong className="font-black underline decoration-blue-300 underline-offset-2">{reopenDate}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Scope & Audience (Your requested edge cases) */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5"><Users size={14} className="text-blue-500"/> Applicability Rules</h3>
            
            <div className="space-y-3">
              <label className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer transition-all ${formData.audience === 'all' ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                <div>
                  <p className="text-sm font-bold text-slate-900">Entire School</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">Students and all faculty members.</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.audience === 'all' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                  {formData.audience === 'all' && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <input type="radio" className="hidden" checked={formData.audience === 'all'} onChange={() => setFormData({...formData, audience: 'all'})} />
              </label>

              <label className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer transition-all ${formData.audience === 'students_only' ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">Students Only</p>
                    <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase">Staff Working Day</span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">e.g., Grading days, board exam duty.</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.audience === 'students_only' ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                  {formData.audience === 'students_only' && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <input type="radio" className="hidden" checked={formData.audience === 'students_only'} onChange={() => setFormData({...formData, audience: 'students_only'})} />
              </label>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-white">
          <button 
            onClick={handleSave}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black text-sm shadow-xl shadow-blue-900/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Declare & Publish
          </button>
        </div>

      </div>
    </>
  );
};

export default DeclareHolidayPanel;