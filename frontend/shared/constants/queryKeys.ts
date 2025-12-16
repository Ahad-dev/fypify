/**
 * Centralized Query Keys for React Query
 * 
 * Using a factory pattern for type-safe and organized query keys.
 * This helps with cache invalidation and query management.
 */

export const QUERY_KEYS = {
  // ============ AUTH ============
  auth: {
    all: ['auth'] as const,
    me: () => [...QUERY_KEYS.auth.all, 'me'] as const,
    session: () => [...QUERY_KEYS.auth.all, 'session'] as const,
  },

  // ============ ADMIN ============
  admin: {
    all: ['admin'] as const,
    // Document Types
    documentTypes: {
      all: () => [...QUERY_KEYS.admin.all, 'documentTypes'] as const,
      list: () => [...QUERY_KEYS.admin.documentTypes.all(), 'list'] as const,
      active: () => [...QUERY_KEYS.admin.documentTypes.all(), 'active'] as const,
      detail: (id: string) => [...QUERY_KEYS.admin.documentTypes.all(), 'detail', id] as const,
    },
    // Audit Logs
    auditLogs: {
      all: () => [...QUERY_KEYS.admin.all, 'auditLogs'] as const,
      list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.admin.auditLogs.all(), 'list', filters] as const,
      byActor: (actorId: string) => [...QUERY_KEYS.admin.auditLogs.all(), 'actor', actorId] as const,
      byAction: (action: string) => [...QUERY_KEYS.admin.auditLogs.all(), 'action', action] as const,
    },
    // System Settings
    settings: {
      all: () => [...QUERY_KEYS.admin.all, 'settings'] as const,
      list: () => [...QUERY_KEYS.admin.settings.all(), 'list'] as const,
      detail: (key: string) => [...QUERY_KEYS.admin.settings.all(), 'detail', key] as const,
    },
  },

  // ============ USERS ============
  users: {
    all: ['users'] as const,
    lists: () => [...QUERY_KEYS.users.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.users.lists(), filters] as const,
    details: () => [...QUERY_KEYS.users.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.users.details(), id] as const,
    profile: (id: string) => [...QUERY_KEYS.users.all, 'profile', id] as const,
  },

  // ============ PROJECTS ============
  projects: {
    all: ['projects'] as const,
    lists: () => [...QUERY_KEYS.projects.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.projects.lists(), filters] as const,
    details: () => [...QUERY_KEYS.projects.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.projects.details(), id] as const,
    members: (projectId: string) => [...QUERY_KEYS.projects.all, projectId, 'members'] as const,
    tasks: (projectId: string) => [...QUERY_KEYS.projects.all, projectId, 'tasks'] as const,
    milestones: (projectId: string) => [...QUERY_KEYS.projects.all, projectId, 'milestones'] as const,
    meetings: (projectId: string) => [...QUERY_KEYS.projects.all, projectId, 'meetings'] as const,
    submissions: (projectId: string) => [...QUERY_KEYS.projects.all, projectId, 'submissions'] as const,
    my: () => [...QUERY_KEYS.projects.all, 'my'] as const,
    pending: () => [...QUERY_KEYS.projects.all, 'pending'] as const,
    byGroup: (groupId: string) => [...QUERY_KEYS.projects.all, 'byGroup', groupId] as const,
    stats: () => [...QUERY_KEYS.projects.all, 'stats'] as const,
  },

  // ============ GROUPS ============
  groups: {
    all: ['groups'] as const,
    lists: () => [...QUERY_KEYS.groups.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.groups.lists(), filters] as const,
    details: () => [...QUERY_KEYS.groups.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.groups.details(), id] as const,
    members: (groupId: string) => [...QUERY_KEYS.groups.all, groupId, 'members'] as const,
    requests: (groupId: string) => [...QUERY_KEYS.groups.all, groupId, 'requests'] as const,
    my: () => [...QUERY_KEYS.groups.all, 'my'] as const,
    available: () => [...QUERY_KEYS.groups.all, 'available'] as const,
    invites: {
      all: () => [...QUERY_KEYS.groups.all, 'invites'] as const,
      group: (groupId: string) => [...QUERY_KEYS.groups.invites.all(), 'group', groupId] as const,
      my: () => [...QUERY_KEYS.groups.invites.all(), 'my'] as const,
    },
    availableStudents: (search?: string) => [...QUERY_KEYS.groups.all, 'availableStudents', search] as const,
  },

  // ============ PROPOSALS ============
  proposals: {
    all: ['proposals'] as const,
    lists: () => [...QUERY_KEYS.proposals.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.proposals.lists(), filters] as const,
    details: () => [...QUERY_KEYS.proposals.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.proposals.details(), id] as const,
    my: () => [...QUERY_KEYS.proposals.all, 'my'] as const,
    pending: () => [...QUERY_KEYS.proposals.all, 'pending'] as const,
  },

  // ============ TASKS ============
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...QUERY_KEYS.tasks.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.tasks.lists(), filters] as const,
    details: () => [...QUERY_KEYS.tasks.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.tasks.details(), id] as const,
    my: () => [...QUERY_KEYS.tasks.all, 'my'] as const,
  },

  // ============ MEETINGS ============
  meetings: {
    all: ['meetings'] as const,
    lists: () => [...QUERY_KEYS.meetings.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.meetings.lists(), filters] as const,
    details: () => [...QUERY_KEYS.meetings.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.meetings.details(), id] as const,
    upcoming: () => [...QUERY_KEYS.meetings.all, 'upcoming'] as const,
  },

  // ============ MILESTONES ============
  milestones: {
    all: ['milestones'] as const,
    lists: () => [...QUERY_KEYS.milestones.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.milestones.lists(), filters] as const,
    details: () => [...QUERY_KEYS.milestones.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.milestones.details(), id] as const,
    active: () => [...QUERY_KEYS.milestones.all, 'active'] as const,
  },

  // ============ EVALUATIONS ============
  evaluations: {
    all: ['evaluations'] as const,
    lists: () => [...QUERY_KEYS.evaluations.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.evaluations.lists(), filters] as const,
    details: () => [...QUERY_KEYS.evaluations.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.evaluations.details(), id] as const,
    rubrics: () => [...QUERY_KEYS.evaluations.all, 'rubrics'] as const,
    rubric: (id: string) => [...QUERY_KEYS.evaluations.rubrics(), id] as const,
  },

  // ============ NOTIFICATIONS ============
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...QUERY_KEYS.notifications.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.notifications.lists(), filters] as const,
    unread: () => [...QUERY_KEYS.notifications.all, 'unread'] as const,
    count: () => [...QUERY_KEYS.notifications.all, 'count'] as const,
  },

  // ============ SEMESTERS ============
  semesters: {
    all: ['semesters'] as const,
    lists: () => [...QUERY_KEYS.semesters.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.semesters.lists(), filters] as const,
    details: () => [...QUERY_KEYS.semesters.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.semesters.details(), id] as const,
    current: () => [...QUERY_KEYS.semesters.all, 'current'] as const,
  },

  // ============ DEPARTMENTS ============
  departments: {
    all: ['departments'] as const,
    lists: () => [...QUERY_KEYS.departments.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.departments.lists(), filters] as const,
    details: () => [...QUERY_KEYS.departments.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.departments.details(), id] as const,
  },

  // ============ STATISTICS / DASHBOARD ============
  statistics: {
    all: ['statistics'] as const,
    dashboard: () => [...QUERY_KEYS.statistics.all, 'dashboard'] as const,
    overview: () => [...QUERY_KEYS.statistics.all, 'overview'] as const,
    projects: () => [...QUERY_KEYS.statistics.all, 'projects'] as const,
  },
} as const;

// Type helper for extracting query key types
export type QueryKeyType<T extends (...args: unknown[]) => readonly unknown[]> = ReturnType<T>;
