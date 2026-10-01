import { getDayLabel, getShortDate } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherInfo } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';
import UnavailableValue from './states/UnavailableValue';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const dayLabel = getDayLabel(day.date, index);
  const weather = getWeatherInfo(day.weatherCode);
  const precipitation = day.precipitationProbabilityPercent;
  const hasPrecipitation = precipitation !== undefined && Number.isFinite(precipitation);

  return (
    <li className="flex min-w-0 flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-md sm:p-4">
      <h3 className="max-w-full break-words text-sm font-semibold text-white sm:text-base">
        {dayLabel}
      </h3>
      <time dateTime={day.date} className="text-xs text-slate-300">
        {getShortDate(day.date)}
      </time>
      <span role="img" aria-label={weather.label} className="text-3xl sm:text-4xl">
        {weather.icon}
      </span>
      <span className="max-w-full text-xs text-slate-200 sm:text-sm">{weather.label}</span>
      <dl className="grid w-full grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-slate-300">Máx.</dt>
          <dd className="mt-0.5 break-words font-semibold text-white">
            {formatTemperature(day.maximumC, unit)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-300">Mín.</dt>
          <dd className="mt-0.5 break-words text-slate-200">
            {formatTemperature(day.minimumC, unit)}
          </dd>
        </div>
      </dl>
      <p className="mt-auto flex min-h-6 items-center gap-1 text-xs text-slate-200 sm:text-sm">
        <span aria-hidden="true">💧</span>
        <span>Chuva:</span>
        {hasPrecipitation ? (
          <span className="font-semibold">{precipitation}%</span>
        ) : (
          <UnavailableValue />
        )}
      </p>
    </li>
  );
}
