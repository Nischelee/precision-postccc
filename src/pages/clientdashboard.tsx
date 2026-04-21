import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://cmxivkphfhxtxhaqevch.supabase.co', 'sb_publishable_G2WC5Z0MrSeqQHqy8PxU0Q_vFy49Lcv')

const C = {
  navy: '#0D2144',
  navyDark: '#081729',
  red: '#C8102E',
  white: '#FFFFFF',
  offWhite: '#F4F6F9',
  lightGray: '#E8ECF2',
  midGray: '#8A95A3',
  darkGray: '#4A5568',
  text: '#1A2535',
  border: '#D6DCE6',
}

export default function ClientDashboard({ profile }: { profile: any }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [tab, setTab] = useState('jobs')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', profile.id)
      .single()

    if (!client) { setLoading(false); return }

    const [j, i] = await Promise.all([
      supabase.from('jobs').select('*').eq('client_id', client.id).order('scheduled_date', { ascending: true }),
      supabase.from('invoices').select('*').eq('client_id', client.id).order('created_at', { ascending: false }),
    ])

    setJobs(j.data || [])
    setInvoices(i.data || [])
    setLoading(false)
  }

  const signOut = async () => { await supabase.auth.signOut() }

  const pendingInvoices = invoices.filter(i => i.status === 'pending')
  const totalOutstanding = pendingInvoices.reduce((a, b) => a + (b.amount || 0), 0)
  const upcomingJobs = jobs.filter(j => j.status === 'scheduled' || j.status === 'in_progress')

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.navyDark }}>
      <div style={{ color: C.white, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.offWhite, fontFamily: "'Barlow', sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: C.white, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: '0.06em' }}>PRECISION POST</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Client Portal</div>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{profile?.full_name}</div>
          <button onClick={signOut} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Sign Out</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Upcoming Jobs', val: upcomingJobs.length, color: C.navy },
            { label: 'Outstanding', val: `$${totalOutstanding.toLocaleString()}`, color: totalOutstanding > 0 ? C.red : C.navy },
          ].map(s => (
            <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ color: C.midGray, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', padding: '0 24px' }}>
        {[{ id: 'jobs', label: '📋 Jobs' }, { id: 'invoices', label: '💰 Invoices' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '13px 20px', background: 'transparent', border: 'none',
            borderBottom: tab === t.id ? `3px solid ${C.red}` : '3px solid transparent',
            color: tab === t.id ? C.navy : C.midGray,
            fontWeight: tab === t.id ? 700 : 500, fontSize: 14, cursor: 'pointer',
            fontFamily: 'inherit'
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Jobs Tab */}
        {tab === 'jobs' && (
          <div>
            {jobs.length === 0 && (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, textAlign: 'center' as const }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏗️</div>
                <div style={{ color: C.midGray, fontSize: 14 }}>No jobs scheduled yet.</div>
                <div style={{ color: C.midGray, fontSize: 13, marginTop: 4 }}>Contact us to book your first clean.</div>
              </div>
            )}
            {jobs.map(job => (
              <div key={job.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap' as const, gap: 8 }}>
                  <span style={{ background: 'rgba(13,33,68,0.08)', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const }}>{job.type}</span>
                  <span style={{
                    background: job.status === 'completed' ? 'rgba(16,150,72,0.10)' : job.status === 'in_progress' ? 'rgba(200,140,16,0.10)' : 'rgba(13,33,68,0.08)',
                    color: job.status === 'completed' ? '#109648' : job.status === 'in_progress' ? '#C88C10' : C.navy,
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const
                  }}>{job.status}</span>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 4 }}>{job.title}</div>
                <div style={{ color: C.midGray, fontSize: 13, marginBottom: 2 }}>📍 {job.address}</div>
                <div style={{ color: C.midGray, fontSize: 13 }}>📅 {job.scheduled_date} {job.scheduled_time && `· ${job.scheduled_time}`}</div>
              </div>
            ))}
          </div>
        )}

        {/* Invoices Tab */}
        {tab === 'invoices' && (
          <div>
            {invoices.length === 0 && (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, textAlign: 'center' as const }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
                <div style={{ color: C.midGray, fontSize: 14 }}>No invoices yet.</div>
              </div>
            )}
            {invoices.map(inv => (
              <div key={inv.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800, color: C.navy }}>${inv.amount?.toLocaleString()}</div>
                    <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>Due: {inv.due_date || 'Upon receipt'}</div>
                    {inv.payment_method && <div style={{ color: C.midGray, fontSize: 12 }}>Paid via {inv.payment_method}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{
                      background: inv.status === 'paid' ? 'rgba(16,150,72,0.10)' : inv.status === 'overdue' ? 'rgba(200,16,46,0.10)' : 'rgba(200,140,16,0.10)',
                      color: inv.status === 'paid' ? '#109648' : inv.status === 'overdue' ? C.red : '#C88C10',
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const
                    }}>{inv.status}</span>
                    {inv.status === 'pending' && (
                      <button style={{ background: C.red, border: 'none', color: C.white, padding: '8px 18px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}