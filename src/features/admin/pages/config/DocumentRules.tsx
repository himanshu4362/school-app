import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../store/store';
import { toggleDocumentRequirement } from '../../../../store/slices/configSlice';
import AdminLayout from '../../components/layout/AdminLayout';
import { FileText, CheckCircle2, Circle, ShieldAlert } from 'lucide-react';

const DocumentRules: React.FC = () => {
  const dispatch = useDispatch();
  const { documentRules } = useSelector((state: RootState) => state.config);

  return (
    <AdminLayout 
      pageTitle="Document Compliance Rules" 
      pageDescription="Configure which documents are mandatory vs. optional during the admission process."
      breadcrumbs={[{ label: 'System Config' }, { label: 'Document Rules' }]}
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-5 text-xs font-black uppercase tracking-widest text-slate-500">Document Type</div>
          <div className="col-span-4 text-xs font-black uppercase tracking-widest text-slate-500">Applies To (Admission Type)</div>
          <div className="col-span-3 text-right text-xs font-black uppercase tracking-widest text-slate-500">Requirement</div>
        </div>

        {/* Rules List */}
        <div className="divide-y divide-slate-100">
          {documentRules.map((rule) => (
            <div key={rule.id} className="px-6 py-5 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/50 transition-colors">
              
              {/* Document Name */}
              <div className="col-span-5 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${rule.isMandatory ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{rule.displayName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{rule.documentType}</p>
                </div>
              </div>

              {/* Applies To Badge */}
              <div className="col-span-4">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                  rule.admissionType === 'transfer' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  rule.admissionType === 'fresh' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {rule.admissionType === 'all' ? 'All Admissions' : `${rule.admissionType} Only`}
                </span>
              </div>

              {/* Toggle Action */}
              <div className="col-span-3 flex justify-end">
                <button 
                  onClick={() => dispatch(toggleDocumentRequirement(rule.id))}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    rule.isMandatory 
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {rule.isMandatory ? (
                    <><ShieldAlert size={14}/> Mandatory</>
                  ) : (
                    <><Circle size={14}/> Optional</>
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default DocumentRules;