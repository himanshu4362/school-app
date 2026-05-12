import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { setFilters, viewExamAnalytics, startEvaluationSession, navToCreateTest } from '../../../../store/slices/evaluationSlice';
import { BookOpen, Clock, FileText, CheckCircle, ShieldAlert, ArrowRight, Filter, Lock, BarChart3 } from 'lucide-react';

const EvaluationInbox: React.FC = () => {
    const dispatch = useDispatch();
    const { assignedExams, filterTimeframe, filterExamType } = useSelector((state: RootState) => state.evaluation);

    const filteredExams = useMemo(() => {
        return Object.values(assignedExams).filter(exam => {
            if (filterExamType !== 'ALL' && exam.examType !== filterExamType) return false;
            return true; // Skipping complex date math for mockup brevity, assuming all are within 30 days
        }).sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());
    }, [assignedExams, filterExamType]);

    const StatusBadge = ({ status }: { status: string }) => {
        const config: any = {
            NOT_STARTED: { color: 'bg-slate-100 text-slate-500 border-slate-200', icon: <FileText size={12} />, label: 'Pending Start' },
            DRAFT: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock size={12} />, label: 'Draft / In Progress' },
            PREPARED: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <ShieldAlert size={12} />, label: 'Prepared (Unverified)' },
            VERIFIED: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <CheckCircle size={12} />, label: 'Verified by HOD' },
            PUBLISHED: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle size={12} />, label: 'Snapshot Published' },
            LOCKED: { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: <Lock size={12} />, label: 'Immutable Lock' }
        };
        const c = config[status] || config.NOT_STARTED;
        return (
            <div className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max ${c.color}`}>
                {c.icon} {c.label}
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* FILTER BAR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap gap-4 items-center shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 mr-2">
                    <Filter size={16} /> <span className="text-xs font-black uppercase tracking-widest">Filters:</span>
                </div>
                <select
                    value={filterExamType}
                    onChange={(e) => dispatch(setFilters({ timeframe: filterTimeframe, type: e.target.value }))}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-2 outline-none focus:border-blue-500"
                >
                    <option value="ALL">All Exam Types</option>
                    <option value="MONTHLY_TEST">Monthly Tests</option>
                    <option value="MAIN_EXAM">Main Term Exams</option>
                </select>
                <select
                    value={filterTimeframe}
                    onChange={(e) => dispatch(setFilters({ timeframe: e.target.value, type: filterExamType }))}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-2 outline-none focus:border-blue-500"
                >
                    <option value="30_DAYS">Last 30 Days</option>
                    <option value="6_MONTHS">Last 6 Months</option>
                </select>

                <button
                    onClick={() => dispatch(navToCreateTest())}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-colors"
                >
                    + Schedule Monthly Test
                </button>
            </div>

            {/* EXAM INBOX GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.map(exam => (
                    <div key={exam.id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col relative group">

                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                                <BookOpen size={24} />
                            </div>
                            <StatusBadge status={exam.status} />
                        </div>

                        <div className="mb-6 flex-1">
                            <h3 className="text-xl font-black text-slate-800 leading-tight">{exam.title}</h3>
                            <p className="text-sm font-bold text-slate-500 mt-1">Class {exam.classId}-{exam.sectionId} • {exam.subject}</p>

                            <div className="flex gap-2 mt-4 flex-wrap">
                                {exam.components.map(c => (
                                    <span key={c.id} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                                        {c.name} ({c.maxMarks}m)
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 mt-auto pt-4">
                            <button
                                onClick={() => dispatch(startEvaluationSession(exam.id))}
                                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-md"
                            >
                                {exam.status === 'PUBLISHED' ? 'View Snapshot' : 'Evaluate'} <ArrowRight size={16} />
                            </button>

                            {['PREPARED', 'VERIFIED', 'PUBLISHED'].includes(exam.status) && (
                                <button
                                    onClick={() => dispatch(viewExamAnalytics(exam.id))}
                                    className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                                >
                                    <BarChart3 size={16} /> Analytics
                                </button>
                            )}
                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
};

export default EvaluationInbox;