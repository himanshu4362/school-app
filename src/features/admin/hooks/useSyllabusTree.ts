import { useState, useCallback } from 'react';
import { SyllabusNode } from '../../../types/academic/academic.schema';


export const useSyllabusTree = (initialData: SyllabusNode[]) => {
  const [nodes, setNodes] = useState<SyllabusNode[]>(initialData);

  const updateNode = useCallback((id: string, field: keyof SyllabusNode, value: any) => {
    const recurse = (list: SyllabusNode[]): SyllabusNode[] =>
      list.map(node => {
        if (node.id === id) return { ...node, [field]: value };
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

  const addChild = useCallback((parentId: string | null, type: 'chapter' | 'topic' | 'subtopic') => {
    const newNode: SyllabusNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      hours: '',
      outcome: '',
      isDeleted: false,
      children: []
    };

    if (!parentId) {
      setNodes(prev => [...prev, newNode]);
      return;
    }

    const recurse = (list: SyllabusNode[]): SyllabusNode[] =>
      list.map(node => {
        if (node.id === parentId) return { ...node, children: [...node.children, newNode] };
        return { ...node, children: recurse(node.children) };
      });
    setNodes(prev => recurse(prev));
  }, []);

  // --- THE SMART CALCULATOR ---
  const calculateMetrics = useCallback((node: SyllabusNode) => {
    let totalHours = 0;
    const startDates: number[] = [];
    const endDates: number[] = [];

    const activeChildren = node.children.filter(c => !c.isDeleted);
    
    // Aggregate from children if they exist
    if (activeChildren.length > 0) {
      activeChildren.forEach(child => {
        const childMetrics = calculateMetrics(child);
        totalHours += childMetrics.totalHours;
        if (childMetrics.startDate) startDates.push(new Date(childMetrics.startDate).getTime());
        if (childMetrics.endDate) endDates.push(new Date(childMetrics.endDate).getTime());
      });
    } else {
      // Use manual inputs if no children
      totalHours = Number(node.hours) || 0;
      if (node.startDate) startDates.push(new Date(node.startDate).getTime());
      if (node.endDate) endDates.push(new Date(node.endDate).getTime());
    }

    const startDate = startDates.length ? new Date(Math.min(...startDates)).toISOString().split('T')[0] : '';
    const endDate = endDates.length ? new Date(Math.max(...endDates)).toISOString().split('T')[0] : '';

    // Calculate Days Automatically
    let totalDays = 0;
    if (startDate && endDate) {
      const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
      totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    }

    return { totalHours, startDate, endDate, totalDays };
  }, []);

  return { nodes, updateNode, toggleDelete, addChild, calculateMetrics };
};