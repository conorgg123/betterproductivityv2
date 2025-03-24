import { QuadrantInfo } from '@/types/task';
import colors from '@/constants/colors';

export const quadrants: QuadrantInfo[] = [
  {
    id: 'do',
    title: 'Do',
    description: 'Urgent & Important',
    color: colors.urgent_important,
    icon: 'AlertTriangle'
  },
  {
    id: 'schedule',
    title: 'Schedule',
    description: 'Important, Not Urgent',
    color: colors.not_urgent_important,
    icon: 'Calendar'
  },
  {
    id: 'delegate',
    title: 'Delegate',
    description: 'Urgent, Not Important',
    color: colors.urgent_not_important,
    icon: 'Users'
  },
  {
    id: 'eliminate',
    title: 'Eliminate',
    description: 'Not Urgent or Important',
    color: colors.not_urgent_not_important,
    icon: 'Trash'
  }
];

export const getQuadrantInfo = (id: string): QuadrantInfo => {
  return quadrants.find(q => q.id === id) || quadrants[0];
};