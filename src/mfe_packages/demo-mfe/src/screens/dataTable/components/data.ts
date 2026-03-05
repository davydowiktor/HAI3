/**
 * Sample data and types for the DataTable screen demo.
 */

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
};

export const SAMPLE_TASKS: Task[] = [
  { id: 'TASK-001', title: 'Set up project scaffolding', status: TASK_STATUS.DONE, priority: TASK_PRIORITY.HIGH, createdAt: '2026-01-15' },
  { id: 'TASK-002', title: 'Design database schema', status: TASK_STATUS.DONE, priority: TASK_PRIORITY.HIGH, createdAt: '2026-01-16' },
  { id: 'TASK-003', title: 'Implement authentication module', status: TASK_STATUS.IN_PROGRESS, priority: TASK_PRIORITY.HIGH, createdAt: '2026-01-18' },
  { id: 'TASK-004', title: 'Create user profile page', status: TASK_STATUS.IN_PROGRESS, priority: TASK_PRIORITY.MEDIUM, createdAt: '2026-01-20' },
  { id: 'TASK-005', title: 'Add dark mode support', status: TASK_STATUS.TODO, priority: TASK_PRIORITY.LOW, createdAt: '2026-01-22' },
  { id: 'TASK-006', title: 'Write unit tests for API layer', status: TASK_STATUS.TODO, priority: TASK_PRIORITY.MEDIUM, createdAt: '2026-01-23' },
  { id: 'TASK-007', title: 'Optimize bundle size', status: TASK_STATUS.TODO, priority: TASK_PRIORITY.LOW, createdAt: '2026-01-25' },
  { id: 'TASK-008', title: 'Set up CI/CD pipeline', status: TASK_STATUS.DONE, priority: TASK_PRIORITY.HIGH, createdAt: '2026-01-26' },
  { id: 'TASK-009', title: 'Add error boundary components', status: TASK_STATUS.IN_PROGRESS, priority: TASK_PRIORITY.MEDIUM, createdAt: '2026-01-28' },
  { id: 'TASK-010', title: 'Implement search functionality', status: TASK_STATUS.TODO, priority: TASK_PRIORITY.MEDIUM, createdAt: '2026-01-30' },
  { id: 'TASK-011', title: 'Create notification system', status: TASK_STATUS.TODO, priority: TASK_PRIORITY.LOW, createdAt: '2026-02-01' },
  { id: 'TASK-012', title: 'Add localization support', status: TASK_STATUS.DONE, priority: TASK_PRIORITY.HIGH, createdAt: '2026-02-02' },
  { id: 'TASK-013', title: 'Performance audit and fixes', status: TASK_STATUS.CANCELLED, priority: TASK_PRIORITY.MEDIUM, createdAt: '2026-02-04' },
  { id: 'TASK-014', title: 'Migrate to new state management', status: TASK_STATUS.IN_PROGRESS, priority: TASK_PRIORITY.HIGH, createdAt: '2026-02-05' },
  { id: 'TASK-015', title: 'Add accessibility improvements', status: TASK_STATUS.TODO, priority: TASK_PRIORITY.MEDIUM, createdAt: '2026-02-07' },
  { id: 'TASK-016', title: 'Create onboarding wizard', status: TASK_STATUS.TODO, priority: TASK_PRIORITY.LOW, createdAt: '2026-02-08' },
  { id: 'TASK-017', title: 'Implement file upload feature', status: TASK_STATUS.CANCELLED, priority: TASK_PRIORITY.MEDIUM, createdAt: '2026-02-10' },
  { id: 'TASK-018', title: 'Add analytics dashboard', status: TASK_STATUS.TODO, priority: TASK_PRIORITY.LOW, createdAt: '2026-02-12' },
  { id: 'TASK-019', title: 'Refactor legacy API endpoints', status: TASK_STATUS.IN_PROGRESS, priority: TASK_PRIORITY.HIGH, createdAt: '2026-02-14' },
  { id: 'TASK-020', title: 'Set up monitoring and alerts', status: TASK_STATUS.TODO, priority: TASK_PRIORITY.MEDIUM, createdAt: '2026-02-15' },
];
