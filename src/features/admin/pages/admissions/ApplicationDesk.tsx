import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom'; // 🟢 1. IMPORT useHistory
import { RootState } from '../../../../store/store';
import AdminLayout from '../../components/layout/AdminLayout';
import { Search, Eye } from 'lucide-react';
import api from '../../../../services/api';
import { setApplications } from '../../../../store/slices/admissionSlice'; // Removed openReviewDrawer

const ApplicationDesk: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory(); // 🟢 2. INITIALIZE history
    
    const { applications } = useSelector((state: RootState) => state.admission);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const response = await api.get('/api/admissions/applications?limit=50');
                if (response.data.success) {
                    dispatch(setApplications(response.data.data.applications));
                }
            } catch (error) {
                console.error("Failed to fetch applications", error);
            }
        };
        fetchApps();
    }, [dispatch]);

    const filteredApps = applications.filter(app => 
        app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentProfile?.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'SUBMITTED': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-black tracking-widest uppercase">Under Review</span>;
            case 'DOCUMENT_PENDING': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-black tracking-widest uppercase">Doc Pending</span>;
            case 'APPROVED': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-black tracking-widest uppercase">Approved</span>;
            case 'ENROLLED': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-[10px] font-black tracking-widest uppercase">Enrolled</span>;
            default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-black tracking-widest uppercase">{status}</span>;
        }
    };

    return (
        <AdminLayout pageTitle="Application Desk" pageDescription="Review submissions, verify documents, and enroll students." breadcrumbs={[{ label: 'Admissions' }, { label: 'Application Desk' }]}>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative w-full md:w-96">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search Application No. or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <th className="p-4">App Number</th>
                                <th className="p-4">Student Name</th>
                                <th className="p-4">Target Class</th>
                                <th className="p-4">Admission Type</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-bold text-slate-700">
                            {filteredApps.map((app) => (
                                <tr key={app._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-blue-600">{app.applicationNumber}</td>
                                    <td className="p-4">{app.studentProfile?.firstName} {app.studentProfile?.lastName}</td>
                                    <td className="p-4">{app.appliedGradeId?.name} {app.preferredSectionId ? `(${app.preferredSectionId.name})` : ''}</td>
                                    <td className="p-4 capitalize">{app.admissionType}</td>
                                    <td className="p-4">{getStatusBadge(app.status)}</td>
                                    <td className="p-4 text-right">
                                        
                                        {/* 🟢 3. THE UPDATED BUTTON */}
                                        <button 
                                            onClick={() => history.push(`/admin/admissions/applications/${app._id}`)} 
                                            className="px-4 py-2 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-black transition-all shadow-sm flex items-center justify-end gap-2 ml-auto"
                                        >
                                            <Eye size={14} /> Open Desk
                                        </button>
                                        {/* --------------------------- */}

                                    </td>
                                </tr>
                            ))}
                            {filteredApps.length === 0 && (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-400 text-xs">No applications found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🟢 4. The Drawer component has been removed from here! */}

        </AdminLayout>
    );
};

export default ApplicationDesk;