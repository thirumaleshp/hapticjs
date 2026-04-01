import { createContext, useContext, useMemo } from 'react';
import { HapticEngine } from '@vibejs/core';
import type { HapticConfig } from '@vibejs/core';

export interface HapticContextValue {
  engine: HapticEngine;
}

const HapticContext = createContext<HapticContextValue | null>(null);

export interface HapticProviderProps {
  config?: Partial<HapticConfig>;
  engine?: HapticEngine;
  children: React.ReactNode;
}

/**
 * Provides a shared HapticEngine to all child components.
 *
 * Usage:
 *   <HapticProvider config={{ intensity: 0.8 }}>
 *     <App />
 *   </HapticProvider>
 */
export function HapticProvider({ config, engine, children }: HapticProviderProps) {
  const value = useMemo<HapticContextValue>(() => {
    if (engine) return { engine };
    return { engine: HapticEngine.create(config) };
  }, [engine, config]);

  return (
    <HapticContext.Provider value={value}>
      {children}
    </HapticContext.Provider>
  );
}

/** Get the HapticEngine from context, or create a default one */
export function useHapticEngine(): HapticEngine {
  const context = useContext(HapticContext);
  if (context) return context.engine;

  // No provider — return the default singleton
  return HapticEngine.create();
}
