interface UnavailableValueProps {
  className?: string;
}

export default function UnavailableValue({ className = '' }: UnavailableValueProps) {
  return (
    <span className={`text-slate-300 ${className}`}>
      <span aria-hidden="true">—</span>
      <span className="sr-only">Indisponível</span>
    </span>
  );
}
