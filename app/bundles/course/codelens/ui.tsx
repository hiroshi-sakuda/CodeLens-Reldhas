import type { ReactNode } from 'react';
import { highlight } from './CodeBlock';
import { LockIcon } from './icons';
import './exercise.css';
// Small building blocks shared by the redesigned screens.

export const pct = (value: number | null | undefined) => value == null ? '—' : Math.round(value * 100) + '%';
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' });

/* Result pill: green when right, amber when it needs work, red for a zero. */
// soft: a word like Not quite stays amber; red is only for a zero score.
export function ResultChip({ value, children, soft = false, className = '' }: { value: number | null; children: ReactNode; soft?: boolean; className?: string }) {
  const tone = value == null ? '' : value >= 0.75 ? 'good' : value > 0 || soft ? 'warn' : 'bad';
  return <span className={`chip chip-score ${tone} ${className}`}>{children}</span>;
}

export function ScoreBar({ value, delay = 0 }: { value: number | null; delay?: number }) {
  return <div className="bar"><span className={value != null && value < 0.5 ? 'warn' : ''} style={{ width: (value || 0) * 100 + '%', animationDelay: delay + 's' }}/></div>;
}

/* Two white sheets side by side: the work and the answer panel. */
export function WorkArea({ children }: { children: ReactNode }) { return <div className="work-area">{children}</div>; }

/* Read-only code card. `marks` tints lines: found (green), missed or slip (amber). */
export function CodeCard({ file, code, note, legend, marks = {} }: { file: string; code: string; note?: ReactNode; legend?: ReactNode; marks?: Record<number, 'found' | 'missed'> }) {
  return <div className="code-card">
    <div className="code-card-head">{legend || <span className="mono">{file}</span>}{note === undefined ? <span className="code-card-note"><LockIcon/>Runs after you submit</span> : note}{legend && <span className="mono muted-mono">{file}</span>}</div>
    <div className="code-lines">{code.split('\n').map((line, i) => <div key={i} className={'code-row ' + (marks[i + 1] || '')}><span className="ln">{i + 1}</span><code>{highlight(line) || ' '}</code></div>)}</div>
  </div>;
}

export function PanelFooter({ note, children }: { note?: ReactNode; children: ReactNode }) {
  return <footer className="panel-footer">{note && <span className="panel-footer-note">{note}</span>}<div className="panel-footer-actions">{children}</div></footer>;
}
