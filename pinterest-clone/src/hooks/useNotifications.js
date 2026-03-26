// src/hooks/useNotifications.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('notifications')
      .select(
        '*, actor:actor_id(username,display_name,avatar_url), pin:pin_id(id,thumb_url,title)',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        const notifs = data ?? [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.is_read).length);
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('notifications:' + userId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: 'user_id=eq.' + userId,
        },
        async (payload) => {
          const { data } = await supabase
            .from('notifications')
            .select(
              '*, actor:actor_id(username,display_name,avatar_url), pin:pin_id(id,thumb_url,title)',
            )
            .eq('id', payload.new.id)
            .single();
          if (data) {
            setNotifications((prev) => [data, ...prev]);
            setUnreadCount((c) => c + 1);
          }
        },
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [userId]);

  async function markAllRead() {
    if (!userId) return;
    await supabase.rpc('mark_notifications_read', { for_user: userId });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  async function markOneRead(notifId) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  return { notifications, unreadCount, loading, markAllRead, markOneRead };
}
