import type { Feature } from '../../features';
import { TaReview } from '../review-queue/ReviewQueue';
// Reviewing one submission: opened from the Review Queue, with its own slim bar.
const feature: Feature = { id: 'ta-review', role: 'ta', kind: 'hidden', bare: true, order: 23, label: 'Review submission', Screen: TaReview };
export default feature;
