'use client';

export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Welcome to Internship Matching Platform</h1>
      <p>Find your perfect internship match based on skills and preferences.</p>
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <a href="/student/dashboard" style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          Student Dashboard
        </a>
        <a href="/employer/dashboard" style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          Employer Dashboard
        </a>
        <a href="/admin/dashboard" style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          Admin Dashboard
        </a>
      </div>
    </main>
  );
}
