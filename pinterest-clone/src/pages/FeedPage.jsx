// src/pages/FeedPage.jsx
// Discovery feed with tag-based filtering, search, infinite scroll, pin modal.

import { useState, useCallback } from 'react';
import { useAuth } from '../lib/auth';
import { usePins, useSearchPins } from '../hooks/usePins';
import Navbar from '../components/layout/Navbar';
import MasonryGrid from '../components/feed/MasonryGrid';
import PinModal from '../components/pin/PinModal';
import PageTransition from '../components/ui/PageTransition';
import styles from './FeedPage.module.css';

// All available tag categories with emoji
const TAGS = [
  { label: 'All', value: null },
  { label: 'Architecture', value: 'architecture' },
  { label: 'Food', value: 'food' },
  { label: 'Travel', value: 'travel' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Art', value: 'art' },
  { label: 'Nature', value: 'nature' },
  { label: 'Interior', value: 'interior' },
  { label: 'Fitness', value: 'fitness' },
  { label: 'DIY', value: 'diy' },
  { label: 'Plants', value: 'plants' },
  { label: 'Minimal', value: 'minimal' },
  { label: 'Cozy', value: 'cozy' },
];

export default function FeedPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);

  // Derive effective search: tag filter overrides typed search
  const effectiveSearch = activeTag ?? searchQuery;

  const feedQuery = usePins(user?.id);
  const searchQuery_ = useSearchPins(effectiveSearch);
  const activeQuery = effectiveSearch ? searchQuery_ : feedQuery;

  // Flatten all pages + client-side tag filter when browsing feed
  let pins = activeQuery.data?.pages?.flatMap((page) => page) ?? [];

  // Client-side tag filter on the live feed (no extra RPC needed)
  if (activeTag && !searchQuery) {
    pins = pins.filter((p) => p.tags?.includes(activeTag));
  }

  const loadMore = useCallback(() => {
    if (!activeQuery.isFetchingNextPage) activeQuery.fetchNextPage();
  }, [activeQuery]);

  function handleTagClick(tagValue) {
    setActiveTag((prev) => (prev === tagValue ? null : tagValue));
    setSearchQuery('');
  }

  function handleSearch(q) {
    setSearchQuery(q);
    setActiveTag(null);
  }

  return (
    <PageTransition>
      <div className={styles.root}>
        <Navbar onSearch={handleSearch} />

        <main className={styles.main}>
          {/* Tag filter pills */}
          <div className={styles.pillsWrap}>
            <div className={styles.pills}>
              {TAGS.map((tag) => (
                <button
                  key={tag.label}
                  className={`${styles.pill} ${activeTag === tag.value && tag.value !== null ? styles.pillActive : ''} ${activeTag === null && tag.value === null ? styles.pillActive : ''}`}
                  onClick={() => handleTagClick(tag.value)}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search result header */}
          {searchQuery && !activeTag && (
            <div className={styles.searchHeader}>
              <h2 className={styles.searchTitle}>
                Results for "{searchQuery}"
              </h2>
              <button
                className={styles.clearSearch}
                onClick={() => setSearchQuery('')}
              >
                Clear
              </button>
            </div>
          )}

          {/* Tag filter header */}
          {activeTag && (
            <div className={styles.searchHeader}>
              <h2 className={styles.searchTitle}>#{activeTag}</h2>
              <button
                className={styles.clearSearch}
                onClick={() => setActiveTag(null)}
              >
                Show all
              </button>
            </div>
          )}

          {activeQuery.isError && (
            <div className={styles.error}>
              Failed to load pins. Check your Supabase connection.
            </div>
          )}

          {activeQuery.isLoading ? (
            <MasonryGrid
              pins={[]}
              loading={true}
              hasMore={false}
              onLoadMore={() => {}}
            />
          ) : (
            <MasonryGrid
              pins={pins}
              onPinClick={setSelectedPin}
              onLoadMore={loadMore}
              hasMore={activeQuery.hasNextPage ?? false}
              loading={activeQuery.isFetchingNextPage}
            />
          )}
        </main>

        {selectedPin && (
          <PinModal pin={selectedPin} onClose={() => setSelectedPin(null)} />
        )}
      </div>
    </PageTransition>
  );
}
