import type { Request, Response, NextFunction } from "express";

/**
 * Middleware that verifies the `x-admin-key` header against ADMIN_SECRET.
 * Returns 401 if missing or incorrect.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    res.status(500).json({ success: false, error: "Admin secret not configured on server" });
    return;
  }

  const provided = req.headers["x-admin-key"];
  if (!provided || provided !== adminSecret) {
    res.status(401).json({ success: false, error: "Unauthorized — invalid admin key" });
    return;
  }

  next();
}

