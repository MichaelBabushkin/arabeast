import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Noto_Naskh_Arabic } from 'next/font/google';
import './globals.css';

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-naskh',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Arabeast | Gamified Arabic Learning',
  description: 'Quick Arabic vocab quizzes with hearts, XP, and streaks.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${notoNaskh.variable}`}>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
