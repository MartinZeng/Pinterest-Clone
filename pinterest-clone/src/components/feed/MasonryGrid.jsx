// src/components/feed/MasonryGrid.jsx
// CSS column-based masonry grid with infinite scroll via IntersectionObserver.

import { useEffect, useRef } from 'react';
import PinCard from './PinCard';
import styles from './MasonryGrid.module.css';

export default function MasonryGrid({
  pins,
  onPinClick,
  onLoadMore,
  hasMore,
  loading,
}) {
  const sentinelRef = useRef(null);

  // Watch the sentinel div — when it enters the viewport, load more
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { rootMargin: '400px' }, // start loading 400px before the bottom
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (!pins.length && !loading) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📌</span>
        <p>No pins yet. Follow some creators or create your first pin!</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {pins.map((pin) => (
          <PinCard key={pin.id} pin={pin} onClick={onPinClick} />
        ))}
      </div>

      {/* Skeleton cards while loading more */}
      {loading && (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </div>
      )}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className={styles.sentinel} />

      {!hasMore && pins.length > 0 && (
        <p className={styles.endMessage}>You've seen everything — for now.</p>
      )}
    </div>
  );
}

function SkeletonCard({ index }) {
  const heights = [280, 360, 220, 420, 300, 380];
  return (
    <div
      className={styles.skeleton}
      style={{ height: heights[index % heights.length] }}
    />
  );
}
