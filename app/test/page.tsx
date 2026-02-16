'use client';

export default function TestPage() {
  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', color: '#0070f3' }}>
        ✅ Test Page
      </h1>
      <p style={{ fontSize: '1.2rem' }}>
        If you can see this page, static export is working correctly!
      </p>
      <div style={{
        padding: '1rem',
        backgroundColor: '#e6f7e6',
        borderRadius: '8px',
        marginTop: '1rem'
      }}>
        <strong>Success!</strong> The routing is working.
      </div>
    </div>
  );
}