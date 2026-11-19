import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

/**
 * Generates a stable token derived from the configured ADMIN_USERNAME and ADMIN_PASSWORD.
 */
export function getAdminToken(): string {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not set in environment");
  }
  return crypto.createHmac("sha256", "saa-anniversary-salt").update(`${username}:${password}`).digest("hex");
}

/**
 * Validates a provided token against the configured admin credentials.
 */
export function isValidAdminToken(token: string): boolean {
  if (!token) return false;
  const rawPass = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET;
  if (!rawPass) return false;

  try {
    const expected = getAdminToken();
    if (token === expected) return true;
  } catch {
    return false;
  }

  // Fallback: also accept the raw password for direct curl or legacy tests
  if (token === rawPass) return true;

  return false;
}

/**
 * Middleware that verifies admin authorization via Bearer token, x-admin-token, or x-admin-key.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token = req.headers["x-admin-token"] as string | undefined;

  if (!token && authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    token = req.headers["x-admin-key"] as string | undefined;
  }

  if (!token || !isValidAdminToken(token)) {
    res.status(401).json({ success: false, error: "Unauthorized — please log in with admin credentials" });
    return;
  }

  next();
}
