import React from 'react';
import { Plus, Trash2, Undo2, CalendarDays, Clock, FileText, Target, CornerDownRight } from 'lucide-react';
import { SyllabusNode } from '../../../../types/academic/academic.schema';

interface NodeProps {
  node: SyllabusNode;
  serial: string; 
  onUpdate: (id: string, field: keyof SyllabusNode, value: any) => void;
  onDelete: (id: string) => void;
  onAddChild: (id: string, type: 'chapter' | 'topic' | 'subtopic') => void;
  calculateMetrics: (node: SyllabusNode) => any;
}

const CurriculumNode: React.FC<NodeProps> = ({ node, serial, onUpdate, onDelete, onAddChild, calculateMetrics }) => {
  const isDeleted = node.isDeleted;
  const isChapter = node.type === 'chapter';
  const isTopic = node.type === 'topic';
  const childType = isChapter ? 'topic' : 'subtopic';

  // Process live calculations
  const metrics = calculateMetrics(node);
  const hasChildren = node.children && node.children.filter((c: SyllabusNode) => !c.isDeleted).length > 0;

  // --- HIGH CONTRAST STYLING ---
  const containerStyle = isChapter 
    ? 'bg-slate-900 text-white rounded-[2rem] p-6 md:p-8 shadow-2xl mt-8 ring-1 ring-slate-800' 
    : isTopic 
      ? 'bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm mt-6 ml-4 md:ml-8 relative'
      : 'bg-slate-50 border border-slate-200 rounded-xl p-5 mt-4 ml-8 md:ml-12 relative';

  return (
    <div className={`transition-all duration-300 ${isDeleted ? 'opacity-40 grayscale' : ''}`}>
      <div className={containerStyle}>
        
        {/* Dynamic Connector Line for Sub-items */}
        {!isChapter && (
          <div className="absolute -left-6 top-6 text-slate-300">
            <CornerDownRight size={24} />
          </div>
        )}

        {/* HEADER: Title & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex-1 w-full">
            <span className={`text-[11px] font-black tracking-[0.2em] uppercase mb-2 inline-block px-2 py-1 rounded ${
              isChapter ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-200 text-slate-600'
            }`}>
              {node.type} {serial}
            </span>
            
            <input 
              value={node.title || ''} 
              onChange={(e) => onUpdate(node.id, 'title', e.target.value)} 
              disabled={isDeleted}
              placeholder={`Enter ${node.type} name...`}
              className={`w-full outline-none transition-all px-4 py-3 rounded-xl border-2 ${
                isChapter 
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 text-2xl font-black' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white text-lg font-bold'
              } ${isDeleted ? 'line-through decoration-rose-500' : ''}`}
            />
          </div>

          <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end">
            {!isDeleted && !(!isChapter && !isTopic) /* Only show Add on Chapter and Topic */ && (
              <button 
                onClick={() => onAddChild(node.id, childType)} 
                className={`px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                  isChapter ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' : 'bg-slate-100 hover:bg-blue-50 text-blue-700'
                }`}
              >
                <Plus size={18} /> Add {childType}
              </button>
            )}
            <button 
              onClick={() => onDelete(node.id)} 
              className={`p-3 rounded-xl transition-colors ${
                isDeleted ? 'bg-emerald-500 text-white shadow-lg' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'
              }`}
            >
              {isDeleted ? <Undo2 size={20} /> : <Trash2 size={20} />}
            </button>
          </div>
        </div>

        {/* DETAILS SECTION (Topics & Subtopics Only) */}
        {!isChapter && (
          <div className="space-y-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            
            {/* Description */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2"><FileText size={14}/> Syllabus Content Details</label>
              <textarea 
                value={node.description || ''} onChange={(e) => onUpdate(node.id, 'description', e.target.value)} disabled={isDeleted}
                placeholder="Briefly describe the specific points covered in this section..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all" rows={2}
              />
            </div>

            {/* Metrics Calculator Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Start Date</label>
                <input 
                  type="date" 
                  value={hasChildren ? metrics.startDate : (node.startDate || '')} 
                  onChange={(e) => onUpdate(node.id, 'startDate', e.target.value)} 
                  disabled={isDeleted || hasChildren} 
                  className={`w-full p-3 text-sm font-bold border-2 rounded-xl outline-none transition-all ${
                    hasChildren ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-200 focus:border-blue-500'
                  }`} 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">End Date</label>
                <input 
                  type="date" 
                  value={hasChildren ? metrics.endDate : (node.endDate || '')} 
                  onChange={(e) => onUpdate(node.id, 'endDate', e.target.value)} 
                  disabled={isDeleted || hasChildren} 
                  className={`w-full p-3 text-sm font-bold border-2 rounded-xl outline-none transition-all ${
                    hasChildren ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-200 focus:border-blue-500'
                  }`} 
                />
              </div>
              
              {/* Dynamic Days Display */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-col justify-center items-center shadow-inner">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Total Days</span>
                <span className="text-xl font-black text-blue-700">{metrics.totalDays || 0}</span>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Total Hours</label>
                <input 
                  type="number" min="0" 
                  value={hasChildren ? metrics.totalHours : (node.hours || '')} 
                  onChange={(e) => onUpdate(node.id, 'hours', e.target.value)} 
                  disabled={isDeleted || hasChildren} 
                  placeholder="Hrs" 
                  className={`w-full p-3 text-sm font-bold border-2 rounded-xl outline-none transition-all ${
                    hasChildren ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-200 focus:border-blue-500'
                  }`} 
                />
              </div>
            </div>

            {hasChildren && (
              <p className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded inline-block uppercase">
                Dates & Hours are auto-calculated from subtopics
              </p>
            )}

            {/* Outcome (Topics Only) */}
            {isTopic && (
              <div className="pt-2">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Target size={14}/> Expected Outcome</label>
                <input 
                  value={node.outcome || ''} onChange={(e) => onUpdate(node.id, 'outcome', e.target.value)} disabled={isDeleted}
                  placeholder="What specific skills will students achieve? (Optional)"
                  className="w-full bg-emerald-50/30 border-2 border-emerald-100 focus:border-emerald-400 rounded-xl p-3 text-sm font-medium italic outline-none transition-all text-emerald-900 placeholder:text-emerald-300"
                />
              </div>
            )}
          </div>
        )}

        {/* CHAPTER READ-ONLY AGGREGATION FOOTER */}
        {isChapter && (
          <div className="flex flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-slate-800 mt-4">
            <div className="flex items-center gap-3 text-slate-400">
              <CalendarDays size={18} className="text-blue-500"/> 
              <span className="text-sm font-medium uppercase tracking-widest">Schedule: <strong className="text-white">{metrics.startDate || 'TBD'}</strong> to <strong className="text-white">{metrics.endDate || 'TBD'}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <Clock size={18} className="text-emerald-500"/> 
              <span className="text-sm font-medium uppercase tracking-widest">Duration: <strong className="text-white">{metrics.totalDays || 0} Days</strong> / <strong className="text-white">{metrics.totalHours || 0} Hours</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* RENDER CHILDREN RECURSIVELY */}
      {!isDeleted && node.children.map((child: SyllabusNode, idx: number) => (
        <CurriculumNode 
          key={child.id} 
          node={child}
          serial={`${serial}.${idx + 1}`} 
          onUpdate={onUpdate} 
          onDelete={onDelete} 
          onAddChild={onAddChild}
          calculateMetrics={calculateMetrics}
        />
      ))}
    </div>
  );
};

export default CurriculumNode;