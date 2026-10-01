import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-title">
      <h2 id="forecast-title" className="mb-4 text-xl font-bold text-white sm:text-2xl">
        Previsão de 5 dias
      </h2>
      {forecast.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-slate-200">
          Previsão indisponível.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {forecast.map((day, index) => (
            <ForecastCard key={day.date} day={day} index={index} unit={unit} />
          ))}
        </ul>
      )}
    </section>
  );
}
