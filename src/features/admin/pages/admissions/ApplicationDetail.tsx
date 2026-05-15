import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../store/store';
import AdminLayout from '../../components/layout/AdminLayout';
import { ShieldCheck, FileText, UserCheck, GraduationCap, MapPin, Users, BookOpen, Clock, AlertCircle, Eye, X, Loader2, CheckCircle2 } from 'lucide-react';
import { updateApplicationState } from '../../../../store/slices/admissionSlice';
import { Skeleton } from '../../components/shared/Skeleton';
import api from '../../../../services/api';

const ApplicationDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch();
    
    // 🟢 1. STATE MANAGEMENT
    const reduxApp = useSelector((state: RootState) => state.admission.applications.find(a => a._id === id));
    const [app, setApp] = useState<any>(reduxApp);
    const [isLoading, setIsLoading] = useState(!reduxApp);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Document Viewer State
    const [viewingDocUrl, setViewingDocUrl] = useState<string | null>(null);
    const [docLoadingId, setDocLoadingId] = useState<string | null>(null);

    // 🟢 2. AUTO-FETCH ON HARD REFRESH
    useEffect(() => {
        if (!reduxApp) {
            setIsLoading(true);
            api.get(`/api/admissions/applications/${id}`)
                .then(res => setApp(res.data.data))
                .catch(err => console.error("Failed to load application", err))
                .finally(() => setIsLoading(false));
        } else {
            setApp(reduxApp);
        }
    }, [id, reduxApp]);

    // 🟢 3. THE S3 DOCUMENT VIEWER ENGINE
    const handleViewDocument = async (fileKey: string, docId: string) => {
        if (!fileKey) return alert("No file attached to this record.");
        try {
            setDocLoadingId(docId);
            const res = await api.get(`/api/admissions/documents/url?fileKey=${encodeURIComponent(fileKey)}`);
            setViewingDocUrl(res.data.data.url);
        } catch (error) {
            alert("Failed to securely load document from AWS Vault.");
        } finally {
            setDocLoadingId(null);
        }
    };

    const updateWorkflowStatus = async (newStatus: string, remarks: string) => {
        try {
            setIsProcessing(true);
            const res = await api.patch(`/api/admissions/applications/${app._id}/status`, { status: newStatus, remarks });
            if (res.data.success) {
                dispatch(updateApplicationState({ id: app._id, updates: { status: newStatus } }));
                setApp((prev: any) => ({ ...prev, status: newStatus }));
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update status.");
        } finally {
            setIsProcessing(false);
        }
    };

    // 🟢 4. UNIVERSAL SKELETON LOADER UI
    if (isLoading) {
        return (
            <AdminLayout pageTitle="Loading Desk..." breadcrumbs={[]}>
                <Skeleton className="w-full h-24 mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <Skeleton className="w-full h-48" />
                        <Skeleton className="w-full h-32" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="w-full h-64" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="w-full h-72" />
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!app) return <AdminLayout pageTitle="Error" breadcrumbs={[]}><div className="p-10 text-center text-slate-500">Application not found.</div></AdminLayout>;

    return (
        <AdminLayout 
            pageTitle={`Application ${app.applicationNumber}`} 
            pageDescription="Full Application Verification & Review Engine" 
            breadcrumbs={[{ label: 'Admissions Desk', path: '/admin/admissions/applications' }, { label: app.applicationNumber }]}
        >
            {/* 🟢 THE DOCUMENT VIEWER MODAL */}
            {viewingDocUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                            <h3 className="font-black text-slate-800 flex items-center gap-2"><FileText size={18} className="text-blue-500"/> S3 Secure Document Viewer</h3>
                            <button onClick={() => setViewingDocUrl(null)} className="p-2 bg-slate-200 text-slate-600 rounded-xl hover:bg-rose-100 hover:text-rose-600 transition-colors"><X size={18}/></button>
                        </div>
                        <div className="flex-1 bg-slate-200 w-full h-full relative">
                            {/* IFrames natively render PDFs and Images securely */}
                            <iframe src={viewingDocUrl} className="w-full h-full border-none bg-white" title="Secure Vault Document" />
                        </div>
                    </div>
                </div>
            )}

            {/* PROGRESS HEADER */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-2xl">
                        {app.studentProfile?.firstName.charAt(0)}{app.studentProfile?.lastName.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900">{app.studentProfile?.firstName} {app.studentProfile?.lastName}</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Applied for {app.appliedGradeId?.name} • {app.admissionType} Admission
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="px-4 py-2 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl border border-slate-200">
                        Current Status: <span className="text-blue-600 ml-2">{app.status.replace('_', ' ')}</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMN 1 & 2: Identical to Previous Code ... */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-3"><UserCheck size={16} className="text-blue-500"/> Core Identity</h3>
                        <div className="space-y-4 text-sm font-bold text-slate-700">
                            <div><p className="text-[10px] text-slate-400 uppercase">Date of Birth</p><p>{new Date(app.studentProfile?.dob).toLocaleDateString()}</p></div>
                            <div><p className="text-[10px] text-slate-400 uppercase">Gender</p><p className="capitalize">{app.studentProfile?.gender}</p></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-3"><Users size={16} className="text-purple-500"/> Guardians</h3>
                        <div className="space-y-5">
                            {app.guardians?.map((g: any, i: number) => (
                                <div key={i} className="text-sm font-bold text-slate-700">
                                    <p className="flex items-center gap-2">{g.fullName} <span className={`text-[9px] px-2 py-0.5 rounded uppercase ${g.isPrimaryContact ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{g.relation}</span></p>
                                    <p className="text-slate-500 text-xs mt-1">📞 {g.mobile}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: Document Viewer & Action Engine */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-3"><FileText size={16} className="text-emerald-500"/> Vault Documents</h3>
                        <div className="space-y-3">
                            {app.documents?.map((doc: any) => (
                                <div key={doc._id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 transition-colors group">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600">{doc.displayName || doc.documentType.replace('_', ' ')}</span>
                                        <span className={`text-[9px] font-black uppercase mt-1 w-max px-2 py-0.5 rounded ${doc.status === 'SUBMITTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {doc.status}
                                        </span>
                                    </div>
                                    
                                    {/* 🟢 THE VIEW BUTTON */}
                                    {doc.status === 'SUBMITTED' && doc.fileKey && (
                                        <button 
                                            onClick={() => handleViewDocument(doc.fileKey, doc._id)}
                                            disabled={docLoadingId === doc._id}
                                            className="p-2 bg-white border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
                                            title="View Secure Document"
                                        >
                                            {docLoadingId === doc._id ? <Loader2 size={16} className="animate-spin text-blue-400" /> : <Eye size={16} />}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ACTION ENGINE */}
                    <div className="bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-900/20 text-white">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-700 pb-3"><ShieldCheck size={16} className="text-blue-400"/> Admin Action Engine</h3>
                        
                        <div className="space-y-3">
                            {app.status === 'SUBMITTED' && (
                                <button onClick={() => updateWorkflowStatus('UNDER_REVIEW', 'Admin started verification process.')} disabled={isProcessing} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2">
                                    <Clock size={16} /> Mark as "Under Review"
                                </button>
                            )}

                            {app.status === 'UNDER_REVIEW' && (
                                <button onClick={() => updateWorkflowStatus('APPROVED', 'All documents verified and approved.')} disabled={isProcessing} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2">
                                    <CheckCircle2 size={16} /> Approve Application
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};

export default ApplicationDetail;