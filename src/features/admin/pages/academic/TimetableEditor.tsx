import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Save, AlertTriangle, X, Search, Clock, CheckCircle2 } from 'lucide-react';

// --- TYPES & INTERFACES ---
type PeriodType = 'standard' | 'leisure' | 'recess';

interface TimeCell {
  subjectId: string;
  teacherId: string;
  type: PeriodType;
  isOverride: boolean;
}

interface TimetableState {
  [day: string]: {
    [period: number]: TimeCell;
  };
}

// --- MOCK DATA FOR THE SMART ENGINE ---
const SUBJECTS = [
  { id: 'SUB-MAT', name: 'Mathematics' },
  { id: 'SUB-PHY', name: 'Physics' },
  { id: 'SUB-CHE', name: 'Chemistry' },
  { id: 'SUB-ENG', name: 'English' },
];

const TEACHERS = [
  { id: 'TCH-101', name: 'Ravi Verma' },
  { id: 'TCH-102', name: 'Dr. Arora' },
  { id: 'TCH-103', name: 'Neha Singh' },
  { id: 'TCH-104', name: 'A. Sharma' },
];

// The Conflict Simulator: Teachers who are already teaching somewhere else at a specific time
const MOCK_BUSY_TEACHERS: Record<string, string[]> = {
  'Monday-1': ['TCH-101'], // Ravi is busy Monday Period 1
  'Tuesday-3': ['TCH-103'], // Neha is busy Tuesday Period 3
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 'RECESS', 5, 6, 7, 8];

