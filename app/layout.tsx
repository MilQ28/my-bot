import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import ChatWidget from '@/components/chat/ChatWidget';
import AdminSecretModal from '@/components/AdminSecretModal';
import { ColorBlindProvider } from '@/contexts/ColorBlindContext';
import Header from '@/partials/Header';
import './globals.css';
import Footer from '@/partials/Footer';

export const metadata: Metadata = {
  title: 'Syamil Cholid Atsani — Student Developer',
  description: 'Student developer from Lampung, Indonesia. Building modern web applications with Next.js, React, and Laravel.',
  openGraph: {
    title: 'Syamil Cholid Atsani — Student Developer',
    description: 'Student developer from Lampung, Indonesia. Building modern web applications with Next.js, React, and Laravel.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Syamil Cholid Atsani — Student Developer',
    description: 'Student developer from Lampung, Indonesia. Building modern web applications with Next.js, React, and Laravel.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ColorBlindProvider>
          <ThemeProvider>

            <Header />

            {children}

            <ChatWidget />
            <AdminSecretModal />

            <Footer />

          </ThemeProvider>
        </ColorBlindProvider>
      </body>
    </html>
  );
}