import { type KeyboardEvent, useRef } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const celsiusButtonRef = useRef<HTMLButtonElement>(null);
  const fahrenheitButtonRef = useRef<HTMLButtonElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentUnit: Unit) {
    let nextUnit: Unit | undefined;

    if (event.key === 'ArrowRight') {
      nextUnit = currentUnit === 'celsius' ? 'fahrenheit' : 'celsius';
    } else if (event.key === 'ArrowLeft') {
      nextUnit = currentUnit === 'fahrenheit' ? 'celsius' : 'fahrenheit';
    } else if (event.key === 'Home') {
      nextUnit = 'celsius';
    } else if (event.key === 'End') {
      nextUnit = 'fahrenheit';
    }

    if (!nextUnit) return;

    event.preventDefault();
    onChange(nextUnit);

    if (nextUnit === 'celsius') {
      celsiusButtonRef.current?.focus();
    } else {
      fahrenheitButtonRef.current?.focus();
    }
  }

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-grid w-full grid-cols-2 gap-1 rounded-xl border border-white/15 bg-white/5 p-1 shadow-glass backdrop-blur-md sm:w-auto"
    >
      <button
        ref={celsiusButtonRef}
        type="button"
        aria-label="Celsius"
        aria-pressed={unit === 'celsius'}
        tabIndex={unit === 'celsius' ? 0 : -1}
        onClick={() => onChange('celsius')}
        onKeyDown={(event) => handleKeyDown(event, 'celsius')}
        className={`min-h-11 min-w-16 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 ${
          unit === 'celsius'
            ? 'bg-accent-400 text-night-900 shadow-sm hover:bg-accent-400'
            : 'text-slate-200 hover:bg-white/10 hover:text-white'
        }`}
      >
        °C
      </button>
      <button
        ref={fahrenheitButtonRef}
        type="button"
        aria-label="Fahrenheit"
        aria-pressed={unit === 'fahrenheit'}
        tabIndex={unit === 'fahrenheit' ? 0 : -1}
        onClick={() => onChange('fahrenheit')}
        onKeyDown={(event) => handleKeyDown(event, 'fahrenheit')}
        className={`min-h-11 min-w-16 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 ${
          unit === 'fahrenheit'
            ? 'bg-accent-400 text-night-900 shadow-sm hover:bg-accent-400'
            : 'text-slate-200 hover:bg-white/10 hover:text-white'
        }`}
      >
        °F
      </button>
    </div>
  );
}
