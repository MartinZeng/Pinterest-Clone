// src/pages/ExplorePage.jsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/layout/Navbar';
import MasonryGrid from '../components/feed/MasonryGrid';
import PinModal from '../components/pin/PinModal';
import PageTransition from '../components/ui/PageTransition';
import styles from './ExplorePage.module.css';

const CATEGORIES = [
  { label: 'Trending', tag: null },
  { label: 'Architecture', tag: 'architecture' },
  { label: 'Food', tag: 'food' },
  { label: 'Travel', tag: 'travel' },
  { label: 'Fashion', tag: 'fashion' },
  { label: 'Art', tag: 'art' },
  { label: 'Nature', tag: 'nature' },
  { label: 'Interior', tag: 'interior' },
  { label: 'Plants', tag: 'plants' },
  { label: 'Cozy', tag: 'cozy' },
];

const PAGE_SIZE = 30;

export default function ExplorePage() {
  const [activeTag, setActiveTag] = useState(null);
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [selectedPin, setSelectedPin] = useState(null);

  async function fetchPins(tag, currentOffset, replace) {
    if (currentOffset === 0) setLoading(true);
    else setLoadingMore(true);

    let query = supabase
      .from('pins_with_author')
      .select('*')
      .order('save_count', { ascending: false })
      .order('created_at', { ascending: false })
      .range(currentOffset, currentOffset + PAGE_SIZE - 1);

    if (tag) query = query.contains('tags', [tag]);

    const { data } = await query;
    const results = data ?? [];

    if (replace) setPins(results);
    else setPins((prev) => [...prev, ...results]);

    setHasMore(results.length === PAGE_SIZE);
    setLoading(false);
    setLoadingMore(false);
  }

  useEffect(() => {
    setOffset(0);
    fetchPins(activeTag, 0, true);
  }, [activeTag]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const next = offset + PAGE_SIZE;
    setOffset(next);
    fetchPins(activeTag, next, false);
  }, [activeTag, offset, loadingMore, hasMore]);

  return (
    <PageTransition>
      <div className={styles.root}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>Explore</h1>
            <p className={styles.heroSub}>Discover what's trending right now</p>
          </div>

          <div className={styles.tabsWrap}>
            <div className={styles.tabs}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  className={`${styles.tab} ${activeTag === cat.tag ? styles.tabActive : ''}`}
                  onClick={() => setActiveTag(cat.tag)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {!loading && (
            <div className={styles.statsBar}>
              <span className={styles.statsText}>
                {activeTag ? '#' + activeTag : 'All categories'} · {pins.length}
                + pins
              </span>
            </div>
          )}

          <MasonryGrid
            pins={pins}
            onPinClick={setSelectedPin}
            onLoadMore={loadMore}
            hasMore={hasMore}
            loading={loading || loadingMore}
          />
        </main>

        {selectedPin && (
          <PinModal pin={selectedPin} onClose={() => setSelectedPin(null)} />
        )}
      </div>
    </PageTransition>
  );
}
