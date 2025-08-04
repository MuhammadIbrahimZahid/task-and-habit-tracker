import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'TaskHabit - Personal Task & Habit Tracker',
    template: '%s | TaskHabit',
  },
  description:
    'A comprehensive task management and habit tracking application to boost your productivity and build better habits.',
  keywords: [
    'task management',
    'habit tracking',
    'productivity',
    'personal development',
    'goal tracking',
  ],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://taskhabit.com',
    title: 'TaskHabit - Personal Task & Habit Tracker',
    description:
      'Master your tasks and build better habits with our comprehensive productivity platform.',
    siteName: 'TaskHabit',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaskHabit - Personal Task & Habit Tracker',
    description:
      'Master your tasks and build better habits with our comprehensive productivity platform.',
    creator: '@yourusername',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <div id="root" className="min-h-screen">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
