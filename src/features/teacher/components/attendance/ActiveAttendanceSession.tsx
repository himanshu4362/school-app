import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight, Save, X } from 'lucide-react';
import { RootState } from '../../../../store/store';
import {
    updateStudentStatus, compileAndSubmitRegister, navToPreFlight, StudentDailyStatus
} from '../../../../store/slices/studentAttendanceSlice';

const ActiveAttendanceSession: React.FC = () => {
    const dispatch = useDispatch();
    const { activeClassId, activeSectionId, sessions } = useSelector((state: RootState) => state.studentAttendance);
    const globalStudents = useSelector((state: RootState) => state.student.records);

    const [currentIndex, setCurrentIndex] = useState(0);

    const session = sessions[`${activeClassId}-${activeSectionId}`];
    const draftRegister = session?.draftRegister || {};

    const classRoster = useMemo(() => {
        return Object.values(globalStudents)
            .filter(s => s.classId === activeClassId && s.sectionId === activeSectionId && s.status === 'ACTIVE')
            .sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
    }, [globalStudents, activeClassId, activeSectionId]);

    const activeStudent = classRoster[currentIndex];

    const handleStatus = (status: StudentDailyStatus) => {
        if (!activeStudent) return;
        dispatch(updateStudentStatus({ studentId: activeStudent.id, status }));
        if (currentIndex < classRoster.length - 1) {
            setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
        }
    };

    const handleSubmit = () => {
        if (window.confirm("Submit Attendance? Unmarked students will be logged as SKIPPED.")) {
            dispatch(compileAndSubmitRegister({
                classRosterIds: classRoster.map(s => s.id),
                teacherId: 'EMP-001' // Mock logged in teacher
            }));
        }
    };

    if (!activeStudent) return null;

    return (
        <div className="flex-1 flex flex-col relative bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">

            {/* Top Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                    <h3 className="font-black text-slate-800">Class {activeClassId}-{activeSectionId}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Session</p>
                </div>
                {/*   FIXED: Now uses navToPreFlight */}
                <button onClick={() => dispatch(navToPreFlight({ classId: activeClassId!, sectionId: activeSectionId! }))} className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 transition-colors">
                    <X size={16} />
                </button>
            </div>

            <div className="h-1.5 w-full bg-slate-200 shrink-0">
                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${((currentIndex + 1) / classRoster.length) * 100}%` }}></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-start sm:justify-center p-6 sm:p-12 overflow-y-auto">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-6 sm:mb-8">
                    Student {currentIndex + 1} of {classRoster.length}
                </p>

                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl sm:text-4xl font-black mb-4 sm:mb-6 border-4 border-white">
                    {activeStudent.firstName[0]}{activeStudent.lastName[0]}
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 text-center">{activeStudent.firstName} {activeStudent.lastName}</h2>
                <p className="text-xs sm:text-sm font-bold text-slate-500 mt-2 mb-8 bg-slate-100 px-4 py-1.5 rounded-full">
                    Roll: {activeStudent.rollNumber} • {activeStudent.id}
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md mb-4 shrink-0">
                    <button onClick={() => handleStatus('PRESENT')} className={`py-4 sm:py-6 rounded-2xl border-4 text-center transition-all ${draftRegister[activeStudent.id]?.status === 'PRESENT' ? 'bg-emerald-500 border-emerald-600 text-white scale-105 shadow-md shadow-emerald-500/20' : 'bg-white border-emerald-100 text-emerald-600 hover:bg-emerald-50'}`}>
                        <span className="block text-lg sm:text-xl font-black uppercase tracking-widest">Present</span>
                    </button>
                    <button onClick={() => handleStatus('ABSENT')} className={`py-4 sm:py-6 rounded-2xl border-4 text-center transition-all ${draftRegister[activeStudent.id]?.status === 'ABSENT' ? 'bg-rose-500 border-rose-600 text-white scale-105 shadow-md shadow-rose-500/20' : 'bg-white border-rose-100 text-rose-600 hover:bg-rose-50'}`}>
                        <span className="block text-lg sm:text-xl font-black uppercase tracking-widest">Absent</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full max-w-md shrink-0">
                    {[
                        { val: 'LATE', lbl: 'Late', c: 'amber' },
                        { val: 'HALF_DAY', lbl: 'Half Day', c: 'purple' },
                        { val: 'MEDICAL_EXIT', lbl: 'Medical', c: 'blue' },
                        { val: 'ON_LEAVE', lbl: 'Leave', c: 'slate' }
                    ].map(opt => {
                        const isActive = draftRegister[activeStudent.id]?.status === opt.val;

                        // Safe color mapping to prevent Tailwind Purge bugs
                        const colorStyles: any = {
                            amber: isActive ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-500 border-amber-200 hover:bg-amber-50 hover:text-amber-600',
                            purple: isActive ? 'bg-purple-500 text-white border-purple-600' : 'bg-white text-slate-500 border-purple-200 hover:bg-purple-50 hover:text-purple-600',
                            blue: isActive ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-slate-500 border-blue-200 hover:bg-blue-50 hover:text-blue-600',
                            slate: isActive ? 'bg-slate-700 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700',
                        };

                        return (
                            <button
                                key={opt.val}
                                onClick={() => handleStatus(opt.val as StudentDailyStatus)}
                                className={`py-3 px-2 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${colorStyles[opt.c]}`}
                            >
                                {opt.lbl}
                            </button>
                        );
                    })}
                </div>

                <div className="flex w-full max-w-md justify-between items-center mt-6 border-t border-slate-100 pt-6">
                    <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0} className="flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <button onClick={() => setCurrentIndex(prev => Math.min(classRoster.length - 1, prev + 1))} disabled={currentIndex === classRoster.length - 1} className="flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 disabled:opacity-30">
                        Skip <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                <button onClick={handleSubmit} className="w-full sm:w-auto px-8 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all">
                    <Save size={16} /> Submit & Compile Payload
                </button>
            </div>
        </div>
    );
};

export default ActiveAttendanceSession;