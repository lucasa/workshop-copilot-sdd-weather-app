import type { Unit } from '../types/weather';

export function convertTemperature(celsius: number, unit: Unit): number {
  return unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
}

export function formatTemperature(celsius: number | undefined, unit: Unit): string {
  if (celsius === undefined || !Number.isFinite(celsius)) return 'Indisponível';

  const value = Math.round(convertTemperature(celsius, unit));
  return `${value} ${unitLabel(unit)}`;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}
