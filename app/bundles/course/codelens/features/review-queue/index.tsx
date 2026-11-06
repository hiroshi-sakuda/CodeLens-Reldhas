import type { Feature } from '../../features';
import { QueueIcon } from '../../icons';
import { queueCounts } from './queue.js';
import ReviewQueue, { loadQueue } from './ReviewQueue';
const feature: Feature = { id: 'review-queue', role: 'ta', kind: 'page', order: 20, label: 'Review Queue', navIcon: QueueIcon, badge: () => queueCounts(loadQueue()).waiting, Screen: ReviewQueue };
export default feature;
