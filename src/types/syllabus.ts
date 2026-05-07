export interface SyllabusNode {
  id: string; // Stable UUID
  title: string;
  estimatedHours: number;
  targetDate?: string;
  outcome?: string;
  isDeleted: boolean;
  isExpanded?: boolean; // UX Fix: Collapse/Expand system
  children: SyllabusNode[];
}

export interface SubjectOverviewBlock {
  id: string;
  heading: string;
  content: string;
}