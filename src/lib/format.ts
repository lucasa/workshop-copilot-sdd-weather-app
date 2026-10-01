function parseDate(date: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;

  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    return undefined;
  }

  return parsed;
}

export function getDayLabel(date: string, index: number): string {
  const parsed = parseDate(date);
  if (!parsed) return 'Data indisponível';
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(parsed);
}

export function getShortDate(date: string): string {
  const parsed = parseDate(date);
  if (!parsed) return 'Data indisponível';

  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(parsed);
}
