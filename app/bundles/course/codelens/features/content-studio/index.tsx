import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, Check, FileText, Plus, RefreshCw, Sparkles, X } from 'lucide-react';
import CodeBlock from '../../CodeBlock';
import type { Feature } from '../../features';
import { functionNames, label, practiceFunctions, readCourse, topicName, topics, writeCourse } from '../../course.js';
import { exercises } from '../../model.js';
import { generatedSamples } from './generated-samples.js';
import { approvedCounts, nextSamples, regenerate, seedStatuses } from './studio.js';
import './content-studio.css';
const lensSamples = exercises.map(e => ({ id: 'lr-' + e.id, function: 'lens-review', topicId: null, difficulty: null, title: `${e.title} (${e.findings.length} planted ${e.findings.length === 1 ? 'issue' : 'issues'})`, code: e.code.join('\n'), explanation: e.findings.map(f => f.claim).join(' ') || 'This code has no planted issues.', topicLabel: e.topic }));
const library: any[] = [...generatedSamples, ...lensSamples];
const key = 'codelens-studio-v1';
const seedMaterials = [
  { id: 'm1', name: 'Week 3 notes: conditionals.pdf', week: 3, topicId: 'functions-conditionals' },
  { id: 'm2', name: 'Week 4 tutorial: loops.pdf', week: 4, topicId: 'loops' },
  { id: 'm3', name: 'Week 6 notes: lists and strings.pdf', week: 6, topicId: 'lists-strings' },
  { id: 'm4', name: 'Past paper 2025 midterm.pdf', week: 7, topicId: 'loops' },
];
const statusNames: Record<string,string> = { pending: 'To review', approved: 'Approved', rejected: 'Rejected' };
function readStudio() {
  const fresh = { statuses: seedStatuses(library), materials: seedMaterials };
  try { return { ...fresh, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { return fresh; }
}
function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return <section className="progress-card studio-step" aria-labelledby={'step-'+n}><h2 id={'step-'+n}><span className="step-number">{n}</span>{title}</h2>{children}</section>;
}
// Upload → Generate → Review → Publish: the AI only writes from course material, and students only get what the TA approves and publishes.
function ContentStudio() {
  const [studio, setStudio] = useState<any>(readStudio);
  const [course, setCourse] = useState(readCourse);
  const [fn, setFn] = useState('dry-run');
  const [topic, setTopic] = useState(topics[0].id);
  const [selected, setSelected] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const save = (next: any) => { setStudio(next); try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Lasts for this screen. */ } };
  const counts = approvedCounts(library, studio.statuses) as Record<string, number>;
  useEffect(() => { writeCourse({ ...course, approved: counts }); }, [studio.statuses, course]);
  const sources = studio.materials.filter((m: any) => fn === 'lens-review' || m.topicId === topic);
  const shown = library.filter(s => s.function === fn && statusNames[studio.statuses[s.id]]);
  const current = shown.find(s => s.id === selected);
  function choose(nextFn: string) { setFn(nextFn); setSelected(null); setMessage(''); }
  function generate() {
    setGenerating(true); setMessage('');
    setTimeout(() => {
      const ids = nextSamples(library, studio.statuses, fn, topic);
      setGenerating(false);
      if (!ids.length) { setMessage('The prototype has no more samples for this choice. Try another topic.'); return; }
      save({ ...studio, statuses: { ...studio.statuses, ...Object.fromEntries(ids.map((id: string) => [id, 'pending'])) } });
      setSelected(ids[0]);
      setMessage(`${ids.length} new ${ids.length === 1 ? 'exercise' : 'exercises'} to review in step 3.`);
    }, 1500);
  }
  function replace(sample: any) {
    const statuses = regenerate(library, studio.statuses, sample);
    if (!statuses) { setMessage('The prototype has no more samples to replace this one.'); return; }
    save({ ...studio, statuses });
    setSelected(Object.keys(statuses).find(id => statuses[id] === 'pending' && !studio.statuses[id]) || null);
  }
  const togglePublished = (id: string) => setCourse({ ...course, publishedTopics: course.publishedTopics.includes(id) ? course.publishedTopics.filter((t: string) => t !== id) : [...course.publishedTopics, id] });
  return <div className="ta-page studio-page">
    <h1>Content Studio</h1>
    <ol className="studio-flow" aria-label="Steps">{['Upload','Generate','Review','Publish'].map((s,i)=><li key={s}>{i>0&&<ArrowRight size={13} aria-hidden="true"/>}{s}</li>)}</ol>
    <p className="ta-intro">The AI writes practice from the course material you upload. Students only get what you approve and publish. <span className="simulated-label">Simulated generation</span></p>
    <Step n={1} title="Upload course materials"><Materials studio={studio} save={save}/></Step>
    <Step n={2} title="Generate exercises with AI">
      <div className="studio-form">
        <label>Exercise type<select value={fn} onChange={e=>choose(e.target.value)}>{(practiceFunctions as string[]).map(f=><option key={f} value={f}>{(functionNames as any)[f]}</option>)}</select></label>
        {fn!=='lens-review'&&<label>Topic<select value={topic} onChange={e=>setTopic(e.target.value)}>{topics.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>}
        <button className="primary" disabled={generating||!sources.length} onClick={generate}><Sparkles size={15}/>{generating?'Generating…':'Generate'}</button>
      </div>
      <p className="studio-sources">{sources.length?<>Based on: {sources.map((m: any)=>m.name).join(' · ')}</>:'Upload material for this topic first.'}</p>
      {message&&<p className="studio-message" role="status">{message}</p>}
    </Step>
    <Step n={3} title="Review and approve">
      <div className="studio-bank">{(practiceFunctions as string[]).map(f=>{const ready=counts[f]>=course.examplesRequired;return <button key={f} className={f===fn?'current':''} aria-pressed={f===fn} onClick={()=>choose(f)}><span>{(functionNames as any)[f]}</span><strong>{counts[f]} / {course.examplesRequired} approved</strong><small className={ready?'ready':'not-ready'}>{ready?'Open to students':'Students see: Your TA is preparing this'}</small></button>;})}</div>
      <div className="studio-split">
        <div className="studio-list">{shown.map(s=><button key={s.id} className={selected===s.id?'current':''} aria-current={selected===s.id} onClick={()=>setSelected(s.id)}><strong>{s.title}</strong><small>{s.topicLabel||topicName(s.topicId)}{s.difficulty?` · ${label(s.difficulty)}`:''}</small><span className={'queue-status '+({pending:'waiting',approved:'sent'} as any)[studio.statuses[s.id]]}>{statusNames[studio.statuses[s.id]]}</span></button>)}</div>
        {current?<Detail key={current.id} sample={current} status={studio.statuses[current.id]} onStatus={(status: string)=>save({...studio,statuses:{...studio.statuses,[current.id]:status}})} onRegenerate={()=>replace(current)}/>:<div className="studio-empty"><FileText size={26}/><p>Select an exercise to check it and approve or reject it.</p></div>}
      </div>
    </Step>
    <Step n={4} title="Publish topics">
      <p className="muted">Dry Run and Concept Match pick at random among published topics. Each exercise type opens to students once it has {course.examplesRequired} approved examples.</p>
      <div className="studio-topics">{topics.map(t=><label className="ta-check" key={t.id}><input type="checkbox" checked={course.publishedTopics.includes(t.id)} onChange={()=>togglePublished(t.id)}/>{t.name}</label>)}</div>
      {!course.publishedTopics.length&&<p className="validation-error">Students can't start Dry Run or Concept Match until a topic is published.</p>}
    </Step>
  </div>;
}
function Detail({ sample, status, onStatus, onRegenerate }: { sample: any; status: string; onStatus: (status: string) => void; onRegenerate: () => void }) {
  return <div className="studio-detail">
    <div className="section-title"><h3>{sample.title}</h3><span className="simulated-label">AI-generated sample</span></div>
    {sample.story&&<p className="clean-answer">{sample.story}</p>}
    {sample.code&&<div className="studio-code editor-panel"><CodeBlock file="sample.py" code={sample.code}/></div>}
    <h4>{sample.function==='lens-review'?'Planted issues':'Explanation'}</h4><p className="clean-answer">{sample.explanation}</p>
    <div className="ta-buttons"><button className="primary" disabled={status==='approved'} onClick={()=>onStatus('approved')}><Check size={15}/>Approve</button><button className="secondary" onClick={onRegenerate}><RefreshCw size={15}/>Regenerate</button><button className="secondary" disabled={status==='rejected'} onClick={()=>onStatus('rejected')}><X size={15}/>Reject</button></div>
  </div>;
}
function Materials({ studio, save }: { studio: any; save: (next: any) => void }) {
  const [name, setName] = useState('');
  const [week, setWeek] = useState(1);
  const [topic, setTopic] = useState(topics[0].id);
  function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    save({ ...studio, materials: [...studio.materials, { id: crypto.randomUUID(), name: name.trim(), week, topicId: topic }] });
    setName('');
  }
  return <>
    <ul className="studio-materials">{studio.materials.map((m: any)=><li key={m.id}><FileText size={15}/><strong>{m.name}</strong><span>Week {m.week} · {topicName(m.topicId)}</span></li>)}</ul>
    <form className="studio-form" onSubmit={upload}>
      <label>File<input key={studio.materials.length} type="file" onChange={e=>setName(e.target.files?.[0]?.name||'')}/></label>
      <label>Week<input type="number" min={1} max={13} value={week} onChange={e=>setWeek(Number(e.target.value))}/></label>
      <label>Topic<select value={topic} onChange={e=>setTopic(e.target.value)}>{topics.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
      <button className="primary" disabled={!name}><Plus size={15}/>Upload</button>
    </form>
    <p className="muted studio-note">In this demo only the file name is kept.</p>
  </>;
}
const feature: Feature = { id: 'content-studio', role: 'ta', kind: 'page', order: 20, label: 'Content Studio', Screen: ContentStudio };
export default feature;
