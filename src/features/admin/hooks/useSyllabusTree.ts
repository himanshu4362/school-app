import { useState, useCallback } from 'react';
import { SyllabusNode } from '../../../types/syllabus';

export const useSyllabusTree = (initialData: SyllabusNode[]) => {
  const [nodes, setNodes] = useState<SyllabusNode[]>(initialData);

  const updateNode = useCallback((id: string, updates: Partial<SyllabusNode>) => {
    const recurse = (list: SyllabusNode[]): SyllabusNode[] => 
      list.map(node => {
        if (node.id === id) return { ...node, ...updates };
        return { ...node, children: recurse(node.children) };
      });
    setNodes(prev => recurse(prev));
  }, []);

  const toggleDelete = useCallback((id: string) => {
    const recurse = (list: SyllabusNode[]): SyllabusNode[] =>
      list.map(node => {
        if (node.id === id) return { ...node, isDeleted: !node.isDeleted };
        return { ...node, children: recurse(node.children) };
      });
    setNodes(prev => recurse(prev));
  }, []);

  const addChild = useCallback((parentId: string | null) => {
    const newNode: SyllabusNode = {
      id: crypto.randomUUID(),
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
        if (node.id === parentId) return { ...node, children: [...node.children, newNode], isExpanded: true };
        return { ...node, children: recurse(node.children) };
      });
    setNodes(prev => recurse(prev));
  }, []);

  return { nodes, updateNode, toggleDelete, addChild };
};