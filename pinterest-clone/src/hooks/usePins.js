// src/hooks/usePins.js
// Infinite scroll data fetching for the discovery feed.
// Uses TanStack Query's useInfiniteQuery for automatic pagination.

import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 20;

async function fetchPins({ pageParam = 0, userId }) {
  // If user is logged in, use the personalised discovery feed RPC.
  // Otherwise fall back to a simple newest-first query.
  if (userId) {
    const { data, error } = await supabase.rpc('discovery_feed', {
      for_user: userId,
      lim: PAGE_SIZE,
      offset_: pageParam,
    });
    if (error) throw error;
    return data;
  }

  // Logged-out fallback: trending by save_count
  const { data, error } = await supabase
    .from('pins_with_author')
    .select('*')
    .order('save_count', { ascending: false })
    .order('created_at', { ascending: false })
    .range(pageParam, pageParam + PAGE_SIZE - 1);

  if (error) throw error;
  return data;
}

export function usePins(userId) {
  return useInfiniteQuery({
    queryKey: ['pins', 'feed', userId],
    queryFn: ({ pageParam }) => fetchPins({ pageParam, userId }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If we got fewer results than PAGE_SIZE, we've reached the end
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// ── Search ────────────────────────────────────────────────────
async function searchPins({ pageParam = 0, query }) {
  const { data, error } = await supabase.rpc('search_pins', {
    query,
    lim: PAGE_SIZE,
    offset_: pageParam,
  });
  if (error) throw error;
  return data;
}

export function useSearchPins(query) {
  return useInfiniteQuery({
    queryKey: ['pins', 'search', query],
    queryFn: ({ pageParam }) => searchPins({ pageParam, query }),
    initialPageParam: 0,
    enabled: !!query && query.length > 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ── Save / unsave a pin ───────────────────────────────────────
export async function savePin({ boardId, pinId, userId }) {
  const { error } = await supabase
    .from('board_pins')
    .insert({ board_id: boardId, pin_id: pinId, saved_by: userId });
  if (error) throw error;
}

export async function unsavePin({ boardId, pinId }) {
  const { error } = await supabase
    .from('board_pins')
    .delete()
    .eq('board_id', boardId)
    .eq('pin_id', pinId);
  if (error) throw error;
}

// ── User boards (for save picker) ────────────────────────────
export async function fetchUserBoards(userId) {
  const { data, error } = await supabase
    .from('boards')
    .select('id, name, cover_url, pin_count')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}
