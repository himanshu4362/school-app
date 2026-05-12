import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { updateStudentMark, markAsPrepared, MarkValue } from '../../../../store/slices/evaluationSlice';
import { Save, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const ActiveEvaluationSession: React.FC = () => {
  const dispatch = useDispatch();
  const { activeExamId, assignedExams } = useSelector((state: RootState) => state.evaluation);
  const exam = assignedExams[activeExamId!];
  const globalStudents = useSelector((state: RootState) => state.student.records);

  const classRoster = useMemo(() => {
    return Object.values(globalStudents)
      .filter(s => s.classId === exam.classId && s.sectionId === exam.sectionId && s.status === 'ACTIVE')
      .sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
  }, [globalStudents, exam.classId, exam.sectionId]);

  const handleMarkChange = (studentId: string, componentId: string, maxMarks: number, rawValue: string) => {
    let finalValue: MarkValue = null;
    const upperVal = rawValue.toUpperCase().trim();

    // Enterprise Status Codes
    if (upperVal === 'A') finalValue = 'ABSENT';
    else if (upperVal === 'M') finalValue = 'MEDICAL';
    else if (upperVal === 'E') finalValue = 'EXEMPTED';
    else if (upperVal === 'MP') finalValue = 'MALPRACTICE';
    else if (upperVal === 'W') finalValue = 'WITHHELD';
    else if (rawValue !== '') {
      // Numeric Validation
      const num = parseFloat(rawValue);
      if (!isNaN(num) && num >= 0 && num <= maxMarks) {
        finalValue = num;
      } else {
        return; // Ignore invalid typing
      }
    }

    dispatch(updateStudentMark({ examId: exam.id, studentId, componentId, value: finalValue }));
  };

  const renderCellValue = (val: MarkValue) => {
    if (val === null || val === undefined) return '';
    if (val === 'ABSENT') return 'A';
    if (val === 'MEDICAL') return 'M';
    if (val === 'EXEMPTED') return 'E';
    if (val === 'MALPRACTICE') return 'MP';
    if (val === 'WITHHELD') return 'W';
    return val.toString();
  };

  const handlePrepare = () => {
    if (window.confirm("Lock this sheet as PREPARED? You will not be able to edit it unless Admin rejects it.")) {
      dispatch(markAsPrepared(exam.id));
    }
  };

  // Simple completeness check
  const totalCells = classRoster.length * exam.components.length;
  let filledCells = 0;
  classRoster.forEach(s => {
    exam.components.forEach(c => {
      if (exam.marksData?.[s.id]?.[c.id] !== undefined && exam.marksData?.[s.id]?.[c.id] !== null) filledCells++;
    });
  });
  const isComplete = filledCells === totalCells && classRoster.length > 0;

  return (
    <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-300">
      
      {/* HEADER BAR */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="text-xl font-black text-slate-800">{exam.title}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Class {exam.classId}-{exam.sectionId} • {exam.subject}
          </p>
        </div>
        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-200">
           <span>Codes:</span>
           <span className="text-rose-500">A (Absent)</span>
           <span className="text-amber-500">M (Medical)</span>
           <span className="text-purple-500">MP (Malpractice)</span>
        </div>
      </div>

      {/* SPREADSHEET GRID */}
      <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-slate-900 text-white sticky top-0 z-10 shadow-md">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] w-20 text-center border-r border-slate-800">Roll</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] w-64 border-r border-slate-800">Student Name</th>
              {exam.components.map(comp => (
                <th key={comp.id} className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-center border-r border-slate-800">
                  {comp.name} <br/> <span className="text-slate-400">({comp.maxMarks}m)</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classRoster.length === 0 ? (
               <tr><td colSpan={exam.components.length + 2} className="p-12 text-center text-slate-500 font-bold">No students found.</td></tr>
            ) : (
              classRoster.map((student, index) => (
                <tr key={student.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50 transition-colors`}>
                  <td className="px-6 py-3 border-b border-slate-200 text-center font-black text-slate-500 border-r">{student.rollNumber}</td>
                  <td className="px-6 py-3 border-b border-slate-200 border-r font-bold text-slate-800">{student.firstName} {student.lastName}</td>
                  
                  {exam.components.map(comp => {
                    const currentVal = exam.marksData?.[student.id]?.[comp.id];
                    const displayVal = renderCellValue(currentVal as MarkValue);
                    
                    return (
                      <td key={comp.id} className="px-4 py-2 border-b border-slate-200 border-r text-center">
                        <input 
                          type="text"
                          value={displayVal}
                          onChange={(e) => handleMarkChange(student.id, comp.id, comp.maxMarks, e.target.value)}
                          placeholder="--"
                          className={`w-20 text-center py-2 px-1 rounded-lg border-2 text-sm font-black outline-none transition-all ${
                            displayVal === 'A' || displayVal === 'MP' ? 'border-rose-200 bg-rose-50 text-rose-700' :
                            displayVal === 'M' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                            displayVal !== '' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                            'border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:bg-blue-50'
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER & SUBMISSION */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
        <p className="text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-2">
          {isComplete 
            ? <><CheckCircle size={14} className="text-emerald-500"/> All {totalCells} evaluations completed. Ready to lock.</>
            : <><AlertTriangle size={14} className="text-orange-500"/> {filledCells} of {totalCells} evaluations filled. Autosaving...</>
          }
        </p>
        <button
          onClick={handlePrepare}
          disabled={!isComplete}
          className={`px-8 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${
            !isComplete ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg'
          }`}
        >
          <Save size={16} /> Mark as Prepared
        </button>
      </div>

    </div>
  );
};

export default ActiveEvaluationSession;