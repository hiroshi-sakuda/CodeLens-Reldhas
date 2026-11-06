import test from 'node:test';
import assert from 'node:assert/strict';
import { lensReviewItems, summarizeLensReview, summarizePractice } from '../app/bundles/course/codelens/attempt-summary.js';
const comment = { lenses: ['Efficiency'], start: 6, end: 9, text: 'The nested loop scans every seat', fix: '' };
const lens = (comments, total = 0) => ({ id: 'a', exercise: 'seats', date: '2026-11-01', comments, result: { total } });
test('a found issue counts fully for its lens',()=>assert.deepEqual(lensReviewItems(lens([comment])).map(i=>[i.lens,i.value]),[['Efficiency',1]]));
test('right lines with another lens get half',()=>assert.equal(lensReviewItems(lens([{...comment,lenses:['Correctness']}]))[0].value,0.5));
test('a missed issue counts zero',()=>assert.equal(lensReviewItems(lens([]))[0].value,0));
test('a TA adjusted score replaces the score',()=>assert.equal(summarizeLensReview(lens([comment],10),[{attemptId:'a',sentAt:'x',adjustedScore:6}]).score,0.6));
test('a skipped review does not change the score',()=>assert.equal(summarizeLensReview(lens([comment],10),[{attemptId:'a',sentAt:null,adjustedScore:6}]).score,1));
test('Dry Run partial credit is not a correct lens item',()=>{
  const s=summarizePractice({id:'d',function:'dry-run',title:'T',score:0.5,submittedAt:'x',feedback:{correct:false,tip:'t',mistake:null}});
  assert.equal(s.items[0].value,0);assert.equal(s.score,0.5);
});
test('Concept Match makes one item per question',()=>{
  const s=summarizePractice({id:'c',function:'concept-match',score:0.5,submittedAt:'x',feedback:{correctCount:1,questions:[{correct:true,comment:'a'},{correct:false,comment:'b'}]}});
  assert.deepEqual(s.items.map(i=>i.value),[1,0]);assert.equal(s.note,'b');
});
