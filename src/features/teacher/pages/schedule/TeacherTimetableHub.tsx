import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Calendar,
  Clock,
  Coffee,
  BookOpen,
  GraduationCap,
  Sparkles
} from 'lucide-react';

import { RootState } from '../../../../store/store';
import TeacherLayout from '../../components/layout/TeacherLayout';
import Breadcrumbs from '../../components/shared/Breadcrumbs'; // Required for navigation

// ============================================
// MOCK CONSTANTS
// ============================================

const LOGGED_IN_TEACHER_ID = 'EMP-001';

const DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY'
];

const PERIODS = [1, 2, 3, 4, 'RECESS', 5, 6, 7, 8];

const PERIOD_TIMES: Record<string, string> = {
  1: '08:00 - 08:45',
  2: '08:45 - 09:30',
  3: '09:30 - 10:15',
  4: '10:15 - 11:00',
  RECESS: '11:00 - 11:30',
  5: '11:30 - 12:15',
  6: '12:15 - 13:00',
  7: '13:00 - 13:45',
  8: '13:45 - 14:30'
};

const TeacherTimetableHub: React.FC = () => {
  const [mobileActiveDay, setMobileActiveDay] = useState<string>('MONDAY');

  // ============================================
  // REDUX DATA
  // ============================================

  const { timetable, allocations, subjects } = useSelector(
    (state: RootState) => state.academic
  );

  // ============================================
  // MY SCHEDULE ENGINE
  // ============================================

  const mySchedule = useMemo(() => {
    const myAllocationIds = allocations
      .filter((a) => a.facultyId === LOGGED_IN_TEACHER_ID)
      .map((a) => a.id);

    const myPeriods = timetable.filter((t) =>
      myAllocationIds.includes(t.allocationId)
    );

    const lookup: Record<string, any> = {};

    myPeriods.forEach((p) => {
      const allocation = allocations.find(
        (a) => a.id === p.allocationId
      );

      const subject = allocation
        ? subjects[allocation.subjectId]
        : null;

      lookup[`${p.dayOfWeek.toUpperCase()}-${p.periodNumber}`] = {
        classId: p.classId,
        sectionId: p.sectionId,
        subjectName: subject?.name || 'Unknown',
        roomId: p.roomId || 'TBA'
      };
    });

    return lookup;
  }, [timetable, allocations, subjects]);

  // ============================================
  // STATS
  // ============================================

  const totalClasses = Object.keys(mySchedule).length;

  const totalPossibleSlots =
    DAYS.length * (PERIODS.length - 1);

  const freeSlots = totalPossibleSlots - totalClasses;

  // ============================================
  // CELL RENDERER
  // ============================================

  const renderCellContent = (
    day: string,
    periodNumber: number | string
  ) => {
    if (periodNumber === 'RECESS') {
      return (
        <div className="h-full min-h-[90px] rounded-2xl border border-orange-200 bg-orange-50 flex flex-col items-center justify-center text-orange-600">
          <Coffee size={20} className="mb-2" />

          <span className="text-[11px] font-black uppercase tracking-[0.25em]">
            Recess
          </span>
        </div>
      );
    }

    const slot = mySchedule[`${day}-${periodNumber}`];

    // ============================================
    // FREE SLOT
    // ============================================

    if (!slot) {
      return (
        <div className="h-full min-h-[95px] rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center transition-all hover:bg-slate-100">
          <Sparkles
            size={18}
            className="text-slate-300 mb-2"
          />

          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
            Free Slot
          </span>
        </div>
      );
    }

    // ============================================
    // CLASS SLOT
    // ============================================

    return (
      <div className="h-full min-h-[95px] rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-white p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
        <div>
          <h4
            className="text-sm font-black text-slate-900 leading-tight line-clamp-2"
            title={slot.subjectName}
          >
            {slot.subjectName}
          </h4>

          <div className="mt-2 inline-flex items-center gap-1 rounded-xl bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
            <GraduationCap size={10} />
            Class {slot.classId}-{slot.sectionId}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <BookOpen size={11} />
          Room : {slot.roomId}
        </div>
      </div>
    );
  };

  return (
    <TeacherLayout>
      <div className="w-full max-w-[1600px] mx-auto p-4 lg:p-8">

        {/* ============================================ */}
        {/* PAGE HEADER */}
        {/* ============================================ */}

        <div className="mb-8 rounded-[32px] border border-slate-200 bg-white p-6 lg:p-8 shadow-sm">

          {/* 🟢 FIXED BREADCRUMB COMPONENT */}
          <Breadcrumbs items={[
            { label: 'My Timetable' }
          ]} />

          {/* HEADER CONTENT */}
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8 mt-2">

            {/* LEFT */}
            <div className="flex items-start gap-4">

              <div className="shrink-0 p-4 rounded-3xl bg-blue-100 text-blue-600">
                <Calendar size={30} />
              </div>

              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900">
                  Weekly Schedule
                </h1>

                <p className="mt-2 text-sm lg:text-base font-semibold text-slate-500 max-w-2xl">
                  Review your allocated classes,
                  room assignments, free periods,
                  and academic timetable for the week.
                </p>
              </div>
            </div>

            {/* RIGHT STATS */}
            <div className="flex flex-wrap gap-4">

              <div className="min-w-[150px] rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
                <div className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Total Classes
                </div>

                <div className="mt-2 text-3xl font-black text-slate-900">
                  {totalClasses}
                </div>
              </div>

              <div className="min-w-[150px] rounded-3xl border border-blue-200 bg-blue-50 px-5 py-4">
                <div className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-400">
                  Free Slots
                </div>

                <div className="mt-2 text-3xl font-black text-blue-700">
                  {freeSlots}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* MOBILE VIEW */}
        {/* ============================================ */}

        <div className="block lg:hidden">

          {/* DAY TABS */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 custom-scrollbar">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setMobileActiveDay(day)}
                className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 ${
                  mobileActiveDay === day
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'bg-white border border-slate-200 text-slate-500'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>

          {/* TIMELINE */}
          <div className="space-y-4 pb-10">

            {PERIODS.map((period) => (
              <div
                key={period}
                className="flex gap-4"
              >

                {/* TIME */}
                <div className="w-24 shrink-0 pt-2 text-right">

                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    {period === 'RECESS'
                      ? 'Break'
                      : `P-${period}`}
                  </div>

                  <div className="mt-1 text-[10px] font-bold text-slate-400">
                    {PERIOD_TIMES[period.toString()]}
                  </div>
                </div>

                {/* SLOT */}
                <div className="flex-1">
                  {renderCellContent(
                    mobileActiveDay,
                    period
                  )}
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* ============================================ */}
        {/* DESKTOP VIEW */}
        {/* ============================================ */}

        <div className="hidden lg:block">

          <div className="rounded-[32px] border border-slate-200 bg-white shadow-sm overflow-hidden">

            {/* TABLE HEADER */}
            <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Weekly Timetable Matrix
                </h2>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Your assigned teaching schedule
                  for the academic week.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                <Clock size={14} />
                Academic Session 2026
              </div>
            </div>

            {/* TABLE */}
            <div className="min-w-0 overflow-x-auto custom-scrollbar">

              <table className="w-full border-collapse">

                {/* HEAD */}
                <thead className="sticky top-0 z-20">

                  <tr>

                    {/* TIME */}
                    <th className="sticky left-0 z-30 min-w-[130px] bg-slate-900 px-4 py-5 text-center text-white border-r border-slate-800">
                      <div className="text-sm font-black uppercase tracking-[0.2em]">
                        Time
                      </div>
                    </th>

                    {/* DAYS */}
                    {DAYS.map((day) => (
                      <th
                        key={day}
                        className="bg-slate-900 px-6 py-5 text-center text-white whitespace-nowrap border-r border-slate-800"
                      >
                        <div className="text-sm font-black uppercase tracking-[0.2em]">
                          {day}
                        </div>
                      </th>
                    ))}
                  </tr>

                </thead>

                {/* BODY */}
                <tbody>

                  {PERIODS.map((period, index) => {

                    const isRecess =
                      period === 'RECESS';

                    return (
                      <tr
                        key={period}
                        className={
                          index % 2 === 0
                            ? 'bg-white'
                            : 'bg-slate-50/50'
                        }
                      >

                        {/* TIME COLUMN */}
                        <td className="sticky left-0 z-10 min-w-[130px] border-r border-b border-slate-200 bg-white px-4 py-5 text-center align-middle">

                          <div className="text-base font-black text-slate-700">
                            {isRecess
                              ? 'Break'
                              : `P-${period}`}
                          </div>

                          <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {
                              PERIOD_TIMES[
                                period.toString()
                              ]
                            }
                          </div>
                        </td>

                        {/* RECESS */}
                        {isRecess ? (
                          <td
                            colSpan={6}
                            className="border-b border-slate-200 bg-orange-50/50 px-4 py-5"
                          >
                            <div className="flex items-center justify-center gap-3 text-orange-600">

                              <Coffee size={18} />

                              <span className="text-sm font-black uppercase tracking-[0.25em]">
                                Campus Recess
                              </span>
                            </div>
                          </td>
                        ) : (
                          DAYS.map((day) => (
                            <td
                              key={`${day}-${period}`}
                              className="border-b border-r border-slate-200 p-3 align-top min-w-[220px]"
                            >
                              {renderCellContent(
                                day,
                                period
                              )}
                            </td>
                          ))
                        )}

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          </div>
        </div>

      </div>
    </TeacherLayout>
  );
};

export default TeacherTimetableHub;