import type {
  AdminStats,
  BackendComment,
  GuestWish,
  TriviaLeaderboardEntry,
  AdminInstagramPost,
} from "./types";

const CONFIGURED_API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

// Automatically prioritize 8080 if running on localhost dev
let activeApiBase =
  CONFIGURED_API && !CONFIGURED_API.includes("3001")
    ? CONFIGURED_API
    : "http://localhost:8080";

export function getApiBase(): string {
  return activeApiBase;
}

/**
 * Resilient fetch that tries activeApiBase first, and automatically falls back
 * between port 8080 and 3001 if the configured server isn't answering.
 */
async function apiFetch(endpoint: string, init?: RequestInit): Promise<Response> {
  const cleanPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  try {
    const res = await fetch(`${activeApiBase}${cleanPath}`, init);
    return res;
  } catch (err) {
    // If connection refused, try alternate local port (8080 <-> 3001)
    const candidates = [
      "http://localhost:8080",
      "http://localhost:3001",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:3001",
    ].filter((base) => base !== activeApiBase);

    for (const altBase of candidates) {
      try {
        const altRes = await fetch(`${altBase}${cleanPath}`, init);
        activeApiBase = altBase; // remember working host
        return altRes;
      } catch {}
    }

    throw err;
  }
}

// ============================================
// Admin Username/Password Authentication
// ============================================

export async function adminLogin(
  username: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const res = await apiFetch(`/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    return { success: !!data.success, token: data.token, error: data.error };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? `${err.message} (Tried connecting to ${activeApiBase})`
          : "Connection failed to backend API",
    };
  }
}

export async function verifyAdminToken(
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(`/admin/verify`, {
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
    const res = await apiFetch(`/admin/stats`, {
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
    const res = await apiFetch(`/admin/comments?limit=${limit}`, {
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
    const res = await apiFetch(`/admin/comments/${commentId}`, {
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
    const res = await apiFetch(`/admin/wishes?limit=${limit}`, {
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
    const res = await apiFetch(`/admin/wishes/${wishId}`, {
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
    const res = await apiFetch(`/admin/trivia?limit=${limit}`, {
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
    const res = await apiFetch(`/admin/trivia/${scoreId}`, {
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

// ============================================
// Instagram Posts Management
// ============================================

export async function adminGetPosts(
  token: string
): Promise<{ success: boolean; posts: AdminInstagramPost[]; error?: string }> {
  try {
    const res = await apiFetch(`/posts`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-admin-token": token,
      },
    });
    const data = await res.json();
    return {
      success: !!data.success,
      posts: Array.isArray(data.posts) ? data.posts : [],
      error: data.error,
    };
  } catch (err) {
    return {
      success: false,
      posts: [],
      error: err instanceof Error ? err.message : "Failed to fetch posts",
    };
  }
}

export async function adminCreatePost(
  post: Partial<AdminInstagramPost>,
  token: string
): Promise<{ success: boolean; post?: AdminInstagramPost; error?: string }> {
  try {
    const res = await apiFetch(`/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-admin-token": token,
      },
      body: JSON.stringify(post),
    });
    const data = await res.json();
    return { success: !!data.success, post: data.post, error: data.error };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create post",
    };
  }
}

export async function adminUpdatePost(
  postId: string,
  updates: Partial<AdminInstagramPost>,
  token: string
): Promise<{ success: boolean; post?: AdminInstagramPost; error?: string }> {
  try {
    const res = await apiFetch(`/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-admin-token": token,
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    return { success: !!data.success, post: data.post, error: data.error };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update post",
    };
  }
}

export async function adminDeletePost(
  postId: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(`/posts/${postId}`, {
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
      error: err instanceof Error ? err.message : "Failed to delete post",
    };
  }
}

export async function adminReorderPosts(
  order: string[],
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(`/posts/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-admin-token": token,
      },
      body: JSON.stringify({ order }),
    });
    const data = await res.json();
    return { success: !!data.success, error: data.error };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reorder posts",
    };
  }
}

export async function adminUploadImage(
  file: File,
  token: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const res = await apiFetch(`/posts/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-admin-token": token,
      },
      body: formData,
    });
    const data = await res.json();
    return { success: !!data.success, url: data.url, error: data.error };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to upload image",
    };
  }
}
