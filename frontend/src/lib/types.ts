// ============================================
// 25 Years of Us — TypeScript Types
// ============================================

// --- Timeline ---
export interface TimelineEntry {
  year: number;
  title: string;
  description: string;
  image?: string;
  category: "wedding" | "family" | "milestone" | "travel" | "celebration";
}

// --- Gallery ---
export type GalleryCategory =
  | "wedding-day"
  | "early-years"
  | "family"
  | "celebrations"
  | "travels"
  | "everyday";

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  date?: string;
  year?: number;
  category: GalleryCategory;
  type: "image" | "video";
  width?: number;
  height?: number;
}

// --- Glass Jar Messages ---
export interface GlassJarMessage {
  id: number;
  message: string;
  author?: string;
}

// --- Then vs Now ---
export interface ThenVsNowPair {
  id: string;
  thenImage: string;
  nowImage: string;
  thenYear?: number;
  nowYear?: number;
  thenCaption?: string;
  nowCaption?: string;
  title?: string;
}

// --- Family Messages ---
export interface FamilyMessage {
  id: string;
  name: string;
  relation: string;
  photo: string;
  description: string;
  type: "audio" | "video";
  mediaSrc: string;
  transcript?: string;
}

// --- Trivia ---
export interface TriviaOption {
  text: string;
  isCorrect: boolean;
}

export interface TriviaQuestion {
  id: number;
  question: string;
  options: TriviaOption[];
  explanation: string;
  category: "wedding" | "habits" | "favourites" | "memories" | "funny";
}

// --- Memory Map ---
export interface MapLocation {
  id: string;
  name: string;
  nameTe?: string;
  lat: number;
  lng: number;
  year: number;
  story: string;
  storyTe?: string;
  image?: string;
  category: "first-meeting" | "wedding" | "home" | "holiday" | "special";
  icon?: string;
  orderIndex?: number;
}

// --- Section ---
export interface SectionProps {
  className?: string;
  id?: string;
}

// --- Navigation ---
export interface NavLink {
  label: string;
  href: string;
  icon?: string;
}

// --- Backend Integration Types ---
export interface BackendComment {
  id: number;
  post_id: string;
  author_name: string;
  text: string;
  created_at: string;
  visitor_id?: string | null;
}

export interface GuestWish {
  id: number;
  author_name: string;
  relation?: string | null;
  message: string;
  emoji: string;
  created_at: string;
}

export interface TriviaLeaderboardEntry {
  id: number;
  player_name: string;
  score: number;
  total: number;
  percentage: number;
  time_taken?: number | null;
  created_at: string;
  rank?: number;
}

export interface AdminStats {
  total_comments: number;
  total_likes: number;
  total_trivia_players: number;
  total_wishes: number;
}


