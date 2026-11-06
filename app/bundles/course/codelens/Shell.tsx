import { useEffect, useState } from 'react';
import { Check, ChevronRight, CircleHelp, Moon, Sun, X } from 'lucide-react';
import App from './App';
import StudentHome from './StudentHome';
import { features, type Go } from './features';
import './shell.css';
type Role = 'student' | 'ta';
type Route = { id: string; params: Record<string, any> };
const taHome = () => features.find(f => f.role === 'ta' && f.kind === 'page')?.id || 'home';
function Frame({ route, role, go, onRole }: { route: Route; role: Role; go: Go; onRole: (role: Role) => void }) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try { return localStorage.getItem('codelens-theme') === 'light' ? 'light' : 'dark'; }
    catch { return 'dark'; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f5f7f8' : '#111517');
    try { localStorage.setItem('codelens-theme', theme); } catch { /* Theme still works for this session. */ }
  }, [theme]);
  const [showHelp, setShowHelp] = useState(false);
  const feature = features.find(f => f.id === route.id);
  const has = (id: string) => id === 'lens-review' || features.some(f => f.id === id);
  const pages = features.filter(f => f.role === role && f.kind === 'page');
  const screenProps = { params: route.params, go, has };
  return <div className="app-shell"><div className="main-shell">
    <header className="topbar">
      <nav className="breadcrumb-nav shell-nav" aria-label="Main">
        <span className="breadcrumb">CodeLens</span>
        {role==='ta'?<div className="ta-tabs">{pages.map(p=><button key={p.id} className={route.id===p.id?'current':''} aria-current={route.id===p.id?'page':undefined} onClick={()=>go(p.id)}>{p.label}</button>)}</div>:<><ChevronRight size={14}/>{feature?<><button onClick={()=>go('home')}>Practice</button><ChevronRight size={14}/><span aria-current="page">{feature.label}</span></>:<span aria-current="page">Practice</span>}</>}
      </nav>
      <div className="topbar-actions">
        {role==='student'&&pages.map(p=><button key={p.id} className={'header-link'+(route.id===p.id?' current':'')} onClick={()=>go(p.id)}>{p.label}</button>)}
        {feature?.help&&<button className="icon-button" aria-label="How it works" onClick={()=>setShowHelp(true)}><CircleHelp size={17}/></button>}
        {features.some(f=>f.role==='ta')&&(role==='ta'||!feature)&&<div className="role-switch" role="group" aria-label="View as"><button aria-pressed={role==='student'} onClick={()=>onRole('student')}>Student</button><button aria-pressed={role==='ta'} onClick={()=>onRole('ta')}>TA</button></div>}
        <button className="theme-toggle" onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label={theme==='dark'?'Switch to light mode':'Switch to dark mode'} title={theme==='dark'?'Switch to light mode':'Switch to dark mode'}>{theme==='dark'?<Sun size={16}/>:<Moon size={16}/>}<span>{theme==='dark'?'Light mode':'Dark mode'}</span></button>
        <span className="local-status"><span className="live-dot"/>Saved locally</span>
      </div>
    </header>
    <main className={feature?.kind==='practice'?'review-page':'shell-page'}>
      {feature?<feature.Screen key={route.id+JSON.stringify(route.params)} {...screenProps}/>:<StudentHome {...screenProps}/>}
      <footer><span>Demo · Sample exercises and simulated grading</span></footer>
    </main>
    {showHelp&&feature?.help&&<div className="modal-backdrop" onClick={()=>setShowHelp(false)}><section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e=>e.stopPropagation()}><button autoFocus className="icon-button close-modal" aria-label="Close help" onClick={()=>setShowHelp(false)}><X/></button><h2 id="help-title">{feature.help.title}</h2><ol>{feature.help.steps.map(step=><li key={step}>{step}</li>)}</ol><button className="primary" onClick={()=>setShowHelp(false)}>Got it<Check size={16}/></button></section></div>}
  </div></div>;
}
export default function Shell() {
  const [route, setRoute] = useState<Route>({ id: 'home', params: {} });
  const [role, setRole] = useState<Role>('student');
  const go: Go = (id, params = {}) => { setRoute({ id, params }); window.scrollTo({ top: 0 }); };
  const studentPage = features.find(f => f.role === 'student' && f.kind === 'page');
  if (route.id === 'lens-review') return <App onHome={() => go('home')} extraLink={studentPage && { label: studentPage.label, onClick: () => go(studentPage.id) }} openReview={route.params.reviewId}/>;
  return <Frame route={route} role={role} go={go} onRole={next => { setRole(next); go(next === 'ta' ? taHome() : 'home'); }}/>;
}
