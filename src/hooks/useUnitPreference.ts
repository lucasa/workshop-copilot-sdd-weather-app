import { useState } from 'react';
import type { Unit } from '../types/weather';

const STORAGE_KEY = 'weather-view-unit';

function getStoredUnit(): Unit {
  try {
    const storedUnit = window.localStorage.getItem(STORAGE_KEY);
    return storedUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
  } catch {
    return 'celsius';
  }
}

export default function useUnitPreference(): [Unit, (unit: Unit) => void] {
  const [unit, setUnit] = useState<Unit>(getStoredUnit);

  function updateUnit(nextUnit: Unit) {
    setUnit(nextUnit);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextUnit);
    } catch {
      return;
    }
  }

  return [unit, updateUnit];
}
