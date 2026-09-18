import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES, type Category, type ImportantDate, type Recurrence } from './types'
import { attentionLabel, dateStatus, daysUntil, formatDate, loadData, loadReminderPreferences, nextOccurrence, parseISODate, REMINDER_OPTIONS, reminderDaysFor, saveData, saveReminderPreferences, sendDueReminders, STORAGE_KEY, todayISO, type ReminderPreferences, uid, validateBackup } from './utils'

type View = 'dashboard' | 'calendar' | 'settings'; type StatusFilter = 'all' | 'upcoming' | 'today' | 'overdue' | 'completed'; type Sort = 'nearest' | 'farthest' | 'recent'
type FormValues = Pick<ImportantDate, 'title' | 'category' | 'date' | 'notes' | 'reminderDaysList' | 'recurrence'>
const blankForm = (): FormValues => ({ title: '', category: 'Other', date: todayISO(), notes: '', reminderDaysList: undefined, recurrence: 'none' })
const categoryIcon: Record<string, string> = { Work:'💼', Documents:'📄', Travel:'✈️', Vehicle:'🚗', Finance:'💳', Rent:'🏠', Subscription:'📦', Warranty:'🛡️', Personal:'🎉', Events:'★', Other:'📌' }

const getCurrentRoute = (): 'landing' | 'app' => typeof window !== 'undefined' && window.location.pathname === '/app' ? 'app' : 'landing'

