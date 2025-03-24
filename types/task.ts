export type QuadrantType = 'do' | 'schedule' | 'delegate' | 'eliminate';

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: QuadrantType;
  completed: boolean;
  createdAt: string;
  dueDate?: number;
  estimatedTime?: number; // in minutes
  assignedTo?: string;
  repeat?: RepeatType;
  preferredStartTime?: number; // in minutes from midnight (e.g., 9:00 AM = 540)
  preferredEndTime?: number; // in minutes from midnight
}

export interface QuadrantInfo {
  id: QuadrantType;
  title: string;
  description: string;
  color: string;
  icon: string;
}