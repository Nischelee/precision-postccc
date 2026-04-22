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
  const [tab, setTab] = useState('overview')
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

  const upcomingJobs = jobs.filter(j => j.status === 'scheduled' || j.status === 'in_progress')
  const completedJobs = jobs.filter(j => j.status === 'completed')
  const pendingInvoices = invoices.filter(i => i.status === 'pending')
  const paidInvoices = invoices.filter(i => i.status === 'paid')
  const totalOutstanding = pendingInvoices.reduce((a, b) => a + (b.amount || 0), 0)
  const totalPaid = paidInvoices.reduce((a, b) => a + (b.amount || 0), 0)

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
          <img src="https://i.imgur.com/9UVzMKd.png" alt="Precision Post" style={{ height: 36, objectFit: 'contain' as const }} />
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{profile?.full_name}</div>
          <button onClick={signOut} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Sign Out</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: C.navy }}>{upcomingJobs.length}</div>
            <div style={{ color: C.midGray, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginTop: 2 }}>Upcoming Jobs</div>
          </div>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: totalOutstanding > 0 ? C.red : C.navy }}>${totalOutstanding.toLocaleString()}</div>
            <div style={{ color: C.midGray, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginTop: 2 }}>Outstanding</div>
          </div>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: '#109648' }}>${totalPaid.toLocaleString()}</div>
            <div style={{ color: C.midGray, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginTop: 2 }}>Total Paid</div>
          </div>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: C.navy }}>{completedJobs.length}</div>
            <div style={{ color: C.midGray, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginTop: 2 }}>Jobs Completed</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', padding: '0 24px' }}>
        {[
          { id: 'overview', label: '📋 Jobs' },
          { id: 'invoices', label: '💰 Invoices' },
          { id: 'contact', label: '📞 Contact Us' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '13px 18px', background: 'transparent', border: 'none',
            borderBottom: tab === t.id ? `3px solid ${C.red}` : '3px solid transparent',
            color: tab === t.id ? C.navy : C.midGray,
            fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: 'pointer',
            fontFamily: 'inherit'
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '20px 24px' }}>

        {/* Jobs Tab */}
        {tab === 'overview' && (
          <div>
            {upcomingJobs.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ color: C.navy, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Upcoming</div>
                {upcomingJobs.map(job => (
                  <div key={job.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 10, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap' as const, gap: 8 }}>
                      <span style={{ background: 'rgba(13,33,68,0.08)', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const }}>{job.type}</span>
                      <span style={{ background: job.status === 'in_progress' ? 'rgba(200,140,16,0.10)' : 'rgba(13,33,68,0.08)', color: job.status === 'in_progress' ? '#C88C10' : C.navy, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const }}>{job.status}</span>
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, fontWeight: 700, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 4 }}>{job.title}</div>
                    <div style={{ color: C.midGray, fontSize: 12, marginBottom: 2 }}>📍 {job.address}</div>
                    <div style={{ color: C.midGray, fontSize: 12 }}>
                      📅 {job.scheduled_date}
                      {job.end_date && ` → ${job.end_date}`}
                      {job.days && ` · ${job.days} day(s)`}
                      {job.scheduled_time && ` · ${job.scheduled_time}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {completedJobs.length > 0 && (
              <div>
                <div style={{ color: C.midGray, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Completed</div>
                {completedJobs.map(job => (
                  <div key={job.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 10, opacity: 0.8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap' as const, gap: 8 }}>
                      <span style={{ background: 'rgba(13,33,68,0.08)', color: C.navy, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const }}>{job.type}</span>
                      <span style={{ background: 'rgba(16,150,72,0.10)', color: '#109648', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const }}>Completed</span>
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, fontWeight: 700, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 4 }}>{job.title}</div>
                    <div style={{ color: C.midGray, fontSize: 12 }}>📅 {job.scheduled_date} · 📍 {job.address}</div>
                  </div>
                ))}
              </div>
            )}

            {jobs.length === 0 && (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, textAlign: 'center' as const }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏗️</div>
                <div style={{ color: C.midGray, fontSize: 14 }}>No jobs scheduled yet.</div>
                <div style={{ color: C.midGray, fontSize: 13, marginTop: 4 }}>Contact us to get started.</div>
              </div>
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {tab === 'invoices' && (
          <div>
            {pendingInvoices.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ color: C.red, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Outstanding</div>
                {pendingInvoices.map(inv => (
                  <div key={inv.id} style={{ background: C.white, border: `1.5px solid rgba(200,16,46,0.2)`, borderRadius: 12, padding: 16, marginBottom: 10, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 10 }}>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: C.navy }}>${inv.amount?.toLocaleString()}</div>
                        <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>Due: {inv.due_date || 'Upon receipt'}</div>
                      </div>
                      <span style={{ background: 'rgba(200,140,16,0.10)', color: '#C88C10', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const }}>Pending</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {paidInvoices.length > 0 && (
              <div>
                <div style={{ color: C.midGray, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Payment History</div>
                {paidInvoices.map(inv => (
                  <div key={inv.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 10, opacity: 0.85 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 10 }}>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: C.navy }}>${inv.amount?.toLocaleString()}</div>
                        <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>
                          Paid {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : ''} 
                          {inv.payment_method && ` · via ${inv.payment_method}`}
                        </div>
                      </div>
                      <span style={{ background: 'rgba(16,150,72,0.10)', color: '#109648', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const }}>Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {invoices.length === 0 && (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, textAlign: 'center' as const }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
                <div style={{ color: C.midGray, fontSize: 14 }}>No invoices yet.</div>
              </div>
            )}
          </div>
        )}

        {/* Contact Tab */}
        {tab === 'contact' && (
          <div>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 4 }}>Precision Post Cleaning Co.</div>
              <div style={{ color: C.midGray, fontSize: 13, marginBottom: 20 }}>Built Rough. Finished Right.</div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
                <a href="tel:+1" style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.navy, borderRadius: 10, padding: '14px 18px', color: C.white, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                  <span style={{ fontSize: 20 }}>📞</span> Call Us
                </a>
                <a href="mailto:nischelee@precisionpostcleaningco.com" style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', color: C.navy, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                  <span style={{ fontSize: 20 }}>✉️</span> Email Us
                </a>
                <a href="sms:+1" style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', color: C.navy, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                  <span style={{ fontSize: 20 }}>💬</span> Send a Text
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
