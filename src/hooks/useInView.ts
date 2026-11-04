"use client";

import { useRef, useState, useEffect, useCallback, type RefObject } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface UseInViewReturn<T extends HTMLElement> {
  ref: RefObject<T | null>;
  isInView: boolean;
}

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
): UseInViewReturn<T> {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);
  const hasTriggered = useRef(false);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) return;

      if (triggerOnce) {
        if (entry.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          setIsInView(true);
        }
      } else {
        setIsInView(entry.isIntersecting);
      }
    },
    [triggerOnce]
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect, rootMargin, threshold]);

  return { ref, isInView };
}
