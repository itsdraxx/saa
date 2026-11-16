import type {
  AdminStats,
  BackendComment,
  GuestWish,
  TriviaLeaderboardEntry,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3001";

// ============================================
// Admin Username/Password Authentication
// ============================================

export async function adminLogin(
  username: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    return { success: !!data.success, token: data.token, error: data.error };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Connection failed to backend API",
    };
  }
}

export async function verifyAdminToken(
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-admin-token": token,
      },
    });
    const data = await res.json();
    return { success: !!data.success, error: data.error };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Connection failed to backend API",
    };
  }
}

export async function adminGetStats(
  token: string
): Promise<{ success: boolean; stats?: AdminStats; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-admin-token": token,
      },
    });
    const data = await res.json();
    return { success: !!data.success, stats: data.stats, error: data.error };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch stats",
    };
  }
}

export async function adminGetComments(
  token: string,
  limit: number = 200
): Promise<{ success: boolean; comments: BackendComment[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/comments?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-admin-token": token,
      },
    });
    const data = await res.json();
    return {
      success: !!data.success,
      comments: Array.isArray(data.comments) ? data.comments : [],
      error: data.error,
    };
  } catch (err) {
    return {
      success: false,
      comments: [],
      error: err instanceof Error ? err.message : "Failed to fetch comments",
    };
  }
}

export async function adminDeleteComment(
  commentId: number,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-admin-token": token,
      },
    });
    const data = await res.json();
    return { success: !!data.success, error: data.error };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete comment",
    };
  }
}

export async function adminGetWishes(
  token: string,
  limit: number = 200
): Promise<{ success: boolean; wishes: GuestWish[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/wishes?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-admin-token": token,
      },
    });
    const data = await res.json();
    return {
      success: !!data.success,
      wishes: Array.isArray(data.wishes) ? data.wishes : [],
      error: data.error,
    };
  } catch (err) {
    return {
      success: false,
      wishes: [],
      error: err instanceof Error ? err.message : "Failed to fetch wishes",
    };
  }
}

export async function adminDeleteWish(
  wishId: number,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/wishes/${wishId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-admin-token": token,
      },
    });
    const data = await res.json();
    return { success: !!data.success, error: data.error };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete wish",
    };
  }
}

export async function adminGetTrivia(
  token: string,
  limit: number = 200
): Promise<{ success: boolean; scores: TriviaLeaderboardEntry[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/trivia?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-admin-token": token,
      },
    });
    const data = await res.json();
    return {
      success: !!data.success,
      scores: Array.isArray(data.scores) ? data.scores : [],
      error: data.error,
    };
  } catch (err) {
    return {
      success: false,
      scores: [],
      error: err instanceof Error ? err.message : "Failed to fetch trivia",
    };
  }
}

export async function adminDeleteTrivia(
  scoreId: number,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/trivia/${scoreId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-admin-token": token,
      },
    });
    const data = await res.json();
    return { success: !!data.success, error: data.error };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete trivia score",
    };
  }
}
