export default function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-100 shadow-glass backdrop-blur-md"
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-white/25 border-t-accent-400 motion-reduce:animate-none"
      />
      <span>Carregando dados do tempo…</span>
    </div>
  );
}
