import React from 'react';

import {
  Plus,
  Trash2,
} from 'lucide-react';

import {
  SubjectOverviewBlock,
} from '../../pages/syllabus/syllabus';

interface Props {
  blocks: SubjectOverviewBlock[];

  setBlocks: React.Dispatch<
    React.SetStateAction<SubjectOverviewBlock[]>
  >;
}

const OverviewEditor: React.FC<Props> = ({
  blocks,
  setBlocks,
}) => {

  const addBlock = () => {

    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'custom',
        heading: '',
        content: '',
        order: prev.length + 1,
      },
    ]);
  };

  const updateBlock = (
    id: string,
    field: string,
    value: string
  ) => {

    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id
          ? {
              ...block,
              [field]: value,
            }
          : block
      )
    );
  };

  const deleteBlock = (id: string) => {

    setBlocks((prev) =>
      prev.filter((b) => b.id !== id)
    );
  };

  return (
    <div className="space-y-4">

      {blocks.map((block) => (

        <div
          key={block.id}
          className="bg-white border rounded-2xl p-5 space-y-4"
        >

          <div className="flex justify-between items-center">

            <h3 className="font-semibold">
              Overview Block
            </h3>

            <button
              onClick={() =>
                deleteBlock(block.id)
              }
              className="p-2 rounded-xl bg-red-100 text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <input
            value={block.heading}
            onChange={(e) =>
              updateBlock(
                block.id,
                'heading',
                e.target.value
              )
            }
            placeholder="Heading"
            className="w-full border rounded-xl p-3"
          />

          <textarea
            rows={5}
            value={block.content}
            onChange={(e) =>
              updateBlock(
                block.id,
                'content',
                e.target.value
              )
            }
            placeholder="Write content..."
            className="w-full border rounded-xl p-3"
          />
        </div>
      ))}

      <button
        onClick={addBlock}
        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl"
      >
        <Plus size={18} />
        Add More Section
      </button>
    </div>
  );
};

export default OverviewEditor;