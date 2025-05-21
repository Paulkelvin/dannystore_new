import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Add request logging
const handler = async (req: any, res: any) => {
  console.log('🔐 Auth request:', {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body,
    headers: {
      host: req.headers.host,
      'user-agent': req.headers['user-agent'],
    }
  });

  try {
    const result = await NextAuth(authOptions)(req, res);
    console.log('✅ Auth response:', {
      status: res.statusCode,
      headers: res.getHeaders(),
    });
    return result;
  } catch (error) {
    console.error('❌ Auth error:', error);
    throw error;
  }
};

// Export as a named export to avoid webpack issues
export const GET = handler;
export const POST = handler; 