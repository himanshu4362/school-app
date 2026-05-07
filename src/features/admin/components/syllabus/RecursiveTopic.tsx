import React from 'react';

import {
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react';

import { Topic } from '../../pages/syllabus/syllabus';

interface Props {
  node: Topic;

  level?: number;

  onDelete: (id: string) => void;

  onAddSubtopic: (id: string) => void;
}

const RecursiveTopic: React.FC<Props> = ({
  node,
  level = 0,
  onDelete,
  onAddSubtopic,
}) => {

  return (
    <div className="space-y-3">

      <div
        className="bg-white border rounded-2xl p-4 shadow-sm"
        style={{
          marginLeft: `${level * 24}px`,
        }}
      >

        <div className="flex justify-between items-start gap-4">

          <div>

            <h3 className="font-semibold text-slate-800">
              {node.title}
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              {node.description}
            </p>

            <div className="flex gap-3 mt-2 text-xs text-slate-500">

              <span>
                {node.estimatedHours || 0} hrs
              </span>

              <span>
                {node.completed
                  ? 'Completed'
                  : 'Pending'}
              </span>

            </div>
          </div>

          <div className="flex gap-2">

            <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200">
              <Pencil size={16} />
            </button>

            <button
              onClick={() =>
                onDelete(node.id)
              }
              className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-600"
            >
              <Trash2 size={16} />
            </button>

            <button
              onClick={() =>
                onAddSubtopic(node.id)
              }
              className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600"
            >
              <Plus size={16} />
            </button>

          </div>
        </div>
      </div>

      {node.children?.map((child) => (
        <RecursiveTopic
          key={child.id}
          node={child}
          level={level + 1}
          onDelete={onDelete}
          onAddSubtopic={onAddSubtopic}
        />
      ))}
    </div>
  );
};

export default RecursiveTopic;