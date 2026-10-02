import { formatTemperature } from '../lib/temperature';
import { getWeatherInfo } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';
import UnavailableValue from './states/UnavailableValue';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData | undefined;
  unit: Unit;
}

interface MetricProps {
  icon: string;
  label: string;
  value: number | undefined;
  suffix: string;
  fractionDigits?: number;
}

function Metric({ icon, label, value, suffix, fractionDigits = 0 }: MetricProps) {
  const formattedValue =
    value !== undefined && Number.isFinite(value)
      ? `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: fractionDigits }).format(value)} ${suffix}`
      : undefined;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-md sm:px-4">
      <span aria-hidden="true" className="text-xl">
        {icon}
      </span>
      <dl className="min-w-0">
        <dt className="text-xs text-slate-300">{label}</dt>
        <dd className="mt-0.5 break-words font-semibold text-white">
          {formattedValue ?? <UnavailableValue />}
        </dd>
      </dl>
    </div>
  );
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const weather = getWeatherInfo(current?.weatherCode);
  const location = [city.admin1, city.country].filter(Boolean).join(', ');

  return (
    <section
      aria-labelledby="current-weather-title"
      className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:p-6 lg:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] lg:items-center lg:gap-10">
        <div className="min-w-0">
          <h2 id="current-weather-title" className="break-words text-2xl font-bold sm:text-3xl">
            {city.name}
          </h2>
          {location && <p className="mt-1 text-sm text-slate-300">{location}</p>}

          <div className="mt-6 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <span role="img" aria-label={weather.label} className="text-5xl sm:text-6xl">
              {weather.icon}
            </span>
            <p className="min-w-0 break-words text-5xl font-light tabular-nums text-white sm:text-6xl lg:text-7xl">
              {formatTemperature(current?.temperatureC, unit)}
            </p>
          </div>
          <p className="mt-3 text-base text-slate-200">{weather.label}</p>
          <p className="mt-1 text-sm text-slate-300">
            Sensação térmica de {formatTemperature(current?.apparentTemperatureC, unit)}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-2 sm:gap-3">
          <Metric icon="💧" label="Umidade" value={current?.relativeHumidityPercent} suffix="%" />
          <Metric
            icon="💨"
            label="Vento"
            value={current?.windSpeedKmh}
            suffix="km/h"
            fractionDigits={1}
          />
          <Metric
            icon="🌧️"
            label="Precipitação"
            value={current?.precipitationMm}
            suffix="mm"
            fractionDigits={1}
          />
          <Metric icon="◉" label="Pressão" value={current?.pressureHpa} suffix="hPa" />
        </dl>
      </div>
    </section>
  );
}
