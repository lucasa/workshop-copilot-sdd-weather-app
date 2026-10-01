interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="rounded-2xl border border-rose-300/30 bg-rose-950/30 p-5 text-rose-50 shadow-glass backdrop-blur-md"
    >
      <h2 className="text-lg font-semibold">Não foi possível carregar o clima</h2>
      <p className="mt-2 text-sm text-rose-100">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 min-h-11 rounded-xl border border-rose-100/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-100/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Tentar novamente
      </button>
    </section>
  );
}
