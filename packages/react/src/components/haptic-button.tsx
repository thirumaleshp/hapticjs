import type { SemanticEffect } from '@feelback/core';
import { useHaptic } from '../hooks/use-haptic';

export interface HapticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Haptic effect to trigger on click */
  effect?: SemanticEffect | string;
  /** HPL pattern string to play on click */
  pattern?: string;
}

/**
 * Button component with built-in haptic feedback.
 *
 * Usage:
 *   <HapticButton effect="tap">Click me</HapticButton>
 *   <HapticButton pattern="~~..##">Custom feel</HapticButton>
 */
export function HapticButton({
  effect = 'tap',
  pattern,
  onClick,
  children,
  ...props
}: HapticButtonProps) {
  const { trigger } = useHaptic(pattern ?? effect);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    await trigger();
    onClick?.(e);
  };

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
