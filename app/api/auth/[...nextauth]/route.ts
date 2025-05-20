import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";
 
// Use a more stable export pattern
const handler = NextAuth(authOptions);

// Export as a named export to avoid webpack issues
export const GET = handler;
export const POST = handler; 