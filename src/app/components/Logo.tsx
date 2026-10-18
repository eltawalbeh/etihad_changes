/**
 * Logo component — renders the real brand mark using Figma-imported React SVG components.
 *
 * Frame68 → white lettering → dark backgrounds (hero navbar, footer, admin sidebar/login, mobile menu)
 * Frame67 → black lettering → light backgrounds (scrolled white navbar)
 *
 * Natural artwork size: 760.382 × 385 px  (aspect ratio ≈ 1.975 : 1)
 */

import Frame67 from '../../imports/Frame67'; // black text
import Frame68 from '../../imports/Frame68'; // white text

const NATURAL_W = 760.382;
const NATURAL_H = 385;

interface LogoProps {
  /**
   * 'white' → white lettering  → Frame68 → use on DARK backgrounds
   * 'dark'  → black lettering  → Frame67 → use on LIGHT/white backgrounds
   */
  variant?: 'white' | 'dark';
  /** Desired rendered height in px (width scales proportionally) */
  height?: number;
  className?: string;
}

export function Logo({ variant = 'white', height = 48, className = '' }: LogoProps) {
  const scale = height / NATURAL_H;
  const width  = Math.ceil(NATURAL_W * scale);
  const Component = variant === 'white' ? Frame68 : Frame67;

  return (
    <div
      className={`shrink-0 ${className}`}
      style={{ height, width, overflow: 'hidden', position: 'relative', display: 'inline-block' }}
      aria-label="Al-Etihad for Travel & Tourism — الاتحاد للسفر والسياحة"
    >
      {/* Give the Figma component an explicit container matching natural artwork size,
          then scale it down via CSS transform so it fits the requested height */}
      <div
        style={{
          position:        'absolute',
          top:             0,
          left:            0,
          width:           NATURAL_W,
          height:          NATURAL_H,
          transform:       `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents:   'none',
        }}
      >
        <Component />
      </div>
    </div>
  );
}
