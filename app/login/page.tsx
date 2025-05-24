"use client";
import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

function LoginContent() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams ? searchParams.get("callbackUrl") || "/account" : "/account";

  // Check for error parameters in URL
  useEffect(() => {
    const error = searchParams?.get("error");
    if (error === "OAuthAccountNotLinked") {
      setError("This email is already registered with a different sign-in method. Please use your original sign-in method (magic link) or contact support if you need help.");
      toast.error("This email is already registered with a different sign-in method");
    }
  }, [searchParams]);

  async function handleGoogleSignIn() {
    try {
      setIsLoading(true);
      setError("");
      const res = await signIn("google", {
        callbackUrl,
        redirect: false // Changed to false to handle the response
      });
      
      if (res?.error) {
        if (res.error === "OAuthAccountNotLinked") {
          setError("This email is already registered with a different sign-in method. Please use your original sign-in method (magic link) or contact support if you need help.");
          toast.error("This email is already registered with a different sign-in method");
        } else {
          setError(res.error);
          toast.error(res.error);
        }
      } else if (res?.ok) {
        // If sign-in was successful, redirect
        router.push(callbackUrl);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Google";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setIsEmailLoading(true);
    setError("");
    try {
      const res = await signIn("email", { email, callbackUrl, redirect: false });
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        toast.success("Check your email for a magic link!");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send magic link";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsEmailLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in or create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use your email or Google to sign in or create your account. No password required!
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleEmailSignIn}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-[#DEE2E6] focus:outline-none focus:ring-2 focus:ring-[#42A5F5] focus:border-transparent transition-all"
              placeholder="you@example.com"
              disabled={isEmailLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isEmailLoading || !email}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#42A5F5] hover:bg-[#1e88e5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#42A5F5] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEmailLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending magic link...
              </span>
            ) : (
              <span>Sign in with Magic Link</span>
            )}
          </button>
        </form>

        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#42A5F5] hover:bg-[#1e88e5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#42A5F5] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
} 