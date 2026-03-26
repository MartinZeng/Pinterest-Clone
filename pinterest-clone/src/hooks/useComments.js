// src/hooks/useComments.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useComments(pinId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pinId) return;
    setLoading(true);
    supabase
      .from('comments_with_author')
      .select('*')
      .eq('pin_id', pinId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setComments(data ?? []);
        setLoading(false);
      });
  }, [pinId]);

  useEffect(() => {
    if (!pinId) return;
    const channel = supabase
      .channel(`comments:${pinId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `pin_id=eq.${pinId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('comments_with_author')
            .select('*')
            .eq('id', payload.new.id)
            .single();
          if (data) setComments((prev) => [...prev, data]);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `pin_id=eq.${pinId}`,
        },
        (payload) =>
          setComments((prev) => prev.filter((c) => c.id !== payload.old.id)),
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [pinId]);

  const addComment = useCallback(
    async (body) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !body.trim()) return;
      const { error } = await supabase
        .from('comments')
        .insert({ pin_id: pinId, user_id: user.id, body: body.trim() });
      if (error) throw error;
    },
    [pinId],
  );

  const deleteComment = useCallback(async (commentId) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    if (error) throw error;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  return { comments, loading, addComment, deleteComment };
}
