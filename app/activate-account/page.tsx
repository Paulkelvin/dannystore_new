"use client";

import { signIn } from "next-auth/react";

export default function ActivateAccountPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Activate Your Account</h1>
        <p className="mb-6 text-center text-gray-600">
          Sign in with Google to activate your account and view your order history.
        </p>
        <button
          onClick={() => signIn("google")}
          className="w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
} 