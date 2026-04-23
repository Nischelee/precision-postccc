import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
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
  { id: 'quotes', label: 'Quotes', icon: '📄' },
  { id: 'jobs', label: 'Jobs', icon: '📋' },
  { id: 'clients', label: 'Clients', icon: '👤' },
  { id: 'cleaners', label: 'Cleaners', icon: '👥' },
  { id: 'invoices', label: 'Invoices', icon: '💰' },
  { id: 'payroll', label: 'Payroll', icon: '💵' },
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
    orange: { bg: 'rgba(200,100,16,0.10)', text: '#C86410' },
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
    <div style={{ background: C.white, borderRadius: 14, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' as const, padding: 28, boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
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

const Textarea = ({ label, ...props }: any) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: 'block', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>{label}</label>}
    <textarea {...props} style={{ width: '100%', background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' as const, resize: 'vertical' as const, minHeight: 80, fontFamily: 'inherit' }} />
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
  const [quotes, setQuotes] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [cleaners, setCleaners] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [addons, setAddons] = useState<any[]>([])
  const [jobCleaners, setJobCleaners] = useState<any[]>([])
  const [showModal, setShowModal] = useState('')
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null)
  const [selectedCleaner, setSelectedCleaner] = useState('')
  const [confirmAction, setConfirmAction] = useState<any>(null)
  const [calcJobCost, setCalcJobCost] = useState('')
  const [calcWorkers, setCalcWorkers] = useState('')
  const [newService, setNewService] = useState({ name: '', description: '', base_price: '' })
  const [newAddon, setNewAddon] = useState({ name: '', price: '' })
  const [invoiceForm, setInvoiceForm] = useState<any>(null)
  const [quoteForm, setQuoteForm] = useState<any>(null)
  const [newJob, setNewJob] = useState({
    title: '', type: 'Post-Construction', address: '',
    scheduled_date: '', scheduled_time: '', price: '',
    access_notes: '', client_id: '', days: '', end_date: '',
    recurring: '', selected_addons: [] as string[]
  })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    const [c, q, j, cl, cn, i, s, jc, ao] = await Promise.all([
      supabase.from('consultations').select('*').order('created_at', { ascending: false }),
      supabase.from('quotes').select('*, clients(profiles(full_name, email, phone))').order('created_at', { ascending: false }),
      supabase.from('jobs').select('*').order('scheduled_date', { ascending: true }),
      supabase.from('clients').select('*, profiles(full_name, email, phone)').order('created_at', { ascending: false }),
      supabase.from('cleaners').select('*, profiles(full_name, email, phone)').order('created_at', { ascending: false }),
      supabase.from('invoices').select('*, clients(profiles(full_name))').order('created_at', { ascending: false }),
      supabase.from('services').select('*').eq('is_addon', false).order('created_at', { ascending: false }),
      supabase.from('job_cleaners').select('*, cleaners(*, profiles(full_name))'),
      supabase.from('services').select('*').eq('is_addon', true).order('created_at', { ascending: false }),
    ])
    setConsultations(c.data || [])
    setQuotes(q.data || [])
    setJobs(j.data || [])
    setClients(cl.data || [])
    setCleaners(cn.data || [])
    setInvoices(i.data || [])
    setServices(s.data || [])
    setJobCleaners(jc.data || [])
    setAddons(ao.data || [])
  }

  const updateConsultation = async (id: string, status: string) => {
    await supabase.from('consultations').update({ status }).eq('id', id)
    fetchAll()
  }

  const convertToJob = async (consultation: any) => {
    await supabase.from('jobs').insert([{
      title: `${consultation.service_type} - ${consultation.name}`,
      type: consultation.service_type,
      address: consultation.address,
      status: 'scheduled',
      price: 0,
      notes: consultation.message,
    }])
    await updateConsultation(consultation.id, 'converted')
    setTab('jobs')
    fetchAll()
  }

  const openQuoteModal = (consultation: any) => {
    setSelectedConsultation(consultation)
    setQuoteForm({
      consultation_id: consultation.id,
      client_id: '',
      services: consultation.service_type || '',
      description: consultation.message || '',
      total_amount: '',
    })
    setShowModal('quote')
  }

  const saveQuote = async () => {
    if (!quoteForm || !quoteForm.total_amount) return
    const total = Number(quoteForm.total_amount)
    const { error } = await supabase.from('quotes').insert([{
      consultation_id: quoteForm.consultation_id,
      client_id: quoteForm.client_id || null,
      services: quoteForm.services,
      description: quoteForm.description,
      total_amount: total,
      deposit_amount: total * 0.6,
      balance_amount: total * 0.4,
      status: 'draft',
    }])
    if (error) { alert('Error: ' + error.message); return }
    setShowModal('')
    setQuoteForm(null)
    fetchAll()
    setTab('quotes')
  }

  const downloadQuotePDF = (quote: any) => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.setTextColor(13, 33, 68)
    doc.text('PRECISION POST CLEANING CO.', 20, 20)
    doc.setFontSize(10)
    doc.setTextColor(138, 149, 163)
    doc.text('precisionpostcleaningco.com | Built Rough. Finished Right.', 20, 28)
    doc.setFontSize(16)
    doc.setTextColor(13, 33, 68)
    doc.text('QUOTE', 170, 20)
    doc.setFontSize(10)
    doc.setTextColor(138, 149, 163)
    doc.text(new Date().toLocaleDateString(), 170, 28)
    doc.setDrawColor(214, 220, 230)
    doc.line(20, 33, 190, 33)
    doc.setFontSize(11)
    doc.setTextColor(138, 149, 163)
    doc.text('Prepared for:', 20, 42)
    doc.setFontSize(13)
    doc.setTextColor(26, 37, 53)
    doc.text(quote.clients?.profiles?.full_name || 'Client', 20, 50)
    if (quote.clients?.profiles?.email) {
      doc.setFontSize(10)
      doc.setTextColor(138, 149, 163)
      doc.text(quote.clients.profiles.email, 20, 57)
    }
    doc.setFontSize(11)
    doc.setTextColor(13, 33, 68)
    doc.text('Services:', 20, 70)
    doc.setFontSize(10)
    doc.setTextColor(26, 37, 53)
    doc.text(quote.services || '', 20, 78)
    if (quote.description) {
      doc.setFontSize(10)
      doc.setTextColor(138, 149, 163)
      doc.text(quote.description, 20, 86, { maxWidth: 170 })
    }
    doc.line(20, 105, 190, 105)
    doc.setFontSize(12)
    doc.setTextColor(13, 33, 68)
    doc.text('Payment Schedule', 20, 115)
    ;(doc as any).autoTable({
      startY: 121,
      head: [['Description', 'Amount']],
      body: [
        ['60% Deposit — Due Before Job Starts', `$${Number(quote.deposit_amount).toLocaleString()}`],
        ['40% Balance — Due On Completion', `$${Number(quote.balance_amount).toLocaleString()}`],
        ['TOTAL', `$${Number(quote.total_amount).toLocaleString()}`],
      ],
      headStyles: { fillColor: [13, 33, 68], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { textColor: [26, 37, 53] },
      alternateRowStyles: { fillColor: [244, 246, 249] },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      styles: { fontSize: 11 },
    })
    doc.setFontSize(10)
    doc.setTextColor(138, 149, 163)
    doc.text('This quote is valid for 30 days from the date issued.', 20, 220)
    doc.text('Thank you for choosing Precision Post Cleaning Co.', 20, 228)
    doc.save(`PrecisionPost-Quote-${quote.clients?.profiles?.full_name || 'Client'}.pdf`)
  }

  const downloadInvoicePDF = (inv: any) => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.setTextColor(13, 33, 68)
    doc.text('PRECISION POST CLEANING CO.', 20, 20)
    doc.setFontSize(10)
    doc.setTextColor(138, 149, 163)
    doc.text('precisionpostcleaningco.com | Built Rough. Finished Right.', 20, 28)
    doc.setFontSize(16)
    doc.setTextColor(13, 33, 68)
    doc.text('INVOICE', 170, 20)
    doc.setFontSize(10)
    doc.setTextColor(138, 149, 163)
    doc.text(new Date().toLocaleDateString(), 170, 28)
    if (inv.invoice_number) doc.text(inv.invoice_number, 170, 35)
    doc.setDrawColor(214, 220, 230)
    doc.line(20, 33, 190, 33)
    doc.setFontSize(11)
    doc.setTextColor(138, 149, 163)
    doc.text('Bill To:', 20, 42)
    doc.setFontSize(13)
    doc.setTextColor(26, 37, 53)
    doc.text(inv.clients?.profiles?.full_name || 'Client', 20, 50)
    doc.line(20, 60, 190, 60)
    autoTable(doc, {
      startY: 66,
      head: [['Description', 'Amount']],
      body: [
        [inv.job_title || 'Services Rendered', `$${Number(inv.amount).toLocaleString()}`],
        ['TOTAL DUE', `$${Number(inv.amount).toLocaleString()}`],
      ],
      headStyles: { fillColor: [13, 33, 68], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { textColor: [26, 37, 53] },
      alternateRowStyles: { fillColor: [244, 246, 249] },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      styles: { fontSize: 11 },
    })
    doc.setFontSize(10)
    doc.setTextColor(138, 149, 163)
    doc.text(`Due Date: ${inv.due_date || 'Upon receipt'}`, 20, 160)
    if (inv.notes) doc.text(`Notes: ${inv.notes}`, 20, 168)
    doc.text('Thank you for choosing Precision Post Cleaning Co.', 20, 200)
    doc.save(`PrecisionPost-Invoice-${inv.clients?.profiles?.full_name || 'Client'}.pdf`)
  }

  const updateQuoteStatus = async (id: string, status: string) => {
    await supabase.from('quotes').update({ status }).eq('id', id)
    fetchAll()
  }

  const markDepositPaid = async (id: string, method: string) => {
    await supabase.from('quotes').update({
      deposit_paid: true,
      deposit_paid_at: new Date().toISOString(),
      deposit_payment_method: method,
      status: 'accepted'
    }).eq('id', id)
    fetchAll()
  }

  const updateJobStatus = async (id: string, status: string) => {
    await supabase.from('jobs').update({ status }).eq('id', id)
    fetchAll()
  }

  const assignCleaner = async () => {
    if (!selectedJob || !selectedCleaner) return
    const existing = jobCleaners.find(jc => jc.job_id === selectedJob.id && jc.cleaner_id === selectedCleaner)
    if (existing) { setShowModal(''); return }
    await supabase.from('job_cleaners').insert([{ job_id: selectedJob.id, cleaner_id: selectedCleaner }])
    setShowModal('')
    setSelectedCleaner('')
    fetchAll()
  }

  const removeCleanerFromJob = async (jobCleanerId: string) => {
    await supabase.from('job_cleaners').delete().eq('id', jobCleanerId)
    fetchAll()
  }

  const updateCleanerStatus = async (cleanerId: string, status: string) => {
    await supabase.from('cleaners').update({ status }).eq('id', cleanerId)
    setConfirmAction(null)
    fetchAll()
  }

  const addService = async () => {
    if (!newService.name) return
    await supabase.from('services').insert([{ ...newService, base_price: Number(newService.base_price), is_addon: false }])
    setNewService({ name: '', description: '', base_price: '' })
    setShowModal('')
    fetchAll()
  }

  const addAddon = async () => {
    if (!newAddon.name) return
    await supabase.from('services').insert([{ name: newAddon.name, base_price: Number(newAddon.price), is_addon: true, description: 'Add-on service' }])
    setNewAddon({ name: '', price: '' })
    setShowModal('')
    fetchAll()
  }

  const addJob = async () => {
    if (!newJob.title || !newJob.scheduled_date) return
    const addonCost = newJob.selected_addons.reduce((sum, id) => {
      const addon = addons.find((a: any) => a.id === id)
      return sum + (addon?.base_price || 0)
    }, 0)
    await supabase.from('jobs').insert([{
      title: newJob.title, type: newJob.type, address: newJob.address,
      scheduled_date: newJob.scheduled_date, scheduled_time: newJob.scheduled_time,
      price: Number(newJob.price) + addonCost, access_notes: newJob.access_notes,
      client_id: newJob.client_id || null, status: 'scheduled',
      recurring: newJob.recurring || null,
      notes: newJob.selected_addons.length > 0 ? `Add-ons: ${newJob.selected_addons.map(id => addons.find((a: any) => a.id === id)?.name).join(', ')}` : '',
    }])
    setNewJob({ title: '', type: 'Post-Construction', address: '', scheduled_date: '', scheduled_time: '', price: '', access_notes: '', client_id: '', days: '', end_date: '', recurring: '', selected_addons: [] })
    setShowModal('')
    fetchAll()
  }

  const openInvoiceModal = async (job: any) => {
    const existing = invoices.find(i => i.job_id === job.id)
    if (existing) {
      const client = clients.find(c => c.id === existing.client_id)
      setInvoiceForm({ ...existing, job_title: job.title, client_name: client?.profiles?.full_name || existing.clients?.profiles?.full_name || 'No client', editing: true })
      setShowModal('invoice')
      return
    }
    const invNum = `INV-${String(invoices.length + 1).padStart(3, '0')}`
    const client = clients.find(c => c.id === job.client_id)
    setInvoiceForm({
      job_id: job.id, job_title: job.title,
      client_name: client?.profiles?.full_name || 'No client assigned',
      client_id: job.client_id || null,
      amount: job.price || 0,
      invoice_number: invNum,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '', payment_method: '', editing: false,
    })
    setShowModal('invoice')
  }

  const saveInvoice = async () => {
    if (!invoiceForm) return
    if (invoiceForm.editing) {
      const { error } = await supabase.from('invoices').update({
        amount: Number(invoiceForm.amount),
        due_date: invoiceForm.due_date,
        notes: invoiceForm.notes || '',
        payment_method: invoiceForm.payment_method || null,
      }).eq('id', invoiceForm.id)
      if (error) { alert('Error: ' + error.message); return }
    } else {
      const { error } = await supabase.from('invoices').insert([{
        job_id: invoiceForm.job_id,
        client_id: invoiceForm.client_id || null,
        amount: Number(invoiceForm.amount),
        status: 'pending',
        due_date: invoiceForm.due_date,
        notes: invoiceForm.notes || '',
        invoice_number: invoiceForm.invoice_number,
      }])
      if (error) { alert('Error: ' + error.message); return }
    }
    setShowModal('')
    setInvoiceForm(null)
    fetchAll()
    setTab('invoices')
  }

  const markInvoicePaid = async (id: string, method: string) => {
    await supabase.from('invoices').update({ status: 'paid', payment_method: method, paid_at: new Date().toISOString() }).eq('id', id)
    fetchAll()
  }

  const signOut = async () => { await supabase.auth.signOut() }
  const getJobCleaners = (jobId: string) => jobCleaners.filter(jc => jc.job_id === jobId)
  const calcHours = (clockIn: string, clockOut: string) => {
    if (!clockIn || !clockOut) return 0
    return Math.round((new Date(clockOut).getTime() - new Date(clockIn).getTime()) / (1000 * 60 * 60) * 10) / 10
  }

  const newConsultations = consultations.filter(c => c.status === 'new').length
  const totalOutstanding = invoices.filter(i => i.status === 'pending').reduce((a, b) => a + (b.amount || 0), 0)
  const todayJobs = jobs.filter(j => j.scheduled_date === new Date().toISOString().split('T')[0])
  const calcResult = calcJobCost && calcWorkers ? {
    workerPool: Number(calcJobCost) * 0.4,
    perWorker: (Number(calcJobCost) * 0.4) / Number(calcWorkers),
    business: Number(calcJobCost) * 0.6
  } : null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.offWhite, fontFamily: "'Barlow', sans-serif" }}>
      <div style={{ width: 220, background: C.navy, display: 'flex', flexDirection: 'column' as const, flexShrink: 0, position: 'sticky' as const, top: 0, height: '100vh' }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <img src="https://i.imgur.com/9UVzMKd.png" alt="Precision Post" style={{ height: 36, objectFit: 'contain' as const }} />
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginTop: 6 }}>Owner Portal</div>
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

      <div style={{ flex: 1, padding: 28, overflowY: 'auto' as const }}>

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
                { label: 'Active Cleaners', val: cleaners.filter(c => c.status === 'active').length, color: C.navy },
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
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Badge label={job.status} color={job.status === 'in_progress' ? 'yellow' : job.status === 'completed' ? 'green' : job.status === 'on_hold' ? 'orange' : 'navy'} />
                    <span style={{ color: C.navy, fontWeight: 800, fontSize: 14 }}>${job.price}</span>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No jobs yet.</div>}
            </div>
          </div>
        )}

        {tab === 'consultations' && (
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 20 }}>Consultation Requests</div>
            {consultations.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No consultation requests yet.</div>}
            {consultations.map(c => (
              <div key={c.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 12, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                    <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>📞 {c.phone} · ✉️ {c.email}</div>
                    <div style={{ color: C.midGray, fontSize: 12 }}>📍 {c.address}</div>
                  </div>
                  <Badge label={c.status} color={c.status === 'new' ? 'red' : c.status === 'converted' ? 'green' : c.status === 'contacted' ? 'yellow' : 'gray'} />
                </div>
                <div style={{ background: C.offWhite, borderRadius: 7, padding: '10px 12px', marginBottom: 12 }}>
                  <div style={{ color: C.navy, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>{c.service_type}</div>
                  <div style={{ color: C.darkGray, fontSize: 13 }}>{c.message}</div>
                </div>
                {(c.status === 'new' || c.status === 'contacted') && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
                    {c.status === 'new' && <Btn onClick={() => updateConsultation(c.id, 'contacted')} style={{ padding: '7px 16px', fontSize: 12 }}>Mark Contacted</Btn>}
                    <Btn onClick={() => openQuoteModal(c)} variant="outline" style={{ padding: '7px 16px', fontSize: 12 }}>📄 Generate Quote</Btn>
                    <Btn onClick={() => convertToJob(c)} variant="outline" style={{ padding: '7px 16px', fontSize: 12 }}>Convert to Job</Btn>
                    <Btn onClick={() => updateConsultation(c.id, 'declined')} variant="outline" style={{ padding: '7px 16px', fontSize: 12, borderColor: C.midGray, color: C.midGray }}>Decline</Btn>
                  </div>
                )}
                {c.status === 'declined' && <Btn onClick={() => updateConsultation(c.id, 'new')} variant="outline" style={{ padding: '7px 16px', fontSize: 12 }}>Reopen</Btn>}
              </div>
            ))}
          </div>
        )}

        {tab === 'quotes' && (
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 20 }}>Quotes</div>
            {quotes.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No quotes yet. Generate one from a consultation.</div>}
            {quotes.map(q => (
              <div key={q.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 12, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{q.clients?.profiles?.full_name || 'No client linked'}</div>
                    <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>{q.services}</div>
                    <div style={{ color: C.darkGray, fontSize: 13, marginTop: 4 }}>{q.description}</div>
                  </div>
                  <Badge label={q.status} color={q.status === 'accepted' ? 'green' : q.status === 'declined' ? 'red' : q.status === 'sent' ? 'yellow' : 'gray'} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                  {[
                    { label: 'Total', val: `$${Number(q.total_amount).toLocaleString()}`, color: C.navy },
                    { label: '60% Deposit', val: `$${Number(q.deposit_amount).toLocaleString()}`, color: q.deposit_paid ? '#109648' : C.red },
                    { label: '40% Balance', val: `$${Number(q.balance_amount).toLocaleString()}`, color: C.navy },
                  ].map(s => (
                    <div key={s.label} style={{ background: C.offWhite, borderRadius: 8, padding: '10px 14px', textAlign: 'center' as const }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: s.color }}>{s.val}</div>
                      <div style={{ color: C.midGray, fontSize: 10, textTransform: 'uppercase' as const }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {q.deposit_paid && (
                  <div style={{ background: 'rgba(16,150,72,0.08)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: 12, color: '#109648' }}>
                    ✅ Deposit paid via {q.deposit_payment_method} on {new Date(q.deposit_paid_at).toLocaleDateString()}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                  <Btn onClick={() => downloadQuotePDF(q)} variant="outline" style={{ padding: '6px 14px', fontSize: 12 }}>📥 Download PDF</Btn>
                  {q.status === 'draft' && <Btn onClick={() => updateQuoteStatus(q.id, 'sent')} style={{ padding: '6px 14px', fontSize: 12 }}>Mark as Sent</Btn>}
                  {q.status === 'sent' && <Btn onClick={() => updateQuoteStatus(q.id, 'accepted')} variant="outline" style={{ padding: '6px 14px', fontSize: 12 }}>Mark Accepted</Btn>}
                  {!q.deposit_paid && q.status === 'accepted' && (
                    <>
                      <span style={{ color: C.midGray, fontSize: 12, alignSelf: 'center' }}>Deposit:</span>
                      <Btn onClick={() => markDepositPaid(q.id, 'square')} style={{ padding: '6px 12px', fontSize: 11 }}>Square</Btn>
                      <Btn onClick={() => markDepositPaid(q.id, 'zelle')} variant="outline" style={{ padding: '6px 12px', fontSize: 11 }}>Zelle</Btn>
                      <Btn onClick={() => markDepositPaid(q.id, 'cash')} variant="outline" style={{ padding: '6px 12px', fontSize: 11 }}>Cash</Btn>
                    </>
                  )}
                  {q.status !== 'declined' && <Btn onClick={() => updateQuoteStatus(q.id, 'declined')} variant="outline" style={{ padding: '6px 14px', fontSize: 12, borderColor: C.midGray, color: C.midGray }}>Decline</Btn>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'jobs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' as const, gap: 12 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const }}>Jobs</div>
              <Btn onClick={() => setShowModal('job')}>+ New Job</Btn>
            </div>
            {jobs.map((job) => {
              const assigned = getJobCleaners(job.id)
              const workerPool = job.price * 0.4
              const perWorker = assigned.length > 0 ? (workerPool / assigned.length).toFixed(2) : '0.00'
              return (
                <div key={job.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', marginBottom: 10, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: 10, marginBottom: 12 }}>
                    <div>
                      <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{job.title}</div>
                      <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>
                        📅 {job.scheduled_date} {job.scheduled_time && `· ${job.scheduled_time}`}
                        {job.end_date && ` → ${job.end_date}`}
                        {job.days && ` · ${job.days} day(s)`}
                      </div>
                      <div style={{ color: C.midGray, fontSize: 12 }}>📍 {job.address}</div>
                      {job.recurring && <div style={{ color: C.navy, fontSize: 12, marginTop: 2 }}>🔄 {job.recurring}</div>}
                      {job.access_notes && <div style={{ color: C.red, fontSize: 12, marginTop: 2 }}>🔑 {job.access_notes}</div>}
                      {job.notes && <div style={{ color: C.darkGray, fontSize: 12, marginTop: 2 }}>📝 {job.notes}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const }}>
                      <Badge label={job.type} color="navy" />
                      <Badge label={job.status} color={job.status === 'in_progress' ? 'yellow' : job.status === 'completed' ? 'green' : job.status === 'on_hold' ? 'orange' : 'navy'} />
                      <span style={{ color: C.navy, fontWeight: 800, fontSize: 15 }}>${job.price}</span>
                    </div>
                  </div>
                  <div style={{ background: C.offWhite, borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
                    <div style={{ color: C.navy, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>
                      Assigned Cleaners · Worker Pool: ${workerPool.toFixed(2)} (40%) · ${perWorker} each
                    </div>
                    {assigned.length === 0 && <div style={{ color: C.midGray, fontSize: 12 }}>No cleaners assigned yet</div>}
                    {assigned.map(jc => (
                      <div key={jc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>👷 {jc.cleaners?.profiles?.full_name}</span>
                        <button onClick={() => removeCleanerFromJob(jc.id)} style={{ background: 'none', border: 'none', color: C.midGray, cursor: 'pointer', fontSize: 16 }}>×</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                    <Btn onClick={() => { setSelectedJob(job); setShowModal('assign') }} variant="outline" style={{ padding: '6px 14px', fontSize: 12 }}>+ Assign Cleaner</Btn>
                    {job.status === 'scheduled' && <Btn onClick={() => updateJobStatus(job.id, 'in_progress')} style={{ padding: '6px 14px', fontSize: 12 }}>Start Job</Btn>}
                    {job.status === 'in_progress' && <Btn onClick={() => updateJobStatus(job.id, 'completed')} style={{ padding: '6px 14px', fontSize: 12 }}>Complete</Btn>}
                    {(job.status === 'scheduled' || job.status === 'in_progress') && <Btn onClick={() => updateJobStatus(job.id, 'on_hold')} variant="outline" style={{ padding: '6px 14px', fontSize: 12, borderColor: '#C86410', color: '#C86410' }}>On Hold</Btn>}
                    {job.status === 'on_hold' && <Btn onClick={() => updateJobStatus(job.id, 'scheduled')} variant="outline" style={{ padding: '6px 14px', fontSize: 12 }}>Resume</Btn>}
                    {job.status === 'completed' && <Btn onClick={() => openInvoiceModal(job)} style={{ padding: '6px 14px', fontSize: 12 }}>Generate Invoice</Btn>}
                  </div>
                </div>
              )
            })}
            {jobs.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No jobs yet.</div>}
          </div>
        )}

        {tab === 'clients' && (
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 20 }}>Clients</div>
            {clients.map(c => (
              <div key={c.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', marginBottom: 10, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: 10 }}>
                  <div>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{c.profiles?.full_name}</div>
                    <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>✉️ {c.profiles?.email}</div>
                    <div style={{ color: C.midGray, fontSize: 12 }}>📞 {c.profiles?.phone}</div>
                    <div style={{ color: C.midGray, fontSize: 12 }}>📍 {c.address}, {c.city} {c.state} {c.zip}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6, alignItems: 'flex-end' }}>
                    <Badge label={c.type || 'commercial'} color="navy" />
                    <Badge label={c.client_category || 'company'} color="gray" />
                  </div>
                </div>
              </div>
            ))}
            {clients.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No clients yet.</div>}
          </div>
        )}

        {tab === 'cleaners' && (
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 20 }}>Cleaners</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {cleaners.map(c => {
                const cleanerJobs = jobCleaners.filter(jc => jc.cleaner_id === c.id)
                const totalHours = cleanerJobs.reduce((sum, jc) => sum + calcHours(jc.clock_in, jc.clock_out), 0)
                return (
                  <div key={c.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 800, fontSize: 18 }}>{c.profiles?.full_name?.[0] || '?'}</div>
                      <Badge label={c.status || 'active'} color={c.status === 'active' ? 'green' : c.status === 'terminated' ? 'red' : 'yellow'} />
                    </div>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{c.profiles?.full_name}</div>
                    <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>📞 {c.profiles?.phone}</div>
                    <div style={{ color: C.midGray, fontSize: 12 }}>✉️ {c.profiles?.email}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14, marginBottom: 14 }}>
                      <div style={{ textAlign: 'center' as const }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: C.navy }}>{cleanerJobs.length}</div>
                        <div style={{ color: C.midGray, fontSize: 10, textTransform: 'uppercase' as const }}>Jobs</div>
                      </div>
                      <div style={{ textAlign: 'center' as const }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: C.navy }}>{totalHours}h</div>
                        <div style={{ color: C.midGray, fontSize: 10, textTransform: 'uppercase' as const }}>Hours</div>
                      </div>
                      <div style={{ textAlign: 'center' as const }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: C.navy }}>⭐{c.rating || 5.0}</div>
                        <div style={{ color: C.midGray, fontSize: 10, textTransform: 'uppercase' as const }}>Rating</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                      {c.status !== 'active' && <Btn onClick={() => setConfirmAction({ type: 'activate', cleaner: c })} style={{ padding: '6px 14px', fontSize: 11 }}>Activate</Btn>}
                      {c.status === 'active' && <Btn onClick={() => setConfirmAction({ type: 'deactivate', cleaner: c })} variant="outline" style={{ padding: '6px 14px', fontSize: 11 }}>Deactivate</Btn>}
                      {c.status !== 'terminated' && <Btn onClick={() => setConfirmAction({ type: 'terminate', cleaner: c })} variant="outline" style={{ padding: '6px 14px', fontSize: 11, borderColor: C.red, color: C.red }}>Terminate</Btn>}
                    </div>
                  </div>
                )
              })}
            </div>
            {cleaners.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No cleaners yet.</div>}
          </div>
        )}

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
              <div key={inv.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', marginBottom: 10, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      {inv.invoice_number && <span style={{ color: C.midGray, fontSize: 11, fontWeight: 700 }}>{inv.invoice_number}</span>}
                      <Badge label={inv.status} color={inv.status === 'paid' ? 'green' : inv.status === 'overdue' ? 'red' : 'yellow'} />
                    </div>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{inv.clients?.profiles?.full_name || 'Client'}</div>
                    <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>Due: {inv.due_date}</div>
                    {inv.status === 'paid' && inv.paid_at && <div style={{ color: '#109648', fontSize: 12 }}>✅ Paid {new Date(inv.paid_at).toLocaleDateString()} via {inv.payment_method}</div>}
                    {inv.notes && <div style={{ color: C.darkGray, fontSize: 12, marginTop: 2 }}>📝 {inv.notes}</div>}
                   <button onClick={() => downloadInvoicePDF(inv)} style={{ background: 'none', border: 'none', color: C.navy, fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0, marginTop: 6, fontFamily: 'inherit', textDecoration: 'underline' }}>📥 Download PDF</button>
                   <button onClick={() => { setInvoiceForm({ ...inv, job_title: 'Invoice', client_name: inv.clients?.profiles?.full_name || 'Client', editing: true }); setShowModal('invoice') }} style={{ background: 'none', border: 'none', color: C.navy, fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0, marginTop: 6, fontFamily: 'inherit', textDecoration: 'underline' }}>✏️ Edit Invoice</button>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' as const }}>
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
              </div>
            ))}
            {invoices.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No invoices yet.</div>}
          </div>
        )}

        {tab === 'payroll' && (
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 20 }}>Payroll</div>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
              <div style={{ color: C.navy, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 14 }}>Pay Calculator</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <Input label="Job Total ($)" type="number" value={calcJobCost} onChange={(e: any) => setCalcJobCost(e.target.value)} placeholder="1000" />
                <Input label="Number of Workers" type="number" value={calcWorkers} onChange={(e: any) => setCalcWorkers(e.target.value)} placeholder="2" />
              </div>
              {calcResult && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { label: 'Worker Pool (40%)', val: `$${calcResult.workerPool.toFixed(2)}`, color: C.navy },
                    { label: 'Per Worker', val: `$${calcResult.perWorker.toFixed(2)}`, color: C.red },
                    { label: 'Business (60%)', val: `$${calcResult.business.toFixed(2)}`, color: '#109648' },
                  ].map(s => (
                    <div key={s.label} style={{ background: C.offWhite, borderRadius: 8, padding: '12px 14px', textAlign: 'center' as const }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
                      <div style={{ color: C.midGray, fontSize: 10, textTransform: 'uppercase' as const }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cleaners.map(cleaner => {
              const assigned = jobCleaners.filter(jc => jc.cleaner_id === cleaner.id)
              const completedAssigned = assigned.filter(jc => jobs.find(j => j.id === jc.job_id)?.status === 'completed')
              const totalHours = assigned.reduce((sum, jc) => sum + calcHours(jc.clock_in, jc.clock_out), 0)
              const totalOwed = completedAssigned.reduce((sum, jc) => {
                const job = jobs.find(j => j.id === jc.job_id)
                if (!job) return sum
                const count = jobCleaners.filter(x => x.job_id === job.id).length
                return sum + (job.price * 0.4) / count
              }, 0)
              return (
                <div key={cleaner.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: 10, marginBottom: 12 }}>
                    <div>
                      <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{cleaner.profiles?.full_name}</div>
                      <div style={{ color: C.midGray, fontSize: 12, marginTop: 2 }}>{completedAssigned.length} jobs · {totalHours}h total</div>
                    </div>
                    <div style={{ textAlign: 'right' as const }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 800, color: C.navy }}>${totalOwed.toFixed(2)}</div>
                      <div style={{ color: C.midGray, fontSize: 11, textTransform: 'uppercase' as const }}>Total Owed</div>
                    </div>
                  </div>
                  {completedAssigned.map(jc => {
                    const job = jobs.find(j => j.id === jc.job_id)
                    if (!job) return null
                    const count = jobCleaners.filter(x => x.job_id === job.id).length
                    const pay = (job.price * 0.4) / count
                    const hours = calcHours(jc.clock_in, jc.clock_out)
                    return (
                      <div key={jc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: `1px solid ${C.lightGray}`, fontSize: 13 }}>
                        <span style={{ color: C.text }}>{job.title}</span>
                        <span style={{ color: C.midGray }}>{hours}h · <strong style={{ color: C.navy }}>${pay.toFixed(2)}</strong></span>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'services' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' as const, gap: 12 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const }}>Services</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={() => setShowModal('service')} style={{ fontSize: 12, padding: '8px 16px' }}>+ Add Service</Btn>
                <Btn onClick={() => setShowModal('addon')} variant="outline" style={{ fontSize: 12, padding: '8px 16px' }}>+ Add Add-On</Btn>
              </div>
            </div>
            <div style={{ color: C.navy, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 10 }}>Main Services</div>
            {services.map(s => (
              <div key={s.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 20px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                  <div style={{ color: C.midGray, fontSize: 12 }}>{s.description}</div>
                </div>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, color: C.navy, fontSize: 18 }}>From ${s.base_price}</span>
              </div>
            ))}
            <div style={{ color: C.navy, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginTop: 24, marginBottom: 10 }}>Add-Ons Menu</div>
            {addons.map(a => (
              <div key={a.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 20px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div style={{ color: C.text, fontWeight: 600, fontSize: 14 }}>{a.name}</div>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, color: C.red, fontSize: 18 }}>+${a.base_price}</span>
              </div>
            ))}
            {addons.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No add-ons yet.</div>}
          </div>
        )}

        {tab === 'messages' && (
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 20 }}>Messages</div>
            {cleaners.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ color: C.navy, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Cleaners</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {cleaners.map(person => (
                    <div key={person.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 800, fontSize: 16 }}>{person.profiles?.full_name?.[0] || '?'}</div>
                        <div>
                          <div style={{ color: C.text, fontWeight: 600, fontSize: 14 }}>{person.profiles?.full_name}</div>
                          <div style={{ color: C.midGray, fontSize: 11 }}>{person.profiles?.phone}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a href={`tel:${person.profiles?.phone}`} style={{ flex: 1, textAlign: 'center' as const, background: C.navy, borderRadius: 6, padding: '7px', fontSize: 12, fontWeight: 600, color: C.white, textDecoration: 'none' }}>📞 Call</a>
                        <a href={`sms:${person.profiles?.phone}`} style={{ flex: 1, textAlign: 'center' as const, background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 6, padding: '7px', fontSize: 12, fontWeight: 600, color: C.navy, textDecoration: 'none' }}>💬 Text</a>
                        <a href={`mailto:${person.profiles?.email}`} style={{ flex: 1, textAlign: 'center' as const, background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 6, padding: '7px', fontSize: 12, fontWeight: 600, color: C.navy, textDecoration: 'none' }}>✉️ Email</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {clients.length > 0 && (
              <div>
                <div style={{ color: C.navy, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Clients</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {clients.map(person => (
                    <div key={person.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.navyDark, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 800, fontSize: 16 }}>{person.profiles?.full_name?.[0] || '?'}</div>
                        <div>
                          <div style={{ color: C.text, fontWeight: 600, fontSize: 14 }}>{person.profiles?.full_name}</div>
                          <div style={{ color: C.midGray, fontSize: 11 }}>{person.profiles?.phone}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a href={`tel:${person.profiles?.phone}`} style={{ flex: 1, textAlign: 'center' as const, background: C.navy, borderRadius: 6, padding: '7px', fontSize: 12, fontWeight: 600, color: C.white, textDecoration: 'none' }}>📞 Call</a>
                        <a href={`sms:${person.profiles?.phone}`} style={{ flex: 1, textAlign: 'center' as const, background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 6, padding: '7px', fontSize: 12, fontWeight: 600, color: C.navy, textDecoration: 'none' }}>💬 Text</a>
                        <a href={`mailto:${person.profiles?.email}`} style={{ flex: 1, textAlign: 'center' as const, background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 6, padding: '7px', fontSize: 12, fontWeight: 600, color: C.navy, textDecoration: 'none' }}>✉️ Email</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {cleaners.length === 0 && clients.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No contacts yet.</div>}
          </div>
        )}
      </div>

      {/* Quote Modal */}
      {showModal === 'quote' && quoteForm && (
        <Modal title="Generate Quote" onClose={() => { setShowModal(''); setQuoteForm(null) }}>
          <div style={{ background: C.offWhite, borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
            <div style={{ color: C.navy, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 4 }}>For: {selectedConsultation?.name}</div>
            <div style={{ color: C.midGray, fontSize: 12 }}>{selectedConsultation?.phone} · {selectedConsultation?.email}</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Link to Client Account</label>
            <select value={quoteForm.client_id} onChange={(e: any) => setQuoteForm((f: any) => ({ ...f, client_id: e.target.value }))} style={{ width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' as const, appearance: 'none' as const }}>
              <option value="">No client account yet</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.profiles?.full_name}</option>)}
            </select>
          </div>
          <Input label="Services" value={quoteForm.services} onChange={(e: any) => setQuoteForm((f: any) => ({ ...f, services: e.target.value }))} placeholder="e.g. Post-Construction Clean" />
          <Textarea label="Description / Scope of Work" value={quoteForm.description} onChange={(e: any) => setQuoteForm((f: any) => ({ ...f, description: e.target.value }))} placeholder="Detail the work to be performed..." />
          <Input label="Total Amount ($)" type="number" value={quoteForm.total_amount} onChange={(e: any) => setQuoteForm((f: any) => ({ ...f, total_amount: e.target.value }))} placeholder="0" />
          {quoteForm.total_amount && Number(quoteForm.total_amount) > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ background: C.offWhite, borderRadius: 8, padding: '10px 14px', textAlign: 'center' as const }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: C.red }}>${(Number(quoteForm.total_amount) * 0.6).toFixed(2)}</div>
                <div style={{ color: C.midGray, fontSize: 10, textTransform: 'uppercase' as const }}>60% Deposit</div>
              </div>
              <div style={{ background: C.offWhite, borderRadius: 8, padding: '10px 14px', textAlign: 'center' as const }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: C.navy }}>${(Number(quoteForm.total_amount) * 0.4).toFixed(2)}</div>
                <div style={{ color: C.midGray, fontSize: 10, textTransform: 'uppercase' as const }}>40% Balance</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Btn onClick={saveQuote} style={{ flex: 1 }}>Save Quote</Btn>
            <Btn variant="outline" onClick={() => { setShowModal(''); setQuoteForm(null) }} style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* Invoice Modal */}
      {showModal === 'invoice' && invoiceForm && (
        <Modal title={invoiceForm.editing ? 'Edit Invoice' : 'Invoice Preview'} onClose={() => { setShowModal(''); setInvoiceForm(null) }}>
          <div style={{ background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <img src="https://i.imgur.com/9UVzMKd.png" alt="Precision Post" style={{ height: 32, objectFit: 'contain' as const, marginBottom: 4 }} />
                <div style={{ color: C.midGray, fontSize: 11 }}>precisionpostcleaningco.com</div>
              </div>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, color: C.navy }}>INVOICE</div>
                {invoiceForm.invoice_number && <div style={{ color: C.midGray, fontSize: 12 }}>{invoiceForm.invoice_number}</div>}
                <div style={{ color: C.midGray, fontSize: 12 }}>{new Date().toLocaleDateString()}</div>
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginBottom: 12 }}>
              <div style={{ color: C.midGray, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 4 }}>Bill To</div>
              <div style={{ color: C.text, fontWeight: 600, fontSize: 14 }}>{invoiceForm.client_name || 'Client'}</div>
            </div>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: C.darkGray, fontSize: 13 }}>{invoiceForm.job_title}</span>
                <span style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>${Number(invoiceForm.amount).toLocaleString()}</span>
              </div>
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: C.navy }}>Total Due</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: C.navy }}>${Number(invoiceForm.amount).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <Input label="Edit Amount ($)" type="number" value={invoiceForm.amount} onChange={(e: any) => setInvoiceForm((f: any) => ({ ...f, amount: e.target.value }))} />
          <Input label="Due Date" type="date" value={invoiceForm.due_date} onChange={(e: any) => setInvoiceForm((f: any) => ({ ...f, due_date: e.target.value }))} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Payment Method</label>
            <select value={invoiceForm.payment_method || ''} onChange={(e: any) => setInvoiceForm((f: any) => ({ ...f, payment_method: e.target.value }))} style={{ width: '100%', background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' as const, appearance: 'none' as const }}>
              <option value="">Not specified</option>
              <option value="square">Square</option>
              <option value="zelle">Zelle</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <Input label="Notes (optional)" value={invoiceForm.notes || ''} onChange={(e: any) => setInvoiceForm((f: any) => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes..." />
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Btn onClick={saveInvoice} style={{ flex: 1 }}>{invoiceForm.editing ? 'Save Changes' : 'Confirm & Save Invoice'}</Btn>
            <Btn variant="outline" onClick={() => { setShowModal(''); setInvoiceForm(null) }} style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* Assign Cleaner Modal */}
      {showModal === 'assign' && selectedJob && (
        <Modal title="Assign Cleaner" onClose={() => setShowModal('')}>
          <div style={{ color: C.midGray, fontSize: 13, marginBottom: 16 }}>{selectedJob.title}</div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Select Cleaner</label>
            <select value={selectedCleaner} onChange={(e: any) => setSelectedCleaner(e.target.value)} style={{ width: '100%', background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' as const, appearance: 'none' as const }}>
              <option value="">Choose a cleaner...</option>
              {cleaners.filter(c => c.status === 'active').map(c => (
                <option key={c.id} value={c.id}>{c.profiles?.full_name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Btn onClick={assignCleaner} style={{ flex: 1 }}>Assign</Btn>
            <Btn variant="outline" onClick={() => setShowModal('')} style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* Confirm Action Modal */}
      {confirmAction && (
        <Modal title="Confirm Action" onClose={() => setConfirmAction(null)}>
          <div style={{ color: C.text, fontSize: 15, marginBottom: 20 }}>
            {confirmAction.type === 'terminate' ? `Terminate ${confirmAction.cleaner.profiles?.full_name}?`
              : confirmAction.type === 'deactivate' ? `Deactivate ${confirmAction.cleaner.profiles?.full_name}?`
              : `Reactivate ${confirmAction.cleaner.profiles?.full_name}?`}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn onClick={() => updateCleanerStatus(confirmAction.cleaner.id, confirmAction.type === 'activate' ? 'active' : confirmAction.type === 'deactivate' ? 'on_leave' : 'terminated')}
              style={{ flex: 1, background: confirmAction.type === 'terminate' ? C.red : C.navy, borderColor: confirmAction.type === 'terminate' ? C.red : C.navy }}>
              Confirm
            </Btn>
            <Btn variant="outline" onClick={() => setConfirmAction(null)} style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </Modal>
      )}

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

      {/* Add Addon Modal */}
      {showModal === 'addon' && (
        <Modal title="Add Add-On" onClose={() => setShowModal('')}>
          <Input label="Add-On Name" value={newAddon.name} onChange={(e: any) => setNewAddon(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Window Cleaning, Carpet Steam" />
          <Input label="Price ($)" type="number" value={newAddon.price} onChange={(e: any) => setNewAddon(f => ({ ...f, price: e.target.value }))} placeholder="0" />
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Btn onClick={addAddon} style={{ flex: 1 }}>Save Add-On</Btn>
            <Btn variant="outline" onClick={() => setShowModal('')} style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* New Job Modal */}
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
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Assign to Client</label>
            <select value={newJob.client_id} onChange={(e: any) => setNewJob(f => ({ ...f, client_id: e.target.value }))} style={{ width: '100%', background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' as const, appearance: 'none' as const }}>
              <option value="">No client assigned</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.profiles?.full_name}</option>)}
            </select>
          </div>
          <Input label="Address" value={newJob.address} onChange={(e: any) => setNewJob(f => ({ ...f, address: e.target.value }))} placeholder="Job site address" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Start Date" type="date" value={newJob.scheduled_date} onChange={(e: any) => setNewJob(f => ({ ...f, scheduled_date: e.target.value }))} />
            <Input label="End Date" type="date" value={newJob.end_date} onChange={(e: any) => setNewJob(f => ({ ...f, end_date: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Start Time" type="time" value={newJob.scheduled_time} onChange={(e: any) => setNewJob(f => ({ ...f, scheduled_time: e.target.value }))} />
            <Input label="Number of Days" type="number" value={newJob.days} onChange={(e: any) => setNewJob(f => ({ ...f, days: e.target.value }))} placeholder="1" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Recurring Schedule</label>
            <select value={newJob.recurring} onChange={(e: any) => setNewJob(f => ({ ...f, recurring: e.target.value }))} style={{ width: '100%', background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' as const, appearance: 'none' as const }}>
              <option value="">None (One-time)</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="twice_monthly">Twice a Month</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <Input label="Base Price ($)" type="number" value={newJob.price} onChange={(e: any) => setNewJob(f => ({ ...f, price: e.target.value }))} placeholder="0" />
          <Input label="Access / Clearance Notes" value={newJob.access_notes} onChange={(e: any) => setNewJob(f => ({ ...f, access_notes: e.target.value }))} placeholder="Gate code, key location, contact..." />
          {addons.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 8 }}>Add-Ons</label>
              {addons.map((a: any) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <input type="checkbox" id={a.id} checked={newJob.selected_addons.includes(a.id)}
                    onChange={(e) => setNewJob(f => ({ ...f, selected_addons: e.target.checked ? [...f.selected_addons, a.id] : f.selected_addons.filter(x => x !== a.id) }))} />
                  <label htmlFor={a.id} style={{ color: C.text, fontSize: 13, cursor: 'pointer' }}>{a.name} <span style={{ color: C.red, fontWeight: 700 }}>+${a.base_price}</span></label>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Btn onClick={addJob} style={{ flex: 1 }}>Create Job</Btn>
            <Btn variant="outline" onClick={() => setShowModal('')} style={{ flex: 1 }}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
