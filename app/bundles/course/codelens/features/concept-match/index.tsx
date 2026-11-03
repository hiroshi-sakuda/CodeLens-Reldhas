import { Puzzle } from 'lucide-react';
import type { Feature } from '../../features';
import { listAttempts, percent } from '../../practice-log.js';
import ConceptMatchScreen from './ConceptMatch';
const feature: Feature = {
  id: 'concept-match', role: 'student', kind: 'practice', order: 2, label: 'Concept Match', Screen: ConceptMatchScreen,
  card: { icon: Puzzle, lens: 'Appropriateness', skill: 'Read a real-world story and choose the concept that fits it.', minutes: '2–3 min per question',
    score: () => percent(listAttempts('concept-match').filter((a: any) => a.status === 'submitted').map((a: any) => a.score)) },
};
export default feature;
