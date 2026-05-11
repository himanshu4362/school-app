import React from 'react';
import { Users, ArrowRight, ShieldCheck } from 'lucide-react';

interface ClassData {
  classId: string;
  sectionId: string;
  label: string;
  isHomeroom: boolean;
}

interface Props {
  onSelectClass: (classId: string, sectionId: string) => void;
}

const AVAILABLE_CLASSES: ClassData[] = [
  { classId: '10', sectionId: 'A', label: 'Class 10-A', isHomeroom: true },
  { classId: '10', sectionId: 'B', label: 'Class 10-B', isHomeroom: false },
  { classId: '9', sectionId: 'A', label: 'Class 9-A', isHomeroom: false },
];

const ClassSelectionBoard: React.FC<Props> = ({ onSelectClass }) => {
  const homeroom = AVAILABLE_CLASSES.find(c => c.isHomeroom);
  const proxies = AVAILABLE_CLASSES.filter(c => !c.isHomeroom);

  return (
    <div className="flex-1 flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HOMEROOM SECTION */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-blue-500" /> My Homeroom
        </h2>
        {homeroom && (
          <div 
            onClick={() => onSelectClass(homeroom.classId, homeroom.sectionId)}
            className="group bg-blue-600 hover:bg-blue-500 cursor-pointer rounded-3xl p-6 sm:p-8 flex justify-between items-center transition-all shadow-lg shadow-blue-600/20"
          >
            <div>
              <h3 className="text-3xl font-black text-white">{homeroom.label}</h3>
              <p className="text-blue-100 font-bold mt-1 text-sm">Official primary class assignment</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <ArrowRight size={24} />
            </div>
          </div>
        )}
      </div>

      {/* PROXY SECTION */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <Users size={16} className="text-purple-500" /> Proxy & Subjects
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {proxies.map(proxy => (
            <div 
              key={`${proxy.classId}-${proxy.sectionId}`}
              onClick={() => onSelectClass(proxy.classId, proxy.sectionId)}
              className="group bg-white border-2 border-slate-200 hover:border-purple-300 cursor-pointer rounded-3xl p-6 flex justify-between items-center transition-all shadow-sm hover:shadow-md"
            >
              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-purple-700 transition-colors">{proxy.label}</h3>
                <p className="text-slate-400 font-bold mt-1 text-xs uppercase tracking-widest">Proxy Assignment</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-purple-100 flex items-center justify-center text-slate-400 group-hover:text-purple-600 transition-all">
                <ArrowRight size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ClassSelectionBoard;