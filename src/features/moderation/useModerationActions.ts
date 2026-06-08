import { getSupabase } from "../../app/utils/supabase";
import type { ChannelRole } from "./permissions";
import { canPerformAction, canModerateRole, roleRank } from "./permissions";

interface ModerationContext {
  roomId: string;
  actorId: string;
  actorRole: ChannelRole;
}

export function useModerationActions({
  roomId,
  actorId,
  actorRole,
}: ModerationContext) {
  
  async function logAction(
    action: string,
    targetUserId?: string,
    detail?: Record<string, any>
  ) {
    try {
      const supabaseInstance = await getSupabase();
      await supabaseInstance.from("channel_moderation_logs").insert({
        room_id: roomId,
        actor_id: actorId,
        actor_role: actorRole,
        target_user_id: targetUserId || null,
        action,
        detail: detail || {},
      });
    } catch (err) {
      console.error("Failed to log moderation action:", err);
    }
  }

  async function setUserRole(
    targetUserId: string,
    targetCurrentRole: ChannelRole = "guest",
    nextRole: ChannelRole
  ) {
    if (!canPerformAction(actorRole, "MANAGE_ROLES")) {
      throw new Error("Anda tidak memiliki izin untuk mengelola role.");
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error("Anda tidak bisa mengubah role user dengan tingkat setara atau lebih tinggi.");
    }

    if (roleRank[nextRole] >= roleRank[actorRole]) {
      throw new Error("Anda tidak bisa menunjuk user ke role yang setara atau lebih tinggi dari role Anda.");
    }

    const supabaseInstance = await getSupabase();
    const { error } = await supabaseInstance.from("channel_roles").upsert({
      room_id: roomId,
      user_id: targetUserId,
      role: nextRole,
      status: "active",
      assigned_by: actorId,
      assigned_at: new Date().toISOString(),
    });

    if (error) throw error;

    await logAction("SET_USER_ROLE", targetUserId, {
      previousRole: targetCurrentRole,
      nextRole,
    });
  }

  async function muteUser(
    targetUserId: string,
    targetCurrentRole: ChannelRole = "guest",
    minutes = 15
  ) {
    if (!canPerformAction(actorRole, "MUTE_USER")) {
      throw new Error("Anda tidak memiliki izin untuk melakukan mute.");
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error("Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.");
    }

    const expiresAt = minutes > 0 
      ? new Date(Date.now() + minutes * 60_000).toISOString()
      : null;

    const supabaseInstance = await getSupabase();
    const { error } = await supabaseInstance.from("channel_roles").upsert({
      room_id: roomId,
      user_id: targetUserId,
      status: "muted",
      expires_at: expiresAt,
      assigned_by: actorId,
      assigned_at: new Date().toISOString(),
    });

    if (error) throw error;

    await logAction("MUTE_USER", targetUserId, { minutes, expiresAt });
  }

  async function unmuteUser(
    targetUserId: string,
    targetCurrentRole: ChannelRole = "guest"
  ) {
    if (!canPerformAction(actorRole, "MUTE_USER")) {
      throw new Error("Anda tidak memiliki izin untuk membatalkan mute.");
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error("Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.");
    }

    const supabaseInstance = await getSupabase();
    const { error } = await supabaseInstance.from("channel_roles").upsert({
      room_id: roomId,
      user_id: targetUserId,
      status: "active",
      expires_at: null,
      assigned_by: actorId,
      assigned_at: new Date().toISOString(),
    });

    if (error) throw error;

    await logAction("UNMUTE_USER", targetUserId);
  }

  async function blockPTT(
    targetUserId: string,
    targetCurrentRole: ChannelRole = "guest",
    minutes = 15
  ) {
    if (!canPerformAction(actorRole, "BLOCK_PTT")) {
      throw new Error("Anda tidak memiliki izin untuk memblokir PTT.");
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error("Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.");
    }

    const expiresAt = minutes > 0 
      ? new Date(Date.now() + minutes * 60_000).toISOString()
      : null;

    const supabaseInstance = await getSupabase();
    const { error } = await supabaseInstance.from("channel_roles").upsert({
      room_id: roomId,
      user_id: targetUserId,
      status: "ptt_blocked",
      expires_at: expiresAt,
      assigned_by: actorId,
      assigned_at: new Date().toISOString(),
    });

    if (error) throw error;

    await logAction("BLOCK_PTT", targetUserId, { minutes, expiresAt });
  }

  async function unblockPTT(
    targetUserId: string,
    targetCurrentRole: ChannelRole = "guest"
  ) {
    if (!canPerformAction(actorRole, "BLOCK_PTT")) {
      throw new Error("Anda tidak memiliki izin untuk membuka blokir PTT.");
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error("Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.");
    }

    const supabaseInstance = await getSupabase();
    const { error } = await supabaseInstance.from("channel_roles").upsert({
      room_id: roomId,
      user_id: targetUserId,
      status: "active",
      expires_at: null,
      assigned_by: actorId,
      assigned_at: new Date().toISOString(),
    });

    if (error) throw error;

    await logAction("UNBLOCK_PTT", targetUserId);
  }

  async function blockChat(
    targetUserId: string,
    targetCurrentRole: ChannelRole = "guest",
    minutes = 15
  ) {
    if (!canPerformAction(actorRole, "BLOCK_CHAT")) {
      throw new Error("Anda tidak memiliki izin untuk memblokir Chat.");
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error("Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.");
    }

    const expiresAt = minutes > 0 
      ? new Date(Date.now() + minutes * 60_000).toISOString()
      : null;

    const supabaseInstance = await getSupabase();
    const { error } = await supabaseInstance.from("channel_roles").upsert({
      room_id: roomId,
      user_id: targetUserId,
      status: "chat_blocked",
      expires_at: expiresAt,
      assigned_by: actorId,
      assigned_at: new Date().toISOString(),
    });

    if (error) throw error;

    await logAction("BLOCK_CHAT", targetUserId, { minutes, expiresAt });
  }

  async function unblockChat(
    targetUserId: string,
    targetCurrentRole: ChannelRole = "guest"
  ) {
    if (!canPerformAction(actorRole, "BLOCK_CHAT")) {
      throw new Error("Anda tidak memiliki izin untuk membuka blokir Chat.");
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error("Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.");
    }

    const supabaseInstance = await getSupabase();
    const { error } = await supabaseInstance.from("channel_roles").upsert({
      room_id: roomId,
      user_id: targetUserId,
      status: "active",
      expires_at: null,
      assigned_by: actorId,
      assigned_at: new Date().toISOString(),
    });

    if (error) throw error;

    await logAction("UNBLOCK_CHAT", targetUserId);
  }

  async function kickUser(
    targetUserId: string,
    targetCurrentRole: ChannelRole = "guest"
  ) {
    if (!canPerformAction(actorRole, "KICK_USER")) {
      throw new Error("Anda tidak memiliki izin untuk melakukan kick.");
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error("Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.");
    }

    const supabaseInstance = await getSupabase();
    const channel = supabaseInstance.channel(`room:${roomId}:moderation`);
    
    await new Promise<void>((resolve, reject) => {
      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          try {
            await channel.send({
              type: "broadcast",
              event: "kick",
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
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          supabaseInstance.removeChannel(channel);
          reject(new Error("Gagal menyambungkan channel realtime untuk kick broadcast"));
        }
      });
    });

    await logAction("KICK_USER", targetUserId);
  }

  async function banUser(
    targetUserId: string,
    targetCurrentRole: ChannelRole = "guest",
    reason = "",
    minutes = 0
  ) {
    if (!canPerformAction(actorRole, "BAN_USER")) {
      throw new Error("Anda tidak memiliki izin untuk melakukan ban.");
    }

    if (!canModerateRole(actorRole, targetCurrentRole)) {
      throw new Error("Anda tidak bisa memoderasi user dengan tingkat setara atau lebih tinggi.");
    }

    const expiresAt = minutes > 0 
      ? new Date(Date.now() + minutes * 60_000).toISOString()
      : null;

    const supabaseInstance = await getSupabase();

    // 1. Simpan ke channel_bans
    const { error: banError } = await supabaseInstance.from("channel_bans").upsert({
      room_id: roomId,
      user_id: targetUserId,
      reason: reason || null,
      banned_by: actorId,
      banned_at: new Date().toISOString(),
      expires_at: expiresAt,
    });

    if (banError) throw banError;

    // 2. Set status di channel_roles agar konsisten
    await supabaseInstance.from("channel_roles").upsert({
      room_id: roomId,
      user_id: targetUserId,
      status: "banned",
      expires_at: expiresAt,
      assigned_by: actorId,
      assigned_at: new Date().toISOString(),
    });

    await logAction("BAN_USER", targetUserId, { reason, expiresAt });

    // 3. Kick user keluar secara realtime
    await kickUser(targetUserId, targetCurrentRole);
  }

  async function unbanUser(targetUserId: string) {
    if (!canPerformAction(actorRole, "BAN_USER")) {
      throw new Error("Anda tidak memiliki izin untuk membatalkan ban.");
    }

    const supabaseInstance = await getSupabase();

    // 1. Hapus dari channel_bans
    const { error: unbanError } = await supabaseInstance
      .from("channel_bans")
      .delete()
      .eq("room_id", roomId)
      .eq("user_id", targetUserId);

    if (unbanError) throw unbanError;

    // 2. Kembalikan status di channel_roles menjadi active
    await supabaseInstance.from("channel_roles").upsert({
      room_id: roomId,
      user_id: targetUserId,
      status: "active",
      expires_at: null,
      assigned_by: actorId,
      assigned_at: new Date().toISOString(),
    });

    await logAction("UNBAN_USER", targetUserId);
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
