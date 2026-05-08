import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { RootState } from '../../../../../store/store';
import { saveDocuments, resetApplication } from '../../../../../store/slices/applicationSlice';
import { ShieldCheck, FileText, AlertCircle } from 'lucide-react';

const DocumentEntrySchema = z.object({
    documentType: z.string(),
    displayName: z.string(),
    isMandatory: z.boolean(),
    status: z.enum(['submitted', 'pending', 'not_applicable']),
    documentNumber: z.string().optional(),
});

const Step5Schema = z.object({
    documents: z.array(DocumentEntrySchema),
});

type Step5Data = z.infer<typeof Step5Schema>;

const Step5Vault: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    // Pull EVERYTHING for the final submission
    const applicationState = useSelector((state: RootState) => state.application);
    const { documentRules } = useSelector((state: RootState) => state.config);

    const { register, control, handleSubmit, reset } = useForm<Step5Data>({
        resolver: zodResolver(Step5Schema),
        defaultValues: { documents: [] }
    });

    const { fields } = useFieldArray({ control, name: "documents" });

    // Initialize the required documents based on Admission Type
    useEffect(() => {
        if (applicationState.documents) {
            reset({ documents: applicationState.documents });
            return;
        }

        // Filter rules: Apply 'all' rules, PLUS 'fresh' or 'transfer' rules
        const applicableRules = documentRules.filter(rule =>
            rule.admissionType === 'all' || rule.admissionType === applicationState.admissionType
        );

        const initialDocs = applicableRules.map(rule => ({
            documentType: rule.documentType,
            displayName: rule.displayName,
            isMandatory: rule.isMandatory,
            status: 'pending' as const,
            documentNumber: '',
        }));

        reset({ documents: initialDocs });
    }, [documentRules, applicationState.admissionType, applicationState.documents, reset]);

    const onSubmit = (data: Step5Data) => {
        dispatch(saveDocuments(data.documents));

        // --- THE FINAL PAYLOAD ASSEMBLY ---
        const finalEnterprisePayload = {
            ...applicationState,
            documents: data.documents,
            status: 'submitted', // Moves to admin review
            createdAt: new Date().toISOString()
        };

        console.log(" FINAL APPLICATION READY FOR DATABASE:", finalEnterprisePayload);

        // Simulate API Call
        alert("Application Successfully Submitted for Review!");

        // Clean up and redirect back to CRM
        dispatch(resetApplication());
        history.push('/admin/admissions');
    };

    return (
        <form id="step5-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-300">

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3 mb-6">
                <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs font-bold text-emerald-900 leading-relaxed">
                    Final Verification Step. The system has automatically requested the following documents based on the student's admission profile.
                </p>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center">

                        <div className="flex items-center gap-3 flex-1">
                            <div className={`p-2 rounded-lg ${field.isMandatory ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                <FileText size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                    {field.displayName}
                                    {field.isMandatory && <div title="Mandatory Document">
                                        <AlertCircle
                                            size={12}
                                            className="text-rose-500"
                                            aria-label="Mandatory Document"
                                        />
                                    </div>}
                                </h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {field.isMandatory ? 'Mandatory Document' : 'Optional Document'}
                                </p>
                            </div>
                        </div>

                        <div className="w-full md:w-48">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Status</label>
                            <select {...register(`documents.${index}.status`)} className="w-full p-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500">
                                <option value="pending">Pending (Not Submitted)</option>
                                <option value="submitted">Submitted</option>
                                <option value="not_applicable">Not Applicable</option>
                            </select>
                        </div>

                        <div className="w-full md:w-48">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Document ID (Optional)</label>
                            <input type="text" {...register(`documents.${index}.documentNumber`)} className="w-full p-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="e.g. Aadhaar No." />
                        </div>

                    </div>
                ))}
            </div>
        </form>
    );
};

export default Step5Vault;