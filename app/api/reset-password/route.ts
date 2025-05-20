import { NextResponse } from "next/server";
import { sanityClientPublic as client } from "@/lib/sanityClient";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const EMAIL_FROM = process.env.SMTP_USER || "no-reply@example.com";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ message: "Missing token." }, { status: 400 });

  const now = new Date().toISOString();
  const nowNum = typeof now === 'number' ? now : Date.now();
  const user = await client.fetch(
    `*[_type == "user" && resetToken == $token && resetTokenExpiry > $now][0]{email}`,
    { token: String(token), now: nowNum } as any
  );
  if (!user) {
    return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 });
  }
  return NextResponse.json({ email: user.email });
}

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ message: "Missing token or password." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const user = await client.fetch(
    `*[_type == "user" && resetToken == $token && resetTokenExpiry > $now][0]{_id, email, name}`,
    { token, now }
  );
  if (!user) {
    return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await client.patch(user._id)
    .set({ password: hashed, accountStatus: "active" })
    .unset(["resetToken", "resetTokenExpiry"])
    .commit();

  // Send confirmation email
  const transporter = nodemailer.createTransport({
    service: "gmail", // or your provider
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: user.email,
    subject: "Your Password Was Reset",
    html: `
      <p>Hello${user.name ? ` ${user.name}` : ""},</p>
      <p>Your password was successfully reset. If you did not perform this action, please contact support immediately.</p>
      <p>Thank you!</p>
    `,
  });

  return NextResponse.json({ message: "Password reset! You can now log in." });
} 