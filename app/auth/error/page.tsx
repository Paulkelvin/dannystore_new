'use client';

// Updated for Vercel deployment
import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';

const errorMessages: Record<string, string | ReactNode> = {
  AccountNotLinked: (
    <>
      <strong>This email is already registered.</strong>
      <br />
      Please sign in using the method you originally used (e.g., email/magic link).
      <br />
      If you made a purchase as a guest, check your email for a magic link to activate your account.
    </>
  ),
  OAuthAccountNotLinked: (
    <>
      <strong>This email is already registered.</strong>
      <br />
      Please sign in using the method you originally used (e.g., email/magic link).
      <br />
      If you made a purchase as a guest, check your email for a magic link to activate your account.
    </>
  ),
  EmailSignin: 'There was a problem sending the email. Please try again.',
  CredentialsSignin: 'Sign in failed. Check the details you provided are correct.',
  default: 'An unknown error occurred. Please try again or contact support.'
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');
  const message = (error && errorMessages[error]) || errorMessages.default;

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
      <h1 style={{ color: '#d32f2f' }}>Authentication Error</h1>
      <div>{message}</div>
      <a href="/login" style={{ color: '#1976d2', textDecoration: 'underline', display: 'block', marginTop: 16 }}>Back to login</a>
    </div>
  );
} 