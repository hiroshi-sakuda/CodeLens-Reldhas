import type { ComponentType } from 'react';
export type Go = (id: string, params?: Record<string, any>) => void;
export type ScreenProps = { params: Record<string, any>; go: Go; has: (id: string) => boolean };
// A feature is a folder in features/ with an index.tsx. The shell finds it, so
// each one can be added or merged without changing the shell.
export type Feature = {
  id: string;
  role: 'student' | 'ta';
  kind: 'practice' | 'page' | 'hidden';
  order: number;
  label: string;
  Screen: ComponentType<ScreenProps>;
  HomePanel?: ComponentType<ScreenProps>;
  card?: { icon: ComponentType<any>; lens: string; skill: string; score: () => string | null };
  help?: { title: string; steps: string[] };
};
const found = import.meta.glob('./features/*/index.tsx', { eager: true }) as Record<string, { default: Feature }>;
export const features = Object.values(found).map(m => m.default).sort((a, b) => a.order - b.order);
