import { useEffect, useRef, useState, type ComponentType } from 'react';
import App from './App';
import StudentHome from './StudentHome';
import { features, type Go, type Note } from './features';
import { ThemeButton } from './bars';
import { BellIcon, Logo, PracticeIcon } from './icons';
import { useTheme } from './theme';
import './shell.css';
type Role = 'student' | 'ta';
type Route = { id: string; params: Record<string, any> };
const taHome = () => features.find(f => f.role === 'ta' && f.kind === 'page')?.id || 'home';

function Bell({ go }: { go: Go }) {
  const [open, setOpen] = useState(false);
  const [, refresh] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const notes: Note[] = features.flatMap(f => f.notifications?.() || []);
  const unread = notes.filter(n => n.unread).length;
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => { if (e instanceof KeyboardEvent ? e.key === 'Escape' : !box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open]);
  return <div className="bell" ref={box}>
    <button className="icon-btn" aria-label={unread ? `Notifications, ${unread} new` : 'Notifications'} aria-expanded={open} onClick={() => setOpen(!open)}>
      <BellIcon/>{unread > 0 && <span className="bell-badge badge-pop" aria-hidden="true">{unread}</span>}
    </button>
    {open && <section className="notes pop-in" aria-label="Notifications">
      <div className="notes-head"><h2>Notifications</h2>{unread > 0 && <button className="text-link" onClick={() => { notes.forEach(n => n.markRead()); refresh(x => x + 1); }}>Mark all as read</button>}</div>
      {notes.length ? notes.map(n => <button key={n.id} className="note row-hover" onClick={() => { n.markRead(); setOpen(false); go(n.to, n.params); }}>
        <span className="note-avatar" aria-hidden="true">TA</span>
        <span className="note-text"><span><strong>{n.title}</strong> {n.text}</span><small>Opens the review at the comment</small></span>
        {n.unread && <span className="note-dot" aria-label="Unread"/>}
      </button>) : <p className="notes-empty">Nothing new. When your TA comments on a review, it shows up here.</p>}
    </section>}
  </div>;
}

type NavItem = { id: string; label: string; Icon?: ComponentType<{ size?: number }>; badge?: number };
export function TopBar({ role, routeId, go, onRole }: { role: Role; routeId: string; go: Go; onRole: (role: Role) => void }) {
  const pages = features.filter(f => f.role === role && f.kind === 'page');
  const items: NavItem[] = [
    ...(role === 'student' ? [{ id: 'home', label: 'Practice', Icon: PracticeIcon }] : []),
    ...pages.map(p => ({ id: p.id, label: p.label, Icon: p.navIcon, badge: p.badge?.() })),
  ];
  const current = items.some(i => i.id === routeId) ? routeId : role === 'student' ? 'home' : taHome();
  const hasTa = features.some(f => f.role === 'ta');
  return <header className="cl-topbar">
    <button className="brand" onClick={() => go(role === 'student' ? 'home' : taHome())}><Logo/>CodeLens</button>
    <nav className="topnav" aria-label="Main">{items.map(({ id, label, Icon, badge }) => {
      const on = id === current;
      return <button key={id} className={'topnav-item' + (on ? ' on' : '')} aria-current={on ? 'page' : undefined} onClick={() => go(id)}>
        <span className="topnav-icon" aria-hidden="true">{Icon && <Icon size={on ? 15 : 18}/>}</span>{label}
        {badge ? <span className="count-badge">{badge}<span className="sr-only"> waiting</span></span> : null}
      </button>;
    })}</nav>
    <div className="topbar-end">
      {hasTa && <div className="segmented" role="group" aria-label="View as">
        {(['student', 'ta'] as Role[]).map(r => <button key={r} aria-pressed={role === r} onClick={() => role !== r && onRole(r)}>{r === 'ta' ? 'TA' : 'Student'}</button>)}
      </div>}
      <ThemeButton/>
      {role === 'student' && <Bell go={go}/>}
    </div>
  </header>;
}

function Frame({ route, role, go, onRole }: { route: Route; role: Role; go: Go; onRole: (role: Role) => void }) {
  const feature = features.find(f => f.id === route.id);
  const has = (id: string) => id === 'lens-review' || features.some(f => f.id === id);
  const screenProps = { params: route.params, go, has };
  // Exercises draw their own slim bar; every other screen sits on a sheet under the top bar.
  if (feature && (feature.kind === 'practice' || feature.bare)) return <div className="app-frame exercise"><feature.Screen key={route.id + JSON.stringify(route.params)} {...screenProps}/></div>;
  return <div className="app-frame">
    <TopBar role={role} routeId={route.id} go={go} onRole={onRole}/>
    <main className="sheet page"><div className="page-inner">
      {feature ? <feature.Screen key={route.id + JSON.stringify(route.params)} {...screenProps}/> : <StudentHome {...screenProps}/>}
      {feature?.role !== 'ta' && <p className="cl-demo-note">Demo with sample exercises. Progress is saved in this browser.</p>}
    </div></main>
  </div>;
}

export default function Shell() {
  const [route, setRoute] = useState<Route>({ id: 'home', params: {} });
  const [role, setRole] = useState<Role>('student');
  useTheme();
  const go: Go = (id, params = {}) => { setRoute({ id, params }); window.scrollTo({ top: 0 }); };
  if (route.id === 'lens-review') return <div className="app-frame exercise"><App onHome={() => go('home')} onHistoryBack={() => go('skill-map')} params={route.params}/></div>;
  return <Frame route={route} role={role} go={go} onRole={next => { setRole(next); go(next === 'ta' ? taHome() : 'home'); }}/>;
}
