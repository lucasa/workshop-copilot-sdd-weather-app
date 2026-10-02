import { type FormEvent, useId, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [validationError, setValidationError] = useState('');
  const inputId = useId();
  const validationErrorId = useId();
  const trimmedCity = city.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) return;
    if (!trimmedCity) {
      setValidationError('Digite o nome de uma cidade para iniciar a busca.');
      return;
    }

    setValidationError('');
    onSearch(trimmedCity);
  }

  return (
    <form
      role="search"
      aria-label="Buscar cidade"
      onSubmit={handleSubmit}
      className="w-full max-w-md"
    >
      <div className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/5 p-2 shadow-glass backdrop-blur-md ring-1 ring-white/10 transition-all duration-200 focus-within:border-accent-400/80 focus-within:ring-2 focus-within:ring-accent-400/40 sm:flex-row sm:items-center">
        <label htmlFor={inputId} className="sr-only">
          Nome da cidade
        </label>
        <input
          id={inputId}
          type="search"
          value={city}
          placeholder="Buscar cidade"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={Boolean(validationError)}
          aria-describedby={validationError ? validationErrorId : undefined}
          onChange={(event) => {
            setCity(event.target.value);
            if (validationError) setValidationError('');
          }}
          disabled={disabled}
          className="w-full min-w-0 rounded-xl border border-transparent bg-transparent px-3 py-2.5 text-base text-slate-50 placeholder:text-slate-300/70 outline-none transition focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled}
          className="w-full rounded-xl bg-accent-400 px-4 py-2.5 text-sm font-semibold text-night-900 shadow-sm transition enabled:hover:bg-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300 disabled:opacity-70 sm:w-auto"
        >
          Buscar
        </button>
      </div>
      {validationError && (
        <p id={validationErrorId} className="mt-2 text-sm text-rose-200" role="alert">
          {validationError}
        </p>
      )}
    </form>
  );
}
