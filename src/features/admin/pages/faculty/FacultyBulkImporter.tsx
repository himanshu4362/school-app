import React, { useState, useRef } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Play, Download, XCircle } from 'lucide-react';
import { z } from 'zod';
import { FacultyIdentitySchema, FacultyEmploymentSchema } from '../../../../types/faculty/faculty.schema';

// Combine schemas for bulk validation
const BulkFacultySchema = FacultyIdentitySchema.merge(FacultyEmploymentSchema.pick({
    employeeId: true, departmentId: true, designationId: true
}));

type ParsedRow = any; // In production, this comes from PapaParse
interface ValidationResult {
    rowNumber: number;
    data: ParsedRow;
    isValid: boolean;
    errors: string[];
}

const FacultyBulkImporter: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [validationResults, setValidationResults] = useState<ValidationResult[] | null>(null);

    // --- MOCK PARSER & VALIDATOR ---
    // In reality, you would use 'papaparse' library here: Papa.parse(file, { complete: handleParsedData })
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        // Simulating file reading and parsing delay
        setTimeout(() => {
            // Mocked CSV Data (1 Valid, 2 Invalid)
            const mockParsedData = [
                { employeeId: 'EMP-001', firstName: 'Ravi', lastName: 'Kumar', mobile: '9876543210', email: 'ravi@test.com', departmentId: '123e4567-e89b-12d3-a456-426614174000', designationId: '123e4567-e89b-12d3-a456-426614174001', emergencyContactName: 'Wife', emergencyContactMobile: '8765432109', address: 'Delhi', dob: '1990-01-01', gender: 'male', maritalStatus: 'married' },
                { employeeId: 'EMP-002', firstName: 'Sita', lastName: '', mobile: '12345', email: 'sita@test', departmentId: 'invalid-uuid', designationId: 'invalid-uuid', emergencyContactName: '', emergencyContactMobile: '', address: '', dob: '', gender: 'unknown', maritalStatus: 'single' }, // FAILS validation
                { employeeId: 'EMP-003', firstName: 'Amit', lastName: 'Singh', mobile: '7654321098', email: 'amit@test.com', departmentId: '123e4567-e89b-12d3-a456-426614174000', designationId: '123e4567-e89b-12d3-a456-426614174001', emergencyContactName: 'Father', emergencyContactMobile: '6543210987', address: 'Mumbai', dob: '1985-05-05', gender: 'male', maritalStatus: 'single' },
            ];

            const results: ValidationResult[] = mockParsedData.map((row, index) => {
                try {
                    BulkFacultySchema.parse(row);
                    return { rowNumber: index + 2, data: row, isValid: true, errors: [] };
                } catch (err: any) {
                    if (err && err.issues) {
                        const errorMessages = err.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
                        return { rowNumber: index + 2, data: row, isValid: false, errors: errorMessages };
                    }
                    return { rowNumber: index + 2, data: row, isValid: false, errors: ['Unknown validation error'] };
                }
            });

            setValidationResults(results);
            setIsUploading(false);
        }, 1500);
    };

    const validCount = validationResults?.filter(r => r.isValid).length || 0;
    const errorCount = validationResults?.filter(r => !r.isValid).length || 0;

    const handleCommit = () => {
        alert(`🚀 COMMITTING ${validCount} VALID RECORDS TO DATABASE...\n\nThe rows with errors will be skipped. You can fix them in Excel and re-upload them later.`);
        setValidationResults(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <AdminLayout
            pageTitle="Data Migration Hub"
            pageDescription="Bulk import faculty records to resolve the cold-start adoption problem."
            breadcrumbs={[{ label: 'HR & Faculty' }, { label: 'Data Migration' }]}
            headerActions={
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                    <Download size={16} /> Download CSV Template
                </button>
            }
        >
            {/* STEP 1: UPLOAD ZONE */}
            {!validationResults && (
                <div className="bg-white p-10 rounded-[2rem] border-2 border-dashed border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                        <UploadCloud size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Upload Faculty Data</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        Drag and drop your populated <span className="font-bold text-slate-700">faculty_template.csv</span> file here, or click to browse. Max 500 rows per upload.
                    </p>

                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-black text-sm shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        {isUploading ? 'Validating Data...' : 'Browse CSV File'}
                    </button>
                </div>
            )}

            {/* STEP 2: REVIEW & STAGING ZONE */}
            {validationResults && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><FileText size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Rows Found</p>
                                <p className="text-2xl font-black text-slate-900">{validationResults.length}</p>
                            </div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><CheckCircle size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Ready to Commit</p>
                                <p className="text-2xl font-black text-emerald-900">{validCount}</p>
                            </div>
                        </div>
                        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl"><AlertTriangle size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Validation Errors</p>
                                <p className="text-2xl font-black text-rose-900">{errorCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* The Validation Data Grid */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Staging Area Preview</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Row</th>
                                        <th className="px-6 py-4">Employee ID</th>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Mobile</th>
                                        <th className="px-6 py-4">Error Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {validationResults.map((result, idx) => (
                                        <tr key={idx} className={result.isValid ? 'bg-white' : 'bg-rose-50/50'}>
                                            <td className="px-6 py-3">
                                                {result.isValid
                                                    ? <CheckCircle size={16} className="text-emerald-500" />
                                                    : <XCircle size={16} className="text-rose-500" />
                                                }
                                            </td>
                                            <td className="px-6 py-3 font-bold text-slate-500">#{result.rowNumber}</td>
                                            <td className="px-6 py-3 font-bold text-slate-900">{result.data.employeeId || 'N/A'}</td>
                                            <td className="px-6 py-3 font-medium text-slate-700">{result.data.firstName} {result.data.lastName}</td>
                                            <td className="px-6 py-3 font-medium text-slate-700">{result.data.mobile}</td>
                                            <td className="px-6 py-3">
                                                {!result.isValid ? (
                                                    <div className="text-[10px] text-rose-600 font-bold max-w-xs truncate" title={result.errors.join(' | ')}>
                                                        {result.errors[0]} {result.errors.length > 1 && `(+${result.errors.length - 1} more)`}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Valid</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            onClick={() => setValidationResults(null)}
                            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
                        >
                            Cancel Upload
                        </button>
                        <button
                            onClick={handleCommit}
                            disabled={validCount === 0}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-sm shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <Play size={16} /> Execute Batch Insert ({validCount})
                        </button>
                    </div>

                </div>
            )}
        </AdminLayout>
    );
};

export default FacultyBulkImporter;