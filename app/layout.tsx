import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import ChatWidget from '@/components/chat/ChatWidget';
import './globals.css';

export const metadata: Metadata = {
  title: 'Syamil — Portfolio',
  description: 'Personal portfolio website',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}