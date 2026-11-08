import { useEffect, useState } from 'react';
import { FileText, Search, Trash2, Upload } from 'lucide-react';
import type { Feature } from '../../features';
import { functionNames, practiceFunctions, readCourse, topicName, topics, writeCourse } from '../../course.js';
import { SparkIcon, StudioIcon } from '../../icons';
import { exercises } from '../../model.js';
import { CodeCard } from '../../ui';
import { generatedSamples } from './generated-samples.js';
import { approvedCounts, approvedIds, nextSamples, regenerate, seedStatuses } from './studio.js';
import './content-studio.css';
const lensSamples = exercises.map(e => ({ id: 'lr-' + e.id, exerciseId: e.id, function: 'lens-review', topicId: null, difficulty: null, title: `${e.title} (${e.findings.length} planted ${e.findings.length === 1 ? 'issue' : 'issues'})`, code: e.code.join('\n'), explanation: e.findings.map(f => f.claim).join(' ') || 'This code has no planted issues.', topicLabel: e.topic }));
const library: any[] = [...generatedSamples, ...lensSamples];
const key = 'codelens-studio-v1';
const seedMaterials = [
  { id: 'm1', name: 'Week 3 notes: conditionals.pdf', week: 3, topicId: 'functions-conditionals' },
  { id: 'm2', name: 'Week 4 tutorial: loops.pdf', week: 4, topicId: 'loops' },
  { id: 'm3', name: 'Week 6 notes: lists and strings.pdf', week: 6, topicId: 'lists-strings' },
  { id: 'm4', name: 'Past paper 2025 midterm.pdf', week: 7, topicId: 'loops' },
];
const statusNames: Record<string, string> = { pending: 'To review', approved: 'Approved', rejected: 'Rejected' };
const topicLabel = (id: string | null) => topicName(id).replace(' & ', ' and ');
function readStudio() {
  const fresh = { statuses: seedStatuses(library), materials: seedMaterials };
  try { return { ...fresh, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { return fresh; }
}
type Tab = 'materials' | 'exercises' | 'publish';
// Upload → Generate and review → Publish. The AI only writes from course material, and students only get what the TA approves and publishes.
function ContentStudio() {
  const [studio, setStudio] = useState<any>(readStudio);
  const [course, setCourse] = useState(readCourse);
  const [tab, setTab] = useState<Tab>('exercises');
  const save = (next: any) => { setStudio(next); try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Lasts for this screen. */ } };
  const counts = approvedCounts(library, studio.statuses) as Record<string, number>;
  // Students get only approved exercises: the counts open an exercise type, the IDs are what they can be given.
  useEffect(() => { writeCourse({ ...course, approved: counts, approvedIds: approvedIds(library, studio.statuses) }); }, [studio.statuses, course]);
  const pending = library.filter(s => studio.statuses[s.id] === 'pending').length;
  const tabs: { id: Tab; n: number; name: string; note: string }[] = [
    { id: 'materials', n: 1, name: 'Materials', note: `${studio.materials.length} ${studio.materials.length === 1 ? 'file' : 'files'}` },
    { id: 'exercises', n: 2, name: 'Exercises', note: pending ? `${pending} to review` : 'All reviewed' },
    { id: 'publish', n: 3, name: 'Publish', note: `${course.publishedTopics.length} ${course.publishedTopics.length === 1 ? 'topic' : 'topics'} live` },
  ];
  return <>
    <div><h1 className="page-title">Content Studio</h1><p className="page-lede">The AI writes practice from the course material you upload. Students only get what you approve and publish. <span className="chip">Simulated generation</span></p></div>
    <div role="tablist" aria-label="Content Studio steps" className="step-tabs">{tabs.map(t => <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}><span className="step-n">{t.n}</span>{t.name}<span className="step-note">{t.note}</span></button>)}</div>
    {tab === 'materials' ? <Materials studio={studio} save={save}/> : tab === 'exercises' ? <Exercises studio={studio} save={save} counts={counts} required={course.examplesRequired}/> : <Publish course={course} setCourse={setCourse} counts={counts}/>}
  </>;
}

