import { Plus, X } from 'lucide-react';
import { CheckIcon } from '../../icons';
export function TraceInput({ columns, rows, locked, onChange }: { columns: string[]; rows: string[][]; locked: boolean; onChange: (rows: string[][]) => void }) {
  const setCell = (r: number, c: number, value: string) => onChange(rows.map((row, i) => i === r ? row.map((cell, j) => j === c ? value : cell) : row));
  return <div className="trace-input2">
    <div className="table-card"><table><thead><tr><th scope="col" className="ui">Step</th>{columns.map(c => <th scope="col" key={c}>{c}</th>)}{!locked && <th><span className="sr-only">Remove</span></th>}</tr></thead>
      <tbody>{rows.map((row, r) => <tr key={r}><td className="step">{r + 1}</td>{row.map((cell, c) => <td key={c}><input value={cell} readOnly={locked} spellCheck={false} autoCapitalize="off" aria-label={`Step ${r + 1}, ${columns[c]}`} onChange={e => setCell(r, c, e.target.value)}/></td>)}{!locked && <td className="remove"><button type="button" className="icon-btn" aria-label={`Remove step ${r + 1}`} onClick={() => onChange(rows.filter((_, i) => i !== r))}><X size={14}/></button></td>}</tr>)}</tbody></table></div>
    {!locked && <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange([...rows, columns.map(() => '')])}><Plus size={15}/>Add a row</button>}
  </div>;
}
const describe = (columns: string[], row?: string[]) => (row || []).map((v, i) => v === '' ? null : `${columns[i]} = ${v}`).filter(Boolean).join(', ') || 'no values yet';
// The student's rows, each marked: a check where it matches the real run, and where it first goes wrong.
export function TraceResult({ trace }: { trace: any }) {
  const wrong = trace.firstWrongRow;
  return <div className="trace-result2">
    <div className="table-card"><table><thead><tr><th scope="col" className="ui">Step</th>{trace.columns.map((c: string) => <th scope="col" key={c}>{c}</th>)}<th><span className="sr-only">Result</span></th></tr></thead>
      <tbody>{trace.student.map((row: string[], r: number) => {
        const off = wrong !== null && r >= wrong;
        return <tr key={r} className={off ? 'off' : ''}><td className="step">{r + 1}</td>{row.map((cell, c) => <td key={c}>{cell || '·'}</td>)}<td className="mark">{off ? (r === wrong ? 'Goes wrong here' : '') : <span role="img" aria-label="Matches"><CheckIcon/></span>}</td></tr>;
      })}</tbody></table></div>
    {wrong !== null && <p>At step {wrong + 1} you wrote {describe(trace.columns, trace.student[wrong])}, but at that point the code had {describe(trace.columns, trace.expected[trace.expectedAt])}.</p>}
  </div>;
}
