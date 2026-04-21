import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://cmxivkphfhxtxhaqevch.supabase.co', 'sb_publishable_G2WC5Z0MrSeqQHqy8PxU0Q_vFy49Lcv')

const C = {
  navy: '#0D2144',
  navyDark: '#081729',
  navyMid: '#143260',
  red: '#C8102E',
  white: '#FFFFFF',
  offWhite: '#F4F6F9',
  lightGray: '#E8ECF2',
  midGray: '#8A95A3',
  darkGray: '#4A5568',
  text: '#1A2535',
  border: '#D6DCE6',
}

export default function Landing() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', service_type: 'Post-Construction Clean', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) return
    setLoading(true)
    await supabase.from('consultations').insert([{ ...form, status: 'new' }])
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Barlow', sans-serif", background: C.white }}>
      {/* Nav */}
      <nav style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 8px rgba(13,33,68,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: C.white, fontWeight: 800, fontSize: 14 }}>PP</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 16, color: C.navy, letterSpacing: '0.04em', textTransform: 'uppercase' }}>PRECISION POST</div>
            <div style={{ fontSize: 10, color: C.midGray, letterSpacing: '0.1em', textTransform: 'uppercase' }}>CLEANING CO.</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: `1.5px solid ${C.navy}`, color: C.navy, padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Login</button>
          <button onClick={() => document.getElementById('consult')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: C.red, border: 'none', color: C.white, padding: '9px 22px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Request Quote</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.navyDark} 0%, ${C.navyMid} 60%, #1a4080 100%)`, padding: '80px 40px 90px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 640, position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200,16,46,0.15)', border: '1px solid rgba(200,16,46,0.3)', borderRadius: 20, padding: '5px 14px', marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
            <span style={{ color: C.red, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Post-Construction & Commercial Cleaning</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 58, fontWeight: 800, color: C.white, lineHeight: 1.05, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Built Rough.<br /><span style={{ color: C.red }}>Finished Right.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, lineHeight: 1.65, marginBottom: 36, maxWidth: 500 }}>
            Professional post-construction and commercial cleaning services. We handle the mess so your project finishes on time and on point.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button onClick={() => document.getElementById('consult')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: C.red, border: 'none', color: C.white, padding: '14px 32px', borderRadius: 7, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Request a Consultation</button>
            <button onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.25)', color: C.white, padding: '14px 28px', borderRadius: 7, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Our Services</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: C.red, padding: '20px 40px', display: 'flex', justifyContent: 'center', gap: 80, flexWrap: 'wrap' }}>
        {[['500+', 'Projects Completed'], ['100%', 'Satisfaction Guaranteed'], ['24hr', 'Response Time']].map(([val, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ color: C.white, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800 }}>{val}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Services */}
      <div id="services" style={{ padding: '64px 40px', background: C.offWhite }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ color: C.red, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>What We Do</div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 38, fontWeight: 800, color: C.navy, textTransform: 'uppercase' }}>Our Services</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto' }}>
          {[
            { icon: '🏗️', title: 'Post-Construction', desc: 'Final clean after construction or renovation. Debris, dust, and everything in between.' },
            { icon: '🏢', title: 'Commercial', desc: 'Offices, retail, and commercial spaces kept spotless on your schedule.' },
            { icon: '✨', title: 'Deep Clean', desc: 'Full top-to-bottom clean for move-ins, move-outs, or periodic deep cleans.' },
          ].map(s => (
            <div key={s.title} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '28px 24px', boxShadow: '0 4px 24px rgba(13,33,68,0.08)' }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, color: C.navy, textTransform: 'uppercase', marginBottom: 10 }}>{s.title}</div>
              <div style={{ color: C.darkGray, fontSize: 14, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Consultation Form */}
      <div id="consult" style={{ padding: '64px 40px', background: C.white }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ color: C.red, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Get Started</div>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: C.navy, textTransform: 'uppercase', marginBottom: 10 }}>Request a Consultation</h2>
            <p style={{ color: C.midGray, fontSize: 14 }}>Tell us about your project and we'll get back to you within 24 hours.</p>
          </div>

          {submitted ? (
            <div style={{ background: 'rgba(13,33,68,0.04)', border: `1px solid ${C.border}`, borderRadius: 14, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 800, color: C.navy, textTransform: 'uppercase', marginBottom: 8 }}>Request Received!</div>
              <div style={{ color: C.midGray, fontSize: 14 }}>We'll be in touch within 24 hours to discuss your project.</div>
            </div>
          ) : (
            <div style={{ background: C.offWhite, border: `1px solid ${C.border}`, borderRadius: 14, padding: 32 }}>
              {[['Full Name', 'text', 'name', 'Your name'], ['Email Address', 'email', 'email', 'your@email.com'], ['Phone Number', 'tel', 'phone', '(000) 000-0000'], ['Property Address', 'text', 'address', 'Job site address']].map(([label, type, field, ph]) => (
                <div key={field} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
                  <input type={type} placeholder={ph} value={form[field as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    style={{ width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, fontSize: 14, padding: '11px 14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>Service Type</label>
                <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
                  style={{ width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, fontSize: 14, padding: '11px 14px', outline: 'none', boxSizing: 'border-box', appearance: 'none' }}>
                  <option>Post-Construction Clean</option>
                  <option>Commercial Cleaning</option>
                  <option>Deep Clean</option>
                  <option>Other</option>
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>Tell Us About Your Project</label>
                <textarea rows={3} placeholder="Square footage, timeline, special requirements..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, fontSize: 14, padding: '11px 14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <button onClick={handleSubmit} disabled={loading}
                style={{ width: '100%', background: C.red, border: 'none', color: C.white, padding: '14px', borderRadius: 7, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Submitting...' : 'Submit Consultation Request →'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: C.navyDark, padding: '32px 40px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, color: C.white, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>PRECISION POST CLEANING CO.</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>BUILT ROUGH. FINISHED RIGHT.</div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>© 2026 Precision Post Cleaning Co. All rights reserved.</div>
      </div>
    </div>
  )
}