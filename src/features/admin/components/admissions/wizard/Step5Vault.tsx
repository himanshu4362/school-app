import React, { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { RootState } from '../../../../../store/store';
import { saveDocuments, resetApplication } from '../../../../../store/slices/applicationSlice';
import { ShieldCheck, FileText, AlertCircle, CloudUpload, CheckCircle, Loader2, Check, Plus, Trash2 } from 'lucide-react';
import api from '../../../../../services/api';

const DocumentEntrySchema = z.object({
    documentType: z.string(),
    displayName: z.string().min(2, "Document name is required"),
    isMandatory: z.boolean(),
    status: z.enum(['submitted', 'pending', 'not_applicable']),
    documentNumber: z.string().optional(),
    fileKey: z.string().optional(), 
});

const Step5Schema = z.object({
    documents: z.array(DocumentEntrySchema),
});

type Step5Data = z.infer<typeof Step5Schema>;

const Step5Vault: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const applicationState = useSelector((state: RootState) => state.application);
    const globalYearId = useSelector((state: RootState) => state.systemConfig?.globalCurrentAcademicYearId || state.config?.globalCurrentAcademicYearId || '');
    
    const rawRules = useSelector((state: RootState) => state.config?.documentRules || state.systemConfig?.documentRules);
    const documentRules = Array.isArray(rawRules) && rawRules.length > 0 ? rawRules : [
        { documentType: 'NATIONAL_ID', displayName: 'Student Government ID', isMandatory: true, admissionType: 'all' },
        { documentType: 'BIRTH_CERTIFICATE', displayName: 'Birth Certificate', isMandatory: true, admissionType: 'all' },
        { documentType: 'ADDRESS_PROOF', displayName: 'Address Proof', isMandatory: true, admissionType: 'all' },
        { documentType: 'TRANSFER_CERTIFICATE', displayName: 'Transfer Certificate', isMandatory: true, admissionType: 'transfer' }
    ];

    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const showToast = (type: 'success' | 'error', text: string) => {
        setToastMessage({ type, text });
        setTimeout(() => setToastMessage(null), 4000);
    };

    const { register, control, handleSubmit, reset, setValue, watch } = useForm<Step5Data>({
        resolver: zodResolver(Step5Schema),
        defaultValues: { documents: [] }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "documents" });
    const watchDocs = watch("documents");

    useEffect(() => {
        if (applicationState.documents && applicationState.documents.length > 0) {
            reset({ documents: applicationState.documents as any });
            return;
        }

        const safeRules = Array.isArray(documentRules) ? documentRules : [];
        const applicableRules = safeRules.filter((rule: any) =>
            rule.admissionType === 'all' || rule.admissionType === applicationState.admissionType
        );

        const initialDocs = applicableRules.map((rule: any) => ({
            documentType: rule.documentType,
            displayName: rule.displayName,
            isMandatory: rule.isMandatory,
            status: 'pending' as const,
            documentNumber: '',
            fileKey: ''
        }));

        reset({ documents: initialDocs });
    }, [applicationState.admissionType, applicationState.documents, reset]);

    const handleFileUpload = useCallback(async (acceptedFiles: File[], index: number, docName: string) => {
        const file = acceptedFiles[0];
        if (!file) return;

        try {
            setUploadingIndex(index);
            const { data } = await api.get(`/api/admissions/upload-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`);
            const { uploadUrl, fileKey } = data.data;

            const s3Response = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            if (!s3Response.ok) throw new Error("Failed to upload to AWS S3");

            setValue(`documents.${index}.fileKey`, fileKey, { shouldValidate: true });
            setValue(`documents.${index}.status`, 'submitted', { shouldValidate: true });

            showToast('success', `${docName} uploaded securely to vault.`);
        } catch (error) {
            console.error("Upload error:", error);
            showToast('error', `Failed to upload ${docName}. Please try again.`);
        } finally {
            setUploadingIndex(null);
        }
    }, [setValue]);

    const onSubmit = async (data: Step5Data) => {
        const missingMandatory = data.documents.find(d => d.isMandatory && d.status !== 'submitted' && d.status !== 'not_applicable');
        if (missingMandatory) {
            return showToast('error', `Mandatory Document Missing: Please upload ${missingMandatory.displayName}`);
        }

        if (!globalYearId || !applicationState.selectedClassId) {
            return showToast('error', `System Error: Academic Year or Class ID is missing.`);
        }

        dispatch(saveDocuments(data.documents as any));

        const enterprisePayload = {
            academicYearId: globalYearId,
            appliedGradeId: applicationState.selectedClassId,
            admissionType: applicationState.admissionType || 'fresh',
            admissionSource: 'walk_in', 
            
            studentProfile: {
                firstName: applicationState.studentProfile?.firstName,
                lastName: applicationState.studentProfile?.lastName,
                dob: applicationState.studentProfile?.dob,
                gender: applicationState.studentProfile?.gender,
                bloodGroup: applicationState.studentProfile?.bloodGroup,
                category: "GENERAL",
                hasDisability: applicationState.studentProfile?.hasDisability || false // 🟢 FIXED: Flattened out of medicalInfo object
            },
            
            guardians: applicationState.guardians?.map((g: any, index: number) => ({
                relation: g.relation,
                fullName: g.fullName,
                mobile: g.mobile,
                email: g.email,
                occupation: g.occupation,
                isPrimaryContact: index === 0 
            })),
            
            address: {
                current: applicationState.currentAddress,
                permanent: applicationState.permanentAddress
            },
            
            academicHistory: applicationState.academicHistory,
            
            documents: data.documents.filter(d => d.status === 'submitted' && d.fileKey).map(d => ({
                documentType: d.documentType,
                displayName: d.displayName,
                status: 'SUBMITTED',
                fileKey: d.fileKey
            }))
        };

        try {
            await api.post('/api/admissions/applications', enterprisePayload);
            showToast('success', 'Application Successfully Submitted!');
            setTimeout(() => {
                dispatch(resetApplication());
                history.push('/admin/admissions/applications'); 
            }, 1500);
        } catch (error: any) {
            showToast('error', error.response?.data?.message || "Failed to submit application.");
        }
    };

    return (
        <div className="relative">
            {toastMessage && (
                <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 fade-in duration-300 font-bold text-sm text-white ${toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                    {toastMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {toastMessage.text}
                </div>
            )}

            <form id="step5-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3 flex-1">
                        <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-xs font-bold text-emerald-900 leading-relaxed">
                            Final Verification Step. Please securely upload the required documents to the AWS Vault.
                        </p>
                    </div>
                    
                    <button 
                        type="button" 
                        onClick={() => append({ documentType: 'OTHER', displayName: '', isMandatory: false, status: 'pending', fileKey: '' })}
                        className="px-4 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-50 transition-all flex items-center gap-2 whitespace-nowrap shadow-sm"
                    >
                        <Plus size={16} /> Add Custom Document
                    </button>
                </div>

                <div className="space-y-4">
                    {fields.map((field, index) => {
                        const isUploaded = watchDocs?.[index]?.status === 'submitted' && watchDocs?.[index]?.fileKey;
                        const isWaived = watchDocs?.[index]?.status === 'not_applicable';

                        return (
                            <div key={field.id} className={`p-4 border rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center transition-all relative ${isUploaded ? 'bg-emerald-50/30 border-emerald-200' : 'bg-white border-slate-200'}`}>
                                
                                <div className="flex items-center gap-3 flex-1 w-full">
                                    <div className={`p-3 rounded-xl ${field.isMandatory ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                                        {isUploaded ? <CheckCircle size={20} className="text-emerald-500" /> : <FileText size={20} />}
                                    </div>
                                    <div className="flex-1 w-full">
                                        {field.documentType === 'OTHER' ? (
                                            <input 
                                                {...register(`documents.${index}.displayName`)} 
                                                className="w-full text-sm font-black text-blue-700 bg-transparent border-b border-dashed border-blue-300 focus:border-blue-600 outline-none pb-1 placeholder-blue-300"
                                                placeholder="Enter Document Name (e.g., Medical Certificate)..."
                                                autoFocus
                                            />
                                        ) : (
                                            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                                {field.displayName as string}
                                                {field.isMandatory && <AlertCircle size={12} className="text-rose-500" />}
                                            </h4>
                                        )}
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                                            {field.isMandatory ? 'Required for Admission' : 'Optional Document'}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full md:w-48 hidden lg:block">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Document ID (Optional)</label>
                                    <input type="text" {...register(`documents.${index}.documentNumber`)} className="w-full p-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="e.g. ID Number" />
                                </div>

                                <div className="w-full md:w-64 shrink-0 flex gap-2">
                                    <div className="flex-1">
                                        {isUploaded ? (
                                            <div className="w-full h-[40px] bg-emerald-100 border-2 border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-emerald-700">
                                                <Check size={16} />
                                                <span className="text-xs font-black uppercase tracking-widest">Secured</span>
                                            </div>
                                        ) : isWaived ? (
                                            <div className="w-full h-[40px] bg-slate-100 border-2 border-slate-200 rounded-xl flex items-center justify-center text-slate-500">
                                                <span className="text-xs font-black uppercase tracking-widest">N/A</span>
                                            </div>
                                        ) : (
                                            <div className="w-full h-[40px] border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center relative overflow-hidden hover:bg-slate-100 hover:border-blue-400 transition-colors">
                                                {/* 🟢 FIXED: Removed field.displayName to stop TS error */}
                                                <input 
                                                    type="file" 
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    onChange={(e) => {
                                                        if(e.target.files?.length) {
                                                            handleFileUpload(Array.from(e.target.files), index, watchDocs?.[index]?.displayName || 'Document');
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                                {uploadingIndex === index ? (
                                                    <Loader2 size={16} className="animate-spin text-blue-600" />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <CloudUpload size={14} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Upload File</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {!field.isMandatory && field.documentType === 'OTHER' && (
                                        <button type="button" onClick={() => remove(index)} className="h-[40px] px-3 bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-100 rounded-xl transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </form>
        </div>
    );
};

export default Step5Vault;