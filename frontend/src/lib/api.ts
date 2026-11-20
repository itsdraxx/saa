import type {
  BackendComment,
  GuestWish,
  TriviaLeaderboardEntry,
  AdminStats,
} from "./types";
import { instagramPosts, type InstagramPost } from "@/data/instagramPosts";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/saa";

/**
 * Get or create an anonymous visitor UUID stored in localStorage.
 * Used to prevent duplicate likes and track player rankings.
 */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr-visitor";
  try {
    let id = localStorage.getItem("saa_visitor_id");
    if (!id) {
      id = "v_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem("saa_visitor_id", id);
    }
    return id;
  } catch {
    return "temp-visitor";
  }
}

// ──────────────────────────────────────────────
// 1. COMMENTS API
// ──────────────────────────────────────────────

export async function fetchComments(
  postId: string
): Promise<{ success: boolean; comments: BackendComment[] }> {
  try {
    const res = await fetch(`${API_BASE}/comments?post_id=${encodeURIComponent(postId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed to fetch comments for ${postId}:`, err);
    return { success: false, comments: [] };
  }
}

export async function postComment(
  postId: string,
  authorName: string,
  text: string,
  visitorId?: string
): Promise<{ success: boolean; comment?: BackendComment; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post_id: postId,
        author_name: authorName,
        text,
        visitor_id: visitorId || getVisitorId(),
      }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to post comment",
    };
  }
}

export async function deleteOwnComment(
  commentId: number,
  authorName: string,
  visitorId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author_name: authorName,
        visitor_id: visitorId || getVisitorId(),
      }),
    });
    return await res.json();
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete comment",
    };
  }
}

// ──────────────────────────────────────────────
// 2. LIKES API
// ──────────────────────────────────────────────

export async function fetchLikes(postId: string): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/likes?post_id=${encodeURIComponent(postId)}`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch {
    return 0;
  }
}

export async function fetchAllLikes(): Promise<Record<string, number>> {
  try {
    const res = await fetch(`${API_BASE}/likes/all`);
    if (!res.ok) return {};
    const data = await res.json();
    return data.likes || {};
  } catch {
    return {};
  }
}

export async function toggleLike(
  postId: string,
  visitorId: string
): Promise<{ success: boolean; liked?: boolean; count?: number }> {
  try {
    const res = await fetch(`${API_BASE}/likes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, visitor_id: visitorId }),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

// ──────────────────────────────────────────────
// 3. TRIVIA LEADERBOARD API
// ──────────────────────────────────────────────

export async function fetchTriviaLeaderboard(
  limit = 20
): Promise<{ success: boolean; total_players: number; leaderboard: TriviaLeaderboardEntry[] }> {
  let backendList: TriviaLeaderboardEntry[] = [];
  let total = 0;
  try {
    const res = await fetch(`${API_BASE}/trivia/leaderboard?limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        backendList = data.leaderboard;
        total = data.total_players || backendList.length;
      }
    }
  } catch {}

  // Merge with local submissions so nothing is lost if offline
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("saa_local_trivia_leaderboard");
      if (stored) {
        const localList: TriviaLeaderboardEntry[] = JSON.parse(stored);
        for (const item of localList) {
          if (!backendList.some((b) => b.player_name.toLowerCase() === item.player_name.toLowerCase())) {
            backendList.push(item);
          }
        }
        backendList.sort((a, b) => b.percentage - a.percentage || (a.time_taken ?? 999) - (b.time_taken ?? 999));
        total = Math.max(total, backendList.length);
      }
    }
  } catch {}

  return {
    success: true,
    total_players: total || backendList.length,
    leaderboard: backendList.slice(0, limit),
  };
}

export async function checkTriviaStatus(visitorId: string): Promise<{
  success: boolean;
  completed: boolean;
  rank?: number;
  entry?: TriviaLeaderboardEntry;
}> {
  try {
    const res = await fetch(`${API_BASE}/trivia/status?visitor_id=${encodeURIComponent(visitorId)}`);
    if (res.ok) return await res.json();
  } catch {}

  // Local fallback check
  try {
    if (typeof window !== "undefined") {
      const isCompleted = localStorage.getItem("saa_trivia_completed") === "true";
      const score = Number(localStorage.getItem("saa_trivia_score") || "0");
      const name = localStorage.getItem("saa_user_name") || "Guest";
      const rank = Number(localStorage.getItem("saa_trivia_rank") || "1");

      if (isCompleted) {
        return {
          success: true,
          completed: true,
          rank,
          entry: {
            id: 1,
            player_name: name,
            score,
            total: 6,
            percentage: Math.round((score / 6) * 100),
            time_taken: 30,
            created_at: new Date().toISOString(),
          },
        };
      }
    }
  } catch {}

  return { success: true, completed: false };
}

export async function submitTriviaScore(data: {
  player_name: string;
  score: number;
  total: number;
  percentage: number;
  time_taken?: number;
  visitor_id?: string;
}): Promise<{ success: boolean; rank?: number; entry?: TriviaLeaderboardEntry; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/trivia/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success !== false) {
        return json;
      }
    }
  } catch (err) {
    console.warn("[API] Backend trivia submit error, falling back to local leaderboard:", err);
  }

  // Guaranteed resilient local save so submitting NEVER fails
  try {
    const localEntry: TriviaLeaderboardEntry = {
      id: Date.now(),
      player_name: data.player_name,
      score: data.score,
      total: data.total,
      percentage: data.percentage,
      time_taken: data.time_taken ?? null,
      created_at: new Date().toISOString(),
    };

    let localLb: TriviaLeaderboardEntry[] = [];
    const stored = localStorage.getItem("saa_local_trivia_leaderboard");
    if (stored) {
      try {
        localLb = JSON.parse(stored);
      } catch {}
    }
    localLb = localLb.filter((e) => e.player_name.toLowerCase() !== data.player_name.toLowerCase());
    localLb.push(localEntry);
    localLb.sort((a, b) => b.percentage - a.percentage || (a.time_taken ?? 999) - (b.time_taken ?? 999));
    localStorage.setItem("saa_local_trivia_leaderboard", JSON.stringify(localLb));

    const rank = localLb.findIndex((e) => e.id === localEntry.id) + 1;
    return {
      success: true,
      rank: rank > 0 ? rank : 1,
      entry: localEntry,
    };
  } catch {
    return {
      success: true,
      rank: 1,
      entry: {
        id: Date.now(),
        player_name: data.player_name,
        score: data.score,
        total: data.total,
        percentage: data.percentage,
        time_taken: data.time_taken ?? null,
        created_at: new Date().toISOString(),
      },
    };
  }
}

// ──────────────────────────────────────────────
// 4. GUEST WISHES WALL API
// ──────────────────────────────────────────────

export async function fetchWishes(
  limit = 100
): Promise<{ success: boolean; count: number; wishes: GuestWish[] }> {
  try {
    const res = await fetch(`${API_BASE}/wishes?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { success: false, count: 0, wishes: [] };
  }
}

export async function postWish(data: {
  author_name: string;
  relation?: string;
  message: string;
  emoji?: string;
}): Promise<{ success: boolean; wish?: GuestWish; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/wishes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to post wish",
    };
  }
}

