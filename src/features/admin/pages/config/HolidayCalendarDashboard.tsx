import React, { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Calendar as CalendarIcon, Plus, AlertCircle, CheckCircle2, Clock, Info } from 'lucide-react';
import { IonProgressBar } from '@ionic/react';
import DeclareHolidayPanel from '../../components/config/DeclareHolidayPanel';

// --- MOCK DATA (Redux Simulation) ---
const ACADEMIC_YEAR = {
    label: "2026-2027",
    totalDays: 365,
    targetWorkingDays: 220,
    currentWorkingDays: 195,
    totalHolidaysDeclared: 28
};

const MOCK_EVENTS = [
    { date: '2026-05-01', title: 'Labour Day', type: 'institutional', status: 'declared' },
    { date: '2026-05-18', title: 'Heatwave Alert', type: 'emergency', status: 'declared' },
    { date: '2026-05-25', title: 'Summer Fest', type: 'festival', status: 'pending' },
    { date: '2026-06-10', title: 'Term 1 Break', type: 'institutional', status: 'declared' }, // Upcoming
];

const HolidayCalendarDashboard: React.FC = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    // Dynamic Calendar Setup (Defaults to May 2026 for this MVP view)
    const currentDate = new Date(2026, 4, 1); // May 1, 2026
    const daysInMonth = new Date(2026, 5, 0).getDate(); // 31
    const startingDayOfWeek = currentDate.getDay(); // 5 (Friday)

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Helper to find events for a specific day
    const getEventForDay = (day: number) => {
        const formattedDate = `2026-05-${day.toString().padStart(2, '0')}`;
        return MOCK_EVENTS.find(e => e.date === formattedDate);
    };

    return (
        <AdminLayout
            pageTitle="Academic Calendar & Holidays"
            pageDescription={`Managing schedule for Academic Year ${ACADEMIC_YEAR.label}`}
            breadcrumbs={[
                { label: 'System Config' },
                { label: 'Holiday Management' }
            ]}
            headerActions={
                <button
                    onClick={() => setIsPanelOpen(true)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <Plus size={18} /> Declare Holiday
                </button>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: THE INTERACTIVE CALENDAR (8/12) */}
                <div className="lg:col-span-8 space-y-6">

                    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                        {/* Calendar Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <CalendarIcon size={24} className="text-blue-600" />
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition">&larr; Prev</button>
                                <button className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition">Next &rarr;</button>
                            </div>
                        </div>

                        {/* The Grid Map */}
                        <div className="grid grid-cols-7 gap-2 md:gap-3 mb-6">
                            {/* Day Headers */}
                            {dayNames.map(day => (
                                <div key={day} className="text-center font-black text-[10px] text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                                    {day}
                                </div>
                            ))}

                            {/* Blank spots for beginning of month */}
                            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                                <div key={`blank-${i}`} className="h-20 md:h-28 rounded-xl bg-slate-50/50 border border-transparent"></div>
                            ))}

                            {/* Actual Days */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dateObj = new Date(2026, 4, day);
                                const isSunday = dateObj.getDay() === 0;
                                const event = getEventForDay(day);

                                // --- STYLING LOGIC BASED ON YOUR ARCHITECTURE ---
                                let cellClass = "bg-white border-slate-200 hover:border-blue-400 hover:shadow-md transition-all";
                                let textClass = "text-slate-700";

                                if (isSunday && !event) {
                                    // Weekends: Gray Hatched/Striped Look
                                    cellClass = "bg-slate-50 border-slate-100 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InN0cmlwZSIgd2lkdGg9IjgiIGhlaWdodD0iOCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdHRlcm5UcmFuc2Zvcm0+PHJvdGF0ZSBhbmdsZT0iNDUiLz48L3BhdHRlcm5UcmFuc2Zvcm0+PHJlY3Qgd2lkdGg9IjQiIGhlaWdodD0iOCIgZmlsbD0iI2Y4ZmFmYyIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdHJpcGUpIi8+PC9zdmc+')] opacity-80";
                                    textClass = "text-slate-400";
                                } else if (event) {
                                    if (event.status === 'pending') {
                                        // Pending Festival: Yellow Outline
                                        cellClass = "bg-amber-50/30 border-2 border-amber-400 shadow-sm";
                                        textClass = "text-amber-900";
                                    } else if (event.type === 'institutional') {
                                        // Declared Institutional: Emerald
                                        cellClass = "bg-emerald-50 border-emerald-200";
                                        textClass = "text-emerald-900";
                                    } else if (event.type === 'emergency') {
                                        // Emergency/Custom: Rose Red
                                        cellClass = "bg-rose-50 border-rose-200";
                                        textClass = "text-rose-900";
                                    }
                                }

                                return (
                                    <div key={day} className={`h-20 md:h-28 rounded-xl border p-2 flex flex-col justify-between cursor-pointer ${cellClass}`}>
                                        <span className={`text-sm md:text-base font-black ${textClass}`}>{day}</span>

                                        {event && (
                                            <div className={`text-[9px] md:text-[10px] font-bold leading-tight line-clamp-2 px-1.5 py-0.5 rounded ${event.status === 'pending' ? 'bg-amber-200 text-amber-900' :
                                                event.type === 'institutional' ? 'bg-emerald-200 text-emerald-900' :
                                                    'bg-rose-200 text-rose-900'
                                                }`}>
                                                {event.title}
                                            </div>
                                        )}
                                        {isSunday && !event && (
                                            <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center mb-1 hidden md:block">Weekend</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* The Legend / Key */}
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border-2 border-amber-400 bg-amber-50"></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Festival</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border border-emerald-200 bg-emerald-50"></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Declared Holiday</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border border-rose-200 bg-rose-50"></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Emergency / Custom</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border border-slate-200 bg-slate-50"></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Weekend</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: ANALYTICS & UPCOMING (4/12) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Yearly Analytics Card */}
                    <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] shadow-xl ring-1 ring-slate-800 relative overflow-hidden">
                        {/* Background design flair */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20"></div>

                        <div className="flex items-center gap-2 mb-6">
                            <Info size={18} className="text-blue-400" />
                            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Year-To-Date Analytics</h3>
                        </div>

                        <div className="mb-8">
                            <p className="text-5xl font-black tracking-tighter mb-2">{ACADEMIC_YEAR.currentWorkingDays} <span className="text-xl text-slate-400 font-medium tracking-normal">/ {ACADEMIC_YEAR.targetWorkingDays}</span></p>
                            <p className="text-sm font-bold text-blue-400">Target Working Days Achieved</p>

                            <div className="mt-4">
                                <IonProgressBar
                                    value={ACADEMIC_YEAR.currentWorkingDays / ACADEMIC_YEAR.targetWorkingDays}
                                    color="primary"
                                    className="h-2 rounded-full bg-slate-800"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
                            <div>
                                <p className="text-2xl font-black text-emerald-400">{ACADEMIC_YEAR.totalDays}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Year Days</p>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-rose-400">{ACADEMIC_YEAR.totalHolidaysDeclared}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Declared Off-Days</p>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Holidays List */}
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Clock size={16} /> Upcoming Leaves
                        </h3>

                        <div className="space-y-4">
                            {/* Manual upcoming card for demonstration */}
                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-4 hover:shadow-md transition-all cursor-pointer">
                                <div className="bg-white px-3 py-2 rounded-lg text-center border border-emerald-100 shadow-sm shrink-0">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase">Jun</p>
                                    <p className="text-xl font-black text-slate-900">10</p>
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm">Term 1 Break</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Students & Staff</p>
                                    <div className="mt-2 inline-flex items-center gap-1 bg-emerald-200/50 text-emerald-800 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                                        <CheckCircle2 size={10} /> Declared
                                    </div>
                                </div>
                            </div>

                            {/* Pending Action Card */}
                            <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-xl flex items-start gap-4 hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                                <div className="bg-white px-3 py-2 rounded-lg text-center shadow-sm shrink-0">
                                    <p className="text-[10px] font-black text-amber-600 uppercase">May</p>
                                    <p className="text-xl font-black text-slate-900">25</p>
                                </div>
                                <div>
                                    <h4 className="font-black text-amber-900 text-sm">Summer Fest</h4>
                                    <p className="text-xs text-amber-700/70 font-medium mt-0.5">Awaiting Principal Action</p>
                                    <div className="mt-2 inline-flex items-center gap-1 bg-amber-200 text-amber-900 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                                        <AlertCircle size={10} /> Needs Declaration
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <DeclareHolidayPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
            />
        </AdminLayout>
    );
};

export default HolidayCalendarDashboard;