import { NextResponse } from "next/server";
import { sanityClientPublic as client } from "@/lib/sanityClient";
import nodemailer from "nodemailer";
import crypto from "crypto";

const EMAIL_FROM = process.env.SMTP_USER || "no-reply@example.com";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ message: "Missing email." }, { status: 400 });

  const user = await client.fetch(`*[_type == "user" && email == $email][0]{_id, email, name}`, { email });
  if (!user) return NextResponse.json({ message: "If your email exists, you will receive a reset link soon." });

  // Generate token and expiry (1 hour)
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString();

  // Store token and expiry in user doc
  await client.patch(user._id)
    .set({ resetToken: token, resetTokenExpiry: expires })
    .commit();

  // Send email
  const transporter = nodemailer.createTransport({
    service: "gmail", // or your provider
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: EMAIL_FROM,
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <p>Hello${user.name ? ` ${user.name}` : ""},</p>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });

  return NextResponse.json({ message: "If your email exists, you will receive a reset link soon." });
} 