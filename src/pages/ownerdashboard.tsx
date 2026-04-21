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

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'consultations', label: 'Consultations', icon: '📬' },
  { id: 'jobs', label: 'Jobs', icon: '📋' },
  { id: 'clients', label: 'Clients', icon: '👤' },
  { id: 'cleaners', label: 'Cleaners', icon: '👥' },
  { id: 'invoices', label: 'Invoices', icon: '💰' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'services', label: 'Services', icon: '⚙️' },
]

const Badge = ({ label, color = 'navy' }: { label: string, color?: string }) => {
  const colors: any = {
    navy: { bg: 'rgba(13,33,68,0.08)', text: C.navy },
    red: { bg: 'rgba(200,16,46,0.10)', text: C.red },
    green: { bg: 'rgba(16,150,72,0.10)', text: '#109648' },
    yellow: { bg: 'rgba(200,140,16,0.10)', text: '#C88C10' },
    gray: { bg: C.lightGray, text: C.darkGray },
  }
  const s = colors[color] || colors.navy
  return (
    <span style={{ background: s.bg, color: s.text, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const }}>
      {label}
    </span>
  )
}

const Modal = ({ title, onClose, children }: any) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
    <div style={{ background: C.white, borderRadius: 14, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' as const, padding: 28, boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{title}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.midGray, cursor: 'pointer', fontSize: 24 }}>×</button>
      </div>
      {children}
    </div>
  </div>
)

const Input = ({ label, ...props }: any) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: 'block', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>{label}</label>}
    <input {...props} style={{ width: '100%', background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' as const }} />
  </div>
)

const Btn = ({ children, onClick, variant = 'primary', style: s }: any) => (
  <button onClick={onClick} style={{
    background: variant === 'primary' ? C.red : 'transparent',
    color: variant === 'primary' ? C.white : C.navy,
    border: `1.5px solid ${variant === 'primary' ? C.red : C.navy}`,
    borderRadius: 7, padding: '10px 20px', fontWeight: 700, fontSize: 13,
    cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em', ...s
  }}>{children}</button>
)

export default function OwnerDashboard({ profile }: { profile: any }) {
  const [tab, setTab] = useState('dashboard')
  const [consultations, setConsultations] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [cleaners, setCleaners] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [showModal, setShowModal] = useState('')
  const [newService, setNewService] = useState({ name: '', description: '', base_price: '' })
  const [newJob, setNewJob] = useState({ title: '', type: 'Post-Construction', address: '', scheduled_date: '', scheduled_time: '', price: '', access_notes: '', client_id: '' })
  const [mobileNav, setMobileNav] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    const [c, j, cl, cn, i, s] = await Promise.all([
      supabase.from('consultations').select('*').order('created_at', { ascending: false }),
      supabase.from('jobs').select('*').order('scheduled_date', { ascending: true }),
      supabase.from('clients').select('*, profiles(full_name, email, phone)').order('created_at', { ascending: false }),
      supabase.from('cleaners').select('*, profiles(full_name, email, phone)').order('created_at', { ascending: false }),
      supabase.from('invoices').select('*, clients(profiles(full_name))').order('created_at', { ascending: false }),
      supabase.from('services').select('*').order('created_at', { ascending: false }),
    ])
    setConsultations(c.data || [])
    setJobs(j.data || [])
    setClients(cl.data || [])
    setCleaners(cn.data || [])
    setInvoices(i.data || [])
    setServices(s.data || [])
  }

  const updateConsultation = async (id: string, status: string) => {
    await supabase.from('consultations').update({ status }).eq('id', id)
    fetchAll()
  }

  const updateJobStatus = async (id: string, status: string) => {
    await supabase.from('jobs').update({ status }).eq('id', id)
    fetchAll()
  }

  const addService = async () => {
    if (!newService.name) return
    await supabase.from('services').insert([{ ...newService, base_price: Number(newService.base_price) }])
    setNewService({ name: '', description: '', base_price: '' })
    setShowModal('')
    fetchAll()
  }

  const addJob = async () => {
    if (!newJob.title || !newJob.scheduled_date) return
    await supabase.from('jobs').insert([{ ...newJob, price: Number(newJob.price), status: 'scheduled' }])
    setNewJob({ title: '', type: 'Post-Construction', address: '', scheduled_date: '', scheduled_time: '', price: '', access_notes: '', client_id: '' })
    setShowModal('')
    fetchAll()
  }

  const markInvoicePaid = async (id: string, method: string) => {
    await supabase.from('invoices').update({ status: 'paid', payment_method: method, paid_at: new Date().toISOString() }).eq('id', id)
    fetchAll()
  }

  const signOut = async () => { await supabase.auth.signOut() }

  const newConsultations = consultations.filter(c => c.status === 'new').length
  const pendingInvoices = invoices.filter(i => i.status === 'pending')
  const totalOutstanding = pendingInvoices.reduce((a, b) => a + (b.amount || 0), 0)
  const todayJobs = jobs.filter(j => j.scheduled_date === new Date().toISOString().split('T')[0])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.offWhite, fontFamily: "'Barlow', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: C.navy, display: 'flex', flexDirection: 'column' as const, flexShrink: 0, position: 'sticky' as const, top: 0, height: '100vh' }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: C.white, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>PRECISION POST</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginTop: 2 }}>Owner Portal</div>
        </div>
        <div style={{ padding: '12px 8px', flex: 1, overflowY: 'auto' as const }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '9px 12px', borderRadius: 7, marginBottom: 2,
              background: tab === n.id ? 'rgba(200,16,46,0.20)' : 'transparent',
              border: tab === n.id ? '1px solid rgba(200,16,46,0.35)' : '1px solid transparent',
              color: tab === n.id ? C.white : 'rgba(255,255,255,0.55)',
              fontWeight: tab === n.id ? 700 : 500, fontSize: 13, cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left' as const
            }}>
              <span>{n.icon}</span>
              <span>{n.label}</span>
              {n.id === 'consultations' && newConsultations > 0 && <span style={{ marginLeft: 'auto', background: C.red, color: C.white, fontSize: 10, fontWeight: 800, borderRadius: 10, padding: '1px 7px' }}>{newConsultations}</span>}
            </button>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{profile?.full_name || 'Owner'}</div>
          <button onClick={signOut} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4, fontFamily: 'inherit' }}>Sign Out</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: 28, overflowY: 'auto' as const }}>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const }}>Good Morning 👋</div>
              <div style={{ color: C.midGray, fontSize: 13 }}>Here's your business overview</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
              {[
                { label: "Today's Jobs", val: todayJobs.length, color: C.navy },
                { label: 'Active Clients', val: clients.length, color: C.navy },
                { label: 'Active Cleaners', val: cleaners.length, color: C.navy },
                { label: 'Outstanding', val: `$${totalOutstanding.toLocaleString()}`, color: C.red },
                { label: 'New Requests', val: newConsultations, color: newConsultations > 0 ? C.red : C.navy },
              ].map(s => (
                <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '18px 20px', boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 30, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ color: C.midGray, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
              <div style={{ color: C.navy, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 14 }}>Upcoming Jobs</div>
              {jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').slice(0, 5).map((job, i, arr) => (
                <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.lightGray}` : 'none', gap: 10, flexWrap: 'wrap' as const }}>
                  <div>
                    <div style={{ color: C.text, fontWeight: 600, fontSize: 14 }}>{job.title}</div>
                    <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>{job.scheduled_date} · {job.address}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const }}>
                    <Badge label={job.status} color={job.status === 'in_progress' ? 'yellow' : job.status === 'completed' ? 'green' : 'navy'} />
                    <span style={{ color: C.navy, fontWeight: 800, fontSize: 14 }}>${job.price}</span>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No jobs yet. Book your first job!</div>}
            </div>
          </div>
        )}

        {/* CONSULTATIONS */}
        {tab === 'consultations' && (
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 20 }}>Consultation Requests</div>
            {consultations.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No consultation requests yet.</div>}
            {consultations.map(c => (
              <div key={c.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 12, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                    <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>{c.email} · {c.phone}</div>
                    <div style={{ color: C.midGray, fontSize: 12 }}>{c.address}</div>
                  </div>
                  <Badge label={c.status} color={c.status === 'new' ? 'red' : c.status === 'converted' ? 'green' : 'gray'} />
                </div>
                <div style={{ background: C.offWhite, borderRadius: 7, padding: '10px 12px', marginBottom: 12 }}>
                  <div style={{ color: C.navy, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>{c.service_type}</div>
                  <div style={{ color: C.darkGray, fontSize: 13 }}>{c.message}</div>
                </div>
                {c.status === 'new' && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
                    <Btn onClick={() => updateConsultation(c.id, 'contacted')} style={{ padding: '7px 16px', fontSize: 12 }}>Mark Contacted</Btn>
                    <Btn onClick={() => updateConsultation(c.id, 'converted')} variant="outline" style={{ padding: '7px 16px', fontSize: 12 }}>Convert to Job</Btn>
                    <Btn onClick={() => updateConsultation(c.id, 'declined')} variant="outline" style={{ padding: '7px 16px', fontSize: 12, borderColor: C.midGray, color: C.midGray }}>Decline</Btn>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* JOBS */}
        {tab === 'jobs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' as const, gap: 12 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const }}>Jobs</div>
              <Btn onClick={() => setShowModal('job')}>+ New Job</Btn>
            </div>
            {jobs.map((job, i) => (
              <div key={job.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', marginBottom: 10, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 10 }}>
                  <div>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{job.title}</div>
                    <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>{job.scheduled_date} {job.scheduled_time && `· ${job.scheduled_time}`} · {job.address}</div>
                    {job.access_notes && <div style={{ color: C.red, fontSize: 12, marginTop: 2 }}>🔑 {job.access_notes}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const }}>
                    <Badge label={job.type} color="navy" />
                    <Badge label={job.status} color={job.status === 'in_progress' ? 'yellow' : job.status === 'completed' ? 'green' : 'navy'} />
                    <span style={{ color: C.navy, fontWeight: 800, fontSize: 15 }}>${job.price}</span>
                    {job.status === 'scheduled' && <Btn onClick={() => updateJobStatus(job.id, 'in_progress')} style={{ padding: '6px 14px', fontSize: 12 }}>Start</Btn>}
                    {job.status === 'in_progress' && <Btn onClick={() => updateJobStatus(job.id, 'completed')} style={{ padding: '6px 14px', fontSize: 12 }}>Complete</Btn>}
                  </div>
                </div>
              </div>
            ))}
            {jobs.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No jobs yet.</div>}
          </div>
        )}

        {/* CLIENTS */}
        {tab === 'clients' && (
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 20 }}>Clients</div>
            {clients.map(c => (
              <div key={c.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', marginBottom: 10, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{c.profiles?.full_name}</div>
                <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>{c.profiles?.email} · {c.profiles?.phone}</div>
                <div style={{ color: C.midGray, fontSize: 12 }}>{c.address}, {c.city} {c.state}</div>
                <div style={{ marginTop: 8 }}><Badge label={c.type || 'commercial'} color="navy" /></div>
              </div>
            ))}
            {clients.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No clients yet. Clients are added when they register.</div>}
          </div>
        )}

        {/* CLEANERS */}
        {tab === 'cleaners' && (
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 20 }}>Cleaners</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
              {cleaners.map(c => (
                <div key={c.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 800, fontSize: 18 }}>{c.profiles?.full_name?.[0] || '?'}</div>
                    <Badge label={c.status || 'active'} color={c.status === 'active' ? 'green' : 'yellow'} />
                  </div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{c.profiles?.full_name}</div>
                  <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>{c.profiles?.phone}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                    <div><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, color: C.navy }}>{c.total_jobs || 0}</div><div style={{ color: C.midGray, fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Jobs</div></div>
                    <div><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, color: C.navy }}>⭐ {c.rating || 5.0}</div><div style={{ color: C.midGray, fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Rating</div></div>
                  </div>
                </div>
              ))}
            </div>
            {cleaners.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No cleaners yet. Cleaners are added when they register.</div>}
          </div>
        )}

        {/* INVOICES */}
        {tab === 'invoices' && (
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 20 }}>Invoices</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '18px 20px' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: C.navy }}>${invoices.filter(i => i.status === 'paid').reduce((a, b) => a + (b.amount || 0), 0).toLocaleString()}</div>
                <div style={{ color: C.midGray, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Collected</div>
              </div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '18px 20px' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: C.red }}>${totalOutstanding.toLocaleString()}</div>
                <div style={{ color: C.midGray, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Outstanding</div>
              </div>
            </div>
            {invoices.map(inv => (
              <div key={inv.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 10 }}>
                <div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{inv.clients?.profiles?.full_name || 'Client'}</div>
                  <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>{inv.due_date} · {inv.payment_method || 'Pending payment'}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Badge label={inv.status} color={inv.status === 'paid' ? 'green' : inv.status === 'overdue' ? 'red' : 'yellow'} />
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, color: C.navy, fontSize: 18 }}>${inv.amount}</span>
                  {inv.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn onClick={() => markInvoicePaid(inv.id, 'square')} style={{ padding: '6px 12px', fontSize: 11 }}>Square</Btn>
                      <Btn onClick={() => markInvoicePaid(inv.id, 'zelle')} variant="outline" style={{ padding: '6px 12px', fontSize: 11 }}>Zelle</Btn>
                      <Btn onClick={() => markInvoicePaid(inv.id, 'cash')} variant="outline" style={{ padding: '6px 12px', fontSize: 11 }}>Cash</Btn>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {invoices.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No invoices yet.</div>}
          </div>
        )}

        {/* SERVICES */}
        {tab === 'services' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' as const, gap: 12 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const }}>Services Menu</div>
              <Btn onClick={() => setShowModal('service')}>+ Add Service</Btn>
            </div>
            {services.map(s => (
              <div key={s.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 10 }}>
                <div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                  <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>{s.description}</div>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, color: C.navy, fontSize: 20 }}>Starting at ${s.base_price}</div>
              </div>
            ))}
            {services.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No services yet. Add your first service.</div>}
          </div>
        )}

        {/* MESSAGES */}
        {tab === 'messages' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column' as const, gap: 12 }}>
            <div style={{ fontSize: 40 }}>💬</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const }}>Messages</div>
            <div style={{ color: C.midGray, fontSize: 13 }}>Messaging coming in next update</div>
          </div>
        )}
      </div>

      {/* Add Service Modal */}
      {showModal === 'service' && (
        <Modal title="Add Service" onClose={() => setShowModal('')}>
          <Input label="Service Name" value={newService.name} onChange={(e: any) => setNewService(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Post-Construction Clean" />
          <Input label="Description" value={newService.description} onChange={(e: any) => setNewService(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
          <Input label="Starting Price ($)" type="number" value={newService.base_price} onChange={(e: any) => setNewService(f => ({ ...f, base_price: e.target.value }))} placeholder="0" />
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Btn onClick={addService} style={{ flex: 1 }}>Save Service</Btn>
            <Btn variant="outline" onClick={() => setShowModal('')} style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* Add Job Modal */}
      {showModal === 'job' && (
        <Modal title="New Job" onClose={() => setShowModal('')}>
          <Input label="Job Title" value={newJob.title} onChange={(e: any) => setNewJob(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Riverside Construction Final Clean" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Job Type</label>
            <select value={newJob.type} onChange={(e: any) => setNewJob(f => ({ ...f, type: e.target.value }))} style={{ width: '100%', background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' as const, appearance: 'none' as const }}>
              <option>Post-Construction</option>
              <option>Commercial</option>
              <option>Deep Clean</option>
              <option>Other</option>
            </select>
          </div>
          <Input label="Address" value={newJob.address} onChange={(e: any) => setNewJob(f => ({ ...f, address: e.target.value }))} placeholder="Job site address" />
          <Input label="Date" type="date" value={newJob.scheduled_date} onChange={(e: any) => setNewJob(f => ({ ...f, scheduled_date: e.target.value }))} />
          <Input label="Time" type="time" value={newJob.scheduled_time} onChange={(e: any) => setNewJob(f => ({ ...f, scheduled_time: e.target.value }))} />
          <Input label="Price ($)" type="number" value={newJob.price} onChange={(e: any) => setNewJob(f => ({ ...f, price: e.target.value }))} placeholder="0" />
          <Input label="Access / Clearance Notes" value={newJob.access_notes} onChange={(e: any) => setNewJob(f => ({ ...f, access_notes: e.target.value }))} placeholder="Gate code, key location, contact person..." />
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Btn onClick={addJob} style={{ flex: 1 }}>Create Job</Btn>
            <Btn variant="outline" onClick={() => setShowModal('')} style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}