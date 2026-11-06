import { useState } from 'react';
import { CheckIcon, CloseIcon, HelpIcon, MoonIcon, SunIcon } from './icons';
import { useTheme } from './theme';

export function ThemeButton() {
  const [theme, toggle] = useTheme();
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  return <button className="icon-btn" onClick={toggle} aria-label={label} title={label}>{theme === 'dark' ? <SunIcon/> : <MoonIcon/>}</button>;
}

/* Exercise screens have no navigation: exit, title, help and Save and leave. Submit lives in the work panel. */
export function SlimBar({ title, meta, onExit, help, aside, leave }: { title: string; meta?: string; onExit: () => void; help?: { title: string; steps: string[] }; aside?: React.ReactNode; leave?: { label: string; onClick: () => void } | null }) {
  const [showHelp, setShowHelp] = useState(false);
  return <>
    <header className="cl-slimbar">
      <button className="icon-btn boxed" aria-label="Exit to Practice" onClick={onExit}><CloseIcon/></button>
      <div className="cl-slimbar-title"><h1>{title}</h1>{meta && <span>{meta}</span>}</div>
      {aside}
      {help && <button className="icon-btn" aria-label={help.title} onClick={() => setShowHelp(true)}><HelpIcon/></button>}
      <ThemeButton/>
      {leave !== null && <button className="btn btn-outline btn-sm" onClick={leave?.onClick || onExit}>{leave?.label || 'Save and leave'}</button>}
    </header>
    {showHelp && help && <HelpModal help={help} onClose={() => setShowHelp(false)}/>}
  </>;
}

export function HelpModal({ help, onClose, children }: { help: { title: string; steps: string[] }; onClose: () => void; children?: React.ReactNode }) {
  return <div className="modal-backdrop" onClick={onClose}><section className="modal panel-in" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e => e.stopPropagation()}>
    <button autoFocus className="icon-btn modal-close" aria-label="Close help" onClick={onClose}><CloseIcon/></button>
    <h2 id="help-title">{help.title}</h2><ol>{help.steps.map(step => <li key={step}>{step}</li>)}</ol>{children}
    <button className="btn btn-primary" onClick={onClose}>Got it<CheckIcon className=""/></button>
  </section></div>;
}