function LandingPage({ openApp }: { openApp: () => void }) {
  const sampleDates: ImportantDate[] = [
    { id: 'sample-1', title: 'Vehicle Insurance', category: 'Vehicle', date: todayISO(), notes: 'Renewal reminder', recurrence: 'yearly', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), reminderDaysList: [30, 7, 0], important: true },
    { id: 'sample-2', title: 'Passport Renewal', category: 'Documents', date: todayISO(), notes: 'Check expiry', recurrence: 'none', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), reminderDaysList: [30, 14], important: true },
    { id: 'sample-3', title: 'Rent Payment', category: 'Finance', date: todayISO(), notes: 'Monthly due date', recurrence: 'monthly', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), reminderDaysList: [7, 1], important: true }
  ]

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="container landing-nav">
          <a href="/" className="landing-brand" aria-label="DateNest home">
            <span className="brand-mark" aria-hidden="true">▦</span>
            <span>
              <strong>DateNest</strong>
              <small>Keep every important date close.</small>
            </span>
          </a>
          <nav className="landing-links" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <button type="button" className="text-button" onClick={openApp}>Sign in</button>
            <button type="button" className="primary landing-cta" onClick={openApp}>Get started →</button>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero landing-hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">DateNest</p>
              <h1>Keep every important date close.</h1>
              <p className="hero-text">Track important dates, stay ahead of deadlines, and get reminded before they matter.</p>
              <div className="hero-actions">
                <button type="button" className="primary" onClick={openApp}>Get started →</button>
              </div>
              <p className="hero-meta">Add your first important date in seconds.</p>
            </div>

            <div className="hero-visual" aria-label="DateNest dashboard preview">
              <div className="preview-shell">
                <div className="preview-topbar">
                  <div className="preview-brand">DateNest</div>
                  <div className="preview-actions">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
                <div className="preview-body">
                  <div className="preview-metrics">
                    <div className="mini-stat"><strong>2</strong><span>Due today</span></div>
                    <div className="mini-stat"><strong>7</strong><span>This week</span></div>
                    <div className="mini-stat"><strong>11</strong><span>Upcoming</span></div>
                  </div>
                  <div className="preview-list">
                    {sampleDates.map(item => (
                      <DateCard key={item.id} item={item} click={() => {}} edit={() => {}} remove={() => {}} complete={() => {}} reopen={() => {}} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section" id="features">
          <div className="container">
            <div className="section-intro">
              <p className="eyebrow">Why DateNest</p>
              <h2>Life comes with too many dates.</h2>
              <p>You remember the big ones. But what about the dates you can’t afford to forget?</p>
            </div>
            <div className="category-grid">
              <article className="info-card">
                <span className="info-icon">🔄</span>
                <h3>Renewals</h3>
                <ul><li>Insurance</li><li>PUC</li><li>Driving License</li></ul>
              </article>
              <article className="info-card">
                <span className="info-icon">💰</span>
                <h3>Money</h3>
                <ul><li>EMI</li><li>Rent</li><li>Subscriptions</li></ul>
              </article>
              <article className="info-card">
                <span className="info-icon">💼</span>
                <h3>Work</h3>
                <ul><li>Deadlines</li><li>Appointments</li><li>Important tasks</li></ul>
              </article>
              <article className="info-card">
                <span className="info-icon">🎉</span>
                <h3>Life</h3>
                <ul><li>Birthdays</li><li>Anniversaries</li><li>Events</li></ul>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-section muted" id="how-it-works">
          <div className="container">
            <div className="section-intro center">
              <p className="eyebrow">How it works</p>
              <h2>Add. Remember. Stay ahead.</h2>
            </div>
            <div className="steps-grid">
              <article className="step-card">
                <span className="step-number">01</span>
                <h3>Add a date</h3>
                <p>Add anything important in seconds.</p>
              </article>
              <article className="step-card">
                <span className="step-number">02</span>
                <h3>Set your reminder</h3>
                <p>Choose when you want DateNest to remind you.</p>
              </article>
              <article className="step-card">
                <span className="step-number">03</span>
                <h3>Stay ahead</h3>
                <p>See what’s coming before it becomes urgent.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="container">
            <div className="section-intro">
              <p className="eyebrow">At a glance</p>
              <h2>Your important dates. At a glance.</h2>
            </div>
            <div className="showcase-grid">
              <div className="showcase-preview">
                {sampleDates.map(item => (
                  <DateCard key={`showcase-${item.id}`} item={item} click={() => {}} edit={() => {}} remove={() => {}} complete={() => {}} reopen={() => {}} />
                ))}
              </div>
              <div className="feature-badges">
                <div className="feature-badge"><strong>Due today</strong><span>See what needs attention now</span></div>
                <div className="feature-badge"><strong>Coming up this week</strong><span>Know what is approaching next</span></div>
                <div className="feature-badge"><strong>Never miss a renewal</strong><span>Keep your important dates in view</span></div>
                <div className="feature-badge"><strong>Completed dates</strong><span>Keep your history without clutter</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section muted">
          <div className="container">
            <div className="section-intro">
              <p className="eyebrow">Track whatever matters</p>
              <h2>Track whatever matters.</h2>
              <p>From renewals and payments to personal milestones and deadlines, keep the dates that matter in one place.</p>
            </div>
            <div className="pill-grid">
              <div className="pill-group"><h3>Vehicle</h3><span>Insurance</span><span>PUC</span><span>Registration</span><span>Service</span></div>
              <div className="pill-group"><h3>Money</h3><span>EMI</span><span>Rent</span><span>Subscriptions</span><span>Payments</span></div>
              <div className="pill-group"><h3>Documents</h3><span>Passport</span><span>Visa</span><span>Driving License</span><span>Certificates</span></div>
              <div className="pill-group"><h3>Life</h3><span>Birthdays</span><span>Anniversaries</span><span>Events</span><span>Special dates</span></div>
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="container">
            <div className="section-intro">
              <p className="eyebrow">Reminders</p>
              <h2>Never be surprised.</h2>
              <p>Know what’s coming before the date arrives.</p>
            </div>
            <div className="timeline">
              <div className="timeline-item"><span>30 days before</span><strong>Passport renewal coming up</strong></div>
              <div className="timeline-item"><span>7 days before</span><strong>Insurance renewal in 7 days</strong></div>
              <div className="timeline-item"><span>Today</span><strong>Subscription renewal today</strong></div>
              <div className="timeline-item completed-item"><span>Completed</span><strong>✓ Done</strong></div>
            </div>
          </div>
        </section>

        <section className="landing-section muted">
          <div className="container cal-wrap">
            <div className="section-intro">
              <p className="eyebrow">Calendar</p>
              <h2>See your life by date.</h2>
              <p>See everything important coming up in one simple calendar.</p>
            </div>
            <div className="calendar-hero">
              <div className="mini-calendar">
                <div className="mini-weekdays"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                <div className="mini-grid">
                  <button type="button" className="mini-day muted">28</button>
                  <button type="button" className="mini-day muted">29</button>
                  <button type="button" className="mini-day muted">30</button>
                  <button type="button" className="mini-day">1</button>
                  <button type="button" className="mini-day highlight">2</button>
                  <button type="button" className="mini-day">3</button>
                  <button type="button" className="mini-day">4</button>
                  <button type="button" className="mini-day">5</button>
                  <button type="button" className="mini-day">6</button>
                  <button type="button" className="mini-day">7</button>
                  <button type="button" className="mini-day">8</button>
                  <button type="button" className="mini-day">9</button>
                  <button type="button" className="mini-day">10</button>
                  <button type="button" className="mini-day">11</button>
                </div>
              </div>
              <div className="calendar-copy">
                <p>Look at upcoming dates in context and stay on top of what matters.</p>
                <button type="button" className="primary" onClick={openApp}>Explore your dates →</button>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="container">
            <div className="section-intro">
              <p className="eyebrow">History</p>
              <h2>Done doesn’t mean forgotten.</h2>
              <p>Keep a record of what you’ve taken care of without cluttering your upcoming dates.</p>
            </div>
            <div className="history-list">
              <div className="history-item"><span className="check-pill">✓</span><div><strong>Vehicle Insurance</strong><small>Vehicle · Renewal</small><time>Completed October 8, 2026</time></div></div>
              <div className="history-item"><span className="check-pill">✓</span><div><strong>Passport Renewal</strong><small>Documents · Renewal</small><time>Completed September 17, 2026</time></div></div>
            </div>
          </div>
        </section>

        <section className="landing-section emotional">
          <div className="container emotional-inner">
            <p className="eyebrow">DateNest</p>
            <h2>Less remembering. More living.</h2>
            <p>DateNest keeps the dates that matter within reach, so you don’t have to keep them in your head.</p>
          </div>
        </section>

        <section className="landing-section final-cta">
          <div className="container final-cta-inner">
            <h2>Don’t keep important dates in your head.</h2>
            <h3>Keep them in DateNest.</h3>
            <button type="button" className="primary" onClick={openApp}>Get started →</button>
            <p>Add your first important date in seconds.</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container footer-inner">
          <div>
            <strong>DateNest</strong>
            <p>Keep every important date close.</p>
          </div>
          <nav className="footer-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#calendar">Calendar</a>
            <button type="button" className="text-button" onClick={openApp}>Get started</button>
          </nav>
        </div>
        <div className="container footer-meta">
          <span>© 2026 DateNest. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  const [route, setRoute] = useState<'landing' | 'app'>(() => getCurrentRoute())
  const [dates, setDates] = useState<ImportantDate[]>(loadData), [preferences, setPreferences] = useState<ReminderPreferences>(loadReminderPreferences), [view, setView] = useState<View>('dashboard'), [formItem, setFormItem] = useState<ImportantDate | null | undefined>(undefined), [selected, setSelected] = useState<ImportantDate | null>(null)
  useEffect(() => {
    const handleRoute = () => setRoute(getCurrentRoute())
    window.addEventListener('popstate', handleRoute)
    return () => window.removeEventListener('popstate', handleRoute)
  }, [])
  const navigate = (path: '/' | '/app') => {
    window.history.pushState({}, '', path)
    setRoute(path === '/app' ? 'app' : 'landing')
  }
  if (route === 'landing') return <LandingPage openApp={() => navigate('/app')} />
  const [query, setQuery] = useState(''), [category, setCategory] = useState<'all' | Category>('all'), [status, setStatus] = useState<StatusFilter>('all'), [sort, setSort] = useState<Sort>('nearest'), [month, setMonth] = useState(() => new Date())
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => 'Notification' in window ? Notification.permission : 'unsupported')
  useEffect(() => saveData(dates), [dates]); useEffect(() => saveReminderPreferences(preferences), [preferences])
  const occurrences = useMemo(() => dates.map(nextOccurrence), [dates])
  const completed = useMemo(() => occurrences.filter(x => x.completedAt && !x.archived).sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || '')), [occurrences])
  const active = occurrences.filter(x => !x.completedAt && !x.archived)
  const counts = { overdue: active.filter(x=>daysUntil(x.date)<0).length, today: active.filter(x=>daysUntil(x.date)===0).length, week: active.filter(x=>daysUntil(x.date)>0&&daysUntil(x.date)<=7).length, upcoming: active.filter(x=>daysUntil(x.date)>=0).length }
  const shown = useMemo(() => { const term=query.trim().toLowerCase(); return occurrences.filter(x => !x.archived && (!term || [x.title,x.category,x.notes||'',...(x.tags||[])].join(' ').toLowerCase().includes(term)) && (category==='all'||x.category===category) && (status==='all' || dateStatus(x)===status) && !x.completedAt).sort((a,b)=>sort==='recent'?b.createdAt.localeCompare(a.createdAt):sort==='nearest'?a.date.localeCompare(b.date):b.date.localeCompare(a.date)) }, [occurrences,query,category,status,sort])
  const closeForm = () => setFormItem(undefined)
  const saveItem = (values:FormValues) => { const now=new Date().toISOString(); const trimmed=values.title.trim(); if(!trimmed){ return } const item:ImportantDate = formItem ? {...formItem,...values,title:trimmed,reminderDays:undefined,updatedAt:now} : {...values,title:trimmed,id:uid(),createdAt:now,updatedAt:now}; setDates(all=>formItem?all.map(d=>d.id===item.id?item:d):[item,...all]);closeForm();setSelected(null) }
  const remove=(id:string)=>{if(window.confirm('Delete this important date?')){setDates(all=>all.filter(x=>x.id!==id));setSelected(null)}}
  const complete=(id:string)=>{const now=new Date().toISOString();setDates(all=>all.map(x=>x.id===id?{...x,completedAt:now,updatedAt:now}:x));setSelected(x=>x?.id===id?{...x,completedAt:now,updatedAt:now}:x)}
  const reopen=(id:string)=>{const now=new Date().toISOString();setDates(all=>all.map(x=>x.id===id?{...x,completedAt:undefined,updatedAt:now}:x));setSelected(x=>x?.id===id?{...x,completedAt:undefined,updatedAt:now}:x)}
  useEffect(() => { sendDueReminders(occurrences, preferences) }, [occurrences, preferences])
  const requestNotifications=async()=>{if(!('Notification' in window))return setPermission('unsupported');const result=await Notification.requestPermission();setPermission(result);if(result==='granted')sendDueReminders(occurrences,preferences)}
  const exportData=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,dates},null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=`datenest-${todayISO()}.json`;link.click();URL.revokeObjectURL(url)}
  const importData=(file:File)=>{const reader=new FileReader();reader.onload=()=>{try{const imported=validateBackup(JSON.parse(String(reader.result)));if(!imported)throw Error();setDates(imported);alert(`Imported ${imported.length} important date${imported.length===1?'':'s'}.`)}catch{alert('This is not a valid DateNest backup.')}};reader.readAsText(file)}
  return <div className="app"><header className="topbar"><button className="brand" onClick={()=>setView('dashboard')} aria-label="DateNest dashboard"><span className="brand-mark" aria-hidden="true">▦</span><span><strong>DateNest</strong><small>Keep every important date close.</small></span></button><nav className="top-actions">{(['dashboard','calendar','settings'] as View[]).map(x=><button key={x} className={`nav ${view===x?'active':''}`} onClick={()=>setView(x)}>{x[0].toUpperCase()+x.slice(1)}</button>)}<button className="primary" onClick={()=>setFormItem(null)}>+ Add Important Date</button></nav></header><main>{view==='dashboard'&&<Dashboard today={new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})} counts={counts} active={active} completed={completed} dates={shown} filtered={Boolean(query||category!=='all'||status!=='all')} query={query} category={category} status={status} sort={sort} setQuery={setQuery} setCategory={setCategory} setStatus={setStatus} setSort={setSort} add={()=>setFormItem(null)} select={setSelected} edit={d=>setFormItem(dates.find(x=>x.id===d.id)||null)} remove={remove} complete={complete} reopen={reopen}/>} {view==='calendar'&&<Calendar month={month} setMonth={setMonth} dates={occurrences} select={setSelected}/>} {view==='settings'&&<Settings count={dates.length} preferences={preferences} setPreferences={setPreferences} permission={permission} request={requestNotifications} exportData={exportData} importData={importData} clear={()=>{if(window.confirm('Clear all saved dates? This cannot be undone unless you exported a backup.')){localStorage.removeItem(STORAGE_KEY);setDates([])}}}/>}</main>{formItem!==undefined&&<DateForm item={formItem||undefined} defaults={preferences} save={saveItem} close={closeForm}/>} {selected&&<Detail item={selected} defaults={preferences} close={()=>setSelected(null)} edit={()=>setFormItem(dates.find(x=>x.id===selected.id)||null)} remove={()=>remove(selected.id)} complete={()=>complete(selected.id)} reopen={()=>reopen(selected.id)}/>}</div>
}

