import { AdminRole } from '../types';

export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD:       ['super_admin', 'admin',],
  // Users
  VIEW_USERS:           ['super_admin', 'admin', 'support'],
  MANAGE_USERS:         ['super_admin', 'admin'],
  DELETE_USERS:         ['super_admin'],
  // Revenue
  VIEW_REVENUE:         ['super_admin', 'admin'],
  // Analytics
  VIEW_ANALYTICS:       ['super_admin', 'admin', 'developer'],
  // Support
  VIEW_SUPPORT:         ['super_admin', 'admin', 'support', 'developer'],
  MANAGE_SUPPORT:       ['super_admin', 'admin', 'support', 'developer'],
  // Chat
  VIEW_CHAT:            ['super_admin', 'admin', 'support', 'developer'],
  // Affiliates
  VIEW_AFFILIATES:      ['super_admin', 'admin','support'],
  MANAGE_AFFILIATES:    ['super_admin', 'admin','support'],
  // Admins
  VIEW_ADMINS:          ['super_admin'],
  MANAGE_ADMINS:        ['super_admin'],
  // Logs
  VIEW_LOGS:            ['super_admin', 'admin'],
  // Error Logs
  VIEW_ERROR_LOGS: ['super_admin', 'admin', 'developer'],
  // Settings
  VIEW_SETTINGS:        ['super_admin', 'developer'],
  MANAGE_SETTINGS:      ['super_admin'],
  // Plans
  VIEW_PLANS:        ['super_admin', 'admin'],
  MANAGE_PLANS:      ['super_admin'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}

export function canAccess(role: AdminRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}
