import type { Feature } from '../../features';
import { summarizeLensReview, summarizePractice } from '../../attempt-summary.js';
import { functionNames, practiceFunctions } from '../../course.js';
import { dimensions } from '../../model.js';
import { lensReviewData, listAttempts, readTa } from '../../practice-log.js';
import { sampleSubmissions } from '../review-queue/submissions.js';
import { computeInsights } from './insights.js';
import { sampleClass, sampleVotes } from './sample-class.js';
import './class-insights.css';
const pct = (value: number | null) => value == null ? '—' : Math.round(value * 100) + '%';
const you = 'Demo student';
function loadInsights() {
  const ta = readTa();
  const { attempts: lens, drafts } = lensReviewData();
  const practice = listAttempts().filter((a: any) => a.status === 'submitted');
  const real = [...practice.map(summarizePractice), ...lens.map((a: any) => summarizeLensReview(a, ta.reviews))].map(s => ({ ...s, student: you }));
  const studentVotes = [
    ...practice.flatMap((a: any) => Object.values(a.ratings).map((r: any) => ({ function: a.function, role: 'student', vote: r.vote }))),
    ...Object.values(drafts as Record<string, any>).filter(d => d.ratings?.feedback?.vote).map(d => ({ function: 'lens-review', role: 'student', vote: d.ratings.feedback.vote })),
    ...sampleSubmissions.filter(s => s.studentVote).map(s => ({ function: 'lens-review', role: 'student', vote: s.studentVote })),
  ];
  const taVotes = Object.values(ta.ratings).map((r: any) => ({ function: 'lens-review', role: 'ta', vote: r.vote }));
  return computeInsights([...real, ...sampleClass], [...sampleVotes, ...studentVotes, ...taVotes].filter(v => v.vote));
}
function Bar({ name, value }: { name: string; value: number | null }) {
  return <div className="rubric"><div><span>{name}</span><strong>{pct(value)}</strong></div><div className="track"><span style={{width:(value||0)*100+'%'}}/></div></div>;
}
function ClassInsights() {
  const data = loadInsights() as any;
  return <div className="ta-page insights-page">
    <h1>Class Insights</h1>
    <p className="ta-intro">Last 30 days · CS1010E <span className="simulated-label">Sample class data</span></p>
    <div className="stat-grid insights-stats">
      <article><span>Students active</span><strong>{data.activeStudents}</strong></article>
      <article><span>Practice attempts</span><strong>{data.attempts}</strong></article>
      <article><span>Started from Skill Map</span><strong>{pct(data.fromSuggestionShare)}</strong></article>
      <article><span>Students to support</span><strong>{data.toSupport.length}</strong></article>
    </div>
    <div className="insights-grid">
      <section className="progress-card"><h2>By function</h2>{(practiceFunctions as string[]).map(fn=><Bar key={fn} name={(functionNames as any)[fn]} value={data.byFunction[fn]}/>)}</section>
      <section className="progress-card"><h2>By lens</h2>{dimensions.map(lens=><Bar key={lens} name={lens} value={data.byLens[lens]}/>)}</section>
    </div>
    <section className="progress-card"><h2>Common gaps</h2><p className="muted">Most-missed issues and most-chosen wrong answers.</p>
      <ul className="insights-gaps">{data.gaps.map((g: any)=><li key={g.key}><div><strong>{g.detail}</strong><small>{g.title} · {g.lens}</small></div><b>{g.count} of {g.of}</b></li>)}</ul>
    </section>
    <section className="progress-card"><h2>Students to support</h2><p className="muted">Under 50% in a lens.</p>
      <div className="ta-table-scroll"><table className="ta-table"><thead><tr><th>Student</th><th>Weakest lens</th><th>Pattern</th><th>Attempts</th><th>Last active</th></tr></thead>
        <tbody>{data.toSupport.map((s: any)=><tr key={s.student}><td><strong>{s.student}</strong></td><td>{s.weakest} ({pct(s.score)})</td><td>{s.patterns.map((p: string)=><span className="queue-flag" key={p}>{p}</span>)}</td><td>{s.attempts}</td><td>{new Date(s.lastActive).toLocaleDateString()}</td></tr>)}</tbody></table></div>
    </section>
    <section className="progress-card"><h2>AI feedback quality</h2><p className="muted">Share of 👍 in every rating.</p>
      <div className="ta-table-scroll"><table className="ta-table"><thead><tr><th>Function</th><th>Students</th><th>TAs</th></tr></thead>
        <tbody>{(practiceFunctions as string[]).map(fn=><tr key={fn}><td><strong>{(functionNames as any)[fn]}</strong></td>{(['student','ta'] as const).map(role=>{const q=data.quality[fn][role];return <td key={role}>{pct(q.share)} {q.share!=null&&<small className="muted">({q.up} 👍 · {q.down} 👎)</small>}</td>;})}</tr>)}</tbody></table></div>
    </section>
  </div>;
}
const feature: Feature = { id: 'class-insights', role: 'ta', kind: 'page', order: 22, label: 'Class Insights', Screen: ClassInsights };
export default feature;
