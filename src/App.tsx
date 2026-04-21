import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import Landing from './pages/landing.tsx'
import Login from './pages/login.tsx'
import OwnerDashboard from './pages/ownerdashboard.tsx'
import CleanerDashboard from './pages/cleanerdashboard.tsx'
import ClientDashboard from './pages/clientdashboard.tsx'
const supabase = createClient(
  'https://cmxivkphfhxtxhaqevch.supabase.co',
  'sb_publishable_G2WC5Z0MrSeqQHqy8PxU0Q_vFy49Lcv'
)

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0D2144' }}>
      <div style={{ color: 'white', fontFamily: 'Barlow Condensed', fontSize: 24, fontWeight: 800, letterSpacing: '0.1em' }}>PRECISION POST...</div>
    </div>
  )

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={
        session && profile ? (
          profile.role === 'owner' ? <OwnerDashboard profile={profile} /> :
          profile.role === 'cleaner' ? <CleanerDashboard profile={profile} /> :
          <ClientDashboard profile={profile} />
        ) : <Navigate to="/login" />
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}