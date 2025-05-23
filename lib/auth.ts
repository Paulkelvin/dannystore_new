import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { sanityClientWrite } from "@/lib/sanityClient";
import { SanityAdapter } from "./sanity-adapter";
import type { User } from '@/types';
import nodemailer from "nodemailer";

declare module 'next-auth' {
  interface Session {
    user: User & {
      id: string;
    };
  }
}

// Create a reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

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
      async sendVerificationRequest({ identifier: email, url, provider: { server, from } }) {
        const startTime = Date.now();
        console.log('📧 Starting magic link send:', { email, timestamp: new Date().toISOString() });
        
        try {
          // Verify connection before sending
          await transporter.verify();
          console.log('✅ SMTP connection verified:', Date.now() - startTime, 'ms');

          const info = await transporter.sendMail({
            to: email,
            from,
            subject: `Sign in to Danny's Store`,
            text: `Click here to sign in to Danny's Store: ${url}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Welcome to Danny's Store!</h1>
                <p>Click the button below to sign in to your account:</p>
                <a href="${url}" 
                   style="display: inline-block; background-color: #42A5F5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
                  Sign in to Danny's Store
                </a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all;">${url}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't request this email, you can safely ignore it.</p>
              </div>
            `,
            priority: 'high', // Set email priority to high
          });

          const endTime = Date.now();
          console.log('✅ Magic link sent successfully:', {
            messageId: info.messageId,
            timeTaken: endTime - startTime,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('❌ Error sending magic link:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            timeTaken: Date.now() - startTime,
            timestamp: new Date().toISOString()
          });
          throw new Error(`Failed to send magic link: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      },
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
    newUser: '/auth/welcome',
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const startTime = Date.now();
      console.log('🔐 Sign in attempt:', { 
        email: user.email,
        provider: account?.provider,
        type: account?.type,
        timestamp: new Date().toISOString()
      });
      
      if (account?.provider === 'google' && user.email) {
        // Check if user exists with this email
        const existingUser = await sanityClientWrite.fetch(
          `*[_type == "user" && email == $email][0]`,
          { email: user.email }
        );

        if (existingUser) {
          // Check if user already has a Google account linked
          const existingGoogleAccount = await sanityClientWrite.fetch(
            `*[_type == "account" && provider == "google" && user._ref == $userId][0]`,
            { userId: existingUser._id }
          );

          if (!existingGoogleAccount) {
            // Allow linking the Google account
            console.log('✅ Allowing Google account linking for existing user:', user.email);
            return true;
          }
        }
      }
      
      const result = true;
      console.log('✅ Sign in completed:', {
        success: result,
        timeTaken: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
      return result;
    },
    async session({ session, user }) {
      const startTime = Date.now();
      try {
        console.log('🔑 Starting session callback:', { 
          email: session.user.email,
          userId: user.id,
          timestamp: new Date().toISOString()
        });

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

        console.log('✅ Session callback completed:', {
          timeTaken: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
        return session;
      } catch (error) {
        console.error("❌ Error in session callback:", {
          error: error instanceof Error ? error.message : 'Unknown error',
          timeTaken: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
        return session; // Return session even if Sanity fetch fails
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
}; 