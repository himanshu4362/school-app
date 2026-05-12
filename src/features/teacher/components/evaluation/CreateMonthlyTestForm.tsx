import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createMonthlyTest, navToInbox, ExamComponent } from '../../../../store/slices/evaluationSlice';
import { Plus, Trash2, Save, X, BookOpen, Calendar, Users } from 'lucide-react';

const CreateMonthlyTestForm: React.FC = () => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    title: 'Monthly Test - ' + new Date().toLocaleString('default', { month: 'long' }),
    classId: '10',
    sectionId: 'A',
    subject: 'Science',
    dateStr: new Date().toISOString().split('T')[0],
  });

  // Dynamic Components (Default is just Theory)
  const [components, setComponents] = useState<ExamComponent[]>([
    { id: 'C1', name: 'Theory', maxMarks: 40 }
  ]);

  const handleAddComponent = () => {
    const newId = `C${components.length + 1}-${Date.now()}`;
    setComponents([...components, { id: newId, name: 'Practical', maxMarks: 10 }]);
  };

  const handleRemoveComponent = (id: string) => {
    if (components.length === 1) return alert("You must have at least one exam component.");
    setComponents(components.filter(c => c.id !== id));
  };

  const handleComponentChange = (id: string, field: 'name' | 'maxMarks', value: string | number) => {
    setComponents(components.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a secure mock ID
    const newExamId = `EXM-MT-${Date.now()}`;
    
    dispatch(createMonthlyTest({
      id: newExamId,
      title: form.title,
      examType: 'MONTHLY_TEST', // Strictly forced
      classId: form.classId,
      sectionId: form.sectionId,
      subject: form.subject,
      dateStr: form.dateStr,
      components: components,
      status: 'NOT_STARTED',
    }));
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full animate-in fade-in zoom-in-95 duration-300 pb-10">
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Schedule Monthly Test</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Custom Component Builder</p>
          </div>
          <button onClick={() => dispatch(navToInbox())} className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* CORE DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Test Title</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Users size={12}/> Class & Section</label>
              <select value={`${form.classId}-${form.sectionId}`} onChange={e => { const [c, s] = e.target.value.split('-'); setForm({...form, classId: c, sectionId: s}); }} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500">
                <option value="10-A">Class 10-A</option>
                <option value="10-B">Class 10-B</option>
                <option value="9-A">Class 9-A</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><BookOpen size={12}/> Subject</label>
              <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Calendar size={12}/> Scheduled Date</label>
              <input type="date" value={form.dateStr} onChange={e => setForm({...form, dateStr: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" required />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* DYNAMIC MARKS COMPONENTS */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Marking Components</label>
              <button type="button" onClick={handleAddComponent} className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-100">
                <Plus size={14} /> Add Component
              </button>
            </div>

            <div className="space-y-3">
              {components.map((comp, idx) => (
                <div key={comp.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex-1">
                    <input type="text" value={comp.name} onChange={e => handleComponentChange(comp.id, 'name', e.target.value)} placeholder="e.g. Theory, Practical, Viva" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500" required />
                  </div>
                  <div className="w-24">
                    <input type="number" value={comp.maxMarks} onChange={e => handleComponentChange(comp.id, 'maxMarks', parseInt(e.target.value) || 0)} min="1" placeholder="Marks" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 text-center outline-none focus:border-blue-500" required />
                  </div>
                  <button type="button" onClick={() => handleRemoveComponent(comp.id)} className="text-rose-400 hover:text-rose-600 p-2 bg-rose-50 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between items-center px-4 py-3 bg-slate-900 text-white rounded-xl">
              <span className="text-xs font-black uppercase tracking-widest">Total Maximum Marks</span>
              <span className="text-xl font-black text-emerald-400">{components.reduce((sum, c) => sum + c.maxMarks, 0)}</span>
            </div>
          </div>

          <button type="submit" className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
            <Save size={18} /> Create & Add to Inbox
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateMonthlyTestForm;