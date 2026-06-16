import { useEffect, useRef, useCallback, useMemo, useState } from 'react';

const BATCH_SIZE = 60;

export default function VirtualGrid({ items, renderItem, className = 'media-grid' }) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef(null);
  const prevItemsRef = useRef(items);

  // Reset visibleCount quando a lista muda, sem usar useEffect
  if (prevItemsRef.current !== items) {
    prevItemsRef.current = items;
    setVisibleCount(BATCH_SIZE);
  }

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + BATCH_SIZE, items.length));
  }, [items.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  return (
    <>
      <div className={className}>
        {visibleItems.map(renderItem)}
      </div>

      {visibleCount < items.length && (
        <div ref={sentinelRef} style={{ height: 1, marginBottom: 80 }} />
      )}
    </>
  );
}