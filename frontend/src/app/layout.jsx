import '../styles/globals.css';

export const metadata = {
  title: 'Internship Matching Platform',
  description: 'Find your perfect internship match',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
