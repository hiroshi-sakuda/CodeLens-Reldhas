import test from 'node:test';
import assert from 'node:assert/strict';
import { setDraftArchived, listAttempts } from '../app/bundles/course/codelens/practice-log.js';

test('deleting a lens draft is reversible and preserves submitted history and other drafts', () => {
  const data = new Map();
  globalThis.localStorage = { getItem: key => data.get(key) || null, setItem: (key,value) => data.set(key,value) };
  const saved = { currentReviewId: 'draft', attempts: [{ id: 'attempt', result: { total: 9 } }], drafts: { draft: { submitted: false, comments: [{ claim: 'Saved claim' }], editor: { form: { reasoning: 'Unsaved form' } } }, completed: { submitted: true, comments: [] }, other: { submitted: false, comments: [] } } };
  localStorage.setItem('codelens-demo-v1',JSON.stringify(saved));
  assert.equal(setDraftArchived('lens','draft',true),true);
  let updated=JSON.parse(localStorage.getItem('codelens-demo-v1'));
  assert.equal(updated.drafts.draft.archived,true);assert.deepEqual(updated.attempts,saved.attempts);assert.deepEqual(updated.drafts.other,saved.drafts.other);
  assert.equal(setDraftArchived('lens','completed',true),false);
  assert.equal(setDraftArchived('lens','draft',false),true);
  updated=JSON.parse(localStorage.getItem('codelens-demo-v1'));
  assert.deepEqual(updated.drafts.draft.comments,saved.drafts.draft.comments);assert.deepEqual(updated.drafts.draft.editor,saved.drafts.draft.editor);
});
test('practice draft deletion hides only unfinished items and Undo restores their answers', () => {
  const data=new Map();globalThis.localStorage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};
  const draft={id:'draft',status:'in_progress',function:'dry-run',answers:{prediction:'42'}};
  const done={id:'done',status:'submitted',function:'dry-run',score:1};
  localStorage.setItem('codelens-practice-v1',JSON.stringify({attempts:[draft,done]}));
  assert.equal(setDraftArchived('practice','draft',true),true);assert.deepEqual(listAttempts(),[done]);
  assert.equal(setDraftArchived('practice','done',true),false);
  assert.equal(setDraftArchived('practice','draft',false),true);assert.deepEqual(listAttempts(),[draft,done]);
});
