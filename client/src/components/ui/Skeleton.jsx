export default function Skeleton({ className = '', circle = false }) {
  return (
    <div
      className={`animate-pulse bg-neutral-200 ${
        circle ? 'rounded-full' : 'rounded-md'
      } ${className}`}
      aria-hidden="true"
    />
  );
}
