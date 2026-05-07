import React from 'react';
import { Plus, Trash2, Undo2, ChevronDown, ChevronRight, AlertTriangle, CornerDownRight } from 'lucide-react';
import { SyllabusNode } from '../../../../types/syllabus'; 

const MAX_NESTING = 4;

interface Props {
  node: SyllabusNode;
  level: number;
  parentSerial: string;
  index: number;
  onUpdate: (id: string, updates: Partial<SyllabusNode>) => void;
  onDelete: (id: string) => void;
  onAddChild: (id: string) => void;
}

const RecursiveRow: React.FC<Props> = React.memo(({ node, level, parentSerial, index, onUpdate, onDelete, onAddChild }) => {
  const currentSerial = parentSerial ? `${parentSerial}.${index + 1}` : `${index + 1}`;
  const safeChildren = node.children || [];

  if (level > MAX_NESTING) {
    return (
      <tr>
        <td colSpan={6} className="bg-amber-50 p-3 text-xs font-bold text-amber-700 text-center border-b border-amber-100">
          <AlertTriangle size={14} className="inline mr-2"/> Max architectural depth reached at {currentSerial}
        </td>
      </tr>
    );
  }

  const isChapter = level === 0;
  const rowBg = node.isDeleted ? 'bg-rose-50 opacity-60' : 'bg-slate-50';

  return (
    <>
      <tr className={`group border-b border-slate-200 transition-all ${rowBg}`}>
        {/* 1. ID Column */}
        <td className="px-4 py-3 align-middle">
          <span className="font-mono text-xs font-black text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm">
            {currentSerial}
          </span>
        </td>

        {/* 2. Hierarchy & Title Column */}
        <td className="px-4 py-3 align-middle">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 1.5}rem` }}>
            {level > 0 && <CornerDownRight size={16} className="text-slate-400 shrink-0" />}
            
            {safeChildren.length > 0 && (
              <button 
                onClick={() => onUpdate(node.id, { isExpanded: !node.isExpanded })} 
                className="p-1.5 bg-white border border-slate-200 shadow-sm hover:bg-slate-100 rounded-md text-slate-600 transition-colors shrink-0"
              >
                {node.isExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
              </button>
            )}

            {/* HIGH VISIBILITY INPUT */}
            <input 
              value={node.title || ''}
              onChange={(e) => onUpdate(node.id, { title: e.target.value })}
              className={`w-full bg-white border border-slate-300 text-slate-800 px-3 py-2 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all ${
                isChapter ? 'text-base font-black' : 'text-sm font-bold'
              } ${node.isDeleted ? 'line-through text-rose-500 bg-rose-50' : ''}`}
              placeholder={isChapter ? "Enter Chapter Name..." : "Enter Topic..."}
              readOnly={node.isDeleted}
            />
          </div>
        </td>

        {/* 3. Hours Column */}
        <td className="px-4 py-3 align-middle text-center">
          {level > 0 && (
            <input 
              type="number" 
              min="0"
              step="0.5"
              value={node.estimatedHours || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdate(node.id, { estimatedHours: Number.isNaN(val) ? 0 : val });
              }}
              className="w-20 mx-auto px-2 py-2 bg-white border border-slate-300 text-slate-800 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-center text-sm font-black outline-none transition-all"
              placeholder="Hrs"
              readOnly={node.isDeleted}
            />
          )}
        </td>

        {/* 4. Target Date Column */}
        <td className="px-4 py-3 align-middle">
          {level > 0 && (
            <input 
              type="date" 
              value={node.targetDate || ''} 
              onChange={(e) => onUpdate(node.id, { targetDate: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-800 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs font-bold outline-none transition-all cursor-pointer" 
              readOnly={node.isDeleted}
            />
          )}
        </td>

        {/* 5. Outcome Column */}
        <td className="px-4 py-3 align-middle">
          {level > 0 && (
            <input 
              type="text"
              value={node.outcome || ''} 
              onChange={(e) => onUpdate(node.id, { outcome: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-800 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs font-medium outline-none transition-all" 
              placeholder="Expected outcome..."
              readOnly={node.isDeleted}
            />
          )}
        </td>

        {/* 6. Actions Column */}
        <td className="px-4 py-3 align-middle text-right">
          <div className="flex justify-end gap-2">
            {!node.isDeleted && level < MAX_NESTING && (
              <button 
                onClick={() => onAddChild(node.id)} 
                className="p-2 bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 rounded-lg shadow-sm transition-all"
                title="Add Sub-item"
              >
                <Plus size={16}/>
              </button>
            )}
            <button 
              onClick={() => onDelete(node.id)} 
              className={`p-2 bg-white border shadow-sm rounded-lg transition-all ${
                node.isDeleted 
                  ? 'border-blue-200 text-blue-600 hover:bg-blue-50' 
                  : 'border-slate-200 text-rose-500 hover:bg-rose-50'
              }`}
            >
              {node.isDeleted ? <Undo2 size={16}/> : <Trash2 size={16}/>} 
            </button>
          </div>
        </td>
      </tr>

      {/* Render Children safely */}
      {node.isExpanded && safeChildren.map((child, idx) => (
        <RecursiveRow 
          key={child.id || idx} 
          node={child} 
          level={level + 1} 
          parentSerial={currentSerial}
          index={idx}
          onUpdate={onUpdate} 
          onDelete={onDelete} 
          onAddChild={onAddChild} 
        />
      ))}
    </>
  );
});

export default RecursiveRow;