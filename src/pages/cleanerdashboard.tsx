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

export default function CleanerDashboard({ profile }: { profile: any }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [checklists, setChecklists] = useState<any[]>([])
  const [jobCleaner, setJobCleaner] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('jobs')
  const [cleanerProfile, setCleanerProfile] = useState<any>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { fetchJobs() }, [])

  const fetchJobs = async () => {
    const { data: cleaner } = await supabase
      .from('cleaners')
      .select('*, profiles(full_name, email, phone)')
      .eq('profile_id', profile.id)
      .maybeSingle()

    if (!cleaner) { setLoading(false); return }
    setCleanerProfile(cleaner)

    const { data: jobCleaners } = await supabase
      .from('job_cleaners')
      .select('*, jobs(*)')
      .eq('cleaner_id', cleaner.id)
      .order('created_at', { ascending: false })

    const jobList = jobCleaners?.map((jc: any) => ({
      ...jc.jobs,
      job_cleaner_id: jc.id,
      clock_in: jc.clock_in,
      clock_out: jc.clock_out,
      completed: jc.completed,
    })) || []

    setJobs(jobList)
    setLoading(false)
  }

  const fetchChecklist = async (jobId: string) => {
    const { data } = await supabase.from('checklists').select('*').eq('job_id', jobId)
    setChecklists(data || [])
  }

  const fetchJobCleaner = async (jobCleanerId: string) => {
    const { data } = await supabase.from('job_cleaners').select('*').eq('id', jobCleanerId).single()
    setJobCleaner(data)
  }

  const selectJob = async (job: any) => {
    setSelectedJob(job)
    await fetchChecklist(job.id)
    await fetchJobCleaner(job.job_cleaner_id)
    setTab('detail')
  }

  const clockIn = async () => {
    const now = new Date().toISOString()
    await supabase.from('job_cleaners').update({ clock_in: now }).eq('id', selectedJob.job_cleaner_id)
    await supabase.from('jobs').update({ status: 'in_progress' }).eq('id', selectedJob.id)
    setJobCleaner((prev: any) => ({ ...prev, clock_in: now }))
    fetchJobs()
  }

  const clockOut = async () => {
    const now = new Date().toISOString()
    await supabase.from('job_cleaners').update({ clock_out: now }).eq('id', selectedJob.job_cleaner_id)
    setJobCleaner((prev: any) => ({ ...prev, clock_out: now }))
    fetchJobs()
  }

  const toggleTask = async (task: any) => {
    await supabase.from('checklists').update({
      completed: !task.completed,
      completed_by: profile.id,
      completed_at: new Date().toISOString()
    }).eq('id', task.id)
    fetchChecklist(selectedJob.id)
  }

  const calcHours = (clockIn: string, clockOut: string) => {
    if (!clockIn || !clockOut) return null
    const diff = (new Date(clockOut).getTime() - new Date(clockIn).getTime()) / (1000 * 60 * 60)
    return Math.round(diff * 10) / 10
  }

  const formatTime = (iso: string) => {
    if (!iso) return '--'
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (iso: string) => {
    if (!iso) return '--'
    return new Date(iso).toLocaleDateString()
  }

  const signOut = async () => { await supabase.auth.signOut() }

  const upcomingJobs = jobs.filter(j => j.status === 'scheduled' || j.status === 'in_progress')
  const completedJobs = jobs.filter(j => j.status === 'completed')
  const totalHours = jobs.reduce((sum, j) => sum + (calcHours(j.clock_in, j.clock_out) || 0), 0)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.navyDark }}>
      <div style={{ color: C.white, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.offWhite, fontFamily: "'Barlow', sans-serif", maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as const, top: 0, zIndex: 10 }}>
        <img src="https://i.imgur.com/9UVzMKd.png" alt="Precision Post" style={{ height: 32, objectFit: 'contain' as const }} />
        <div style={{ textAlign: 'right' as const }}>
          <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{profile?.full_name}</div>
          <button onClick={signOut} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Sign Out</button>
        </div>
      </div>

      {/* Stats bar */}
      {tab === 'jobs' && (
        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { label: 'Upcoming', val: upcomingJobs.length, color: C.navy },
            { label: 'Completed', val: completedJobs.length, color: '#109648' },
            { label: 'Total Hours', val: `${Math.round(totalHours * 10) / 10}h`, color: C.navy },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' as const }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ color: C.midGray, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: 16 }}>

        {/* Jobs List */}
        {tab === 'jobs' && (
          <div>
            {upcomingJobs.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 10 }}>My Jobs</div>
                {upcomingJobs.map(job => (
                  <div key={job.id} onClick={() => selectJob(job)}
                    style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 10, cursor: 'pointer', boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap' as const, gap: 6 }}>
                      <span style={{ background: 'rgba(13,33,68,0.08)', color: C.navy, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const }}>{job.type}</span>
                      <span style={{
                        background: job.status === 'in_progress' ? 'rgba(200,140,16,0.10)' : 'rgba(13,33,68,0.08)',
                        color: job.status === 'in_progress' ? '#C88C10' : C.navy,
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const
                      }}>{job.status}</span>
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 4 }}>{job.title}</div>
                    <div style={{ color: C.midGray, fontSize: 12, marginBottom: 2 }}>📍 {job.address}</div>
                    <div style={{ color: C.midGray, fontSize: 12 }}>
                      📅 {job.scheduled_date}
                      {job.end_date && ` → ${job.end_date}`}
                      {job.days && ` · ${job.days} day(s)`}
                      {job.scheduled_time && ` · ${job.scheduled_time}`}
                    </div>
                    {job.clock_in && (
                      <div style={{ marginTop: 8, background: C.offWhite, borderRadius: 6, padding: '6px 10px', fontSize: 12, color: C.darkGray }}>
                        🕐 In: {formatTime(job.clock_in)} {job.clock_out && `· Out: ${formatTime(job.clock_out)} · ${calcHours(job.clock_in, job.clock_out)}h`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {completedJobs.length > 0 && (
              <div>
                <div style={{ color: C.midGray, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 10 }}>Completed</div>
                {completedJobs.map(job => (
                  <div key={job.id} onClick={() => selectJob(job)}
                    style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 8, cursor: 'pointer', opacity: 0.8 }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 4 }}>{job.title}</div>
                    <div style={{ color: C.midGray, fontSize: 12 }}>📅 {job.scheduled_date} · 📍 {job.address}</div>
                    {job.clock_in && job.clock_out && (
                      <div style={{ marginTop: 6, fontSize: 12, color: '#109648', fontWeight: 600 }}>
                        ✅ {calcHours(job.clock_in, job.clock_out)}h worked · {formatDate(job.scheduled_date)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {jobs.length === 0 && (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, textAlign: 'center' as const }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🧹</div>
                <div style={{ color: C.midGray, fontSize: 14 }}>No jobs assigned yet.</div>
              </div>
            )}
          </div>
        )}

        {/* Job Detail */}
        {tab === 'detail' && selectedJob && (
          <div>
            <button onClick={() => setTab('jobs')} style={{ background: 'none', border: 'none', color: C.navy, fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: '8px 0', fontFamily: 'inherit', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>← Back</button>

            {/* Job Info */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap' as const, gap: 6 }}>
                <span style={{ background: 'rgba(13,33,68,0.08)', color: C.navy, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const }}>{selectedJob.type}</span>
                <span style={{ background: selectedJob.status === 'in_progress' ? 'rgba(200,140,16,0.10)' : selectedJob.status === 'completed' ? 'rgba(16,150,72,0.10)' : 'rgba(13,33,68,0.08)', color: selectedJob.status === 'in_progress' ? '#C88C10' : selectedJob.status === 'completed' ? '#109648' : C.navy, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const }}>{selectedJob.status}</span>
              </div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 8 }}>{selectedJob.title}</div>
              <div style={{ color: C.midGray, fontSize: 13, marginBottom: 2 }}>📍 {selectedJob.address}</div>
              <div style={{ color: C.midGray, fontSize: 13, marginBottom: selectedJob.access_notes ? 12 : 0 }}>
                📅 {selectedJob.scheduled_date}
                {selectedJob.end_date && ` → ${selectedJob.end_date}`}
                {selectedJob.days && ` · ${selectedJob.days} day(s)`}
                {selectedJob.scheduled_time && ` · ${selectedJob.scheduled_time}`}
              </div>
              {selectedJob.access_notes && (
                <div style={{ background: 'rgba(200,16,46,0.06)', border: '1px solid rgba(200,16,46,0.15)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                  <div style={{ color: C.red, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>🔑 Access Notes</div>
                  <div style={{ color: C.text, fontSize: 13 }}>{selectedJob.access_notes}</div>
                </div>
              )}
              {selectedJob.notes && (
                <div style={{ background: C.offWhite, borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                  <div style={{ color: C.navy, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>📝 Notes</div>
                  <div style={{ color: C.text, fontSize: 13 }}>{selectedJob.notes}</div>
                </div>
              )}

              {/* Clock In/Out */}
              <div style={{ background: C.offWhite, borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ color: C.navy, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8 }}>Time Tracking</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div style={{ textAlign: 'center' as const, background: C.white, borderRadius: 6, padding: '8px' }}>
                    <div style={{ color: C.midGray, fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 2 }}>Clock In</div>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{jobCleaner?.clock_in ? formatTime(jobCleaner.clock_in) : '--'}</div>
                  </div>
                  <div style={{ textAlign: 'center' as const, background: C.white, borderRadius: 6, padding: '8px' }}>
                    <div style={{ color: C.midGray, fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 2 }}>Clock Out</div>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{jobCleaner?.clock_out ? formatTime(jobCleaner.clock_out) : '--'}</div>
                  </div>
                </div>
                {jobCleaner?.clock_in && jobCleaner?.clock_out && (
                  <div style={{ textAlign: 'center' as const, color: '#109648', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                    ✅ Total: {calcHours(jobCleaner.clock_in, jobCleaner.clock_out)}h
                  </div>
                )}
                {selectedJob.status !== 'completed' && (
                  !jobCleaner?.clock_in ? (
                    <button onClick={clockIn} style={{ width: '100%', background: C.navy, border: 'none', color: C.white, padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      🟢 Clock In
                    </button>
                  ) : !jobCleaner?.clock_out ? (
                    <button onClick={clockOut} style={{ width: '100%', background: C.red, border: 'none', color: C.white, padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                      🔴 Clock Out
                    </button>
                  ) : (
                    <div style={{ textAlign: 'center' as const, color: C.midGray, fontSize: 13 }}>Time recorded ✓</div>
                  )
                )}
              </div>
            </div>

            {/* Checklist */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
              <div style={{ color: C.navy, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>
                Job Checklist {checklists.length > 0 && `(${checklists.filter(t => t.completed).length}/${checklists.length})`}
              </div>
              {checklists.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No checklist for this job.</div>}
              {checklists.map((task, i) => (
                <div key={task.id} onClick={() => toggleTask(task)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < checklists.length - 1 ? `1px solid ${C.lightGray}` : 'none', cursor: 'pointer' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, border: `2px solid ${task.completed ? '#109648' : C.border}`, background: task.completed ? '#109648' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                    {task.completed && <span style={{ color: C.white, fontSize: 12, fontWeight: 800 }}>✓</span>}
                  </div>
                  <span style={{ color: task.completed ? C.midGray : C.text, fontSize: 14, textDecoration: task.completed ? 'line-through' : 'none' }}>{task.task}</span>
                </div>
              ))}
            </div>

            {/* Photos */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
              <div style={{ color: C.navy, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Job Photos</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {['Before', 'After'].map(type => (
                  <div key={type} style={{ background: C.offWhite, border: `1.5px dashed ${C.border}`, borderRadius: 8, padding: '20px 8px', textAlign: 'center' as const, cursor: 'pointer' }}
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.capture = 'environment'
                      input.click()
                    }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>📷</div>
                    <div style={{ color: C.midGray, fontSize: 12, fontWeight: 600 }}>+ {type} Photo</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
