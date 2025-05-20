import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { sanityClientWrite } from "@/lib/sanityClient";
import { SanityAdapter } from "./sanity-adapter";

// Validate required environment variables
const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  EMAIL_SERVER: process.env.EMAIL_SERVER,
  EMAIL_FROM: process.env.EMAIL_FROM,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
};

// Check for missing environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
  }
});

export const authOptions: NextAuthOptions = {
  adapter: SanityAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER!,
      from: process.env.EMAIL_FROM!,
      maxAge: 24 * 60 * 60, // 24 hours
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
    newUser: '/auth/welcome',
  },
  callbacks: {
    async session({ session, user }) {
      try {
        if (session.user) {
          session.user.id = user.id;
          
          // Fetch additional user data from Sanity if needed
          const userData = await sanityClientWrite.fetch(
            `*[_type == "user" && _id == $id][0]`,
            { id: user.id }
          );
          
          if (userData) {
            session.user.name = userData.name || session.user.name;
            session.user.image = userData.image || session.user.image;
          }
        }
        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session; // Return session even if Sanity fetch fails
      }
    }
  }
}; 