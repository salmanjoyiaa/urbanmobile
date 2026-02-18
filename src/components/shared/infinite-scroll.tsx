"use client";

import { useEffect, useRef } from "react";

type InfiniteScrollProps = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
  className?: string;
};

export function InfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  children,
  className,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      {
        rootMargin: "160px",
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className={className}>
      {children}
      <div ref={sentinelRef} className="h-8 w-full" />
    </div>
  );
}
