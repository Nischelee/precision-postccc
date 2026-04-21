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
  const [clockedIn, setClockedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('jobs')

  useEffect(() => { fetchJobs() }, [])

  const fetchJobs = async () => {
    const { data: cleaner } = await supabase
      .from('cleaners')
      .select('id')
      .eq('profile_id', profile.id)
      .single()

    if (!cleaner) { setLoading(false); return }

    const { data: jobCleaners } = await supabase
      .from('job_cleaners')
      .select('*, jobs(*)')
      .eq('cleaner_id', cleaner.id)

    const jobList = jobCleaners?.map((jc: any) => ({ ...jc.jobs, job_cleaner_id: jc.id, clocked_in: jc.clock_in, clocked_out: jc.clock_out })) || []
    setJobs(jobList)
    setLoading(false)
  }

  const fetchChecklist = async (jobId: string) => {
    const { data } = await supabase.from('checklists').select('*').eq('job_id', jobId)
    setChecklists(data || [])
  }

  const selectJob = (job: any) => {
    setSelectedJob(job)
    fetchChecklist(job.id)
    setTab('detail')
  }

  const clockIn = async () => {
    await supabase.from('job_cleaners').update({ clock_in: new Date().toISOString() }).eq('id', selectedJob.job_cleaner_id)
    await supabase.from('jobs').update({ status: 'in_progress' }).eq('id', selectedJob.id)
    setClockedIn(true)
    fetchJobs()
  }

  const clockOut = async () => {
    await supabase.from('job_cleaners').update({ clock_out: new Date().toISOString() }).eq('id', selectedJob.job_cleaner_id)
    setClockedIn(false)
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

  const signOut = async () => { await supabase.auth.signOut() }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.navyDark }}>
      <div style={{ color: C.white, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.offWhite, fontFamily: "'Barlow', sans-serif", maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky' as const, top: 0, zIndex: 10 }}>
        <div>
          <div style={{ color: C.white, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: '0.06em' }}>PRECISION POST</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Cleaner Portal</div>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{profile?.full_name}</div>
          <button onClick={signOut} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Sign Out</button>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Jobs List */}
        {tab === 'jobs' && (
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 16, marginTop: 8 }}>My Jobs</div>
            {jobs.length === 0 && (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, textAlign: 'center' as const }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🧹</div>
                <div style={{ color: C.midGray, fontSize: 14 }}>No jobs assigned yet.</div>
              </div>
            )}
            {jobs.map(job => (
              <div key={job.id} onClick={() => selectJob(job)}
                style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12, cursor: 'pointer', boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ background: 'rgba(13,33,68,0.08)', color: C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const }}>{job.type}</span>
                  <span style={{ background: job.status === 'in_progress' ? 'rgba(200,140,16,0.10)' : 'rgba(13,33,68,0.08)', color: job.status === 'in_progress' ? '#C88C10' : C.navy, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase' as const }}>{job.status}</span>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 4 }}>{job.title}</div>
                <div style={{ color: C.midGray, fontSize: 12, marginBottom: 2 }}>📍 {job.address}</div>
                <div style={{ color: C.midGray, fontSize: 12 }}>📅 {job.scheduled_date} {job.scheduled_time && `· ${job.scheduled_time}`}</div>
              </div>
            ))}
          </div>
        )}

        {/* Job Detail */}
        {tab === 'detail' && selectedJob && (
          <div>
            <button onClick={() => setTab('jobs')} style={{ background: 'none', border: 'none', color: C.navy, fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: '8px 0', fontFamily: 'inherit', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>← Back to Jobs</button>

            {/* Job Info */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, color: C.navy, textTransform: 'uppercase' as const, marginBottom: 8 }}>{selectedJob.title}</div>
              <div style={{ color: C.midGray, fontSize: 13, marginBottom: 4 }}>📍 {selectedJob.address}</div>
              <div style={{ color: C.midGray, fontSize: 13, marginBottom: 12 }}>📅 {selectedJob.scheduled_date} {selectedJob.scheduled_time && `· ${selectedJob.scheduled_time}`}</div>
              {selectedJob.access_notes && (
                <div style={{ background: 'rgba(200,16,46,0.06)', border: '1px solid rgba(200,16,46,0.15)', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                  <div style={{ color: C.red, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>🔑 Access Notes</div>
                  <div style={{ color: C.text, fontSize: 13 }}>{selectedJob.access_notes}</div>
                </div>
              )}
              <button onClick={clockedIn ? clockOut : clockIn}
                style={{ width: '100%', background: clockedIn ? C.red : C.navy, border: 'none', color: C.white, padding: 13, borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em' }}>
                {clockedIn ? '🔴 Clock Out' : '🟢 Clock In'}
              </button>
            </div>

            {/* Checklist */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
              <div style={{ color: C.navy, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Job Checklist</div>
              {checklists.length === 0 && <div style={{ color: C.midGray, fontSize: 13 }}>No checklist items for this job.</div>}
              {checklists.map((task, i) => (
                <div key={task.id} onClick={() => toggleTask(task)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < checklists.length - 1 ? `1px solid ${C.lightGray}` : 'none', cursor: 'pointer' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${task.completed ? C.navy : C.border}`, background: task.completed ? C.navy : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {task.completed && <span style={{ color: C.white, fontSize: 11, fontWeight: 800 }}>✓</span>}
                  </div>
                  <span style={{ color: task.completed ? C.midGray : C.text, fontSize: 14, textDecoration: task.completed ? 'line-through' : 'none' }}>{task.task}</span>
                </div>
              ))}
            </div>

            {/* Photos */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, boxShadow: '0 2px 12px rgba(13,33,68,0.06)' }}>
              <div style={{ color: C.navy, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Photos</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {['Before', 'After'].map(type => (
                  <div key={type} style={{ background: C.offWhite, border: `1.5px dashed ${C.border}`, borderRadius: 8, padding: '20px 8px', textAlign: 'center' as const, cursor: 'pointer' }}>
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