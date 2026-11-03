import { Puzzle } from 'lucide-react';
import type { Feature } from '../../features';
import { listAttempts, percent } from '../../practice-log.js';
import ConceptMatchScreen from './ConceptMatch';
const feature: Feature = {
  id: 'concept-match', role: 'student', kind: 'practice', order: 2, label: 'Concept Match', Screen: ConceptMatchScreen,
  card: { icon: Puzzle, lens: 'Appropriateness', skill: 'Read a real-world story and choose the concept that fits it.',
    score: () => percent(listAttempts('concept-match').filter((a: any) => a.status === 'submitted').map((a: any) => a.score)) },
  help: { title: 'How Concept Match works', steps: ['Read the story. Each set has 5.', 'Pick the concept that fits it best and say why in one line.', 'Check your answer. It locks and the feedback explains every option.', 'Finish the set to see your results.'] },
};
export default feature;