function Materials({ studio, save }: { studio: any; save: (next: any) => void }) {
  const [name, setName] = useState('');
  const [week, setWeek] = useState(8);
  const [topic, setTopic] = useState(topics[0].id);
  const [query, setQuery] = useState('');
  const [over, setOver] = useState(false);
  function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    save({ ...studio, materials: [...studio.materials, { id: crypto.randomUUID(), name: name.trim(), week, topicId: topic }] });
    setName('');
  }
  const q = query.trim().toLowerCase();
  const shown = studio.materials.filter((m: any) => !q || `${m.name} week ${m.week} ${topicLabel(m.topicId)}`.toLowerCase().includes(q));
  return <section aria-label="Materials" className="studio-panel panel-in">
    <form className="upload-bar" onSubmit={upload}>
      <div className={'dropzone' + (over ? ' over' : '')} onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={e => { e.preventDefault(); setOver(false); setName(e.dataTransfer.files?.[0]?.name || ''); }}>
        <Upload size={18} strokeWidth={1.8} aria-hidden="true"/>
        {name ? <strong className="file-name">{name}</strong> : <span>Drop PDFs here, or</span>}
        <label className="btn btn-outline btn-xs browse">{name ? 'Choose another' : 'Browse files'}<input key={studio.materials.length} type="file" className="sr-only" onChange={e => setName(e.target.files?.[0]?.name || '')}/></label>
      </div>
      <label className="field compact">Week<input type="number" min={1} max={13} value={week} onChange={e => setWeek(Number(e.target.value))}/></label>
      <label className="field compact">Topic<select value={topic} onChange={e => setTopic(e.target.value)}>{topics.map(t => <option key={t.id} value={t.id}>{topicLabel(t.id)}</option>)}</select></label>
      <button className="btn btn-primary" disabled={!name}>Upload</button>
    </form>
    <div className="search-row">
      <label className="search"><Search size={16} strokeWidth={1.8} aria-hidden="true"/><span className="sr-only">Search materials</span><input type="search" value={query} placeholder="Search by name, week or topic" onChange={e => setQuery(e.target.value)}/></label>
      <span className="muted-text">{shown.length} {shown.length === 1 ? 'file' : 'files'}</span>
    </div>
    <div className="table-wrap scroll"><table className="ta-table2">
      <thead><tr><th scope="col">File</th><th scope="col">Week</th><th scope="col">Topic</th><th scope="col"><span className="sr-only">Remove</span></th></tr></thead>
      <tbody>{shown.map((m: any) => <tr key={m.id} className="row-hover">
        <td><span className="file-cell"><FileText size={16} strokeWidth={1.8} aria-hidden="true"/>{m.name}</span></td><td className="num">{m.week}</td><td>{topicLabel(m.topicId)}</td>
        <td className="right"><button className="icon-btn" aria-label={'Remove ' + m.name} onClick={() => save({ ...studio, materials: studio.materials.filter((x: any) => x.id !== m.id) })}><Trash2 size={16} strokeWidth={1.8}/></button></td>
      </tr>)}</tbody>
    </table>{!shown.length && <p className="muted-text table-empty">No materials match.</p>}</div>
    <p className="cl-demo-note">In this demo only the file name is kept.</p>
  </section>;
}

