const SRC = '/images/Career%20Bridge%20Studio%20Logo.png';

export default function BrandLogo({ className = 'h-10 w-auto' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={SRC} alt="Career Bridge Studio" className={`object-contain ${className}`} />
  );
}
