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
}
