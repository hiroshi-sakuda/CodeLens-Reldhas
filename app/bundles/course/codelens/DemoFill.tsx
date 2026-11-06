import { useState } from 'react';
import './demo-fill.css';
// Demo shortcut: fills a good or a wrong answer so a presenter doesn't have to type.
// Shown only when the page was opened with ?demo in the address.
export function isDemo() {
  try {
    if (new URLSearchParams(location.search).has('demo')) sessionStorage.setItem('codelens-demo', '1');
    return sessionStorage.getItem('codelens-demo') === '1';
  } catch { return false; }
}
export default function DemoFill({ onGood, onWrong, goodLabel = 'Fill a good answer' }: { onGood: () => void | Promise<void>; onWrong?: () => void; goodLabel?: string }) {
  const [busy, setBusy] = useState(false);
  if (!isDemo()) return null;
  async function good() { setBusy(true); try { await onGood(); } finally { setBusy(false); } }
  return <div className="demo-fill" role="group" aria-label="Demo shortcuts"><strong>Demo</strong><button type="button" disabled={busy} onClick={good}>{busy?'Preparing…':goodLabel}</button>{onWrong&&<button type="button" disabled={busy} onClick={onWrong}>Fill a wrong answer</button>}</div>;
}
