export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        SSII IA Platform
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#666', textAlign: 'center', maxWidth: '600px' }}>
        Plateforme intelligente pour la gestion de projets logiciels
      </p>
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <p style={{ margin: 0, color: '#333' }}>
          ✅ Base de données configurée
        </p>
        <p style={{ margin: '0.5rem 0 0 0', color: '#333' }}>
          🚀 Déploiement Vercel opérationnel
        </p>
      </div>
    </main>
  )
}
