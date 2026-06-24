import { getSupabase } from '../../app/utils/supabase';
import type { ChannelRole } from './permissions';
import { canPerformAction, canModerateRole, roleRank } from './permissions';

interface ModerationContext {
  roomId: string;
  actorId: string;
  actorRole: ChannelRole;
}

export function useModerationActions({ roomId, actorId, actorRole }: ModerationContext) {
  async function callEdgeFunction(
    action: string,
    targetUserId?: string,
    payload?: Record<string, unknown>
  ) {
    try {
      const supabaseInstance = await getSupabase();
      const { data, error } = await supabaseInstance.functions.invoke('moderate-channel', {
        body: {
          action,
          room_id: roomId,
          target_user_id: targetUserId || null,
          actor_user_id: actorId,
          payload: payload || {},
        },
      });

      if (error) {
        console.error(`Edge function error for ${action}:`, error);
        throw new Error(
          error.message || `Gagal mengeksekusi tindakan moderasi ${action} di server.`
        );
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`Error calling moderate-channel function for ${action}:`, err);
      throw err;
    }
  }

  async function setUserRole(
    targetUserId: string,
    targetCurrentRole: ChannelRole = 'guest',
    nextRole: ChannelRole
  ) {
    if (!canPerformAction(actorRole, 'MANAGE_ROLES')) {
      throw new Error('Anda tidak memiliki izin untuk mengelola role.');
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error(
        'Anda tidak bisa mengubah role user dengan tingkat setara atau lebih tinggi.'
      );
    }

    if (roleRank[nextRole] >= roleRank[actorRole]) {
      throw new Error(
        'Anda tidak bisa menunjuk user ke role yang setara atau lebih tinggi dari role Anda.'
      );
    }

    await callEdgeFunction('SET_USER_ROLE', targetUserId, { nextRole });
  }

  async function muteUser(
    targetUserId: string,
    targetCurrentRole: ChannelRole = 'guest',
    minutes = 15
  ) {
    if (!canPerformAction(actorRole, 'MUTE_USER')) {
      throw new Error('Anda tidak memiliki izin untuk melakukan mute.');
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error('Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.');
    }

    await callEdgeFunction('MUTE_USER', targetUserId, { minutes });
  }

  async function unmuteUser(targetUserId: string, targetCurrentRole: ChannelRole = 'guest') {
    if (!canPerformAction(actorRole, 'MUTE_USER')) {
      throw new Error('Anda tidak memiliki izin untuk membatalkan mute.');
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error('Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.');
    }

    await callEdgeFunction('UNMUTE_USER', targetUserId);
  }

  async function blockPTT(
    targetUserId: string,
    targetCurrentRole: ChannelRole = 'guest',
    minutes = 15
  ) {
    if (!canPerformAction(actorRole, 'BLOCK_PTT')) {
      throw new Error('Anda tidak memiliki izin untuk memblokir PTT.');
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error('Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.');
    }

    await callEdgeFunction('BLOCK_PTT', targetUserId, { minutes });
  }

  async function unblockPTT(targetUserId: string, targetCurrentRole: ChannelRole = 'guest') {
    if (!canPerformAction(actorRole, 'BLOCK_PTT')) {
      throw new Error('Anda tidak memiliki izin untuk membuka blokir PTT.');
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error('Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.');
    }

    await callEdgeFunction('UNBLOCK_PTT', targetUserId);
  }

  async function blockChat(
    targetUserId: string,
    targetCurrentRole: ChannelRole = 'guest',
    minutes = 15
  ) {
    if (!canPerformAction(actorRole, 'BLOCK_CHAT')) {
      throw new Error('Anda tidak memiliki izin untuk memblokir Chat.');
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error('Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.');
    }

    await callEdgeFunction('BLOCK_CHAT', targetUserId, { minutes });
  }

  async function unblockChat(targetUserId: string, targetCurrentRole: ChannelRole = 'guest') {
    if (!canPerformAction(actorRole, 'BLOCK_CHAT')) {
      throw new Error('Anda tidak memiliki izin untuk membuka blokir Chat.');
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error('Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.');
    }

    await callEdgeFunction('UNBLOCK_CHAT', targetUserId);
  }

  async function kickUser(targetUserId: string, targetCurrentRole: ChannelRole = 'guest') {
    if (!canPerformAction(actorRole, 'KICK_USER')) {
      throw new Error('Anda tidak memiliki izin untuk melakukan kick.');
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error('Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.');
    }

    const supabaseInstance = await getSupabase();
    const channel = supabaseInstance.channel(`room:${roomId}:moderation`);

    await new Promise<void>((resolve, reject) => {
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await channel.send({
              type: 'broadcast',
              event: 'kick',
              payload: {
                roomId,
                targetUserId,
                actorId,
                createdAt: Date.now(),
              },
            });
            supabaseInstance.removeChannel(channel);
            resolve();
          } catch (err) {
            supabaseInstance.removeChannel(channel);
            reject(err);
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          supabaseInstance.removeChannel(channel);
          reject(new Error('Gagal menyambungkan channel realtime untuk kick broadcast'));
        }
      });
    });

    await callEdgeFunction('KICK_USER', targetUserId);
  }

  async function banUser(
    targetUserId: string,
    targetCurrentRole: ChannelRole = 'guest',
    reason = '',
    minutes = 0
  ) {
    if (!canPerformAction(actorRole, 'BAN_USER')) {
      throw new Error('Anda tidak memiliki izin untuk melakukan ban.');
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error('Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.');
    }

    await callEdgeFunction('BAN_USER', targetUserId, { reason, minutes });

    // 3. Kick user keluar secara realtime
    await kickUser(targetUserId, targetCurrentRole);
  }

  async function unbanUser(targetUserId: string) {
    if (!canPerformAction(actorRole, 'BAN_USER')) {
      throw new Error('Anda tidak memiliki izin untuk membatalkan ban.');
    }

    await callEdgeFunction('UNBAN_USER', targetUserId);
  }

  return {
    setUserRole,
    muteUser,
    unmuteUser,
    blockPTT,
    unblockPTT,
    blockChat,
    unblockChat,
    kickUser,
    banUser,
    unbanUser,
  };
}
