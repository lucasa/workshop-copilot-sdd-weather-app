import { type ReactNode, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import useWeather from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const weather = useWeather();

  let content: ReactNode;

  switch (weather.status) {
    case 'idle':
      content = (
        <EmptyState
          title="Consulte a previsão de uma cidade"
          hint="Pesquise pelo nome de uma cidade para consultar a previsão do tempo."
        />
      );
      break;
    case 'loading':
      content = <LoadingState />;
      break;
    case 'empty':
      content = (
        <EmptyState
          title={`Nenhuma cidade encontrada para “${weather.query}”`}
          hint="Confira o nome e tente novamente."
        />
      );
      break;
    case 'error':
      content = (
        <ErrorState
          message={weather.error ?? 'Ocorreu um erro inesperado. Tente novamente.'}
          onRetry={() => void weather.retry()}
        />
      );
      break;
    case 'success':
      content = weather.data ? (
        <div className="space-y-8">
          <CurrentWeather city={weather.data.city} current={weather.data.current} unit={unit} />
          <ForecastList forecast={weather.data.forecast} unit={unit} />
        </div>
      ) : null;
      break;
  }

  return (
    <div className="min-h-screen min-w-0 text-slate-50">
      <header className="border-b border-white/10 bg-night-900/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="text-2xl text-sun">
              ☀️
            </span>
            <h1 className="text-lg font-bold tracking-normal text-white">WeatherView</h1>
          </div>
          <div className="grid w-full min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] md:max-w-2xl">
            <SearchBar
              onSearch={(query) => void weather.search(query)}
              disabled={weather.status === 'loading'}
            />
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
        {content}
      </main>
    </div>
  );
}
