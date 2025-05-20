import Link from "next/link";

export default function WelcomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)',
    }}>
      <div style={{
        maxWidth: 480,
        width: '100%',
        padding: 40,
        borderRadius: 20,
        background: '#fff',
        boxShadow: '0 8px 32px rgba(31, 41, 55, 0.12)',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{
          width: 72,
          height: 72,
          margin: '0 auto 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(99,102,241,0.12)',
        }}>
          <span style={{ fontSize: 40, color: '#fff' }}>🎉</span>
        </div>
        <h1 style={{ color: '#1e293b', fontSize: 32, fontWeight: 700, marginBottom: 10, letterSpacing: -1 }}>Welcome to Danny's Store!</h1>
        <p style={{ fontSize: 18, color: '#334155', marginBottom: 20, lineHeight: 1.5 }}>
          Your account has been created and you're now signed in.<br />
          We're excited to have you join our community!
        </p>
        <ul style={{
          fontSize: 16,
          color: '#64748b',
          marginBottom: 28,
          paddingLeft: 0,
          listStyle: 'none',
          textAlign: 'left',
        }}>
          <li style={{ marginBottom: 8 }}>🛒 <strong>Shop</strong> our latest products and deals</li>
          <li style={{ marginBottom: 8 }}>📦 <strong>Track</strong> your orders and manage your addresses</li>
          <li>⭐ <strong>Leave reviews</strong> and help others choose</li>
        </ul>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
          <Link href="/" style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
            color: '#fff',
            padding: '12px 32px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 16,
            boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
            transition: 'background 0.2s',
          }}>Go to Home</Link>
          <Link href="/account" style={{
            background: '#f1f5f9',
            color: '#6366f1',
            padding: '12px 32px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 16,
            border: '1px solid #e0e7ef',
            transition: 'background 0.2s',
          }}>View My Account</Link>
        </div>
        <p style={{ marginTop: 8, color: '#94a3b8', fontSize: 15 }}>
          Need help? <a href="/contact" style={{ color: '#06b6d4', textDecoration: 'underline' }}>Contact support</a>
        </p>
      </div>
    </div>
  );
} 