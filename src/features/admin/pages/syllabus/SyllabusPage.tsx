import React, {
  useMemo,
  useState,
} from 'react';

import AdminLayout from '../../components/AdminLayout';

import RecursiveTopic from '../../components/syllabus/RecursiveTopic';

import OverviewEditor from '../../components/syllabus/OverviewEditor';

import {
  calculateTopicMetrics,
  deleteTopicRecursive,
} from '../../pages/syllabus/syllabusUtils';

import {
  SubjectOverviewBlock,
  Topic,
} from '../../pages/syllabus/syllabus';

const SyllabusPage = () => {

  const [topics, setTopics] =
    useState<Topic[]>([
      {
        id: '1',
        title: 'Mechanics',
        description: 'Physics Basics',
        estimatedHours: 8,

        completed: false,

        children: [
          {
            id: '2',
            title: 'Force',
            estimatedHours: 5,

            completed: true,

            children: [
              {
                id: '3',
                title: 'Newton Laws',
                estimatedHours: 4,

                completed: false,
              },
            ],
          },
        ],
      },
    ]);

  const [overviewBlocks, setOverviewBlocks] =
    useState<SubjectOverviewBlock[]>([]);

  const metrics = useMemo(() => {

    return calculateTopicMetrics(topics);

  }, [topics]);

  const deleteTopic = (id: string) => {

    setTopics((prev) =>
      deleteTopicRecursive(prev, id)
    );
  };

  const addSubtopic = (parentId: string) => {

    const title =
      prompt('Enter subtopic name');

    if (!title) return;

    const recursiveAdd = (
      nodes: Topic[]
    ): Topic[] => {

      return nodes.map((node) => {

        if (node.id === parentId) {

          return {
            ...node,

            children: [
              ...(node.children || []),

              {
                id: crypto.randomUUID(),

                title,

                estimatedHours: 0,

                completed: false,

                children: [],
              },
            ],
          };
        }

        return {
          ...node,

          children: node.children
            ? recursiveAdd(node.children)
            : [],
        };
      });
    };

    setTopics((prev) =>
      recursiveAdd(prev)
    );
  };

  return (
    <AdminLayout
      pageTitle="Syllabus Management"
      pageDescription="Manage chapters, topics and hierarchy"
      autoBreadcrumbs
    >

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        <div className="bg-white rounded-2xl border p-5">
          <p className="text-sm text-slate-500">
            Completion
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {metrics.completionPercentage.toFixed(0)}%
          </h2>
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <p className="text-sm text-slate-500">
            Total Hours
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {metrics.totalHours}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <p className="text-sm text-slate-500">
            Completed Hours
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {metrics.completedHours}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <p className="text-sm text-slate-500">
            Estimated Days
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {metrics.estimatedDays}
          </h2>
        </div>
      </div>

      {/* OVERVIEW */}
      <div className="mb-10">

        <h2 className="text-xl font-bold mb-5">
          Subject Overview
        </h2>

        <OverviewEditor
          blocks={overviewBlocks}
          setBlocks={setOverviewBlocks}
        />
      </div>

      {/* TOPIC TREE */}
      <div className="space-y-5">

        <h2 className="text-xl font-bold">
          Topic Hierarchy
        </h2>

        {topics.map((topic) => (
          <RecursiveTopic
            key={topic.id}
            node={topic}
            onDelete={deleteTopic}
            onAddSubtopic={addSubtopic}
          />
        ))}
      </div>

    </AdminLayout>
  );
};

export default SyllabusPage;