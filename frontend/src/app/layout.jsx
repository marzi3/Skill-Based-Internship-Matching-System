import { Providers } from '../context/Providers';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'InternMatch - Student Internship Platform',
  description: 'Find your perfect student internship match with advanced skill verification.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
