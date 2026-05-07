import { Topic } from './syllabus';

export const deleteTopicRecursive = (
  nodes: Topic[],
  id: string
): Topic[] => {

  return nodes
    .filter((node) => node.id !== id)
    .map((node) => ({
      ...node,
      children: node.children
        ? deleteTopicRecursive(node.children, id)
        : [],
    }));
};

export const calculateTopicMetrics = (
  nodes: Topic[]
) => {

  let totalHours = 0;

  let completedHours = 0;

  let totalTopics = 0;

  let completedTopics = 0;

  const traverse = (items: Topic[]) => {

    items.forEach((item) => {

      totalTopics++;

      totalHours += item.estimatedHours || 0;

      if (item.completed) {
        completedTopics++;

        completedHours += item.estimatedHours || 0;
      }

      if (item.children?.length) {
        traverse(item.children);
      }
    });
  };

  traverse(nodes);

  const completionPercentage =
    totalTopics === 0
      ? 0
      : (completedTopics / totalTopics) * 100;

  const estimatedDays =
    Math.ceil(totalHours / 3);

  return {
    totalHours,
    completedHours,
    totalTopics,
    completedTopics,
    completionPercentage,
    estimatedDays,
  };
};
