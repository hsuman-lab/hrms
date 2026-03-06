import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'HRMS Portal',
  description: 'Human Resource Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { background: '#fff', color: '#1A3C4A', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
                success: { iconTheme: { primary: '#00ACC1', secondary: '#fff' } },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
