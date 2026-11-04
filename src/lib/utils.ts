// ============================================
// 25 Years of Us — Utility Helpers
// ============================================

import { type ClassValue, clsx } from "clsx";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a year range string */
export function yearRange(start: number, end: number): string {
  return `${start} — ${end}`;
}

/** Shuffle an array (Fisher-Yates) */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Get a random item from an array */
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/** Format seconds to mm:ss */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

