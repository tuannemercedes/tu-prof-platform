export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-serif font-semibold tracking-wide whitespace-nowrap ${className}`}>
      <span className="logo-tu">TU</span> <span className="logo-prof">PROF</span>
    </span>
  );
}
