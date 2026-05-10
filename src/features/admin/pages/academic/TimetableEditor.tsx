import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminLayout from '../../components/layout/AdminLayout';
import { Save, AlertTriangle, X } from 'lucide-react';
import { RootState } from '../../../../store/store';

type PeriodType = 'standard' | 'leisure' | 'recess';

interface TimeCell {
  allocationId: string;
  type: PeriodType;
  isOverride: boolean;
}

interface TimetableState {
  [day: string]: { [period: number]: TimeCell; };
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 'RECESS', 5, 6, 7, 8];

// 🔴 Synchronized Fallback Data to match AllocationManager
const ACTIVE_FACULTY = [
  { id: 'EMP-001', firstName: 'Ravi', lastName: 'Verma', departmentId: 'Science' },
  { id: 'EMP-002', firstName: 'Anita', lastName: 'Desai', departmentId: 'Mathematics' },
  { id: 'EMP-003', firstName: 'John', lastName: 'Smith', departmentId: 'English' },
];

const TimetableEditor: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const history = useHistory();

  const { subjects, allocations } = useSelector((state: RootState) => state.academic);

  const classAllocations = useMemo(() => {
    return allocations.filter(a => `${a.classId}-${a.sectionId}` === classId || a.classId === classId);
  }, [allocations, classId]);

  const [matrix, setMatrix] = useState<TimetableState>({});
  const [activeCell, setActiveCell] = useState<{day: string, period: number} | null>(null);
  const [panelData, setPanelData] = useState<TimeCell>({ allocationId: '', type: 'standard', isOverride: false });

  useEffect(() => {
    const initial: TimetableState = {};
    DAYS.forEach(day => {
      initial[day] = {};
      [1, 2, 3, 4, 5, 6, 7, 8].forEach(p => {
        initial[day][p] = { allocationId: '', type: 'standard', isOverride: false };
      });
    });
    setMatrix(initial);
  }, []);

  const openPanel = (day: string, period: number) => {
    setActiveCell({ day, period });
    setPanelData(matrix[day]?.[period] || { allocationId: '', type: 'standard', isOverride: false });
  };

  const closePanel = () => setActiveCell(null);

  const saveCell = () => {
    if (!activeCell) return;
    setMatrix(prev => ({
      ...prev,
      [activeCell.day]: { ...prev[activeCell.day], [activeCell.period]: { ...panelData } }
    }));
    closePanel();
  };

  const handleLaunch = () => {
    alert("Timetable Saved successfully!");
    history.goBack();
  };

  return (
    <AdminLayout 
      pageTitle="Matrix Editor" 
      pageDescription={`Drafting master schedule for ${classId}`}
      breadcrumbs={[{ label: 'Academic Hub' }, { label: 'Timetable' }, { label: 'Editor' }]}
      headerActions={<button onClick={handleLaunch} className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm shadow-md hover:bg-blue-600 transition-colors flex items-center gap-2"><Save size={16} /> Save Master</button>}
    >
      <div className="flex gap-6 relative overflow-hidden h-[calc(100vh-180px)]">
        
        {/* MAIN MATRIX GRID */}
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-auto custom-scrollbar transition-all duration-300 ${activeCell ? 'w-2/3 pr-4' : 'w-full'}`}>
          <div className="min-w-[800px] p-1">
            <div className="grid grid-cols-[100px_repeat(4,1fr)_40px_repeat(4,1fr)] gap-px bg-slate-200 mb-px sticky top-0 z-10">
              <div className="bg-slate-50 p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">Day</div>
              {PERIODS.map((p, i) => (
                <div key={i} className={`p-3 text-center text-[10px] font-black uppercase tracking-widest flex flex-col justify-center ${p === 'RECESS' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'}`}>
                  {p === 'RECESS' ? 'BREAK' : `P${p}`}
                </div>
              ))}
            </div>

            <div className="bg-slate-200 gap-px grid">
              {DAYS.map(day => (
                <div key={day} className="grid grid-cols-[100px_repeat(4,1fr)_40px_repeat(4,1fr)] gap-px">
                  <div className="bg-white p-3 flex items-center text-xs font-bold text-slate-700 border-r-4 border-slate-900">{day}</div>

                  {PERIODS.map((p, i) => {
                    if (p === 'RECESS') return <div key={i} className="bg-amber-50/50 flex items-center justify-center relative"><div className="w-px h-full bg-amber-200/50 absolute"></div></div>;

                    const periodNum = p as number;
                    const cellData = matrix[day]?.[periodNum];
                    
                    const alloc = allocations.find(a => a.id === cellData?.allocationId);
                    const subject = alloc ? subjects[alloc.subjectId] : null;
                    const teacher = alloc ? ACTIVE_FACULTY.find(t => t.id === alloc.facultyId) : null;
                    
                    const isSelected = activeCell?.day === day && activeCell?.period === periodNum;
                    const isLeisure = cellData?.type === 'leisure';

                    return (
                      <div key={i} onClick={() => openPanel(day, periodNum)}
                        className={`bg-white p-2 h-20 cursor-pointer border-2 transition-all hover:bg-blue-50 group flex flex-col justify-center items-center text-center
                          ${isSelected ? 'border-blue-500 shadow-inner' : 'border-transparent'}`}
                      >
                        {!alloc && !isLeisure ? (
                          <span className="text-[10px] font-medium text-slate-300 group-hover:text-blue-400">+ Assign</span>
                        ) : isLeisure ? (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Leisure</span>
                        ) : (
                          <>
                            <span className="text-xs font-black text-slate-800 line-clamp-1">{subject?.name}</span>
                            <span className="text-[10px] font-bold text-slate-500 mt-1 line-clamp-1">{teacher?.firstName} {teacher?.lastName}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SLIDE-OVER PANEL */}
        <div className={`absolute top-0 right-0 h-full bg-white border border-slate-200 rounded-xl shadow-2xl transition-transform duration-300 ease-in-out z-10 w-1/3 flex flex-col ${activeCell ? 'translate-x-0' : 'translate-x-[120%]'}`}>
          {activeCell && (
            <>
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                <div>
                  <h3 className="font-black text-slate-800 text-sm">Configure Slot</h3>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{activeCell.day} • Period {activeCell.period}</p>
                </div>
                <button onClick={closePanel} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg"><X size={16}/></button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Period Type</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    {(['standard', 'leisure'] as const).map(type => (
                      <button key={type} onClick={() => setPanelData({ allocationId: '', type, isOverride: false})}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${panelData.type === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {panelData.type === 'standard' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Approved Allocations for {classId}</label>
                    {classAllocations.length === 0 ? (
                       <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs font-bold flex gap-2">
                         <AlertTriangle size={16}/> No teachers have been allocated to this class yet. Go to "Subjects & Allocation" first.
                       </div>
                    ) : (
                      <select 
                        value={panelData.allocationId} 
                        onChange={(e) => setPanelData({...panelData, allocationId: e.target.value})}
                        className="w-full p-3 text-sm font-bold bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                      >
                        <option value="" disabled>Select Approved Subject/Teacher...</option>
                        {classAllocations.map(alloc => {
                          const sub = subjects[alloc.subjectId];
                          const tchr = ACTIVE_FACULTY.find(t => t.id === alloc.facultyId);
                          return (
                            <option key={alloc.id} value={alloc.id}>
                              {sub?.name} - {tchr?.firstName} {tchr?.lastName} ({alloc.periodsPerWeek} p/wk)
                            </option>
                          )
                        })}
                      </select>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-white rounded-b-xl flex gap-2">
                <button onClick={closePanel} className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors">Cancel</button>
                <button onClick={saveCell} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors">Apply to Cell</button>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default TimetableEditor;