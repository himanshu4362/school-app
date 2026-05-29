import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import * as Yup from 'yup';
import AdminLayout from '../../components/layout/AdminLayout';
import { useSyllabusTree } from '../../hooks/useSyllabusTree';
import { SyllabusNode } from '../../../../types/academic/academic.schema';
import CurriculumNode from './CurriculumNode';
import { Save, PlusCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Formik-style strict validation schema
const syllabusSchema: any = Yup.array().of(
  Yup.object().shape({
    isDeleted: Yup.boolean(),
    title: Yup.string().when('isDeleted', {
      is: false,
      then: (schema) => schema.required('Validation Error: All active Chapters and Topics must have a title.'),
    }),
    children: Yup.lazy(() => syllabusSchema.default([])),
  })
);

const SyllabusEditorSandbox: React.FC = () => {
  const { classId, subjectId } = useParams<{ classId: string, subjectId: string }>();
  const history = useHistory();
  
  const { nodes, updateNode, toggleDelete, addChild, calculateMetrics } = useSyllabusTree([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Compute absolute totals for the header
  const totalSubjectHours = nodes.reduce((sum, node) => sum + calculateMetrics(node).totalHours, 0);

  const handleLaunch = async () => {
    setValidationError(null);

    try {
      // 1. Strict Validation Check
      if (nodes.length === 0) throw new Yup.ValidationError("Cannot launch an empty syllabus.", null, '');
      await syllabusSchema.validate(nodes, { strict: true, abortEarly: false });

      // 2. Clean Payload (Removes deleted, adds dynamic calculations to JSON)
      const cleanPayload = (list: SyllabusNode[]): any[] => {
        return list
          .filter(n => !n.isDeleted)
          .map(n => {
            const metrics = calculateMetrics(n);
            return {
              type: n.type,
              title: n.title,
              description: n.description,
              startDate: metrics.startDate,
              endDate: metrics.endDate,
              calculatedDays: metrics.totalDays,
              calculatedHours: metrics.totalHours,
              outcome: n.outcome,
              children: cleanPayload(n.children)
            };
          });
      };

      const finalData = {
        meta: { classId, subjectId, totalSubjectHours, launchedAt: new Date().toISOString() },
        curriculumTree: cleanPayload(nodes)
      };

      // 3. Backend Console Dump
      console.log(JSON.stringify(finalData, null, 2));

      alert("Syllabus validated and launched! Check the developer console for the JSON output.");
      history.goBack();

    } catch (err: any) {
      if (err instanceof Yup.ValidationError) {
        setValidationError(err.errors[0] || err.message);
      }
    }
  };

  return (
    <AdminLayout 
      pageTitle="Curriculum Editor" 
      pageDescription={`Drafting Master Syllabus for ${subjectId}`}
      breadcrumbs={[
        { label: 'Academic Hub' }, 
        { label: classId, path: `/admin/academic/syllabus/manage/${classId}` },
        { label: subjectId, path: `/admin/academic/syllabus/manage/${classId}/${subjectId}` },
        { label: 'Editor' }
      ]}
      headerActions={
        <button 
          onClick={handleLaunch}
          className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-black text-sm shadow-xl shadow-blue-900/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
        >
          <Save size={18} /> Validate & Launch
        </button>
      }
    >
      
      {/* Top Meta Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center mb-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={24}/></div>
          <div>
            <h3 className="font-black text-slate-900 text-lg">Real-Time Pacing Tracker</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Calculated from hierarchy</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-slate-900">{totalSubjectHours} <span className="text-base text-slate-400">Hrs</span></span>
        </div>
      </div>

      {/* Validation Warning */}
      {validationError && (
        <div className="mb-8 p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm animate-in slide-in-from-top-2">
          <AlertTriangle size={18} className="shrink-0" /> {validationError}
        </div>
      )}

      {/* The Recursive Canvas */}
      <div className="pb-20">
        {nodes.map((node, index) => (
          <CurriculumNode 
            key={node.id} 
            node={node} 
            serial={`${index + 1}`} 
            onUpdate={updateNode} 
            onDelete={toggleDelete} 
            onAddChild={addChild}
            calculateMetrics={calculateMetrics}
          />
        ))}

        {nodes.length === 0 && (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-20 text-center">
            <p className="font-black text-xl text-slate-800 mb-2">Blank Canvas</p>
            <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">Start by adding your first Chapter. Chapters will automatically calculate timelines based on the topics you define within them.</p>
          </div>
        )}

        <button 
          onClick={() => addChild(null, 'chapter')}
          className="mt-8 w-full py-6 bg-white border-2 border-slate-200 text-slate-600 rounded-[2rem] font-black text-lg flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-600 hover:shadow-xl transition-all shadow-sm"
        >
          <PlusCircle size={24} /> Add New Chapter
        </button>
      </div>

    </AdminLayout>
  );
};

export default SyllabusEditorSandbox;