import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { getPrismaClient } from "../../helper/initiatePrisma";
dotenv.config();

console.log("first  ", process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const prisma = getPrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Step A: Check if the frontend actually sent a header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    // Step B: Extract the token (Remove "Bearer " prefix)
    // Header format: "Bearer eyJhbGciOiJIUz..."
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    // Step C: THE CORE LOGIC - Ask Supabase to verify
    // We send the token string to Supabase.
    // Supabase checks the signature and expiration.
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("Auth failed:", error?.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Step D: Attach the User to the Request
    // Now 'saveController' can access 'req.user.id

    
    if (user) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
        },
        create: {
          id: user.id,
          email: user.email || "",
        },
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };
    // Step E: Pass control to the next function (the controller)
    next();
  } catch (err) {
    console.error("Middleware Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
