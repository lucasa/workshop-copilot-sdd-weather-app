import type { City } from '../types/weather';

interface CitySuggestionsProps {
  cities: City[];
  onSelect: (city: City) => void;
}

export default function CitySuggestions({ cities, onSelect }: CitySuggestionsProps) {
  return (
    <section
      aria-labelledby="city-suggestions-title"
      className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md"
    >
      <h2 id="city-suggestions-title" className="text-lg font-semibold text-white">
        Selecione uma cidade
      </h2>
      <ul className="mt-3 space-y-2">
        {cities.map((city) => {
          const location = [city.admin1, city.country].filter(Boolean).join(', ');

          return (
            <li key={city.id}>
              <button
                type="button"
                onClick={() => onSelect(city)}
                className="flex min-h-12 w-full min-w-0 flex-col items-start gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-accent-400/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <span className="font-semibold text-white">{city.name}</span>
                {location && (
                  <span className="min-w-0 break-words text-sm text-slate-300">{location}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
