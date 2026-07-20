import { useCallback, useEffect, useState } from 'react';
import { usePTTStore } from '../store/usePTTStore';
import { useReactionSounds } from './useReactionSounds';

interface FloatingReaction {
  id: string;
  category?: string;
  reaction: string;
  x: number;
  senderName?: string;
}

/**
 * Handles reaction broadcast/receive and the floating reaction overlay.
 *
 * Extracted from useRadioOrchestrator so the orchestrator stays a thin
 * composition root. Reaction timeouts are tracked and cleared on unmount to
 * avoid dangling timers in long sessions.
 */
export function useRadioReactions(isPowerOn: boolean, infoText: string, channel: number) {
  const broadcastReaction = usePTTStore((state) => state.broadcastReaction);
  const setOnReactionReceived = usePTTStore((state) => state.setOnReactionReceived);
  const { playReactionSound } = useReactionSounds();

  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const timersRef = useState(() => new Map<string, ReturnType<typeof setTimeout>>())[0];

  useEffect(() => {
    return () => {
      timersRef.forEach((t) => clearTimeout(t));
      timersRef.clear();
    };
  }, [timersRef]);

  const scheduleRemoval = useCallback(
    (id: string, reactionType: string) => {
      const isVideo = reactionType === 'lion' || reactionType === 'aquarium';
      const isKetawa = reactionType === 'ketawa_nular' || reactionType === 'ketawa_anjay';
      const ttl = isVideo ? 60000 : isKetawa ? 12000 : 5000;
      const existing = timersRef.get(id);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
        timersRef.delete(id);
      }, ttl);
      timersRef.set(id, timer);
    },
    [timersRef]
  );

  const handleSendReaction = (category: 'animation' | 'sound' | 'gift', reactionType: string) => {
    if (!isPowerOn) return;
    // Guard special channels — no reactions on echo/test/support channels.
    if (channel === 100 || channel === 0) return;

    if (category === 'sound') {
      playReactionSound(reactionType);
    }

    const localDisplayName = infoText || 'Saya';
    const localId = Math.random().toString();
    const x = 30 + Math.random() * 40;
    setFloatingReactions((prev) => [
      ...prev,
      { id: localId, category, reaction: reactionType, x, senderName: localDisplayName },
    ]);
    scheduleRemoval(localId, reactionType);

    broadcastReaction(category, reactionType);
  };

  useEffect(() => {
    setOnReactionReceived((payload) => {
      if (!isPowerOn) return;
      const state = usePTTStore.getState();
      const isSelf =
        payload.senderId === state.userId &&
        (!payload.senderCallSign || payload.senderCallSign === state.callSign);
      if (isSelf) return;

      if (payload.category === 'sound') {
        playReactionSound(payload.reaction);
      }

      const id = payload.id || Math.random().toString();
      const x = 30 + Math.random() * 40;
      const senderName = payload.senderName || 'User';
      setFloatingReactions((prev) => [
        ...prev,
        { id, category: payload.category, reaction: payload.reaction, x, senderName },
      ]);
      scheduleRemoval(id, payload.reaction);
    });
    return () => {
      setOnReactionReceived(null);
    };
  }, [isPowerOn, setOnReactionReceived, playReactionSound, timersRef, scheduleRemoval]);

  return { floatingReactions, handleSendReaction };
}