// ──────────────────────────────────────────────
// 5. ADMIN API (Requires Admin Key)
// ──────────────────────────────────────────────

export async function verifyAdminKey(
  adminKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/verify`, {
      method: "POST",
      headers: { "x-admin-key": adminKey },
    });
    const data = await res.json();
    return data;
  } catch {
    return { success: false, error: "Network error" };
  }
}

export async function adminGetStats(
  adminKey: string
): Promise<{ success: boolean; stats?: AdminStats; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { "x-admin-key": adminKey },
    });
    return await res.json();
  } catch {
    return { success: false, error: "Failed to fetch stats" };
  }
}

export async function adminGetComments(
  adminKey: string,
  limit = 100,
  offset = 0
): Promise<{ success: boolean; total: number; comments: BackendComment[] }> {
  try {
    const res = await fetch(
      `${API_BASE}/admin/comments?limit=${limit}&offset=${offset}`,
      { headers: { "x-admin-key": adminKey } }
    );
    return await res.json();
  } catch {
    return { success: false, total: 0, comments: [] };
  }
}

export async function adminDeleteComment(
  id: number,
  adminKey: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/comments/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });
    return await res.json();
  } catch {
    return { success: false, error: "Failed to delete comment" };
  }
}

export async function adminGetWishes(
  adminKey: string,
  limit = 100,
  offset = 0
): Promise<{ success: boolean; total: number; wishes: GuestWish[] }> {
  try {
    const res = await fetch(
      `${API_BASE}/admin/wishes?limit=${limit}&offset=${offset}`,
      { headers: { "x-admin-key": adminKey } }
    );
    return await res.json();
  } catch {
    return { success: false, total: 0, wishes: [] };
  }
}

export async function adminDeleteWish(
  id: number,
  adminKey: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/wishes/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });
    return await res.json();
  } catch {
    return { success: false, error: "Failed to delete wish" };
  }
}

export async function adminGetTrivia(
  adminKey: string,
  limit = 100,
  offset = 0
): Promise<{ success: boolean; total: number; scores: TriviaLeaderboardEntry[] }> {
  try {
    const res = await fetch(
      `${API_BASE}/admin/trivia?limit=${limit}&offset=${offset}`,
      { headers: { "x-admin-key": adminKey } }
    );
    return await res.json();
  } catch {
    return { success: false, total: 0, scores: [] };
  }
}

export async function adminDeleteTrivia(
  id: number,
  adminKey: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/trivia/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": adminKey },
    });
    return await res.json();
  } catch {
    return { success: false, error: "Failed to delete trivia score" };
  }
}

// ──────────────────────────────────────────────
// 6. INSTAGRAM POSTS API
// ──────────────────────────────────────────────

export async function fetchInstagramPosts(): Promise<{
  success: boolean;
  posts: InstagramPost[];
}> {
  try {
    const res = await fetch(`${API_BASE}/posts`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.posts) && data.posts.length > 0) {
        return { success: true, posts: data.posts };
      }
    }
  } catch (err) {
    console.warn("[API] Primary fetch failed for Instagram posts:", err);
  }

  // Secondary dev fallback to localhost:8080 if running backend on default port
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost" &&
    !API_BASE.includes("8080")
  ) {
    try {
      const res = await fetch("http://localhost:8080/api/saa/posts");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.posts) && data.posts.length > 0) {
          return { success: true, posts: data.posts };
        }
      }
    } catch {}
  }

  // Guaranteed fallback to static curated posts
  return { success: false, posts: instagramPosts };
}
