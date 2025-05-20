'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from './CartContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './ErrorBoundary';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <SessionProvider>
      <CartProvider>
        <ErrorBoundary>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
          {children}
        </ErrorBoundary>
      </CartProvider>
    </SessionProvider>
  );
}; 