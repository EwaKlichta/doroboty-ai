export function BrandMark({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`selected-brand-mark ${className}`} />;
}
