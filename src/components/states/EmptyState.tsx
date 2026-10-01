interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-glass backdrop-blur-md sm:p-8">
      <span aria-hidden="true" className="text-4xl">
        ☁️
      </span>
      <h2 className="mt-3 text-lg font-semibold text-white sm:text-xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-prose text-sm leading-6 text-slate-300">{hint}</p>
    </section>
  );
}
