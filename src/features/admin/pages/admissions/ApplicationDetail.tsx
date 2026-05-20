import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import {
    Users, ShieldCheck, GraduationCap, Loader2, AlertCircle,
    FileCheck, CheckCircle, X, UploadCloud, Check, XCircle, ArrowRight, Eye, History,
    Clock,
    MapPin
} from 'lucide-react';
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

//  DROPZONE FOR RE-UPLOADS
const ReuploadDropzone = ({ onDrop, isUploading }: { onDrop: (files: File[]) => void, isUploading: boolean }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });
    return (
        <div {...getRootProps()} className={`p-4 mt-3 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
            <input {...getInputProps()} />
            {isUploading ? <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} /> : <UploadCloud className="mx-auto text-slate-400 mb-2" size={24} />}
            <span className="text-xs font-bold text-slate-500">{isUploading ? 'Uploading to Vault...' : 'Drag & Drop missing document here'}</span>
        </div>
    );
};

const ApplicationDetail: React.FC = () => {
    const params = useParams<any>();
    const safeId = params.id || params.applicationId || Object.values(params)[0];
    const history = useHistory();
    const [activeDropzoneId, setActiveDropzoneId] = useState<string | null>(null);
    const [app, setApp] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null); const [viewingDoc, setViewingDoc] = useState<{ url: string, name: string } | null>(null);
    const [updatingDocId, setUpdatingDocId] = useState<string | null>(null);
    const [pdfPages, setPdfPages] = useState(0);
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
        } catch (err: any) { alert(err.response?.data?.message || "Failed to update document."); }
        finally { setUpdatingDocId(null); }
    };

    const handleReUpload = async (acceptedFiles: File[], docId: string, docName: string) => {
        const file = acceptedFiles[0];
        if (!file) return;
        setUpdatingDocId(docId);
        try {
            const ext = file.name.split('.').pop();
            const safeName = `${(docName || 'Document').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${ext}`;
            const studentName = `${app.studentProfile.firstName}_${app.studentProfile.lastName}`;
            const { data } = await api.get(`/api/admissions/upload-url?fileName=${encodeURIComponent(safeName)}&fileType=${encodeURIComponent(file.type)}&studentName=${encodeURIComponent(studentName)}&applicationId=${safeId}`);
            await axios.put(data.data.uploadUrl, file, { headers: { 'Content-Type': file.type } });
            await updateDocStatus(docId, 'SUBMITTED', data.data.fileKey);
            alert("Document uploaded! Ready for verification.");
        } catch (err) { alert("Upload failed. Ensure S3 CORS is enabled."); setUpdatingDocId(null); }
    };
    const updateAppStatus = async (nextStatus: string, remarks: string) => {
        try {
            setIsProcessing(true);
            const payload = { status: nextStatus, remarks };
            const res = await api.patch(`/api/admissions/applications/${safeId}/status`, payload);
            if (res.data.success) {
                await fetchData(); // RELOAD FROM BACKEND
            }
        } catch (err: any) { alert(err.response?.data?.message || "Failed to progress pipeline."); }
        finally { setIsProcessing(false); }
    };
    const enrollStudent = async () => {
        if (!window.confirm("Are you sure you want to officially enroll this student? This will consume a seat and generate a permanent Student ID.")) return;
        try {
            setIsProcessing(true);
            const res = await api.post(`/api/admissions/applications/${safeId}/enroll`);
            if (res.data.success) {
                alert(`Success! Student Enrolled. Enrollment Number: ${res.data.data.enrollmentNumber}`);
                fetchData(); // Data refresh karne ke liye
            }
        } catch (error: any) {
            console.error("Enrollment failed:", error);
            alert(error.response?.data?.message || "Failed to enroll student.");
        } finally {
            setIsProcessing(false);
        }
    };
    if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
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
                                                onDrop={(files) => {
                                                    handleReUpload(files, doc._id, docName);
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

                    {/* DYNAMIC PIPELINE ENGINE WITH VISUAL TRACKER */}
                    <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-700 pb-3"><GraduationCap size={16} className="text-emerald-400" /> Pipeline Action</h3>

                        {/* Visual Stage Tracker */}
                        <div className="flex justify-between items-center mb-8 relative">
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-700 -translate-y-1/2 z-0"></div>
                            {['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'ENROLLED'].map((stage, idx) => {
                                const stages = [
                                    'SUBMITTED',
                                    'UNDER_REVIEW',
                                    'APPROVED',
                                    'ENROLLED'
                                ];

                                const stageIndex =
                                    stages.indexOf(app.status); const isActive = stageIndex >= idx;
                                return (
                                    <div key={stage} className="relative z-10 flex flex-col items-center gap-2 bg-slate-900 px-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-4 border-slate-900 ${isActive ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
                                            {isActive ? <Check size={12} className="font-black" /> : <span className="text-[10px]">{idx + 1}</span>}
                                        </div>
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>{String(stage).replace('_', ' ')}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* STATE 5: FINAL DESTINATION */}
                            {app.status === 'ENROLLED' && (
                                <div className="text-center py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <CheckCircle className="mx-auto text-emerald-400 mb-2" size={24} />
                                    <p className="text-xs font-black uppercase text-emerald-400">Student Enrolled Successfully</p>
                                </div>
                            )}

                            {/* STATE 4: READY FOR ENROLLMENT */}
                            {app.status === 'APPROVED' && (
                                <button onClick={enrollStudent} disabled={isProcessing} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all">
                                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Enroll Student
                                </button>
                            )}

                            {/* STATE 2 & 3: UNDER REVIEW (Checking Documents) */}
                            {app.status === 'UNDER_REVIEW' && (
                                <>
                                    <button
                                        onClick={() =>
                                            updateAppStatus(
                                                'APPROVED',
                                                allDocsVerified
                                                    ? 'All documents verified.'
                                                    : 'Approved with pending document verification.'
                                            )
                                        }
                                        disabled={isProcessing}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all"
                                    >
                                        {isProcessing
                                            ? <Loader2 size={16} className="animate-spin" />
                                            : <ArrowRight size={16} />
                                        }

                                        Approve Application
                                    </button>

                                    {!allDocsVerified && (
                                        <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[10px] font-bold flex items-start gap-2">
                                            <AlertCircle size={14} className="shrink-0 mt-0.5" />

                                            <span>
                                                Application is being approved with pending document verification.
                                            </span>
                                        </div>
                                    )}

                                    {anyDocRejected && (
                                        <button
                                            onClick={() =>
                                                updateAppStatus(
                                                    'DOCUMENT_PENDING',
                                                    'Documents rejected, waiting for re-upload.'
                                                )
                                            }
                                            disabled={isProcessing}
                                            className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all"
                                        >
                                            {isProcessing
                                                ? <Loader2 size={16} className="animate-spin" />
                                                : <ArrowRight size={16} />
                                            }

                                            Move to Document Pending
                                        </button>
                                    )}
                                </>
                            )}

                            {/* STATE 1: NEW APPLICATION */}
                            {app.status === 'SUBMITTED' && (
                                <button onClick={() => updateAppStatus('UNDER_REVIEW', 'Application moved to Under Review phase.')} disabled={isProcessing} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-all">
                                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />} Move to Under Review
                                </button>
                            )}

                            {/* STATE: WAITING FOR PARENT */}
                            {app.status === 'DOCUMENT_PENDING' && (
                                <div className="w-full py-4 bg-amber-50 text-amber-600 rounded-xl font-black text-sm text-center border border-amber-200 flex justify-center items-center gap-2">
                                    <Clock size={16} /> Awaiting Document Re-upload
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ApplicationDetail;