export type ChannelRole = 'noc' | 'sys_admin' | 'pjc' | 'operator' | 'guest';

export type ChannelUserStatus =
  | 'active'
  | 'muted'
  | 'ptt_blocked'
  | 'chat_blocked'
  | 'suspended'
  | 'banned';

export function getGlobalRole(userId: string, displayName?: string, callSign?: string): 'noc' | 'sys_admin' | null {
  if (
    userId === 'noc_global' ||
    userId === 'Pebe Herianto' ||
    displayName === 'NOC Global' ||
    displayName === 'Pebe Herianto' ||
    callSign === 'NOC-01'
  ) {
    return 'noc';
  }
  
  if (
    userId === 'sys_admin_vwt' ||
    displayName === 'Sys Admin VWT' ||
    callSign === 'SYS-01'
  ) {
    return 'sys_admin';
  }
  
  return null;
}

export type ModerationAction =
  | 'VIEW_ADMIN_PANEL'
  | 'MANAGE_CHANNEL'
  | 'MANAGE_ROLES'
  | 'MANAGE_SETTINGS'
  | 'MUTE_USER'
  | 'KICK_USER'
  | 'BAN_USER'
  | 'BLOCK_PTT'
  | 'BLOCK_CHAT'
  | 'MANAGE_QUEUE'
  | 'MANAGE_THEME'
  | 'VIEW_LOGS';

export const roleRank: Record<ChannelRole, number> = {
  guest: 1,
  operator: 2,
  pjc: 3,
  sys_admin: 4,
  noc: 5,
};

/**
 * Checks if actor role is strictly higher than target role rank.
 */
export function isHigherRole(actor: ChannelRole, target: ChannelRole): boolean {
  return roleRank[actor] > roleRank[target];
}

/**
 * Checks if an actor can moderate a target user based on their roles.
 * - NOC can moderate everyone except other NOCs
 * - Sys Admin can moderate everyone except NOCs and other Sys Admins
 * - PJC can moderate Operators and Guests
 * - Operators and Guests cannot moderate anyone
 */
export function canModerateRole(actor: ChannelRole, target: ChannelRole): boolean {
  if (actor === 'noc') return target !== 'noc';
  if (actor === 'sys_admin') return target !== 'noc' && target !== 'sys_admin';
  if (actor === 'pjc') return target === 'operator' || target === 'guest';
  return false;
}

/**
 * Checks if a role is permitted to perform a general moderation/admin action.
 */
export function canPerformAction(role: ChannelRole, action: ModerationAction): boolean {
  const permissions: Record<ChannelRole, ModerationAction[]> = {
    noc: [
      'VIEW_ADMIN_PANEL',
      'MANAGE_CHANNEL',
      'MANAGE_ROLES',
      'MANAGE_SETTINGS',
      'MUTE_USER',
      'KICK_USER',
      'BAN_USER',
      'BLOCK_PTT',
      'BLOCK_CHAT',
      'MANAGE_QUEUE',
      'MANAGE_THEME',
      'VIEW_LOGS',
    ],
    sys_admin: [
      'VIEW_ADMIN_PANEL',
      'MANAGE_CHANNEL',
      'MANAGE_ROLES',
      'MANAGE_SETTINGS',
      'MUTE_USER',
      'KICK_USER',
      'BAN_USER',
      'BLOCK_PTT',
      'BLOCK_CHAT',
      'MANAGE_QUEUE',
      'MANAGE_THEME',
      'VIEW_LOGS',
    ],
    pjc: [
      'VIEW_ADMIN_PANEL',
      'MANAGE_ROLES', // Enabled so PJC can change roles of operators & guests
      'MANAGE_SETTINGS',
      'MUTE_USER',
      'KICK_USER',
      'BAN_USER',
      'BLOCK_PTT',
      'BLOCK_CHAT',
      'MANAGE_QUEUE',
      'MANAGE_THEME',
      'VIEW_LOGS',
    ],
    operator: ['VIEW_ADMIN_PANEL', 'MANAGE_QUEUE'],
    guest: [],
  };

  return permissions[role]?.includes(action) || false;
}

/**
 * Checks if a user is allowed to transmit voice via PTT.
 */
export function canUsePTT(params: {
  role: ChannelRole;
  status: string;
  allowGuestPTT: boolean;
}): boolean {
  const { role, status, allowGuestPTT } = params;

  if (status === 'muted') return false;
  if (status === 'ptt_blocked') return false;
  if (status === 'banned') return false;
  if (status === 'suspended') return false;

  if (role === 'guest' && !allowGuestPTT) return false;

  return true;
}

/**
 * Checks if a user is allowed to send chat messages.
 */
export function canUseChat(params: {
  role: ChannelRole;
  status: string;
  allowGuestChat: boolean;
}): boolean {
  const { role, status, allowGuestChat } = params;

  if (status === 'muted') return false;
  if (status === 'chat_blocked') return false;
  if (status === 'banned') return false;
  if (status === 'suspended') return false;

  if (role === 'guest' && !allowGuestChat) return false;

  return true;
}

/**
 * Checks if a user is allowed to trigger reaction animations/sounds.
 */
export function canUseReaction(params: {
  role: ChannelRole;
  status: string;
  allowGuestReaction: boolean;
}): boolean {
  const { role, status, allowGuestReaction } = params;

  if (status === 'muted') return false;
  if (status === 'banned') return false;
  if (status === 'suspended') return false;

  if (role === 'guest' && !allowGuestReaction) return false;

  return true;
}
