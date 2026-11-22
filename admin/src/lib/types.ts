// ============================================
// Admin Portal — TypeScript Types
// ============================================

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
  total_posts: number;
  total_locations?: number;
}

// ============================================
// Memory Map Location Types
// ============================================

export type MapLocationCategory = "first-meeting" | "wedding" | "home" | "holiday" | "special";

export interface AdminMapLocation {
  id: string;
  name: string;
  nameTe?: string;
  lat: number;
  lng: number;
  year: number;
  story: string;
  storyTe?: string;
  image?: string;
  category: MapLocationCategory;
  icon?: string;
  orderIndex?: number;
  createdAt?: string;
}

// ============================================
// Instagram Post Types
// ============================================

export type InstagramAspectRatio = "landscape" | "portrait" | "square";

export interface InstagramMedia {
  src: string;
  alt: string;
  caption?: string;
  tag?: string;
  themeGradient?: string;
  iconName?: string;
}

export interface AdminInstagramPost {
  id: string;
  year: number;
  dateStr: string;
  title: string;
  titleTe?: string;
  location: string;
  locationTe?: string;
  aspectRatio: InstagramAspectRatio;
  category: string;
  caption: string;
  captionTe?: string;
  hashtags: string[];
  images: InstagramMedia[];
  likesCount: number;
  orderIndex?: number;
  createdAt?: string;
}
