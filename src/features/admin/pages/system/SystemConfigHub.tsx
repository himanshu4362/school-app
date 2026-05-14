import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Building2, Users, Presentation, GraduationCap, BookOpen, Library, CalendarDays, Settings, AlertCircle, X } from 'lucide-react';
import { IonLoading } from '@ionic/react';
import { RootState } from '../../../../store/store';
import { setModule, clearValidationErrors } from '../../../../store/slices/systemConfigSlice';
import AdminLayout from '../../components/layout/AdminLayout';
import AcademicYearPanel from '../../components/system/AcademicYearPanel';
import RoomPanel from '../../components/system/RoomPanel';
import GradePanel from '../../components/system/GradePanel';
import SectionPanel from '../../components/system/SectionPanel';
import DepartmentPanel from '../../components/system/DepartmentPanel';
import DesignationPanel from '../../components/system/DesignationPanel';
import SubjectPanel from '../../components/system/SubjectPanel';
import api from '../../../../services/api';
import {
    upsertAcademicYear,
    upsertRoom,
    upsertSection
} from '../../../../store/slices/systemConfigSlice';
import { upsertGrade } from '../../../../store/slices/systemConfigSlice';
const MODULE_MENU = [
    { id: 'academicYears', label: 'Academic Years', icon: <CalendarDays size={18} /> },
    { id: 'departments', label: 'Departments', icon: <Building2 size={18} /> },
    { id: 'rooms', label: 'Infrastructure', icon: <Library size={18} /> },
    { id: 'sections', label: 'Sections (Classes)', icon: <Presentation size={18} /> },
    { id: 'designations', label: 'Designations', icon: <Users size={18} /> },
    { id: 'grades', label: 'Grades', icon: <GraduationCap size={18} /> },
    { id: 'subjects', label: 'Subject Master', icon: <BookOpen size={18} /> },
] as const;

const SystemConfigHub: React.FC = () => {
    const dispatch = useDispatch();
    const { activeModule, validationErrors } = useSelector((state: RootState) => state.systemConfig);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                setIsLoading(true)
                const [years, grades, rooms, sections, seats] = await Promise.all([
                    api.get('/master-data/academic-years'),
                    api.get('/master-data/grades'),
                    api.get('/master-data/rooms'),
                    api.get('/master-data/sections'),
                    api.get('/master-data/seats')
                ]);
                years.data.data.forEach((year: any) => {
                    dispatch(upsertAcademicYear(year));
                });

                grades.data.data.forEach((grade: any) => {
                    dispatch(upsertGrade(grade));
                });

                rooms.data.data.forEach((room: any) => {
                    dispatch(upsertRoom(room));
                });

                sections.data.data.forEach((section: any) => {
                    dispatch(upsertSection(section));
                });
            } catch (err) {
                console.error("Failed to hydrate Master Data Hub", err);
            } finally {
                setIsLoading(false)
            }
        };
        fetchMasterData();
    }, [dispatch]);

    return (
        <AdminLayout
            pageTitle="System Master Config"
            pageDescription="Manage organizational hierarchy, infrastructure, and academic boundaries."
            breadcrumbs={[{ label: 'System Admin' }, { label: 'Master Data' }]}
        >
            <IonLoading
                isOpen={isLoading}
                message="Loading Master Data..."
                spinner="crescent"
            />
            {validationErrors.length > 0 && (
                <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 shadow-sm">
                    <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />
                    <div className="flex-1">
                        <h4 className="text-xs font-black text-rose-900 uppercase tracking-widest mb-1">System Guard: Validation Failed</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            {validationErrors.map((err, i) => (
                                <li key={i} className="text-sm font-bold text-rose-700 leading-tight">
                                    {err.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button onClick={() => dispatch(clearValidationErrors())} className="text-rose-400 hover:text-rose-700 bg-white p-1 rounded-lg shadow-sm border border-rose-100"><X size={16} /></button>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">

                {/* LEFT MENU */}
                <div className="w-full lg:w-64 shrink-0 space-y-1">
                    <div className="p-4 bg-slate-900 rounded-2xl mb-4 shadow-lg shadow-slate-200 text-white">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Governance</h3>
                        <p className="text-sm font-black">MDM Control Center</p>
                    </div>

                    {MODULE_MENU.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => dispatch(setModule(item.id as any))}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-black transition-all ${activeModule === item.id
                                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                                }`}
                        >
                            <div className={activeModule === item.id ? 'text-indigo-600' : 'text-slate-400'}>{item.icon}</div>
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* RIGHT CONTENT AREA */}
                <div className="flex-1 bg-slate-50/50 p-6 rounded-3xl border border-slate-200 min-h-[600px] shadow-inner">
                    {activeModule === 'academicYears' && <AcademicYearPanel />}
                    {activeModule === 'rooms' && <RoomPanel />}
                    {activeModule === 'grades' && <GradePanel />}
                    {activeModule === 'sections' && <SectionPanel />}
                    {activeModule === 'departments' && <DepartmentPanel />}
                    {activeModule === 'designations' && <DesignationPanel />}
                    {activeModule === 'subjects' && <SubjectPanel />}

                    {/* placeholder for the future features */}
                    {['curriculum'].includes(activeModule) && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                            <Settings size={48} className="mb-4 text-slate-400" />
                            <h3 className="text-lg font-black text-slate-900">{MODULE_MENU.find(m => m.id === activeModule)?.label} Panel</h3>
                            <p className="text-sm font-bold text-slate-500 mt-1">Architectural schema is locked. UI Pending.</p>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
};

export default SystemConfigHub;