import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { RootState } from '../../../../store/store';
import { setApplications } from '../../../../store/slices/admissionSlice';
import AdminLayout from '../../components/layout/AdminLayout';
import { Search, Filter, Eye, AlertCircle, FileText, CheckCircle2, Clock } from 'lucide-react';
import api from '../../../../services/api';

const ApplicationDesk: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const { applications } = useSelector((state: RootState) => state.admission);

    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [error, setError] = useState<string | null>(null);

    //   FETCH APPLICATIONS FROM BACKEND
    useEffect(() => {
        const fetchApps = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const res = await api.get('/api/admissions/applications?limit=100');
                if (res.data.success) {
                    dispatch(setApplications(res.data.data.applications));
                }
            } catch (err: any) {
                console.error("Failed to load applications", err);
                setError(err.response?.data?.message || "Failed to load applications from server.");
            } finally {
                setTimeout(() => setIsLoading(false), 800); // For smooth skeleton effect
            }
        };
        fetchApps();
    }, [dispatch]);

    //   SEARCH & FILTER LOGIC
    const filteredApps = useMemo(() => {
        return applications.filter((app: any) => {
            const matchesSearch =
                (app.applicationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (app.studentProfile?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (app.studentProfile?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [applications, searchTerm, statusFilter]);

    // Dynamic Badges
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUBMITTED': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase flex items-center w-max gap-1"><Clock size={12} /> Under Review</span>;
            case 'DOCUMENT_PENDING': return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase flex items-center w-max gap-1"><AlertCircle size={12} /> Doc Pending</span>;
            case 'APPROVED': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase flex items-center w-max gap-1"><CheckCircle2 size={12} /> Approved</span>;
            case 'ENROLLED': return <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-[10px] font-black uppercase flex items-center w-max gap-1"><FileText size={12} /> Enrolled</span>;
            default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase flex items-center w-max gap-1">{status}</span>;
        }
    };

    return (
        <AdminLayout
            pageTitle="Application Desk"
            pageDescription="Review submitted applications, verify documents, and enroll students."
            breadcrumbs={[{ label: 'Admissions' }, { label: 'Application Desk' }]}
        >

            {/* Top Bar: Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search App No. or Student Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl w-full md:w-auto">
                    <Filter size={16} className="text-slate-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-sm font-black text-slate-700 outline-none bg-transparent w-full cursor-pointer py-1"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="SUBMITTED">Under Review</option>
                        <option value="DOCUMENT_PENDING">Document Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="ENROLLED">Enrolled</option>
                    </select>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 font-bold text-sm">
                    <AlertCircle size={20} className="text-rose-500" />
                    {error}
                </div>
            )}

            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <th className="p-5">App Number</th>
                            <th className="p-5">Student Name</th>
                            <th className="p-5">Target Class</th>
                            <th className="p-5">Status</th>
                            <th className="p-5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-bold text-slate-700">
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => <TableSkeleton key={i} />)
                        ) : filteredApps.length > 0 ? (
                            filteredApps.map((app: any) => (
                                <tr key={app._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="p-5 text-blue-600">{app.applicationNumber || 'N/A'}</td>
                                    <td className="p-5">{app.studentProfile?.firstName} {app.studentProfile?.lastName}</td>
                                    <td className="p-5">Class {app.appliedGradeId?.name || 'N/A'}</td>
                                    <td className="p-5">{getStatusBadge(app.status)}</td>
                                    <td className="p-5 text-right">
                                        <button
                                            onClick={() => history.push(`/admin/admissions/applications/${app._id}`)}
                                            className="px-4 py-2 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-black transition-all shadow-sm flex items-center justify-end gap-2 ml-auto"
                                        >
                                            <Eye size={14} /> Open Desk
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="p-10 text-center text-slate-400 font-bold">No applications found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View (Hidden on desktop) */}
            <div className="md:hidden space-y-4">
                {isLoading ? (
                    Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)
                ) : filteredApps.length > 0 ? (
                    filteredApps.map((app: any) => (
                        <div key={app._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-black text-blue-600 tracking-widest uppercase">{app.applicationNumber}</span>
                                    <h3 className="text-base font-black text-slate-900 mt-0.5">{app.studentProfile?.firstName} {app.studentProfile?.lastName}</h3>
                                    <p className="text-xs font-bold text-slate-500 mt-1">Class {app.appliedGradeId?.name}</p>
                                </div>
                                {getStatusBadge(app.status)}
                            </div>
                            <button
                                onClick={() => history.push(`/admin/admissions/applications/${app._id}`)}
                                className="mt-2 w-full py-3 bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-700 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
                            >
                                <Eye size={16} /> Open Application
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 font-bold">
                        No applications found.
                    </div>
                )}
            </div>

        </AdminLayout>
    );
};

const TableSkeleton = () => (
    <tr className="border-b border-slate-50">
        <td className="p-5"><div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div></td>
        <td className="p-5"><div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div></td>
        <td className="p-5"><div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div></td>
        <td className="p-5"><div className="h-6 w-20 bg-slate-100 rounded-lg animate-pulse"></div></td>
        <td className="p-5 text-right"><div className="h-8 w-24 bg-slate-100 rounded-xl ml-auto animate-pulse"></div></td>
    </tr>
);

const CardSkeleton = () => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-pulse flex flex-col gap-3">
        <div className="flex justify-between items-start">
            <div>
                <div className="h-3 w-20 bg-slate-200 rounded mb-2"></div>
                <div className="h-5 w-32 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 w-16 bg-slate-100 rounded"></div>
            </div>
            <div className="h-6 w-20 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-10 w-full bg-slate-50 rounded-xl mt-2"></div>
    </div>
);

export default ApplicationDesk;