type Actions = { click?:()=>void;edit:()=>void;remove:()=>void;complete:()=>void;reopen?:()=>void }
function Dashboard(p:{today:string;counts:{overdue:number;today:number;week:number;upcoming:number};active:ImportantDate[];completed:ImportantDate[];dates:ImportantDate[];filtered:boolean;query:string;category:'all'|Category;status:StatusFilter;sort:Sort;setQuery:(x:string)=>void;setCategory:(x:'all'|Category)=>void;setStatus:(x:StatusFilter)=>void;setSort:(x:Sort)=>void;add:()=>void;select:(d:ImportantDate)=>void;edit:(d:ImportantDate)=>void;remove:(id:string)=>void;complete:(id:string)=>void;reopen:(id:string)=>void}) { const closest=[...p.active].sort((a,b)=>a.date.localeCompare(b.date)), featured=closest.slice(0,3), week=closest.filter(x=>daysUntil(x.date)>=0&&daysUntil(x.date)<=7), recentCompleted=[...p.completed].sort((a,b)=>(b.completedAt||'').localeCompare(a.completedAt||'')).slice(0,5), hour=new Date().getHours(), greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening', statusMessage=p.counts.overdue?`⚠️ ${p.counts.overdue} date${p.counts.overdue===1?'':'s'} need your attention.`:p.counts.today?`Today you have ${p.counts.today} important date${p.counts.today===1?'':'s'} to take care of.`:'✨ You’re all clear today.'; return <section className="container dashboard"><div className="dashboard-greeting"><div><h1>{greeting} <span aria-hidden="true">👋</span></h1><p>You have {p.counts.upcoming} important date{p.counts.upcoming===1?'':'s'} coming up.</p><time>{p.today}</time></div></div><p className={`daily-status ${p.counts.overdue?'has-overdue':''}`}>{statusMessage}</p><div className="stats dashboard-stats"><Stat value={p.counts.overdue} label="Overdue" tone="danger"/><Stat value={p.counts.today} label="Due Today" tone="warning"/><Stat value={p.counts.week} label="This Week" tone="accent"/><Stat value={p.counts.upcoming} label="Upcoming"/></div><section className="week-section"><SectionHead title="Coming up this week" subtitle="Your next important dates."/>{week.length?<div className="week-list">{week.map(x=><WeekItem key={x.id} item={x} click={()=>p.select(x)}/>)}</div>:<div className="week-empty">You’re all clear for the next 7 days 🎉</div>}</section><section className="featured-dates"><SectionHead title="Upcoming important dates" subtitle="Your next important dates."/>{featured.length?<div className="attention-list">{featured.map(x=><AttentionCard key={x.id} item={x} click={()=>p.select(x)} edit={()=>p.edit(x)} remove={()=>p.remove(x.id)} complete={()=>p.complete(x.id)} reopen={()=>p.reopen(x.id)}/>)}</div>:<Empty filtered={false}/>} {closest.length>3&&<button className="view-all" onClick={()=>document.getElementById('all-dates')?.scrollIntoView({behavior:'smooth'})}>View all dates <span>→</span></button>}</section><section className="completed-section"><SectionHead title="Recently completed" subtitle="Completed dates stay here until you reopen them."/>{recentCompleted.length?<div className="date-list">{recentCompleted.map(x=><DateCard key={x.id} item={x} click={()=>p.select(x)} edit={()=>p.edit(x)} remove={()=>p.remove(x.id)} complete={()=>p.complete(x.id)} reopen={()=>p.reopen(x.id)}/>)}</div>:<Empty filtered={false}/>}</section><section className="browse-section" id="all-dates"><SectionHead title="Browse all dates" subtitle="Search, filter, and manage every important date."/><div className="toolbar"><input className="search" placeholder="Search dates..." value={p.query} onChange={e=>p.setQuery(e.target.value)}/><select value={p.category} onChange={e=>p.setCategory(e.target.value as 'all'|Category)}><option value="all">All categories</option>{CATEGORIES.map(x=><option key={x}>{x}</option>)}</select><select value={p.status} onChange={e=>p.setStatus(e.target.value as StatusFilter)}><option value="all">All statuses</option><option value="upcoming">Upcoming</option><option value="today">Due today</option><option value="overdue">Overdue</option><option value="completed">Completed</option></select><select value={p.sort} onChange={e=>p.setSort(e.target.value as Sort)}><option value="nearest">Nearest date</option><option value="farthest">Farthest date</option><option value="recent">Recently added</option></select></div>{p.dates.length?<div className="date-list">{p.dates.map(x=><DateCard key={x.id} item={x} click={()=>p.select(x)} edit={()=>p.edit(x)} remove={()=>p.remove(x.id)} complete={()=>p.complete(x.id)} reopen={()=>p.reopen(x.id)}/>)}</div>:<Empty filtered={p.filtered}/>}</section></section> }
function SectionHead({title,subtitle}:{title:string;subtitle:string}){return <div className="section-head"><div><h2>{title}</h2><p>{subtitle}</p></div></div>}; function Stat({value,label,tone='' }:{value:number;label:string;tone?:string}){return <div className={`stat ${tone}`}><strong>{value}</strong><span>{label}</span></div>}
function relativeStatus(item:ImportantDate){if(item.completedAt)return <><strong>Completed</strong><small>{new Date(item.completedAt).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</small></>;const days=daysUntil(item.date);if(days<0)return <><strong>Overdue</strong><small>{Math.abs(days)} day{Math.abs(days)===1?'':'s'} overdue <i>→</i></small></>;if(days===0)return <><strong>Due today</strong></>;if(days===1)return <><strong>Tomorrow</strong><small>1 day left <i>→</i></small></>;return <><strong>{days} days left</strong><small><i>→</i></small></>}
function AttentionCard({item,click,edit,remove,complete,reopen}:{item:ImportantDate}&Required<Actions>){const reminders=reminderDaysFor(item,{days:[]});return <article className={`attention-card ${dateStatus(item)}`}><button className="attention-open" onClick={click} aria-label={`View ${item.title}`}><span className="date-icon">{categoryIcon[item.category] || '📌'}</span><span className="attention-content"><strong>{item.important&&'★ '}{item.title}</strong><small>{item.category}{item.context?` · ${item.context}`:item.recurrence!=='none'?` · Repeats ${item.recurrence}`:''}</small><time>{formatDate(item.date)}</time>{reminders.length>0&&<em>🔔 Reminder: {reminders.map(x=>x===0?'on the day':`${x} days before`).join(', ')}</em>}</span><span className="relative-status">{relativeStatus(item)}</span></button><CardActions item={item} edit={edit} remove={remove} complete={complete} reopen={reopen}/></article>}
function DateCard({item,click,edit,remove,complete,reopen}:{item:ImportantDate}&Required<Actions>){return <article className={`date-card ${dateStatus(item)}`}><button className="card-open" onClick={click} aria-label={`View ${item.title}`}><span className="date-icon">{categoryIcon[item.category] || '📌'}</span><span className="date-main"><span className="card-top"><strong>{item.important&&'★ '}{item.title}</strong><small className="badge">{item.category}</small></span><span className="date-text">{formatDate(item.date)}{item.tags?.length?` · ${item.tags.map(tag=>`#${tag}`).join(' ')}`:''}</span></span><span className="relative-status compact-status">{relativeStatus(item)}</span></button><CardActions item={item} edit={edit} remove={remove} complete={complete} reopen={reopen}/></article>}
function CardActions({item,edit,remove,complete,reopen}:{item:ImportantDate;edit:()=>void;remove:()=>void;complete:()=>void;reopen?:()=>void}){const handleComplete=item.completedAt?(reopen||complete):complete;return <div className="card-actions"><button onClick={handleComplete} title={item.completedAt?'Reopen':'Complete'} aria-label={item.completedAt?`Reopen ${item.title}`:`Complete ${item.title}`}>{item.completedAt?'↺':'✓'}</button><button onClick={edit} title="Edit" aria-label={`Edit ${item.title}`}>✎</button><button className="delete-action" onClick={remove} title="Delete" aria-label={`Delete ${item.title}`}>×</button></div>}
function WeekItem({item,click}:{item:ImportantDate;click:()=>void}){const days=daysUntil(item.date),group=days===0?'Today':days===1?'Tomorrow':parseISODate(item.date).toLocaleDateString(undefined,{month:'short',day:'numeric'}).toUpperCase();return <button className="week-item" onClick={click}><span className="week-group">{group}</span><span className="week-event"><i>{categoryIcon[item.category] || '📌'}</i><strong>{item.title}</strong><small>{days===0?'Due today':days===1?'1 day left':`${days} days left`}</small></span><span>›</span></button>}
function Empty({filtered}:{filtered:boolean}){return <div className="empty"><div className="empty-icon">✓</div><h3>{filtered?'No matching dates':'No important dates yet.'}</h3><p>{filtered?'Try changing your search or filters.':'Add your first date and we’ll keep track of it for you.'}</p></div>}
function DateForm({item,defaults,save,close}:{item?:ImportantDate;defaults:ReminderPreferences;save:(x:FormValues)=>void;close:()=>void}){const [form,setForm]=useState<FormValues>(item?{title:item.title,category:item.category,date:item.date,notes:item.notes||'',reminderDaysList:item.reminderDaysList??(item.reminderDays!==undefined?[item.reminderDays]:undefined),recurrence:item.recurrence}:blankForm()), chosen=form.reminderDaysList??defaults.days, toggle=(day:number)=>setForm({...form,reminderDaysList:chosen.includes(day)?chosen.filter(x=>x!==day):[...chosen,day].sort((a,b)=>b-a)});return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&close()}><form className="modal" onSubmit={e=>{e.preventDefault();if(form.title.trim())save(form)}}><div className="modal-head"><div><p className="eyebrow">{item?'Edit important date':'New important date'}</p><h2>{item?'Update your date':'Add something to remember'}</h2></div><button type="button" className="icon-button" onClick={close}>×</button></div><label>Title<input autoFocus required placeholder="e.g. Vehicle Insurance" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><div className="two-col"><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value as Category})}>{CATEGORIES.map(x=><option key={x}>{categoryIcon[x]} {x}</option>)}</select></label><label>Date<input type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label></div><fieldset><legend>Remind me</legend><div className="checks">{REMINDER_OPTIONS.map(day=><label className="check" key={day}><input type="checkbox" checked={chosen.includes(day)} onChange={()=>toggle(day)}/>{day===0?'On the day':`${day} days before`}</label>)}</div><p className="field-help">{form.reminderDaysList===undefined?'Using your default reminder preferences.':'Custom reminders for this date.'}</p></fieldset><label>Notes <span className="muted">(optional)</span><textarea rows={3} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label><fieldset><legend>Repeat</legend><div className="repeat-options">{(['none','monthly','yearly'] as Recurrence[]).map(x=><label key={x}><input type="radio" name="repeat" checked={form.recurrence===x} onChange={()=>setForm({...form,recurrence:x})}/>{x==='none'?'Does not repeat':x[0].toUpperCase()+x.slice(1)}</label>)}</div></fieldset><p className="privacy-note">Stored only in this browser. Nothing is sent to a server.</p><div className="modal-actions"><button type="button" className="secondary" onClick={close}>Cancel</button><button className="primary">{item?'Save changes':'Save important date'}</button></div></form></div>}
function Detail({item,defaults,close,edit,remove,complete,reopen}:{item:ImportantDate;defaults:ReminderPreferences;close:()=>void;edit:()=>void;remove:()=>void;complete:()=>void;reopen:()=>void}){const reminders=reminderDaysFor(item,defaults).map(x=>x===0?'On the day':`${x} days before`).join(', ')||'None';return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&close()}><article className="modal detail-modal"><div className="modal-head"><div><span className="badge">{item.category}</span><h2>{item.title}</h2></div><button className="icon-button" onClick={close}>×</button></div><div className={`big-count ${dateStatus(item)}`}>{attentionLabel(item)}</div><div className="detail-grid"><div><span>Date</span><strong>{formatDate(item.date)}</strong></div><div><span>Repeat</span><strong>{item.recurrence==='none'?'Does not repeat':item.recurrence}</strong></div><div><span>Reminders</span><strong>{reminders}</strong></div></div>{item.notes&&<div className="notes"><span>Notes</span><p>{item.notes}</p></div>}<div className="modal-actions"><button className="danger-button" onClick={remove}>Delete</button><button className="secondary" onClick={edit}>Edit</button><button className="primary" onClick={item.completedAt?reopen:complete}>{item.completedAt?'Reopen':'Mark complete'}</button></div></article></div>}
function Calendar({month,setMonth,dates,select}:{month:Date;setMonth:(d:Date)=>void;dates:ImportantDate[];select:(x:ImportantDate)=>void}){const year=month.getFullYear(),mon=month.getMonth(),start=(new Date(year,mon,1).getDay()+6)%7,days=new Date(year,mon+1,0).getDate(),events=new Map<number,ImportantDate[]>();dates.forEach(d=>{const x=parseISODate(d.date);if(x.getFullYear()===year&&x.getMonth()===mon)events.set(x.getDate(),[...(events.get(x.getDate())||[]),d])});return <section className="container calendar-page"><div className="section-head"><div><p className="eyebrow">Calendar</p><h2>{month.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</h2><p>Select an important date to view it.</p></div><div className="month-nav"><button className="secondary" onClick={()=>setMonth(new Date(year,mon-1,1))}>‹</button><button className="secondary" onClick={()=>setMonth(new Date(year,mon+1,1))}>›</button></div></div><div className="calendar"><div className="weekdays">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=><span key={x}>{x}</span>)}</div><div className="calendar-grid">{Array.from({length:start+days},(_,i)=>i<start?null:i-start+1).map((day,i)=><div className="calendar-cell" key={i}>{day&&<><span className="day-number">{day}</span><div className="calendar-events">{(events.get(day)||[]).map(d=><button key={d.id} onClick={()=>select(d)}>{d.title}</button>)}</div></>}</div>)}</div></div></section>}
function Settings({count,preferences,setPreferences,permission,request,exportData,importData,clear}:{count:number;preferences:ReminderPreferences;setPreferences:(x:ReminderPreferences)=>void;permission:NotificationPermission|'unsupported';request:()=>void;exportData:()=>void;importData:(x:File)=>void;clear:()=>void}){const ref=useRef<HTMLInputElement>(null),message=permission==='granted'?'Browser notifications are enabled.':permission==='denied'?'Notifications are blocked in your browser.':permission==='unsupported'?'Browser notifications are not supported in this browser.':'Enable reminders while DateNest is open.',toggle=(day:number)=>setPreferences({days:preferences.days.includes(day)?preferences.days.filter(x=>x!==day):[...preferences.days,day].sort((a,b)=>b-a)});return <section className="container settings"><p className="eyebrow">Settings</p><h1>Your data, under your control.</h1><p className="settings-intro">DateNest stores your {count===1?'date':`${count} dates`} locally in this browser.</p><div className="settings-card"><div><h2>Browser notifications</h2><p>{message}</p></div>{permission!=='granted'&&permission!=='unsupported'&&<button className="primary" onClick={request}>Enable notifications</button>}</div><div className="settings-card reminder-settings"><div><h2>Reminder preferences</h2><p>Default reminders for new dates.</p></div><div className="checks">{REMINDER_OPTIONS.map(day=><label className="check" key={day}><input type="checkbox" checked={preferences.days.includes(day)} onChange={()=>toggle(day)}/>{day===0?'On the day':`${day} days before`}</label>)}</div></div><p className="notification-note">Notifications are checked while DateNest is open or active. A closed browser cannot reliably deliver reminders without a server or push service.</p><div className="settings-card"><div><h2>Export data</h2><p>Download all your dates as a JSON backup file.</p></div><button className="secondary" onClick={exportData}>Export Data</button></div><div className="settings-card"><div><h2>Import data</h2><p>Restore dates from a DateNest backup file.</p></div><button className="secondary" onClick={()=>ref.current?.click()}>Import Data</button><input ref={ref} type="file" accept="application/json,.json" hidden onChange={e=>{const f=e.target.files?.[0];if(f)importData(f);e.currentTarget.value=''}}/></div><div className="settings-card danger-setting"><div><h2>Clear all data</h2><p>Permanently delete every date saved in this browser.</p></div><button className="danger-button" onClick={clear}>Clear All Data</button></div></section>}
