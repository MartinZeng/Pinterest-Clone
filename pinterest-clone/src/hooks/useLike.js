// src/hooks/useLike.js
// Optimistic like/unlike hook with Supabase sync.

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useLike(pinId, initialLikeCount = 0) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Check if the current user has liked this pin on mount
  useEffect(() => {
    async function checkLiked() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('pin_likes')
        .select('user_id')
        .eq('pin_id', pinId)
        .eq('user_id', user.id)
        .maybeSingle();

      setLiked(!!data);
    }
    if (pinId) checkLiked();
  }, [pinId]);

  async function toggleLike() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || loading) return;

    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    setLoading(true);

    try {
      if (wasLiked) {
        await supabase
          .from('pin_likes')
          .delete()
          .eq('pin_id', pinId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('pin_likes')
          .insert({ pin_id: pinId, user_id: user.id });
      }
      // Invalidate feed so counts stay fresh on next load
      queryClient.invalidateQueries({ queryKey: ['pins'] });
    } catch {
      // Revert on error
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
    } finally {
      setLoading(false);
    }
  }

  return { liked, likeCount, toggleLike, loading };
}
