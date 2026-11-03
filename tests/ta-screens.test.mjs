import test from 'node:test';
import assert from 'node:assert/strict';
import { exercises } from '../app/bundles/course/codelens/model.js';
import { buildQueue, confidenceOf, makeReview, queueCounts, statusOf, taFeedbackFor } from '../app/bundles/course/codelens/features/review-queue/queue.js';
import { sampleReviews, sampleSubmissions } from '../app/bundles/course/codelens/features/review-queue/submissions.js';
import { commonGaps, computeInsights, feedbackQuality } from '../app/bundles/course/codelens/features/class-insights/insights.js';
import { sampleClass, sampleVotes } from '../app/bundles/course/codelens/features/class-insights/sample-class.js';
import { approvedCounts, nextSamples, regenerate, seedStatuses, validRequired } from '../app/bundles/course/codelens/features/content-studio/studio.js';
const seats = exercises.find(e => e.id === 'seats');
const good = { id: 'c', dimension: 'Efficiency', start: 6, end: 9, claim: 'The nested loop scans it', reasoning: 'Slow', fix: 'Set' };
const sub = (id, date, extra = {}) => ({ id, student: id, exercise: 'seats', date, comments: [good], ...extra });
test('sent wins over skipped',()=>{
  assert.equal(statusOf([{action:'skipped'},{sentAt:'x'}]),'sent');
  assert.equal(statusOf([{action:'skipped'}]),'skipped');
  assert.equal(statusOf([]),'waiting');
});
test('confidence is low for a comment that misses the point or a long off-key one',()=>{
  assert.equal(confidenceOf(seats,[good]),'high');
  assert.equal(confidenceOf(seats,[{...good,claim:'Odd style here'}]),'low');
  const discount=exercises.find(e=>e.id==='discount');
  assert.equal(confidenceOf(discount,[{...good,start:3,end:3,claim:'The 100 boundary is wrong'}]),'high');
  assert.equal(confidenceOf(discount,[{...good,start:3,end:3,claim:'The 100 boundary and negative totals'}]),'low');
  assert.equal(confidenceOf(seats,[{...good,start:1,end:1,claim:'word '.repeat(30)}]),'low');
});
test('queue order: waiting, more flags, then newest',()=>{
  const q=buildQueue([sub('old','2026-01-01'),sub('new','2026-02-01'),sub('flag','2026-01-02',{studentVote:'down'}),sub('done','2026-03-01')],[{attemptId:'done',sentAt:'x',createdAt:'x'}],[],exercises);
  assert.deepEqual(q.map(i=>i.submission.id),['flag','new','old','done']);
  assert.deepEqual(queueCounts(q),{waiting:3,flagged:1});
});
test('watched students are flagged',()=>assert.ok(buildQueue([sub('a','2026-01-01')],[],['a'],exercises)[0].flags.includes('watching')));
test('a review records approved or edited',()=>{
  const base={attemptId:'a',originalSummary:'s',originalScore:5};
  assert.equal(makeReview({...base,action:'send',summary:'s',score:5}).action,'approved');
  assert.equal(makeReview({...base,action:'send',summary:'new',score:5}).editedSummary,'new');
  const adjusted=makeReview({...base,action:'send',score:8});assert.equal(adjusted.action,'edited');assert.equal(adjusted.adjustedScore,8);
  const skipped=makeReview({...base,action:'skip',score:8,comment:'x'});assert.equal(skipped.sentAt,null);assert.equal(skipped.adjustedScore,null);assert.equal(skipped.comment,null);
});
test('the student gets the latest edit and score and every comment',()=>{
  const f=taFeedbackFor([{sentAt:'1',editedSummary:'a',adjustedScore:3,comment:'x'},{sentAt:'2',editedSummary:'b',adjustedScore:null,comment:'y'},{sentAt:null,editedSummary:'skip',adjustedScore:9}]);
  assert.equal(f.editedSummary,'b');assert.equal(f.adjustedScore,3);assert.deepEqual(f.comments,['x','y']);
});
test('sample submissions use real exercises, and the demo student has a sent review',()=>{
  assert.ok(sampleSubmissions.every(s=>exercises.some(e=>e.id===s.exercise)));
  assert.ok(sampleSubmissions.some(s=>s.id===sampleReviews[0].attemptId));
});
test('sample class gives the screens something to show',()=>{
  const data=computeInsights(sampleClass,sampleVotes);
  assert.equal(data.activeStudents,8);
  assert.ok(data.toSupport.some(s=>s.patterns.includes('Confident but often wrong')));
  assert.ok(data.toSupport.some(s=>s.patterns.includes('Low scores, few attempts')));
  assert.ok(data.gaps.length>=3);
  assert.equal(data.quality['lens-review'].ta.share,7/9);
});
test('gaps count misses out of chances',()=>{
  const item=value=>({title:'T',claim:'C',lens:'Correctness',value});
  assert.deepEqual(commonGaps([{items:[item(0),item(1),item(0)]}]).map(g=>[g.count,g.of]),[[2,3]]);
});
test('quality is empty with no votes',()=>assert.equal(feedbackQuality([])['dry-run'].student.share,null));
const library=[...Array(7)].map((_,i)=>({id:'d'+i,function:'dry-run',topicId:'loops'}));
test('the bank starts with 3 approved and 2 to review',()=>{
  const s=seedStatuses(library);
  assert.equal(approvedCounts(library,s)['dry-run'],3);
  assert.equal(Object.values(s).filter(v=>v==='pending').length,2);
});
test('generate reveals unseen samples of the topic',()=>{
  const s=seedStatuses(library);
  assert.deepEqual(nextSamples(library,s,'dry-run','loops'),['d5','d6']);
  assert.deepEqual(nextSamples(library,s,'dry-run','lists-strings'),[]);
});
test('regenerate replaces a sample, or says none are left',()=>{
  const s=seedStatuses(library);
  const next=regenerate(library,s,library[3]);
  assert.equal(next.d3,'replaced');assert.equal(next.d5,'pending');
  assert.equal(regenerate(library,{...s,d5:'pending',d6:'pending'},library[3]),null);
});
test('examples required stays in range',()=>{assert.ok(validRequired(3));assert.equal(validRequired(0),false);assert.equal(validRequired(2.5),false);});
