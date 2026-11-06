import type { Feature } from '../../features';
import { summarizeLensReview, summarizePractice } from '../../attempt-summary.js';
import { functionNames, practiceFunctions } from '../../course.js';
import { InsightsIcon } from '../../icons';
import { dimensions } from '../../model.js';
import { lensReviewData, listAttempts, readTa } from '../../practice-log.js';
import { pct, ScoreBar, shortDate } from '../../ui';
import { sampleSubmissions } from '../review-queue/submissions.js';
import { computeInsights } from './insights.js';
import { sampleClass, sampleVotes } from './sample-class.js';
import './class-insights.css';
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
// "Concept Match: lists & sets" reads as "Concept Match, lists and sets".
const source = (g: any) => `${g.title.replace(': ', ', ').replace(' & ', ' and ')}, ${g.lens}`;
function Bars({ title, rows }: { title: string; rows: { name: string; value: number | null }[] }) {
  return <section className="card insight-card"><h2 className="section-title-lg">{title}</h2>
    {rows.map((r, i) => <div className="skill-row" key={r.name}><div className="skill-row-head"><span>{r.name}</span>{r.value == null ? <span className="muted-text">No answers yet</span> : <span className={'skill-value' + (r.value < 0.5 ? ' low' : '')}>{pct(r.value)}</span>}</div><ScoreBar value={r.value} delay={0.1 * i}/></div>)}
  </section>;
}
function ClassInsights() {
  const data = loadInsights() as any;
  return <>
    <div><h1 className="page-title">Class Insights</h1><p className="page-lede">CS1010E, last 30 days. <span className="chip">Sample class data</span></p></div>
    <dl className="stat-row">
      <div><dt>Students active</dt><dd>{data.activeStudents}</dd></div>
      <div><dt>Practice attempts</dt><dd>{data.attempts}</dd></div>
      <div><dt>Started from the Skill map</dt><dd>{pct(data.fromSuggestionShare)}</dd></div>
      <div className={data.toSupport.length ? 'warn' : ''}><dt>Students to support</dt><dd>{data.toSupport.length}</dd></div>
    </dl>
    <section aria-labelledby="support-title" className="insight-section">
      <div><h2 id="support-title" className="section-title-lg">Students to support</h2><p className="muted-text">Under 50% in at least one lens.</p></div>
      {data.toSupport.length ? <div className="table-wrap"><table className="ta-table2">
        <thead><tr><th scope="col">Student</th><th scope="col">Weakest lens</th><th scope="col">Pattern</th><th scope="col">Attempts</th><th scope="col">Last active</th></tr></thead>
        <tbody>{data.toSupport.map((s: any) => <tr key={s.student} className="row-hover"><td><strong>{s.student}</strong></td><td>{s.weakest} <span className="chip warn small">{pct(s.score)}</span></td><td>{s.patterns.join(', ')}</td><td className="num">{s.attempts}</td><td className="nowrap">{shortDate(s.lastActive)}</td></tr>)}</tbody>
      </table></div> : <p className="muted-text">Nobody is under 50% in a lens right now.</p>}
    </section>
    <section aria-labelledby="gaps-title" className="insight-section">
      <div><h2 id="gaps-title" className="section-title-lg">Common gaps</h2><p className="muted-text">Most-missed issues and most-chosen wrong answers.</p></div>
      <ul className="gap-list">{data.gaps.map((g: any) => <li key={g.key}>
        <span className="gap-text"><strong>{g.detail}</strong><span>{source(g)}</span></span>
        <span className="gap-count"><span className="bar"><span className="warn" style={{ width: g.count / g.of * 100 + '%' }}/></span><span>{g.count} of {g.of}</span></span>
      </li>)}</ul>
    </section>
    <div className="insight-grid">
      <Bars title="Class average by practice mode" rows={(practiceFunctions as string[]).map(fn => ({ name: (functionNames as any)[fn], value: data.byFunction[fn] }))}/>
      <Bars title="Class average by lens" rows={dimensions.map(lens => ({ name: lens, value: data.byLens[lens] }))}/>
    </div>
    <section aria-labelledby="ai-title" className="insight-section">
      <div><h2 id="ai-title" className="section-title-lg">AI feedback quality</h2><p className="muted-text">How often students and TAs rated the AI feedback as helpful.</p></div>
      <div className="table-wrap"><table className="ta-table2">
        <thead><tr><th scope="col">Practice mode</th><th scope="col">Students</th><th scope="col">TAs</th></tr></thead>
        <tbody>{(practiceFunctions as string[]).map(fn => <tr key={fn}><td><strong>{(functionNames as any)[fn]}</strong></td>{(['student', 'ta'] as const).map(role => { const q = data.quality[fn][role]; return <td key={role}>{q.share == null ? <span className="muted-text">No ratings yet</span> : <><strong>{pct(q.share)} helpful</strong> <span className="muted-text">({q.up} of {q.up + q.down})</span></>}</td>; })}</tr>)}</tbody>
      </table></div>
    </section>
    <p className="cl-demo-note">Combines a sample class of eight with this browser’s attempts.</p>
  </>;
}
const feature: Feature = { id: 'class-insights', role: 'ta', kind: 'page', order: 22, label: 'Class Insights', navIcon: InsightsIcon, Screen: ClassInsights };
export default feature;
