// Line icons drawn as on the canvas: Lucide style, 1.8 stroke, rounded ends.
type P = { size?: number; className?: string };
const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true });
export const Logo = ({ size = 22 }: P) => <svg {...base(size)} strokeWidth={2.2}><path d="M3 8V5.5A2.5 2.5 0 0 1 5.5 3H8M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8M21 16v2.5a2.5 2.5 0 0 1-2.5 2.5H16M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16"/><circle cx="12" cy="12" r="3" fill="var(--action)" stroke="currentColor"/></svg>;
export const DryRunIcon = ({ size = 20 }: P) => <svg {...base(size)}><path d="M4 6h10M4 12h7M4 18h10"/><path d="M17 9l3 3-3 3"/></svg>;
export const ConceptIcon = ({ size = 20 }: P) => <svg {...base(size)}><rect x="3" y="4" width="7" height="7" rx="2"/><rect x="14" y="13" width="7" height="7" rx="2"/><path d="M10 7.5h4a3 3 0 0 1 3 3V13"/></svg>;
export const LensIcon = ({ size = 20 }: P) => <svg {...base(size)}><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20M8 10.5h5"/></svg>;
export const SkillMapIcon = ({ size = 18 }: P) => <svg {...base(size)}><circle cx="6" cy="17" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M8 15.2l8-7.4M8.5 17.2h6.5"/></svg>;
export const PracticeIcon = ({ size = 18 }: P) => <svg {...base(size)} strokeWidth={2.2}><path d="M7 4.5v15l12-7.5z"/></svg>;
export const QueueIcon = ({ size = 18 }: P) => <svg {...base(size)}><path d="M4 6h16M4 12h16M4 18h10"/></svg>;
export const StudioIcon = ({ size = 18 }: P) => <svg {...base(size)}><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/></svg>;
export const InsightsIcon = ({ size = 18 }: P) => <svg {...base(size)}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>;
export const BellIcon = ({ size = 19 }: P) => <svg {...base(size)}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>;
export const MoonIcon = ({ size = 18 }: P) => <svg {...base(size)}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>;
export const SunIcon = ({ size = 18 }: P) => <svg {...base(size)}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
export const HelpIcon = ({ size = 19 }: P) => <svg {...base(size)}><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.8 1c0 1.7-2.3 2-2.3 3.5M12 17h.01"/></svg>;
export const CloseIcon = ({ size = 18 }: P) => <svg {...base(size)}><path d="M6 6l12 12M18 6L6 18"/></svg>;
export const CheckIcon = ({ size = 14, className = 'draw' }: P) => <svg {...base(size)} strokeWidth={2.6} className={className}><path d="M5 12l5 5 9-10"/></svg>;
export const ResumeIcon = ({ size = 17 }: P) => <svg {...base(size)}><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/></svg>;
export const LockIcon = ({ size = 14 }: P) => <svg {...base(size)}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
export const SparkIcon = ({ size = 17 }: P) => <svg {...base(size)}><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/></svg>;
export const TerminalIcon = ({ size = 14 }: P) => <svg {...base(size)}><path d="M4 17l6-5-6-5M12 19h8"/></svg>;
/* The four viewfinder corners. Put inside an element with class "vf". */
export const Brackets = () => <><span aria-hidden="true" className="vf-c vf-tl"/><span aria-hidden="true" className="vf-c vf-tr"/><span aria-hidden="true" className="vf-c vf-bl"/><span aria-hidden="true" className="vf-c vf-br"/></>;
