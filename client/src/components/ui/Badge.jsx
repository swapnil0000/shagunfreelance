const colorMap = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-neutral-100 text-neutral-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  default: 'bg-neutral-100 text-neutral-700',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        colorMap[variant] || colorMap.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
