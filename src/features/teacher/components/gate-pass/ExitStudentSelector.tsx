import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';

interface Props {
  classRoster: any[];
  onSelectStudent: (studentId: string) => void;
}

const ExitStudentSelector: React.FC<Props> = ({ classRoster, onSelectStudent }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoster = classRoster.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || s.rollNumber.includes(searchQuery);
  });

  return (
    <div className="flex-1 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col animate-in fade-in zoom-in-95 duration-300">
      
      {/* 🟢 SEARCH BAR HEADER */}
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-600 mb-4">Select Student for Gate Pass</h3>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or roll number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-rose-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredRoster.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold">No students found matching your search.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredRoster.map(student => (
              <li 
                key={student.id} 
                onClick={() => onSelectStudent(student.id)}
                className="flex items-center justify-between p-4 sm:p-6 hover:bg-rose-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-black group-hover:bg-rose-200 group-hover:text-rose-700 transition-colors">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-800">{student.firstName} {student.lastName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roll No: {student.rollNumber}</p>
                  </div>
                </div>
                <div className="text-slate-300 group-hover:text-rose-500 transition-colors">
                  <ChevronRight size={20} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};

export default ExitStudentSelector;