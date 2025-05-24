'use client';

// Updated for Vercel deployment
import { useSearchParams } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

const errorMessages: Record<string, string | ReactNode> = {
  AccountNotLinked: (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Account Already Exists</h3>
        <p className="text-blue-700 mb-3">
          This email address is already registered with a different sign-in method.
        </p>
        <div className="space-y-2">
          <p className="text-blue-600">To resolve this:</p>
          <ul className="list-disc list-inside text-blue-600 space-y-1">
            <li>Use the original sign-in method you used to create your account</li>
            <li>If you used magic link, check your email for the sign-in link</li>
            <li>If you made a purchase as a guest, check your email for an activation link</li>
          </ul>
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Back to Login
        </a>
        <a href="/contact" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          Need Help?
        </a>
      </div>
    </div>
  ),
  OAuthAccountNotLinked: (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Account Already Exists</h3>
        <p className="text-blue-700 mb-3">
          This email address is already registered with a different sign-in method.
        </p>
        <div className="space-y-2">
          <p className="text-blue-600">To resolve this:</p>
          <ul className="list-disc list-inside text-blue-600 space-y-1">
            <li>Use the original sign-in method you used to create your account</li>
            <li>If you used magic link, check your email for the sign-in link</li>
            <li>If you made a purchase as a guest, check your email for an activation link</li>
          </ul>
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Back to Login
        </a>
        <a href="/contact" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          Need Help?
        </a>
      </div>
    </div>
  ),
  EmailSignin: (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-lg font-semibold text-red-900 mb-2">Email Sign-in Error</h3>
      <p className="text-red-700">There was a problem sending the email. Please try again.</p>
    </div>
  ),
  CredentialsSignin: (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-lg font-semibold text-red-900 mb-2">Sign-in Failed</h3>
      <p className="text-red-700">Please check the details you provided are correct.</p>
    </div>
  ),
  default: (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-lg font-semibold text-red-900 mb-2">Authentication Error</h3>
      <p className="text-red-700">An unknown error occurred. Please try again or contact support.</p>
    </div>
  )
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');
  const message = (error && errorMessages[error]) || errorMessages.default;

  return (
    <div className="max-w-2xl mx-auto my-16 p-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Authentication Error</h1>
        <div className="mb-8">{message}</div>
        <div className="flex justify-center">
          <a href="/login" className="text-blue-600 hover:text-blue-800 underline">
            Return to Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto my-16 p-8">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
} 