function Exercises({ studio, save, counts, required }: { studio: any; save: (next: any) => void; counts: Record<string, number>; required: number }) {
  const [fn, setFn] = useState('dry-run');
  const [topic, setTopic] = useState(topics[0].id);
  const [selected, setSelected] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const sources = studio.materials.filter((m: any) => fn === 'lens-review' || m.topicId === topic);
  const shown = library.filter(s => s.function === fn && statusNames[studio.statuses[s.id]]).sort((a, b) => (studio.statuses[a.id] === 'pending' ? 0 : 1) - (studio.statuses[b.id] === 'pending' ? 0 : 1));
  const current = shown.find(s => s.id === selected) || shown[0];
  function choose(next: string) { setFn(next); setSelected(null); setMessage(''); }
  function generate() {
    setGenerating(true); setMessage('');
    setTimeout(() => {
      const ids = nextSamples(library, studio.statuses, fn, topic);
      setGenerating(false);
      if (!ids.length) { setMessage('The prototype has no more samples for this choice. Try another topic.'); return; }
      save({ ...studio, statuses: { ...studio.statuses, ...Object.fromEntries(ids.map((id: string) => [id, 'pending'])) } });
      setSelected(ids[0]);
      setMessage(`${ids.length} new ${ids.length === 1 ? 'exercise' : 'exercises'} to review.`);
    }, 1500);
  }
  function replace(sample: any) {
    const statuses = regenerate(library, studio.statuses, sample);
    if (!statuses) { setMessage('The prototype has no more samples to replace this one.'); return; }
    save({ ...studio, statuses });
    setSelected(Object.keys(statuses).find(id => statuses[id] === 'pending' && !studio.statuses[id]) || null);
  }
  const setStatus = (id: string, status: string) => save({ ...studio, statuses: { ...studio.statuses, [id]: status } });
  return <section aria-label="Exercises" className="studio-panel panel-in">
    <div className="studio-controls">
      <div className="segmented" role="group" aria-label="Exercise type">{(practiceFunctions as string[]).map(f => <button key={f} aria-pressed={f === fn} onClick={() => choose(f)}>{(functionNames as any)[f]} <span className={'seg-count' + (counts[f] >= required ? '' : ' low')}>{counts[f]}/{required}</span></button>)}</div>
      {fn !== 'lens-review' && <label className="field compact inline">Topic<select value={topic} onChange={e => setTopic(e.target.value)}>{topics.map(t => <option key={t.id} value={t.id}>{topicLabel(t.id)}</option>)}</select></label>}
      <button className="btn btn-primary" disabled={generating || !sources.length} onClick={generate}><SparkIcon size={16}/>{generating ? 'Generating…' : 'Generate more'}</button>
    </div>
    <p className="muted-text">{counts[fn] >= required ? `${required} approved examples open ${(functionNames as any)[fn]} to students.` : `${(functionNames as any)[fn]} opens to students at ${required} approved examples; ${counts[fn]} so far.`} {sources.length ? `New ones are based on ${sources.map((m: any) => m.name).join(', ')}.` : 'Upload material for this topic first.'}</p>
    {message && <p className="studio-message" role="status">{message}</p>}
    <div className="studio-split2">
      <ul className="sample-list">{shown.map(s => <li key={s.id}><button className={'sample-row row-hover' + (current?.id === s.id ? ' on' : '')} aria-current={current?.id === s.id} onClick={() => setSelected(s.id)}>
        <span className="sample-text"><strong>{s.title}</strong><span>{s.topicLabel ? s.topicLabel.replace(' & ', ' and ') : topicLabel(s.topicId)}{s.difficulty ? `, ${s.difficulty}` : ''}</span></span>
        <span className={'chip ' + ({ pending: 'warn', approved: 'good' } as any)[studio.statuses[s.id]]}>{statusNames[studio.statuses[s.id]]}</span>
      </button></li>)}</ul>
      {current ? <article className="card sample-preview" aria-labelledby="preview-title" key={current.id}>
        <div className="row-between"><h2 id="preview-title" className="panel-title">{current.function === 'concept-match' ? 'Concept Match story' : current.title}</h2><span className="muted-text">{(functionNames as any)[current.function]}{current.difficulty ? `, ${current.difficulty}` : ''}</span></div>
        {current.story && <p className="preview-story">{current.story}</p>}
        {current.code && <CodeCard file={current.function === 'lens-review' ? 'sample.py' : current.id.replace(/-/g, '_') + '.py'} code={current.code} note={null}/>}
        <div><h3 className="small-title">{current.function === 'lens-review' ? 'Planted issues' : current.function === 'dry-run' ? 'Expected trace' : 'Why the answer fits'}</h3><p>{current.explanation}</p></div>
        <div className="preview-actions">
          <button className="btn btn-outline btn-sm" disabled={studio.statuses[current.id] === 'rejected'} onClick={() => setStatus(current.id, 'rejected')}>Reject</button>
          <button className="btn btn-outline btn-sm" onClick={() => replace(current)}>Regenerate</button>
          <button className="btn btn-primary btn-sm" disabled={studio.statuses[current.id] === 'approved'} onClick={() => setStatus(current.id, 'approved')}>{studio.statuses[current.id] === 'approved' ? 'Approved' : 'Approve'}</button>
        </div>
      </article> : <div className="card sample-preview empty"><FileText size={24} strokeWidth={1.8} aria-hidden="true"/><p>Generate exercises to review them here.</p></div>}
    </div>
  </section>;
}

function Publish({ course, setCourse, counts }: { course: any; setCourse: (c: any) => void; counts: Record<string, number> }) {
  const toggle = (id: string) => setCourse({ ...course, publishedTopics: course.publishedTopics.includes(id) ? course.publishedTopics.filter((t: string) => t !== id) : [...course.publishedTopics, id] });
  return <section aria-label="Publish" className="publish-grid panel-in">
    <div className="card publish-card">
      <h2 className="panel-title">Topics students can get</h2>
      <p className="muted-text">Dry Run and Concept Match pick at random from these. Lens Review keeps its own exercises.</p>
      <fieldset className="option-list"><legend className="sr-only">Published topics</legend>
        {topics.map(t => <label key={t.id} className="card hoverable option-card"><input type="checkbox" checked={course.publishedTopics.includes(t.id)} onChange={() => toggle(t.id)}/><span className="option-text"><strong>{topicLabel(t.id)}</strong></span></label>)}
      </fieldset>
      {!course.publishedTopics.length && <p className="error-text">Students can't start Dry Run or Concept Match until a topic is published.</p>}
    </div>
    <div className="card publish-card">
      <h2 className="panel-title">What students see now</h2>
      <ul className="see-list">{(practiceFunctions as string[]).map(fn => {
        const open = counts[fn] >= course.examplesRequired && (fn === 'lens-review' || course.publishedTopics.length > 0);
        return <li key={fn}><span><strong>{(functionNames as any)[fn]}</strong> <span className="muted-text">{counts[fn]} approved</span></span><span className={'chip ' + (open ? 'good' : 'warn')}>{open ? 'Open to students' : 'Your TA is preparing this'}</span></li>;
      })}</ul>
      <p className="muted-text">A type with fewer than {course.examplesRequired} approved examples shows students “Your TA is preparing this”.</p>
    </div>
  </section>;
}
const feature: Feature = { id: 'content-studio', role: 'ta', kind: 'page', order: 21, label: 'Content Studio', navIcon: StudioIcon, Screen: ContentStudio };
export default feature;
