import React, { useMemo, useState, useCallback } from 'react';
import { Save, Loader2, PlusCircle, Hash } from 'lucide-react';
import { useParams } from 'react-router-dom';
import AdminLayout from "../../components/AdminLayout";
import OverviewEditor from "../../components/syllabus/OverviewEditor";
import RecursiveRow from "../../components/syllabus/RecursiveRow"; 
import { SyllabusNode, SubjectOverviewBlock } from '../../../../types/syllabus'; 

const generateSafeId = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const useSyllabusTree = (initialData: SyllabusNode[]) => {
  const [nodes, setNodes] = useState<SyllabusNode[]>(initialData);

  const updateNode = useCallback((id: string, updates: Partial<SyllabusNode>) => {
    const recurse = (list: SyllabusNode[]): SyllabusNode[] => 
      list.map(node => {
        if (node.id === id) return { ...node, ...updates };
        return { ...node, children: recurse(node.children || []) };
      });
    setNodes(prev => recurse(prev));
  }, []);

  const toggleDelete = useCallback((id: string) => {
    const recurse = (list: SyllabusNode[]): SyllabusNode[] =>
      list.map(node => {
        if (node.id === id) return { ...node, isDeleted: !node.isDeleted };
        return { ...node, children: recurse(node.children || []) };
      });
    setNodes(prev => recurse(prev));
  }, []);

  const addChild = useCallback((parentId: string | null) => {
    const newNode: SyllabusNode = {
      id: generateSafeId(),
      title: "",
      estimatedHours: 0,
      isDeleted: false,
      isExpanded: true,
      children: []
    };

    if (!parentId) {
      setNodes(prev => [...prev, newNode]);
      return;
    }

    const recurse = (list: SyllabusNode[]): SyllabusNode[] =>
      list.map(node => {
        if (node.id === parentId) return { ...node, children: [...(node.children || []), newNode], isExpanded: true };
        return { ...node, children: recurse(node.children || []) };
      });
    setNodes(prev => recurse(prev));
  }, []);

  return { nodes, updateNode, toggleDelete, addChild };
};

const SyllabusDefinition: React.FC = () => {
  const { classId, subject } = useParams<{ classId: string, subject: string }>();
  const [overviewBlocks, setOverviewBlocks] = useState<SubjectOverviewBlock[]>([]);
  const { nodes, updateNode, toggleDelete, addChild } = useSyllabusTree([]);
  const [isSaving, setIsSaving] = useState(false);

  const metrics = useMemo(() => {
    let total = 0;
    const calculate = (items: SyllabusNode[]) => {
      if (!Array.isArray(items)) return;
      items.forEach(item => {
        if (!item.isDeleted) {
          const children = item.children || [];
          if (children.length === 0) total += (item.estimatedHours || 0);
          calculate(children);
        }
      });
    };
    calculate(nodes);
    return { hours: total, days: Math.max(1, Math.ceil(total / 3)) };
  }, [nodes]);

  // --- CLEAN BACKEND PAYLOAD GENERATOR ---
  const handleLaunch = async () => {
    setIsSaving(true);
    
    // 1. Recursive function to clean data (removes deleted items & UI state)
    const cleanForBackend = (node: SyllabusNode): any => {
      return {
        id: node.id,
        title: node.title,
        estimatedHours: node.estimatedHours,
        targetDate: node.targetDate || null,
        outcome: node.outcome || null,
        // Only keep children that are NOT deleted, then clean them too
        children: (node.children || []).filter(c => !c.isDeleted).map(cleanForBackend)
      };
    };

    // 2. Build the final JSON object
    const finalPayload = {
      classId: classId || 'UNKNOWN_CLASS',
      subject: subject || 'UNKNOWN_SUBJECT',
      totalEstimatedHours: metrics.hours,
      totalEstimatedDays: metrics.days,
      overview: overviewBlocks,
      // Filter out root nodes that are deleted, then map the rest
      curriculumTree: nodes.filter(n => !n.isDeleted).map(cleanForBackend),
      timestamp: new Date().toISOString()
    };

    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);

    // 3. Log the clean JSON string to the console
    console.log("========== BACKEND API PAYLOAD ==========");
    console.log(JSON.stringify(finalPayload, null, 2));
    console.log("=========================================");
    
    alert("Check your browser console (F12). The clean JSON payload is ready for your API!");
  };

  return (
    <AdminLayout 
      breadcrumbs={[
        { label: 'Syllabus Home', path: '/admin/academic/syllabus' },
        { label: `${classId || 'Class'} Management`, path: `/admin/academic/syllabus/manage/${classId || 'default'}` },
        { label: `Define ${subject || 'Subject'}` }
      ]}
      headerActions={
        <button disabled={isSaving} onClick={handleLaunch} className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg hover:bg-blue-500 transition-all disabled:opacity-50">
          {isSaving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
          {isSaving ? "Syncing..." : "Launch Syllabus"}
        </button>
      }
    >
      <div className="mb-10">
        <OverviewEditor blocks={overviewBlocks} setBlocks={setOverviewBlocks} />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-900 flex justify-between items-center text-white">
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-white/10 rounded-2xl"><Hash size={20}/></div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Curriculum Structure</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Estimated Total: {metrics.hours} Hrs (~{metrics.days} Days)</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pb-32 bg-slate-50">
          <table className="w-full min-w-[1200px] border-separate border-spacing-0">
            <thead className="bg-white text-[10px] font-black text-slate-500 uppercase tracking-widest text-left shadow-sm border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 w-24">Serial</th>
                <th className="px-4 py-4 min-w-[300px]">Curriculum Structure</th>
                <th className="px-4 py-4 w-32 text-center">Hours</th>
                <th className="px-4 py-4 w-48 text-center">Target Date</th>
                <th className="px-4 py-4 min-w-[250px]">Learning Outcome</th>
                <th className="px-4 py-4 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node, idx) => (
                <RecursiveRow 
                  key={node.id} 
                  node={node} 
                  level={0} 
                  parentSerial="" 
                  index={idx} 
                  onUpdate={updateNode} 
                  onDelete={toggleDelete} 
                  onAddChild={addChild} 
                />
              ))}
            </tbody>
          </table>
          
          {nodes.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4 bg-white">
              <div className="p-6 bg-slate-50 rounded-full text-blue-500"><PlusCircle size={48}/></div>
              <p className="text-slate-500 font-bold text-sm">No chapters defined. Start by adding your first chapter node.</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => addChild(null)}
          className="w-full py-6 bg-white border-t border-slate-200 text-blue-600 font-black text-xs hover:bg-slate-50 transition-all uppercase tracking-widest"
        >
          + Add New Chapter Node
        </button>
      </div>
    </AdminLayout>
  );
};

export default SyllabusDefinition;