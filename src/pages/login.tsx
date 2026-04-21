import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://cmxivkphfhxtxhaqevch.supabase.co', 'sb_publishable_G2WC5Z0MrSeqQHqy8PxU0Q_vFy49Lcv')

const C = {
  navy: '#0D2144',
  navyDark: '#081729',
  red: '#C8102E',
  white: '#FFFFFF',
  offWhite: '#F4F6F9',
  border: '#D6DCE6',
  midGray: '#8A95A3',
  text: '#1A2535',
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.navyDark, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 800, color: C.white, letterSpacing: '0.06em', textTransform: 'uppercase' }}>PRECISION POST</div>
          <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: C.midGray, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>CLEANING CO.</div>
          <div style={{ width: 40, height: 3, background: C.red, borderRadius: 2, margin: '12px auto 0' }} />
        </div>

        {/* Card */}
        <div style={{ background: C.white, borderRadius: 14, padding: 32, boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: C.navy, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Welcome Back</div>
          <div style={{ color: C.midGray, fontSize: 13, marginBottom: 24 }}>Sign in to your account</div>

          {error && (
            <div style={{ background: 'rgba(200,16,46,0.08)', border: '1px solid rgba(200,16,46,0.2)', borderRadius: 8, padding: '10px 14px', color: C.red, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ width: '100%', background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, padding: '11px 14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, padding: '11px 14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', background: C.red, border: 'none', color: C.white, padding: '13px', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.04em', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing In...' : 'Sign In →'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <a href="/" style={{ color: C.midGray, fontSize: 13, textDecoration: 'none' }}>← Back to website</a>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          Precision Post Cleaning Co. © 2026
        </div>
      </div>
    </div>
  )
}