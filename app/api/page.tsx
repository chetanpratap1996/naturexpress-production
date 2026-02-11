export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #eff6ff, #e0f2fe)'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌿</div>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '1rem'
        }}>
          NatureXpress
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>
          EUDR Compliance Platform
        </p>
        <div style={{ marginTop: '2rem' }}>
          <span style={{
            backgroundColor: '#d1fae5',
            color: '#065f46',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            ✓ System Ready
          </span>
        </div>
      </div>
    </div>
  );
}