import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { BookOpen, CheckCircle, Plus, X, ChevronRight } from 'lucide-react';

const ClassSyllabusManage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const history = useHistory();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for new subject
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    faculty: ''
  });

  // Mock data for subjects in this class
  const subjects = [
    { id: 'SCI', name: 'Science', chapters: 14, completion: 40 },
    { id: 'MAT', name: 'Mathematics', chapters: 12, completion: 65 },
    { id: 'ENG', name: 'English', chapters: 8, completion: 10 },
  ];

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    
    // BACKEND DEV NOTE: This is the payload to send to your API
    const payload = {
      classId: classId,
      ...formData,
      timestamp: new Date().toISOString()
    };
    
    console.log("=== NEW SUBJECT PAYLOAD ===");
    console.log(JSON.stringify(payload, null, 2));
    console.log("===========================");
    
    alert("Subject added! Check console for payload.");
    setIsAddModalOpen(false);
    setFormData({ name: '', code: '', faculty: '' }); // Reset
  };

  return (
    <AdminLayout 
      pageTitle={`${classId} Subject Hub`} 
      pageDescription="Select a subject to view its dashboard or create a new one."
      breadcrumbs={[
        { label: 'Academic Hub' }, 
        { label: 'Syllabus', path: '/admin/academic/syllabus' },
        { label: classId }
      ]}
      headerActions={
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition"
        >
          <Plus size={16} /> Add Subject
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub) => (
          <div 
            key={sub.id} 
            onClick={() => history.push(`/admin/academic/syllabus/manage/${classId}/${sub.id}`)}
            className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm ring-1 ring-slate-900/5 hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                 <BookOpen size={24} />
               </div>
               <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-md flex items-center gap-1 border border-emerald-100">
                 <CheckCircle size={12}/> {sub.completion}% Done
               </span>
            </div>
            
            <h4 className="text-xl font-black text-slate-900 mb-1">{sub.name}</h4>
            <p className="text-sm text-slate-500 mb-6 font-medium">{sub.chapters} Chapters Total</p>

            <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-between text-blue-600 font-bold text-sm">
              <span>Open Dashboard</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* ADD SUBJECT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-black text-slate-800">Add New Subject</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-rose-600 transition"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleAddSubject} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Subject Name</label>
                <input 
                  required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-500 focus:bg-white transition-all" 
                  placeholder="e.g., Computer Science" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Subject Code</label>
                  <input 
                    required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-500 focus:bg-white uppercase" 
                    placeholder="e.g., CS-101" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">HOD / Lead Faculty</label>
                  <input 
                    required value={formData.faculty} onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-500 focus:bg-white" 
                    placeholder="Teacher ID/Name" 
                  />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-blue-600 transition shadow-lg">
                  Create & Initialize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ClassSyllabusManage;