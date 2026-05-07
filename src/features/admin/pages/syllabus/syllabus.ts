export interface SyllabusNode {
  id: string;
  title: string;
  estimatedHours?: number;
  targetDate?: string;
  outcome?: string;
  isDeleted?: boolean;
  isExpanded?: boolean;
  children: SyllabusNode[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'note' | 'assignment';
  url?: string;
}

export interface Resource {
  id: string;
  title: string;

  type:
    | 'pdf'
    | 'video'
    | 'link'
    | 'note'
    | 'assignment';

  url?: string;
}

export interface Question {
  id: string;

  question: string;

  difficulty:
    | 'easy'
    | 'medium'
    | 'hard';

  marks?: number;

  type:
    | 'mcq'
    | 'short'
    | 'long';
}

export interface SubjectOverviewBlock {
  id: string;

  type:
    | 'introduction'
    | 'objectives'
    | 'exam-pattern'
    | 'important-topics'
    | 'practical-info'
    | 'reference-books'
    | 'custom';

  heading: string;

  content: string;

  order: number;
}

export interface Topic {
  id: string;

  title: string;

  description?: string;

  estimatedHours?: number;

  completed?: boolean;

  completionDate?: string;

  importance?: number;

  resources?: Resource[];

  questions?: Question[];

  children?: Topic[];
}

export interface Chapter {
  id: string;

  title: string;

  description?: string;

  estimatedHours?: number;

  completedHours?: number;

  estimatedDays?: number;

  completionPercentage?: number;

  expectedCompletionDate?: string;

  difficulty?:
    | 'easy'
    | 'medium'
    | 'hard';

  status?:
    | 'not-started'
    | 'in-progress'
    | 'completed';

  topics: Topic[];
}

export interface Subject {
  id: string;

  name: string;

  code?: string;

  color?: string;

  description?: string;

  estimatedHours?: number;

  completionPercentage?: number;

  expectedCompletionDate?: string;

  overviewBlocks?: SubjectOverviewBlock[];

  chapters: Chapter[];
}
