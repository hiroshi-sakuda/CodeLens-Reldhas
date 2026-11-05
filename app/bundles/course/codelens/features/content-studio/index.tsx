import { useEffect, useState } from 'react';
import { Check, FileText, Plus, RefreshCw, Sparkles, X } from 'lucide-react';
import CodeBlock from '../../CodeBlock';
import type { Feature } from '../../features';
import { functionNames, label, practiceFunctions, readCourse, topicName, topics, writeCourse } from '../../course.js';
import { exercises } from '../../model.js';
import { generatedSamples } from './generated-samples.js';
import { approvedCounts, nextSamples, regenerate, seedStatuses, validRequired } from './studio.js';
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
function readStudio() {
  const fresh = { statuses: seedStatuses(library), edits: {}, materials: seedMaterials };
  try { return { ...fresh, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { return fresh; }
}
function ContentStudio() {
  const [tab, setTab] = useState('samples');
  const [studio, setStudio] = useState<any>(readStudio);
  const [course, setCourse] = useState(readCourse);
  const save = (next: any) => { setStudio(next); try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Lasts for this screen. */ } };
  const counts = approvedCounts(library, studio.statuses) as Record<string, number>;
  useEffect(() => { const next = { ...course, approved: counts }; writeCourse(next); }, [studio.statuses, course]);
  return <div className="ta-page studio-page">
    <h1>Content Studio</h1>
    <p className="ta-intro">Set up what students practise. <span className="simulated-label">Simulated generation</span></p>
    <div className="studio-bank">{(practiceFunctions as string[]).map(fn=>{const ready=counts[fn]>=course.examplesRequired;return <article key={fn}><span>{(functionNames as any)[fn]}</span><strong>{counts[fn]} / {course.examplesRequired}</strong><small className={ready?'ready':'not-ready'}>{ready?'Unlocked for students':'Students see: Your TA is preparing this'}</small></article>;})}</div>
    <div className="panel-tabs studio-tabs" role="tablist">{[['samples','Samples'],['materials','Materials'],['settings','Course settings']].map(([id,name])=><button key={id} role="tab" aria-selected={tab===id} className={tab===id?'current':''} onClick={()=>setTab(id)}>{name}</button>)}</div>
    {tab==='samples'&&<Samples studio={studio} save={save}/>}
    {tab==='materials'&&<Materials studio={studio} save={save}/>}
    {tab==='settings'&&<Settings course={course} setCourse={setCourse}/>}
  </div>;
}
const statusNames: Record<string,string> = { pending: 'To review', approved: 'Approved', rejected: 'Rejected' };
function Samples({ studio, save }: { studio: any; save: (next: any) => void }) {
  const [fn, setFn] = useState('dry-run');
  const [topic, setTopic] = useState(topics[0].id);
  const [selected, setSelected] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const shown = library.filter(s => s.function === fn && statusNames[studio.statuses[s.id]]);
  const current = shown.find(s => s.id === selected);
  function generate() {
    setGenerating(true); setMessage('');
    setTimeout(() => {
      const ids = nextSamples(library, studio.statuses, fn, topic);
      setGenerating(false);
      if (!ids.length) { setMessage('The prototype has no more samples for this choice. Try another topic.'); return; }
      save({ ...studio, statuses: { ...studio.statuses, ...Object.fromEntries(ids.map((id: string) => [id, 'pending'])) } });
      setSelected(ids[0]);
      setMessage(`${ids.length} new ${ids.length === 1 ? 'sample' : 'samples'} to review.`);
    }, 1500);
  }
  const setStatus = (id: string, status: string) => save({ ...studio, statuses: { ...studio.statuses, [id]: status } });
  function replace(sample: any) {
    const statuses = regenerate(library, studio.statuses, sample);
    if (!statuses) { setMessage('The prototype has no more samples to replace this one.'); return; }
    save({ ...studio, statuses }); setSelected(Object.keys(statuses).find(id => statuses[id] === 'pending' && !studio.statuses[id]) || null); setMessage('Regenerated. Review the new sample.');
  }
  return <>
    <section className="progress-card studio-generate"><h2>Generate samples</h2><p className="muted">The AI writes sample exercises with solutions from your materials.</p>
      <div className="studio-form">
        <label>Function<select value={fn} onChange={e=>{setFn(e.target.value);setSelected(null);setMessage('');}}>{(practiceFunctions as string[]).map(f=><option key={f} value={f}>{(functionNames as any)[f]}</option>)}</select></label>
        <label>Topic<select value={topic} onChange={e=>setTopic(e.target.value)}>{topics.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        <button className="primary" disabled={generating} onClick={generate}><Sparkles size={15}/>{generating?'Generating…':'Generate'}</button>
      </div>
      {message&&<p className="studio-message" role="status">{message}</p>}
    </section>
    <div className="studio-split">
      <section className="progress-card studio-list"><h2>{(functionNames as any)[fn]} samples</h2>
        {shown.map(s=><button key={s.id} className={selected===s.id?'current':''} aria-current={selected===s.id} onClick={()=>setSelected(s.id)}><strong>{s.title}</strong><small>{s.topicLabel||topicName(s.topicId)}{s.difficulty?` · ${label(s.difficulty)}`:''}</small><span className={'queue-status '+({pending:'waiting',approved:'sent'} as any)[studio.statuses[s.id]]}>{statusNames[studio.statuses[s.id]]}</span></button>)}
      </section>
      {current?<Detail key={current.id} sample={current} status={studio.statuses[current.id]} edit={studio.edits[current.id]} onEdit={(text: string)=>save({...studio,edits:{...studio.edits,[current.id]:text}})} onStatus={(status: string)=>setStatus(current.id,status)} onRegenerate={()=>replace(current)}/>:<section className="progress-card studio-empty"><FileText size={26}/><p>Select a sample to check it, edit its explanation, and approve or reject it.</p></section>}
    </div>
  </>;
}
function Detail({ sample, status, edit, onEdit, onStatus, onRegenerate }: { sample: any; status: string; edit?: string; onEdit: (text: string) => void; onStatus: (status: string) => void; onRegenerate: () => void }) {
  const [text, setText] = useState(edit ?? sample.explanation);
  return <section className="progress-card studio-detail">
    <div className="section-title"><h2>{statusNames[status]}</h2><span className="simulated-label">Sample</span></div>
    {sample.story&&<p className="clean-answer">{sample.story}</p>}
    {sample.code&&<div className="studio-code editor-panel"><CodeBlock file="sample.py" code={sample.code}/></div>}
    <ul className="requirements studio-checks"><li><Check size={15}/><span>Code runs in the sandbox</span></li><li><Check size={15}/><span>{sample.function==='concept-match'?'One correct option, three plausible ones':sample.function==='lens-review'?'Planted correctness bugs fail a test':'Expected output comes from the real run'}</span></li></ul>
    <label className="ta-label">{sample.function==='lens-review'?'Planted issues':'Explanation'}<textarea value={text} onChange={e=>{setText(e.target.value);onEdit(e.target.value);}}/></label>
    <div className="ta-buttons"><button className="primary" disabled={status==='approved'} onClick={()=>onStatus('approved')}><Check size={15}/>Approve</button><button className="secondary" onClick={onRegenerate}><RefreshCw size={15}/>Regenerate</button><button className="secondary" disabled={status==='rejected'} onClick={()=>onStatus('rejected')}><X size={15}/>Reject</button></div>
  </section>;
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
  return <section className="progress-card"><h2>Materials</h2><p className="muted">Notes, tutorials, past papers and conventions the AI works from. In this demo only the file name is kept.</p>
    <form className="studio-form" onSubmit={upload}>
      <label>File<input key={studio.materials.length} type="file" onChange={e=>setName(e.target.files?.[0]?.name||'')}/></label>
      <label>Week<input type="number" min={1} max={13} value={week} onChange={e=>setWeek(Number(e.target.value))}/></label>
      <label>Topic<select value={topic} onChange={e=>setTopic(e.target.value)}>{topics.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
      <button className="primary" disabled={!name}><Plus size={15}/>Upload</button>
    </form>
    <div className="ta-table-scroll"><table className="ta-table studio-materials"><thead><tr><th>File</th><th>Week</th><th>Topic</th></tr></thead><tbody>{studio.materials.map((m: any)=><tr key={m.id}><td><strong>{m.name}</strong></td><td>{m.week}</td><td>{topicName(m.topicId)}</td></tr>)}</tbody></table></div>
  </section>;
}
function Settings({ course, setCourse }: { course: any; setCourse: (next: any) => void }) {
  const toggle = (id: string) => setCourse({ ...course, publishedTopics: course.publishedTopics.includes(id) ? course.publishedTopics.filter((t: string) => t !== id) : [...course.publishedTopics, id] });
  return <div className="studio-settings">
    <section className="progress-card"><h2>Published topics</h2><p className="muted">Dry Run and Concept Match pick at random among these. Lens Review keeps its own exercises.</p>
      {topics.map(t=><label className="ta-check" key={t.id}><input type="checkbox" checked={course.publishedTopics.includes(t.id)} onChange={()=>toggle(t.id)}/>{t.name}</label>)}
      {!course.publishedTopics.length&&<p className="validation-error">Students can't start Dry Run or Concept Match until a topic is published.</p>}
    </section>
    <section className="progress-card"><h2>Examples required</h2><p className="muted">How many approved examples each function needs before students can use it.</p>
      <label className="ta-label studio-required">Per function<input type="number" min={1} max={20} value={course.examplesRequired} onChange={e=>{const value=Number(e.target.value);if(validRequired(value))setCourse({...course,examplesRequired:value});}}/></label>
    </section>
  </div>;
}
const feature: Feature = { id: 'content-studio', role: 'ta', kind: 'page', order: 20, label: 'Content Studio', Screen: ContentStudio };
export default feature;
