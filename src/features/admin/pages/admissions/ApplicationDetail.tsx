import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateApplicationStatus } from '../../../../store/slices/admissionSlice';
import { useParams, useHistory } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import {
    Users, ShieldCheck, GraduationCap, Loader2, AlertCircle,
    FileCheck, CheckCircle, CheckCircle2, X, UploadCloud, Check, XCircle, ArrowRight, Eye, History,
    Clock, MapPin, Ban, RotateCcw, MessageSquare, FileText, CheckSquare
} from 'lucide-react';
import { useIonToast } from '@ionic/react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import api from '../../../../services/api';
import {
    TransformWrapper,
    TransformComponent
} from "react-zoom-pan-pinch";

import { PrivacyScreen } from '@capacitor/privacy-screen';

import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

//  ENHANCED DROPZONE FOR RE-UPLOADS
const ReuploadDropzone = ({ onUpload, isUploading }: { onUpload: (file: File, customName: string) => void, isUploading: boolean }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [customName, setCustomName] = useState<string>('');

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
            // Pre-fill the custom name with the file name (without extension)
            const nameWithoutExt = acceptedFiles[0].name.substring(0, acceptedFiles[0].name.lastIndexOf('.')) || acceptedFiles[0].name;
            setCustomName(nameWithoutExt);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

    if (selectedFile) {
        return (
            <div className="p-5 mt-3 border border-blue-200 bg-blue-50/50 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <FileText size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-800 line-clamp-1">{selectedFile.name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase flex gap-2">
                                <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                <span>•</span>
                                <span>{selectedFile.type || 'Unknown Type'}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedFile(null)} disabled={isUploading} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <XCircle size={18} />
                    </button>
                </div>
                
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Rename File (Optional)</label>
                        <input 
                            type="text" 
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            disabled={isUploading}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="Enter document name..."
                        />
                    </div>
                    
                    <button 
                        onClick={() => onUpload(selectedFile, customName)}
                        disabled={isUploading || !customName.trim()}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-black shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                        {isUploading ? 'Uploading to S3 Vault...' : 'Confirm & Upload Document'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div {...getRootProps()} className={`p-8 mt-3 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}`}>
            <input {...getInputProps()} />
            <div className="w-16 h-16 mx-auto bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                <UploadCloud className="text-blue-500" size={32} />
            </div>
            <h4 className="text-sm font-black text-slate-700 mb-1">Drag & Drop Document Here</h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">or click to browse files</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1"><CheckCircle2 size={12} /> PDF</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={12} /> JPG/PNG</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Max 5MB</span>
            </div>
        </div>
    );
};

// ==========================================
// CONFIRMATION MODAL COMPONENT
// ==========================================
const ConfirmationModal = ({ title, description, confirmLabel, confirmColor, isProcessing, onConfirm, onCancel, children }: {
    title: string; description: string; confirmLabel: string; confirmColor: string;
    isProcessing: boolean; onConfirm: (remarks: string) => void; onCancel: () => void; children?: React.ReactNode;
}) => {
    const [remarks, setRemarks] = useState('');
    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onCancel}>
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-black text-slate-900 mb-2">{title}</h2>
                <p className="text-sm font-bold text-slate-500 mb-6 leading-relaxed">{description}</p>
                {children}
                <div className="mb-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Remarks (Optional)</label>
                    <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} placeholder="Add any notes for the audit trail..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm resize-none" />
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={isProcessing} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-sm hover:bg-slate-200 transition-all">Cancel</button>
                    <button onClick={() => onConfirm(remarks)} disabled={isProcessing} className={`flex-1 py-3 ${confirmColor} text-white rounded-xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2`}>
                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ApplicationDetail: React.FC = () => {
    const params = useParams<any>();
    const safeId = params.id || params.applicationId || Object.values(params)[0];
    const history = useHistory();
    const dispatch = useDispatch();
    const [present] = useIonToast();
    const [activeDropzoneId, setActiveDropzoneId] = useState<string | null>(null);
    const [app, setApp] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
    const [viewingDoc, setViewingDoc] = useState<{ url: string, name: string } | null>(null);
    const [updatingDocId, setUpdatingDocId] = useState<string | null>(null);
    const [pdfPages, setPdfPages] = useState(0);
    const [marksInput, setMarksInput] = useState<string>('');
    const [confirmModal, setConfirmModal] = useState<{ title: string; description: string; confirmLabel: string; confirmColor: string; action: (remarks: string) => void } | null>(null);
    const allDocsVerified =
        app?.documents?.every(
            (d: any) => d.status === 'VERIFIED'
        ) || false;

    const anyDocRejected =
        app?.documents?.some(
            (d: any) =>
                ['REJECTED', 'REUPLOAD_REQUIRED']
                    .includes(d.status)
        ) || false;

    useEffect(() => {
        if (!safeId || safeId === 'undefined') { setIsLoading(false); return; }
        fetchData();
    }, [safeId]);

    useEffect(() => {
        if (!viewingDoc) return;

        const enableSecureView = async () => {
            try {
                await PrivacyScreen.enable();
            } catch (err) {
                console.error('Privacy screen enable failed', err);
            }
        };

        enableSecureView();

        return () => {
            PrivacyScreen.disable().catch(() => { });
        };
    }, [viewingDoc]);


    // 2. fetchData update karein (Presigned URL mangwane ke liye)
    const fetchData = async () => {
        try {
            const res = await api.get(`/api/admissions/applications/${safeId}`);
            if (res.data.success) {
                const applicationData = res.data.data;
                setApp(applicationData);

                // Fetch Profile Photo Securely
                if (applicationData.studentProfile?.profilePhotoKey) {
                    try {
                        const photoRes = await api.get(`/api/admissions/documents/url?fileKey=${encodeURIComponent(applicationData.studentProfile.profilePhotoKey)}`);
                        setProfilePhotoUrl(photoRes.data.data.url);
                    } catch (e) {
                        console.error("Profile photo load failed");
                    }
                }
            }
        } catch (err) { console.error("Fetch error", err); } finally { setIsLoading(false); }
    };

    const handleViewDoc = async (fileKey: string, docName: string) => {
        try {
            const ext = fileKey.split('.').pop() || 'pdf';
            const res = await api.get(`/api/admissions/documents/url?fileKey=${encodeURIComponent(fileKey)}`);
            setViewingDoc({ url: res.data.data.url, name: `${docName}.${ext}` });
        } catch (err) {
            alert("Document access failed. S3 Presigned URL error.");
        }
    };
    const updateDocStatus = async (docId: string, status: string, fileKey?: string) => {
        try {
            setUpdatingDocId(docId);
            const payload = { status, remarks: `Status updated to ${status}`, fileKey };
            const res = await api.patch(`/api/admissions/applications/${safeId}/documents/${docId}/verify`, payload);
            if (res.data.success) {
                await fetchData(); // RELOAD FROM BACKEND (Source of Truth)
            }
        } catch (err: any) { present({ message: err.response?.data?.message || 'Failed to update document.', duration: 3000, position: 'top', color: 'danger' }); }
        finally { setUpdatingDocId(null); }
    };

    const handleReUpload = async (file: File, customName: string, docId: string) => {
        if (!file) return;
        setUpdatingDocId(docId);
        try {
            const ext = file.name.split('.').pop();
            const safeName = `${(customName || 'Document').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${ext}`;
            const studentName = `${app.studentProfile.firstName}_${app.studentProfile.lastName}`;
            const { data } = await api.get(`/api/admissions/upload-url?fileName=${encodeURIComponent(safeName)}&fileType=${encodeURIComponent(file.type)}&studentName=${encodeURIComponent(studentName)}&applicationId=${safeId}`);
            await axios.put(data.data.uploadUrl, file, { headers: { 'Content-Type': file.type } });
            await updateDocStatus(docId, 'SUBMITTED', data.data.fileKey);
            present({ message: 'Document uploaded! Ready for verification.', duration: 3000, position: 'top', color: 'success' });
        } catch (err) { present({ message: 'Upload failed. Check S3 CORS config.', duration: 3000, position: 'top', color: 'danger' }); setUpdatingDocId(null); }
    };
    const updateAppStatus = async (nextStatus: string, remarks: string) => {
        try {
            setIsProcessing(true);
            const payload = { status: nextStatus, remarks };
            const res = await api.patch(`/api/admissions/applications/${safeId}/status`, payload);
            if (res.data.success) {
                dispatch(updateApplicationStatus({ id: safeId, status: nextStatus }));
                present({ message: `Status updated to ${nextStatus.replace('_', ' ')}`, duration: 2500, position: 'top', color: 'success' });
                await fetchData();
            }
        } catch (err: any) {
            present({ message: err.response?.data?.message || 'Failed to progress pipeline.', duration: 3000, position: 'top', color: 'danger' });
        } finally {
            setIsProcessing(false);
            setConfirmModal(null);
        }
    };
    const enrollStudent = async (remarks: string) => {
        setIsProcessing(true);
        try {
            const res = await api.post(`/api/admissions/applications/${safeId}/enroll`, { remarks });
            setApp(res.data.data);
            dispatch(updateApplicationStatus({ id: safeId, status: 'ENROLLED' }));
            present({ message: `Enrolled successfully! Student ID: ${res.data.data.enrollmentNumber}`, duration: 5000, color: 'success' });
        } catch (err: any) { present({ message: err.response?.data?.message || 'Enrollment failed.', duration: 3000, color: 'danger' }); }
        finally { setIsProcessing(false); setConfirmModal(null); }
    };

    // ==========================================
    // ASSESSMENT MARKS UPLOAD (OFFLINE TEST)
    // ==========================================
    const handleAssessmentUpload = async () => {
        if (marksInput === '' || isNaN(Number(marksInput))) {
            present({ message: 'Please enter valid numeric marks.', duration: 3000, color: 'danger' });
            return;
        }
        
        setIsProcessing(true);
        try {
            // Update the admissionTest marks field in the application
            await api.patch(`/api/admissions/applications/${safeId}`, {
                admissionTest: {
                    ...(app.admissionTest || {}),
                    score: Number(marksInput),
                    status: 'COMPLETED',
                    date: new Date().toISOString()
                }
            });
            
            // Re-fetch application to get updated state
            const res = await api.get(`/api/admissions/applications/${safeId}`);
            setApp(res.data.data);
            
            present({ message: 'Assessment marks updated successfully!', duration: 3000, color: 'success' });
        } catch (err: any) {
            present({ message: err.response?.data?.message || 'Failed to update marks.', duration: 3000, color: 'danger' });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return <AdminLayout pageTitle="Application Details" breadcrumbs={[]}><div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={32} /></div></AdminLayout>;
    if (!app) return <AdminLayout pageTitle="Error" breadcrumbs={[]}><div className="p-10 text-center text-rose-500 font-bold bg-rose-50 rounded-2xl">Application not found.</div></AdminLayout>;
    return (
        <AdminLayout pageTitle={`Application: ${app.applicationNumber}`} breadcrumbs={[{ label: 'Applications', path: '/admin/admissions/applications' }, { label: 'Review' }]}>

            {/*  PREMIUM DOC VIEWER WITH CORS HANDLING */}
            {viewingDoc && (
                <div
                    className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-300"
                    onClick={() => setViewingDoc(null)}
                >
                    <div
                        className="bg-white w-full max-w-6xl h-[92vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative border border-slate-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">

                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                                    <ShieldCheck size={20} className="text-blue-600" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-black text-slate-800 text-sm md:text-base truncate">
                                        Secure Viewer
                                    </h3>

                                    <p className="text-xs text-slate-500 truncate">
                                        {viewingDoc.name}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setViewingDoc(null)}
                                className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-200 hover:bg-rose-100 hover:text-rose-600 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="flex-1 bg-slate-950 relative overflow-hidden">

                            {/* WATERMARK */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                                <div className="rotate-[-30deg] text-white/10 text-4xl md:text-7xl font-black tracking-widest select-none">
                                    CONFIDENTIAL
                                </div>
                            </div>

                            {/* IMAGE VIEWER */}
                            {viewingDoc?.name.match(/\.(jpg|jpeg|png|webp)$/i) && (
                                <TransformWrapper
                                    initialScale={1}
                                    minScale={1}
                                    maxScale={8}
                                    centerOnInit
                                    doubleClick={{
                                        mode: "zoomIn"
                                    }}
                                    pinch={{
                                        step: 5
                                    }}
                                    wheel={{
                                        step: 0.2
                                    }}
                                >
                                    {({ zoomIn, zoomOut, resetTransform }) => (
                                        <>
                                            {/* TOOLBAR */}
                                            <div className="absolute top-4 right-4 z-20 flex gap-2">
                                                <button
                                                    onClick={() => zoomIn()}
                                                    className="w-10 h-10 rounded-xl bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70"
                                                >
                                                    +
                                                </button>

                                                <button
                                                    onClick={() => zoomOut()}
                                                    className="w-10 h-10 rounded-xl bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70"
                                                >
                                                    −
                                                </button>

                                                <button
                                                    onClick={() => resetTransform()}
                                                    className="px-3 rounded-xl bg-black/50 backdrop-blur text-white text-sm font-bold hover:bg-black/70"
                                                >
                                                    Reset
                                                </button>
                                            </div>

                                            <TransformComponent
                                                wrapperClass="!w-full !h-full"
                                                contentClass="flex items-center justify-center w-full h-full"
                                            >
                                                <img
                                                    src={viewingDoc.url}
                                                    alt={viewingDoc.name}
                                                    draggable={false}
                                                    onContextMenu={(e) => e.preventDefault()}
                                                    className="max-w-full max-h-full object-contain select-none"
                                                />
                                            </TransformComponent>
                                        </>
                                    )}
                                </TransformWrapper>
                            )}

                            {/* PDF VIEWER */}
                            {viewingDoc?.name.match(/\.pdf$/i) && (
                                <div className="w-full h-full overflow-auto flex justify-center bg-slate-800 p-4">

                                    <Document
                                        file={viewingDoc.url}
                                        onLoadSuccess={({ numPages }) => setPdfPages(numPages)}
                                        loading={
                                            <div className="text-white font-bold">
                                                Loading PDF...
                                            </div>
                                        }
                                        error={
                                            <div className="text-rose-400 font-bold">
                                                Failed to load PDF
                                            </div>
                                        }
                                    >
                                        {Array.from(
                                            new Array(pdfPages),
                                            (_, index) => (
                                                <Page
                                                    key={`page_${index + 1}`}
                                                    pageNumber={index + 1}
                                                    renderTextLayer={false}
                                                    renderAnnotationLayer={false}
                                                    className="mb-4 shadow-2xl"
                                                />
                                            )
                                        )}
                                    </Document>
                                </div>
                            )}
                            {/* FALLBACK */}
                            {!viewingDoc?.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i) && (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <AlertCircle
                                        size={44}
                                        className="text-amber-500 mb-4"
                                    />
                                    <p className="text-base font-black text-white mb-2">
                                        Preview Not Available
                                    </p>

                                    <p className="text-sm text-slate-400 mb-6">
                                        This file type cannot be previewed securely.
                                    </p>

                                    <a
                                        href={viewingDoc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 transition-all text-white rounded-2xl font-black text-sm"
                                    >
                                        Download File
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
                <div className="lg:col-span-2 space-y-6">
                    {/* CORE IDENTITY */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="w-full h-32 relative bg-slate-800">
                            <img src="https://media.istockphoto.com/id/2231268942/photo/portrait-of-smiling-multi-cultural-elementary-school-pupils-sitting-on-wall-outdoors-at-school.jpg?s=1024x1024&w=is&k=20&c=woF0iqmGGDd_2mpou1cxlOm0TP26hHzZfgNKa3AB4Mc=" className="w-full h-full object-cover opacity-60" alt="Banner" />
                        </div>
                        <div className="p-6 md:p-8 pt-0 relative">
                            {/* Fixed Congested Layout: Stacked on mobile, side-by-side on desktop */}
                            <div className="flex flex-col md:flex-row gap-4 items-center md:items-end -mt-12 border-b border-slate-100 pb-6 mb-6">
                                {/*  3. Use the secure presigned URL state */}
                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white bg-slate-100 shadow-xl flex items-center justify-center overflow-hidden z-10">
                                    {profilePhotoUrl ? (
                                        <img src={profilePhotoUrl} className="w-full h-full object-cover" alt="Profile" />
                                    ) : (
                                        <span className="text-3xl md:text-4xl font-black text-slate-300">{app.studentProfile?.firstName?.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1 text-center md:text-left pb-2 mt-2 md:mt-0">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase mb-2 inline-block">App No: {app.applicationNumber}</span>
                                    <h2 className="text-2xl font-black text-slate-800">{app.studentProfile?.firstName} {app.studentProfile?.lastName}</h2>
                                    <p className="text-sm font-bold text-slate-500 mt-1"><GraduationCap size={16} className="inline mr-1" /> Target: {app.appliedGradeId?.name}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-bold text-slate-700 text-center md:text-left mt-6">
                                <div><p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Gender</p><p className="capitalize">{app.studentProfile?.gender}</p></div>
                                <div><p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">DOB</p><p>{new Date(app.studentProfile?.dob).toLocaleDateString()}</p></div>
                                <div><p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Nationality</p><p>{app.studentProfile?.nationality || 'N/A'}</p></div>
                                <div><p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Religion</p><p>{app.studentProfile?.religion || 'N/A'}</p></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-bold text-slate-700 text-center md:text-left mt-6">
                                <div><p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Category</p><p>{app.studentProfile?.category || 'GENERAL'}</p></div>
                                <div><p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Blood Group</p><p className="text-rose-600">{app.studentProfile?.bloodGroup || 'N/A'}</p></div>
                                <div className="col-span-2"><p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Aadhaar / Govt ID</p><p>{app.studentProfile?.aadhaarEncrypted || 'N/A'}</p></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-bold text-slate-700 text-center md:text-left mt-6">

                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                                    Status
                                </p>

                                <p className="text-emerald-600">
                                    {app.status}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                                    Admission Source
                                </p>

                                <p>
                                    {String(app.admissionSource || 'N/A')
                                        .replace('_', ' ')
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                                    Approved At
                                </p>

                                <p>
                                    {app.lifecycle?.approvedAt
                                        ? new Date(
                                            app.lifecycle.approvedAt
                                        ).toLocaleDateString()
                                        : 'N/A'
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                                    Enrolled At
                                </p>

                                <p>
                                    {
                                        app.lifecycle?.enrolledAt
                                            ? new Date(
                                                app.lifecycle.enrolledAt
                                            ).toLocaleDateString()
                                            : 'N/A'
                                    }
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* PARENTS/GUARDIANS */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-3"><Users size={16} className="text-purple-500" /> Guardian Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {app.guardians?.map((g: any, i: number) => {
                                const parent = g.guardianId || {};
                                return (
                                    <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative hover:border-purple-200 transition-colors">
                                        {g.isPrimaryContact && <span className="absolute top-4 right-4 px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-black rounded uppercase shadow-sm">Primary</span>}
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{g.relation}</p>
                                        <p className="text-base font-black text-slate-800">{parent.fullName || 'N/A'}</p>
                                        <div className="mt-3 space-y-1.5">
                                            <p className="text-xs font-bold text-slate-600 flex items-center gap-2">📞 +91 {parent.mobile || 'N/A'}</p>
                                            {parent.email && <p className="text-xs font-bold text-slate-600 flex items-center gap-2">✉️ {parent.email}</p>}
                                            {parent.occupation && <p className="text-xs font-bold text-slate-600 flex items-center gap-2">💼 {parent.occupation}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 🟢 MEDICAL INFO BLOCK */}
                    {app.studentProfile?.medicalInfo?.hasDisability && (
                        <div className="mt-8 bg-rose-50 p-6 rounded-3xl border border-rose-100 shadow-sm">
                            <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-rose-100 pb-3"><AlertCircle size={16} /> Medical & Health Profile</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-bold text-slate-700">
                                <div><p className="text-[10px] text-rose-400 uppercase mb-1">Allergies</p><p>{app.studentProfile.medicalInfo.allergies || 'None'}</p></div>
                                <div><p className="text-[10px] text-rose-400 uppercase mb-1">Severity</p><p>{app.studentProfile.medicalInfo.severity}</p></div>
                            </div>
                        </div>
                    )}

                    
                    {/* 🟢 ADDRESS DETAILS BLOCK */}
                    <div className="mt-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-3">
                            <MapPin size={16} className="text-blue-500" />
                            Address Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* CURRENT ADDRESS */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Current Address
                                    </h4>

                                    {app?.address?.isSameAsPermanent && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-wider">
                                            Same as Permanent
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm font-bold text-slate-700">
                                    {app?.address?.current?.addressLine1 || 'N/A'}
                                </p>

                                <p className="text-xs font-bold text-slate-500 mt-1">
                                    {app?.address?.current?.city || 'N/A'},
                                    {' '}
                                    {app?.address?.current?.district || 'N/A'}
                                </p>

                                <p className="text-xs font-bold text-slate-500">
                                    {app?.address?.current?.state || 'N/A'}
                                    {' '} - Pincode:
                                    {' '}
                                    {app?.address?.current?.pincode || 'N/A'}
                                </p>
                            </div>

                            {/* ONLY SHOW IF DIFFERENT */}
                            {!app?.address?.isSameAsPermanent && (
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                        Permanent Address
                                    </h4>

                                    <p className="text-sm font-bold text-slate-700">
                                        {app?.address?.permanent?.addressLine1 || 'N/A'}
                                    </p>

                                    <p className="text-xs font-bold text-slate-500 mt-1">
                                        {app?.address?.permanent?.city || 'N/A'},
                                        {' '}
                                        {app?.address?.permanent?.district || 'N/A'}
                                    </p>

                                    <p className="text-xs font-bold text-slate-500">
                                        {app?.address?.permanent?.state || 'N/A'}
                                        {' '} - Pincode:
                                        {' '}
                                        {app?.address?.permanent?.pincode || 'N/A'}
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* 🟢 ACADEMIC HISTORY BLOCK (Only shows if transfer admission) */}
                    {app.academicHistory && (
                        <div className="mt-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b pb-3"><GraduationCap size={16} className="text-orange-500" /> Previous Academic History</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-bold text-slate-700">
                                <div className="col-span-2"><p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">School Name</p><p>{app.academicHistory.schoolName}</p></div>
                                <div><p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Board</p><p>{app.academicHistory.board || 'N/A'}</p></div>
                                <div><p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Previous Class</p><p>{app.academicHistory.previousClass || 'N/A'}</p></div>

                                {/* School Address & Hostel */}
                                <div className="col-span-2 md:col-span-3"><p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">School Address</p><p>{app.academicHistory.schoolAddress?.city}, {app.academicHistory.schoolAddress?.district}, {app.academicHistory.schoolAddress?.state}</p></div>
                                <div><p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Hostel Requirement</p><p className="uppercase text-blue-600">{String(app.academicHistory.hostelStatus || 'DAY_SCHOLAR').replace('_', ' ')}</p></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/*  DOCUMENT VAULT WITH VERSIONING */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b pb-3"><FileCheck size={16} className="text-blue-600" /> Document Vault</h3>

                        <div className="space-y-4">
                            {app.documents?.map((doc: any) => {
                                const docName = doc.displayName || (doc.documentType ? String(doc.documentType).replace(/_/g, ' ') : 'Custom Document');
                                const needsUpload = ['PENDING', 'REJECTED', 'REUPLOAD_REQUIRED'].includes(doc.status);

                                return (
                                    <div key={doc._id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800">{docName}</span>
                                                {doc.documentNumber && <span className="text-[10px] text-slate-500 font-bold mb-1">Doc No: {doc.documentNumber}</span>}
                                                <span className={`text-[10px] font-black uppercase mt-1 px-2 py-0.5 rounded w-max ${doc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : needsUpload ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {doc.status}
                                                </span>
                                            </div>
                                            {doc.fileKey && (
                                                <button onClick={() => handleViewDoc(doc.fileKey, docName)} disabled={updatingDocId === doc._id} className="p-2 bg-white border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-50 text-xs shadow-sm flex gap-1 items-center">
                                                    <Eye size={14} /> View
                                                </button>
                                            )}
                                        </div>

                                        <div className="mt-2">
                                            {!needsUpload && (
                                                <button onClick={() => setActiveDropzoneId(activeDropzoneId === doc._id ? null : doc._id)} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">
                                                    {activeDropzoneId === doc._id ? 'Cancel Update' : 'Update / Replace File'}
                                                </button>
                                            )}
                                        </div>

                                        {(needsUpload || activeDropzoneId === doc._id) && (
                                            <ReuploadDropzone
                                                onUpload={(file, customName) => {
                                                    handleReUpload(file, customName, doc._id);
                                                    setActiveDropzoneId(null);
                                                }}
                                                isUploading={updatingDocId === doc._id}
                                            />
                                        )}

                                        {/*  VERIFICATION CONTROLS (Shows when doc is SUBMITTED) */}
                                        {doc.fileKey && doc.status === 'SUBMITTED' && (
                                            <div className="flex items-center gap-2 mt-2 pt-3 border-t border-slate-200">
                                                <button onClick={() => updateDocStatus(doc._id, 'VERIFIED')} disabled={updatingDocId === doc._id} className="flex-1 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all flex justify-center gap-1"><Check size={14} /> Approve</button>
                                                <button onClick={() => updateDocStatus(doc._id, 'REJECTED')} disabled={updatingDocId === doc._id} className="flex-1 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-[10px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all flex justify-center gap-1"><XCircle size={14} /> Reject</button>
                                            </div>
                                        )}

                                        {/*  VERSION HISTORY UI */}
                                        {doc.versions && doc.versions.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-200">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><History size={12} /> Version History</p>
                                                <div className="space-y-2">
                                                    {doc.versions.map((v: any, vIdx: number) => (
                                                        <div key={vIdx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                                                            <span className="text-[10px] font-bold text-slate-500">v{vIdx + 1} - {new Date(v.uploadedAt).toLocaleDateString()}</span>
                                                            <button onClick={() => handleViewDoc(v.fileKey, `${docName} (v${vIdx + 1})`)} className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-[10px] font-black hover:bg-slate-200 transition-all">
                                                                View
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ==========================================
                       FULL WORKFLOW ENGINE WITH SMART TRACKER
                       ========================================== */}
                    <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-slate-700 pb-3"><GraduationCap size={16} className="text-emerald-400" /> Pipeline Engine</h3>

                        {/* CURRENT STATUS INDICATOR */}
                        {(() => {
                            const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
                                'SUBMITTED': { label: 'Submitted — Awaiting Review', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Clock },
                                'UNDER_REVIEW': { label: 'Under Review — Admin Evaluating', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20', icon: Eye },
                                'DOCUMENT_PENDING': { label: 'Document Pending — Action Required', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: AlertCircle },
                                'APPROVED': { label: 'Approved — Ready for Enrollment', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
                                'WAITLISTED': { label: 'Waitlisted — No Seats Available', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: Clock },
                                'ENROLLED': { label: 'Enrolled — Student Active', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: CheckCircle },
                                'REJECTED': { label: 'Rejected — Application Denied', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: XCircle },
                                'CANCELLED': { label: 'Cancelled — Application Withdrawn', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', icon: Ban },
                            };
                            const cfg = statusConfig[app.status] || statusConfig['SUBMITTED'];
                            const Icon = cfg.icon;
                            return (
                                <div className={`p-4 rounded-2xl border ${cfg.bg} mb-6 flex items-center gap-3`}>
                                    <Icon size={20} className={cfg.color} />
                                    <span className={`text-sm font-black ${cfg.color}`}>{cfg.label}</span>
                                </div>
                            );
                        })()}

                        {/* VISUAL PIPELINE TRACKER */}
                        <div className="flex justify-between items-center mb-8 relative">
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-700 -translate-y-1/2 z-0"></div>
                            {(() => {
                                const mainPipeline = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'ENROLLED'];
                                const terminalStates = ['REJECTED', 'CANCELLED'];
                                const isTerminal = terminalStates.includes(app.status);
                                const branchStates = ['DOCUMENT_PENDING', 'WAITLISTED'];
                                const isBranch = branchStates.includes(app.status);
                                const effectiveIndex = isTerminal
                                    ? mainPipeline.indexOf('UNDER_REVIEW')
                                    : isBranch
                                        ? (app.status === 'WAITLISTED' ? mainPipeline.indexOf('APPROVED') : mainPipeline.indexOf('UNDER_REVIEW'))
                                        : mainPipeline.indexOf(app.status);

                                return mainPipeline.map((stage, idx) => {
                                    const isPast = idx < effectiveIndex;
                                    const isCurrent = idx === effectiveIndex && !isTerminal && !isBranch;
                                    const isActive = isPast || isCurrent;
                                    return (
                                        <div key={stage} className="relative z-10 flex flex-col items-center gap-2 bg-slate-900 px-2">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-4 border-slate-900 transition-all ${isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-500/30' : isPast ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
                                                {isPast ? <Check size={12} /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${isCurrent ? 'text-blue-400' : isPast ? 'text-emerald-400' : 'text-slate-500'}`}>{stage.replace('_', ' ')}</span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>

                        {/* BRANCH / TERMINAL INDICATOR CHIPS */}
                        {['DOCUMENT_PENDING', 'WAITLISTED', 'REJECTED', 'CANCELLED'].includes(app.status) && (
                            <div className="flex gap-2 mb-6 flex-wrap">
                                {app.status === 'DOCUMENT_PENDING' && <span className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5"><AlertCircle size={12} /> Branched: Document Re-upload Required</span>}
                                {app.status === 'WAITLISTED' && <span className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5"><Clock size={12} /> Branched: Waiting for Seat</span>}
                                {app.status === 'REJECTED' && <span className="px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5"><XCircle size={12} /> Terminal: Rejected</span>}
                                {app.status === 'CANCELLED' && <span className="px-3 py-1.5 bg-slate-500/20 text-slate-400 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5"><Ban size={12} /> Terminal: Cancelled</span>}
                            </div>
                        )}

                        {/* ==========================================
                           ACTION BUTTONS (Status-Contextual)
                           ========================================== */}
                        <div className="flex flex-col gap-3">

                            {/* ✅ ENROLLED — FINAL DESTINATION */}
                            {app.status === 'ENROLLED' && (
                                <div className="text-center py-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                    <CheckCircle className="mx-auto text-emerald-400 mb-3" size={32} />
                                    <p className="text-sm font-black uppercase text-emerald-400">Student Enrolled Successfully</p>
                                    {app.lifecycle?.enrolledAt && <p className="text-[10px] text-slate-500 font-bold mt-2">Enrolled on {new Date(app.lifecycle.enrolledAt).toLocaleDateString()}</p>}
                                </div>
                            )}

                            {/* ❌ REJECTED / CANCELLED — TERMINAL */}
                            {['REJECTED', 'CANCELLED'].includes(app.status) && (
                                <div className={`text-center py-6 ${app.status === 'REJECTED' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-slate-500/10 border-slate-500/20'} border rounded-2xl`}>
                                    {app.status === 'REJECTED' ? <XCircle className="mx-auto text-rose-400 mb-3" size={32} /> : <Ban className="mx-auto text-slate-400 mb-3" size={32} />}
                                    <p className={`text-sm font-black uppercase ${app.status === 'REJECTED' ? 'text-rose-400' : 'text-slate-400'}`}>Application {app.status.toLowerCase()}</p>
                                    {app.lifecycle?.remarks && <p className="text-[10px] text-slate-500 font-bold mt-2 px-4">Reason: {app.lifecycle.remarks}</p>}
                                </div>
                            )}

                            {/* 📝 SUBMITTED — Begin Review or Reject */}
                            {app.status === 'SUBMITTED' && (
                                <>
                                    <button onClick={() => updateAppStatus('UNDER_REVIEW', 'Application moved to Under Review.')} disabled={isProcessing} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all">
                                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />} Begin Review
                                    </button>
                                    <button onClick={() => setConfirmModal({ title: 'Reject Application', description: 'This will permanently reject this application. The applicant will be notified.', confirmLabel: 'Reject', confirmColor: 'bg-rose-600 hover:bg-rose-500', action: (remarks) => updateAppStatus('REJECTED', remarks || 'Application rejected at submission stage.') })} className="w-full py-3 bg-transparent border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all">
                                        <XCircle size={14} /> Reject Application
                                    </button>
                                </>
                            )}

                            {/* 🔍 UNDER REVIEW — Approve, Request Docs, or Reject */}
                            {app.status === 'UNDER_REVIEW' && (
                                <>
                                    <button
                                        onClick={() => setConfirmModal({
                                            title: 'Approve Application',
                                            description: allDocsVerified ? 'All documents have been verified. Application will be approved and student can be enrolled.' : 'Some documents are not yet verified. The application will still be approved.',
                                            confirmLabel: 'Approve',
                                            confirmColor: 'bg-emerald-600 hover:bg-emerald-500',
                                            action: (remarks) => updateAppStatus('APPROVED', remarks || (allDocsVerified ? 'All documents verified.' : 'Approved with pending verification.'))
                                        })}
                                        disabled={isProcessing}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all"
                                    >
                                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Approve Application
                                    </button>

                                    {!allDocsVerified && (
                                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[10px] font-bold flex items-start gap-2">
                                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                            <span>Some documents are pending verification. You can still approve or request re-uploads.</span>
                                        </div>
                                    )}

                                    <button onClick={() => updateAppStatus('DOCUMENT_PENDING', 'Documents require re-upload from parent.')} disabled={isProcessing} className="w-full py-3 bg-amber-600/20 border border-amber-500/30 text-amber-400 hover:bg-amber-600/30 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all">
                                        <AlertCircle size={14} /> Request Document Re-upload
                                    </button>

                                    <button onClick={() => setConfirmModal({ title: 'Reject Application', description: 'This will permanently reject this application after review.', confirmLabel: 'Reject', confirmColor: 'bg-rose-600 hover:bg-rose-500', action: (remarks) => updateAppStatus('REJECTED', remarks || 'Application rejected after review.') })} className="w-full py-3 bg-transparent border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all">
                                        <XCircle size={14} /> Reject Application
                                    </button>
                                </>
                            )}

                            {/* ⚠️ DOCUMENT PENDING — Resume Review or Cancel (FIXES THE DEAD END!) */}
                            {app.status === 'DOCUMENT_PENDING' && (
                                <>
                                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-xs font-bold flex items-start gap-2 mb-1">
                                        <Clock size={14} className="shrink-0 mt-0.5" />
                                        <span>Waiting for parent/guardian to re-upload required documents. Once uploaded, you can resume the review.</span>
                                    </div>
                                    <button onClick={() => updateAppStatus('UNDER_REVIEW', 'Documents re-submitted. Resuming review.')} disabled={isProcessing} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all">
                                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />} Resume Review
                                    </button>
                                    <button onClick={() => setConfirmModal({ title: 'Cancel Application', description: 'This will permanently cancel this application. Use this if the applicant is unresponsive.', confirmLabel: 'Cancel Application', confirmColor: 'bg-slate-600 hover:bg-slate-500', action: (remarks) => updateAppStatus('CANCELLED', remarks || 'Application cancelled due to missing documents.') })} className="w-full py-3 bg-transparent border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all">
                                        <Ban size={14} /> Cancel Application
                                    </button>
                                </>
                            )}

                            {/* ✅ APPROVED — Enroll */}
                            {app.status === 'APPROVED' && (
                                <button onClick={() => setConfirmModal({ title: 'Enroll Student', description: 'This will officially enroll the student, consume a seat, and generate a permanent Student ID. This action cannot be undone.', confirmLabel: 'Enroll Now', confirmColor: 'bg-emerald-600 hover:bg-emerald-500', action: (remarks) => enrollStudent(remarks) })} disabled={isProcessing} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all">
                                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Enroll Student
                                </button>
                            )}

                            {/* 🕐 WAITLISTED — Approve or Reject */}
                            {app.status === 'WAITLISTED' && (
                                <>
                                    <button onClick={() => setConfirmModal({ title: 'Approve from Waitlist', description: 'A seat is now available. Move this application to Approved status.', confirmLabel: 'Approve', confirmColor: 'bg-emerald-600 hover:bg-emerald-500', action: (remarks) => updateAppStatus('APPROVED', remarks || 'Moved from waitlist — seat available.') })} disabled={isProcessing} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all">
                                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Approve (Seat Available)
                                    </button>
                                    <button onClick={() => setConfirmModal({ title: 'Reject Application', description: 'Reject this waitlisted application permanently.', confirmLabel: 'Reject', confirmColor: 'bg-rose-600 hover:bg-rose-500', action: (remarks) => updateAppStatus('REJECTED', remarks || 'Rejected from waitlist.') })} className="w-full py-3 bg-transparent border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all">
                                        <XCircle size={14} /> Reject Application
                                    </button>
                                </>
                            )}
                        </div>

                        {/* ==========================================
                           ASSESSMENT MARKS UPLOAD (OFFLINE TEST)
                           ========================================== */}
                        {['UNDER_REVIEW', 'APPROVED'].includes(app.status) && (
                            <div className="mt-8 pt-6 border-t border-slate-700">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <CheckSquare size={14} className="text-blue-400" /> Offline Assessment Marks
                                </h4>
                                
                                {app.admissionTest?.status === 'COMPLETED' ? (
                                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400">Test Score Logged</p>
                                            <p className="text-lg font-black text-blue-400">{app.admissionTest.score} <span className="text-[10px] text-slate-500 uppercase tracking-widest">Marks</span></p>
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number" 
                                                placeholder="Update" 
                                                value={marksInput}
                                                onChange={(e) => setMarksInput(e.target.value)}
                                                className="w-20 p-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold text-white outline-none focus:border-blue-500"
                                            />
                                            <button 
                                                onClick={handleAssessmentUpload}
                                                disabled={isProcessing || !marksInput.trim()}
                                                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-black transition-colors disabled:opacity-50"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                        <p className="text-[10px] font-bold text-blue-300 mb-3 leading-relaxed">If an offline test was conducted, enter the marks here before enrolling.</p>
                                        <div className="flex gap-3">
                                            <input 
                                                type="number" 
                                                placeholder="Enter Score" 
                                                value={marksInput}
                                                onChange={(e) => setMarksInput(e.target.value)}
                                                className="flex-1 p-3 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold text-white outline-none focus:border-blue-500"
                                            />
                                            <button 
                                                onClick={handleAssessmentUpload}
                                                disabled={isProcessing || !marksInput.trim()}
                                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-black shadow-lg transition-colors disabled:opacity-50"
                                            >
                                                Upload Marks
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* CONFIRMATION MODAL */}
            {confirmModal && (
                <ConfirmationModal
                    title={confirmModal.title}
                    description={confirmModal.description}
                    confirmLabel={confirmModal.confirmLabel}
                    confirmColor={confirmModal.confirmColor}
                    isProcessing={isProcessing}
                    onConfirm={confirmModal.action}
                    onCancel={() => setConfirmModal(null)}
                />
            )}
        </AdminLayout>
    );
};

export default ApplicationDetail;