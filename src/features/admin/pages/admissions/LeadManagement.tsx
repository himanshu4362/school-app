import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { setLeads, setSearchQuery, setClassFilter, setStatusFilter, openLeadDrawer, initializeWizardFromLead } from '../../../../store/slices/admissionSlice';
import AdminLayout from '../../components/layout/AdminLayout';
import { Search, Filter, Plus, Phone, MessageSquare, Calendar } from 'lucide-react';
import api from '../../../../services/api';
import CaptureLeadDrawer from '../../components/admissions/CaptureLeadDrawer';
import { useIonToast } from '@ionic/react';
import { useHistory } from 'react-router';

const AdmissionTabs = ({ active }: { active: 'leads' | 'applications' }) => {
    const h = useHistory();
    return (
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-max">
            <button onClick={() => h.push('/admin/admissions')} className={`px-5 py-2.5 rounded-lg font-black text-sm transition-all ${active === 'leads' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Lead CRM</button>
            <button onClick={() => h.push('/admin/admissions/applications')} className={`px-5 py-2.5 rounded-lg font-black text-sm transition-all ${active === 'applications' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Application Desk</button>
        </div>
    );
};

const LeadManagement: React.FC = () => {
    const history = useHistory()
    const dispatch = useDispatch();
    const { leads, searchQuery, classFilter, statusFilter } = useSelector((state: RootState) => state.admission);
    const [isLoading, setIsLoading] = useState(true);
    const [grades, setGrades] = useState<any[]>([]);

    const getClassName = (classId: any) => {
        if (!classId) return 'Not Specified';
        if (typeof classId === 'object' && classId.name) return classId.name;
        const grade = grades.find(g => g._id === classId);
        return grade ? grade.name : 'Not Specified';
    };

    const [present] = useIonToast();

    const presentToast = (position: 'top' | 'middle' | 'bottom') => {
        present({
            message: 'Start Admission Process',
            duration: 4000,
            position: position,
        });
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [leadsRes, gradesRes] = await Promise.all([
                    api.get('/api/admissions/leads?limit=100'),
                    api.get('/api/master-data/grades')
                ]);

                if (leadsRes.data.success) {
                    dispatch(setLeads(leadsRes.data.data.leads || leadsRes.data.data));
                }
                if (gradesRes.data.success) {
                    setGrades(gradesRes.data.data);
                }
            } catch (err) {
                console.error("Data load karne me error aayi", err);
            } finally {
                setTimeout(() => setIsLoading(false), 800);
            }
        };
        fetchData();
    }, [dispatch]);

    //  SEARCH & FILTER LOGIC
    const filteredLeads = useMemo(() => {
        return leads.filter((l: any) => {
            const matchesSearch = l.parentName.toLowerCase().includes(searchQuery.toLowerCase()) || l.mobile.includes(searchQuery);
            const matchesClass = classFilter === 'ALL' || (l.interestedClassId?._id || l.interestedClassId) === classFilter;
            const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter; // 🟢 Status Filter Check

            return matchesSearch && matchesClass && matchesStatus;
        });
    }, [leads, searchQuery, classFilter, statusFilter]);

    return (
        <AdminLayout
            pageTitle="Lead CRM"
            pageDescription="Track and convert potential admissions."
            breadcrumbs={[{ label: 'Admissions' }, { label: 'Lead Management' }]}
            headerActions={
                <button onClick={() => dispatch(openLeadDrawer(null))} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2">
                    <Plus size={18} /> <span className="hidden md:inline">Capture Lead</span>
                </button>
            }
        >
            <AdmissionTabs active="leads" />
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search Parent Name or Mobile..."
                        value={searchQuery}
                        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm transition-all"
                    />
                </div>
                {/* Status Filter Dropdown */}
                <div className="w-full md:w-48 relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                        value={statusFilter}
                        onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm appearance-none cursor-pointer capitalize"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="follow_up">Follow Up</option>
                        <option value="converted">Converted</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
                {/* Class Filter Dropdown */}
                <div className="w-full md:w-48 relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                        value={classFilter}
                        onChange={(e) => dispatch(setClassFilter(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm appearance-none cursor-pointer"
                    >
                        <option value="ALL">All Classes</option>
                        {grades.map((g: any) => (
                            <option key={g._id} value={g._id}>{g.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Leads List / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
                ) : filteredLeads.length > 0 ? (
                    filteredLeads.map((lead: any) => (
                        <div
                            key={lead._id}
                            onClick={() => dispatch(openLeadDrawer(lead._id))}
                            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                        >
                            {/* Status Ribbon */}
                            <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-black uppercase tracking-tighter rounded-bl-xl ${getStatusColor(lead.status)}`}>
                                {lead.status.replace('_', ' ')}
                            </div>

                            <div className="flex flex-col gap-3">
                                <div>
                                    <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{lead.parentName}</h3>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        Class: {getClassName(lead.interestedClassId)}
                                    </p>
                                </div>

                                {lead.status === 'converted' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(initializeWizardFromLead({
                                                classId: lead.interestedClassId?._id || lead.interestedClassId || "",
                                                parentName: lead.parentName,
                                                mobile: lead.mobile
                                            }));
                                            presentToast('top')
                                            history.push('/admin/admissions/wizard')
                                        }}
                                        className="mt-3 mb-2 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-emerald-500/30 transition-all active:scale-95"
                                    >
                                        <Plus size={16} /> Start Admission
                                    </button>
                                )}

                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                                        <Phone size={14} className="text-blue-500" /> +91 {lead.mobile}
                                    </div>
                                    <div className="bg-slate-100 p-2 rounded-lg text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                        <MessageSquare size={14} />
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400">
                                    <span className="flex items-center gap-1 uppercase"><Calendar size={12} /> {new Date(lead.createdAt).toLocaleDateString()}</span>
                                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded capitalize">{lead.source}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full p-20 text-center text-slate-400 font-bold">
                        No Leads found matching your criteria.
                    </div>
                )}
            </div>

            {/* The Drawer for Add/Edit */}
            <CaptureLeadDrawer />
        </AdminLayout>
    );
};

// Custom Skeleton UI
const SkeletonCard = () => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
        <div className="h-4 w-2/3 bg-slate-200 rounded mb-2"></div>
        <div className="h-3 w-1/3 bg-slate-100 rounded mb-4"></div>
        <div className="h-10 w-full bg-slate-50 rounded-xl mb-3"></div>
        <div className="flex justify-between">
            <div className="h-3 w-20 bg-slate-100 rounded"></div>
            <div className="h-3 w-12 bg-slate-100 rounded"></div>
        </div>
    </div>
);

const getStatusColor = (status: string) => {
    switch (status) {
        case 'new': return 'bg-blue-100 text-blue-600';
        case 'contacted': return 'bg-purple-100 text-purple-600';
        case 'follow_up': return 'bg-amber-100 text-amber-600';
        case 'converted': return 'bg-emerald-100 text-emerald-600';
        case 'closed': return 'bg-slate-100 text-slate-600';
        default: return 'bg-slate-100 text-slate-500';
    }
};

export default LeadManagement;