const TimetableEditor: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const history = useHistory();

  // --- STATE ---
  // The Master Matrix
  const [matrix, setMatrix] = useState<TimetableState>({});
  
  // Side-Panel State
  const [activeCell, setActiveCell] = useState<{day: string, period: number} | null>(null);
  const [panelData, setPanelData] = useState<TimeCell>({ subjectId: '', teacherId: '', type: 'standard', isOverride: false });

  // Initialize empty matrix
  useEffect(() => {
    const initial: TimetableState = {};
    DAYS.forEach(day => {
      initial[day] = {};
      [1, 2, 3, 4, 5, 6, 7, 8].forEach(p => {
        initial[day][p] = { subjectId: '', teacherId: '', type: 'standard', isOverride: false };
      });
    });
    setMatrix(initial);
  }, []);

  // --- CONFLICT DETECTION ENGINE ---
  const checkConflict = (day: string, period: number, teacherId: string) => {
    if (!teacherId) return false;
    const timeKey = `${day}-${period}`;
    return MOCK_BUSY_TEACHERS[timeKey]?.includes(teacherId) || false;
  };

  const hasActiveConflict = useMemo(() => {
    if (!activeCell) return false;
    return checkConflict(activeCell.day, activeCell.period, panelData.teacherId);
  }, [activeCell, panelData.teacherId]);

  // --- HANDLERS ---
  const openPanel = (day: string, period: number) => {
    setActiveCell({ day, period });
    setPanelData(matrix[day]?.[period] || { subjectId: '', teacherId: '', type: 'standard', isOverride: false });
  };

  const closePanel = () => {
    setActiveCell(null);
  };

  const saveCell = () => {
    if (!activeCell) return;
    
    // Prevent save if conflict exists and override isn't checked
    if (hasActiveConflict && !panelData.isOverride) {
      alert("Please acknowledge the conflict override to proceed.");
      return;
    }

    setMatrix(prev => ({
      ...prev,
      [activeCell.day]: {
        ...prev[activeCell.day],
        [activeCell.period]: { ...panelData }
      }
    }));
    closePanel();
  };

  const handleLaunch = () => {
    // Generate clean JSON payload
    const payload = {
      meta: { classId, launchedAt: new Date().toISOString() },
      timetable: matrix
    };
    
    console.log("🚀 === FINAL TIMETABLE PAYLOAD ===");
    console.log(JSON.stringify(payload, null, 2));
    console.log("==================================");
    
    alert("Timetable Saved successfully! Check console for payload.");
    history.goBack();
  };

  return (
    <AdminLayout 
      pageTitle="Matrix Editor" 
      pageDescription={`Drafting master schedule for ${classId}`}
      breadcrumbs={[
        { label: 'Academic Hub' }, 
        { label: 'Timetable', path: '/admin/academic/timetable' },
        { label: classId, path: `/admin/academic/timetable/manage/${classId}` },
        { label: 'Editor' }
      ]}
      headerActions={
        <button 
          onClick={handleLaunch}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm shadow-md hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Save size={16} /> Save Master
        </button>
      }
    >
      <div className="flex gap-6 relative overflow-hidden">
        
        {/* MAIN MATRIX GRID */}
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto transition-all duration-300 ${activeCell ? 'w-2/3 pr-4' : 'w-full'}`}>
          <div className="min-w-[800px] p-1">
            
            {/* Grid Header */}
            <div className="grid grid-cols-[100px_repeat(4,1fr)_40px_repeat(4,1fr)] gap-px bg-slate-200 mb-px">
              <div className="bg-slate-50 p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">Day</div>
              {PERIODS.map((p, i) => (
                <div key={i} className={`p-3 text-center text-[10px] font-black uppercase tracking-widest flex flex-col justify-center ${
                  p === 'RECESS' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                }`}>
                  {p === 'RECESS' ? 'BREAK' : `P${p}`}
                </div>
              ))}
            </div>

            {/* Grid Body */}
            <div className="bg-slate-200 gap-px grid">
              {DAYS.map(day => (
                <div key={day} className="grid grid-cols-[100px_repeat(4,1fr)_40px_repeat(4,1fr)] gap-px">
                  {/* Day Label */}
                  <div className="bg-white p-3 flex items-center text-xs font-bold text-slate-700 border-r-4 border-slate-900">
                    {day}
                  </div>

                  {/* Period Cells */}
                  {PERIODS.map((p, i) => {
                    if (p === 'RECESS') {
                      return (
                        <div key={i} className="bg-amber-50/50 flex items-center justify-center relative">
                          <div className="w-px h-full bg-amber-200/50 absolute"></div>
                        </div>
                      );
                    }

                    const periodNum = p as number;
                    const cellData = matrix[day]?.[periodNum];
                    const subject = SUBJECTS.find(s => s.id === cellData?.subjectId);
                    const teacher = TEACHERS.find(t => t.id === cellData?.teacherId);
                    
                    const isSelected = activeCell?.day === day && activeCell?.period === periodNum;
                    const isLeisure = cellData?.type === 'leisure';
                    const hasData = subject || teacher;

                    return (
                      <div 
                        key={i} 
                        onClick={() => openPanel(day, periodNum)}
                        className={`bg-white p-2 h-20 cursor-pointer border-2 transition-all hover:bg-blue-50 group flex flex-col justify-center items-center text-center
                          ${isSelected ? 'border-blue-500 shadow-inner' : 'border-transparent'}
                          ${cellData?.isOverride ? 'border-amber-400 bg-amber-50' : ''}
                        `}
                      >
                        {!hasData && !isLeisure ? (
                          <span className="text-[10px] font-medium text-slate-300 group-hover:text-blue-400 transition-colors">+ Assign</span>
                        ) : isLeisure ? (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Leisure</span>
                        ) : (
                          <>
                            <span className="text-xs font-black text-slate-800 line-clamp-1">{subject?.name}</span>
                            <span className="text-[10px] font-bold text-slate-500 mt-1 line-clamp-1">{teacher?.name}</span>
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

        {/* SLIDE-OVER PANEL (The Inspector) */}
        <div className={`absolute top-0 right-0 h-full bg-white border border-slate-200 rounded-xl shadow-2xl transition-transform duration-300 ease-in-out z-10 w-1/3 flex flex-col
          ${activeCell ? 'translate-x-0' : 'translate-x-[120%]'}
        `}>
          {activeCell && (
            <>
              {/* Panel Header */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                <div>
                  <h3 className="font-black text-slate-800 text-sm">Configure Slot</h3>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{activeCell.day} • Period {activeCell.period}</p>
                </div>
                <button onClick={closePanel} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors"><X size={16}/></button>
              </div>

              {/* Panel Body */}
              <div className="p-5 flex-1 overflow-y-auto space-y-5">
                
                {/* Period Type Toggle */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Period Type</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    {(['standard', 'leisure'] as const).map(type => (
                      <button 
                        key={type}
                        onClick={() => setPanelData({...panelData, type, subjectId: '', teacherId: ''})}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${
                          panelData.type === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {panelData.type === 'standard' && (
                  <>
                    {/* Subject Select */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Subject Assignment</label>
                      <select 
                        value={panelData.subjectId} 
                        onChange={(e) => setPanelData({...panelData, subjectId: e.target.value})}
                        className="w-full p-2.5 text-sm font-bold bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
                      >
                        <option value="" disabled>Select Subject...</option>
                        {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    {/* Teacher Select */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Faculty Assignment</label>
                      <select 
                        value={panelData.teacherId} 
                        onChange={(e) => setPanelData({...panelData, teacherId: e.target.value, isOverride: false})} // Reset override if teacher changes
                        className={`w-full p-2.5 text-sm font-bold bg-white border rounded-lg outline-none transition-colors ${
                          hasActiveConflict ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200 focus:border-blue-500'
                        }`}
                      >
                        <option value="" disabled>Select Faculty...</option>
                        {TEACHERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>

                    {/* THE SMART ENGINE CONFLICT ALERT */}
                    {hasActiveConflict && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 animate-in slide-in-from-top-2">
                        <div className="flex items-start gap-2 text-amber-700 mb-3">
                          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-black uppercase tracking-widest mb-1">Scheduling Conflict</p>
                            <p className="text-[11px] font-medium leading-relaxed">
                              This faculty member is already assigned to another class during this period.
                            </p>
                          </div>
                        </div>
                        
                        {/* Override Checkbox */}
                        <label className="flex items-center gap-2 p-2 bg-white rounded border border-amber-100 cursor-pointer hover:bg-amber-100/50 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={panelData.isOverride}
                            onChange={(e) => setPanelData({...panelData, isOverride: e.target.checked})}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-[11px] font-bold text-amber-900">Force Assignment (Co-teaching/Proxy)</span>
                        </label>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Panel Footer */}
              <div className="p-4 border-t border-slate-100 bg-white rounded-b-xl flex gap-2">
                <button onClick={closePanel} className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors">Cancel</button>
                <button 
                  onClick={saveCell} 
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                    hasActiveConflict && !panelData.isOverride 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  }`}
                >
                  Apply to Cell
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default TimetableEditor;