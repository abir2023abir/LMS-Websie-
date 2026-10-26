'use client';

import { Toaster } from 'sonner';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand={false}
      duration={4000}
      theme="light"
      toastOptions={{
        style: {
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          padding: '1rem',
        },
      }}
    />
  );
}
