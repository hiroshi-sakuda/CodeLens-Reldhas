// Demo answers for Lens Review: a good review built from the answer key, and a wrong one.
export function goodReview(exercise) {
  if (!exercise.findings.length) return { comments: [], noIssues: true, justification: 'I checked every requirement against the code and tried the boundary cases. It meets all of them.' };
  return { noIssues: false, justification: '', comments: exercise.findings.map((f, i) => ({ id: `demo-good-${i}`, lenses: [f.dimension], start: f.start, end: f.end, text: `${f.claim} ${f.reasoning}`, fix: f.fix })) };
}
export function wrongReview(exercise, dimensions) {
  const first = exercise.findings[0];
  const otherLens = first ? dimensions.find(d => d !== first.dimension) : dimensions[0];
  return { noIssues: false, justification: '', comments: [
    { id: 'demo-wrong-0', lenses: [otherLens], start: first ? first.start : 1, end: first ? first.start : 1, text: 'This part looks a bit off. Not sure.', fix: 'Rewrite it.' },
  ] };
}
