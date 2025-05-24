"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const params = useSearchParams();
  const token = params ? params.get("token") || "" : "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmail() {
      if (!token) return;
      const res = await fetch(`/api/reset-password?token=${token}`);
      const data = await res.json();
      if (res.ok && data.email) {
        setEmail(data.email);
      }
      setLoading(false);
    }
    fetchEmail();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    const res = await fetch("/api/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setMessage(data.message || (res.ok ? "Password reset!" : "Error resetting password."));
  }

  if (loading) {
    return <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border px-3 py-2 rounded"
          type="email"
          value={email}
          readOnly
        />
        <input
          className="w-full border px-3 py-2 rounded"
          type="password"
          placeholder="New Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          className="w-full border px-3 py-2 rounded"
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
        />
        <button className="w-full bg-[#42A5F5] text-white py-2 rounded hover:bg-[#1e88e5]">Reset Password</button>
      </form>
      {message && <div className="mt-4 text-center text-[#42A5F5]">{message}</div>}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
} 