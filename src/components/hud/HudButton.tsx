import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GOLD, GOLD_BRIGHT, INK, PARCHMENT } from './theme';

type Variant = 'primary' | 'secondary';

interface HudButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: Variant;
}

const BASE =
  'w-full rounded-lg text-sm font-semibold py-2.5 transition-colors disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2';

/**
 * The tactile action button used inside sheets. Its background is always
 * driven by inline styles, never a Tailwind `bg-*` class: index.css carries an
 * unconditional, un-layered `button { background-color: #f9f9f9 }` (under
 * prefers-color-scheme: light) left over from the Vite starter; sitting
 * outside any `@layer`, it outranks every Tailwind utility on a `<button>`
 * regardless of specificity, so a class-based background silently loses in
 * light-mode browsers. Inline styles outrank it in turn. A small spring
 * lift/press makes the button feel physical before the app responds.
 */
export const HudButton: React.FC<HudButtonProps> = ({
  variant = 'primary',
  disabled,
  className = '',
  children,
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  const [hovered, setHovered] = useState(false);

  const background =
    variant === 'primary'
      ? hovered && !disabled
        ? GOLD_BRIGHT
        : GOLD
      : hovered && !disabled
        ? 'rgba(201, 162, 39, 0.14)'
        : 'transparent';

  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      onMouseEnter={(e) => {
        setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);
      }}
      style={{
        backgroundColor: background,
        color: variant === 'primary' ? INK : PARCHMENT,
        border: variant === 'secondary' ? '1px solid rgba(201, 162, 39, 0.35)' : 'none',
      }}
      className={`${BASE} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
};
