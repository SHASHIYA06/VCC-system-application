'use client';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'stat' | 'list' | 'table' | 'chart';
  count?: number;
  className?: string;
  height?: string;
}

export function SkeletonLoader({
  variant = 'text',
  count = 1,
  className = '',
  height = 'h-4',
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-800 to-slate-700 rounded';

  switch (variant) {
    case 'text':
      return (
        <div className={`space-y-2 ${className}`}>
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className={`${baseClasses} ${height} w-full ${i === count - 1 ? 'w-4/5' : 'w-full'}`}
            />
          ))}
        </div>
      );

    case 'card':
      return (
        <div className={`space-y-4 p-4 md:p-6 rounded-lg border border-slate-800 ${className}`}>
          {/* Header */}
          <div className="space-y-2">
            <div className={`${baseClasses} h-6 w-1/2`} />
            <div className={`${baseClasses} h-4 w-3/4`} />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div className={`${baseClasses} h-4 w-full`} />
            <div className={`${baseClasses} h-4 w-5/6`} />
            <div className={`${baseClasses} h-4 w-4/5`} />
          </div>

          {/* Footer */}
          <div className="flex gap-2 pt-2">
            <div className={`${baseClasses} h-10 flex-1`} />
            <div className={`${baseClasses} h-10 flex-1`} />
          </div>
        </div>
      );

    case 'stat':
      return (
        <div className={`space-y-4 p-4 rounded-lg border border-slate-800 ${className}`}>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className={`${baseClasses} h-4 w-1/2`} />
              <div className={`${baseClasses} h-8 w-2/3`} />
            </div>
            <div className={`${baseClasses} h-10 w-10 rounded-full`} />
          </div>
          <div className={`${baseClasses} h-6 w-1/3`} />
        </div>
      );

    case 'list':
      return (
        <div className={`space-y-3 ${className}`}>
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 p-3 rounded-lg border border-slate-800"
            >
              <div className={`${baseClasses} h-12 w-12 flex-shrink-0 rounded`} />
              <div className="flex-1 space-y-2 min-w-0">
                <div className={`${baseClasses} h-4 w-3/4`} />
                <div className={`${baseClasses} h-4 w-1/2`} />
              </div>
            </div>
          ))}
        </div>
      );

    case 'table':
      return (
        <div className={`space-y-2 ${className}`}>
          {/* Header */}
          <div className="grid grid-cols-4 gap-2 p-3 border border-slate-800 rounded-lg">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${baseClasses} h-4`} />
            ))}
          </div>

          {/* Rows */}
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 p-3 border border-slate-800 rounded-lg">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className={`${baseClasses} h-4`} />
              ))}
            </div>
          ))}
        </div>
      );

    case 'chart':
      return (
        <div className={`space-y-4 p-4 rounded-lg border border-slate-800 ${className}`}>
          <div className={`${baseClasses} h-4 w-1/3`} />
          <div className="h-64 bg-gradient-to-t from-slate-800 to-slate-700 rounded animate-pulse" />
        </div>
      );

    default:
      return (
        <div className={`${baseClasses} ${height} w-full ${className}`} />
      );
  }
}

export default SkeletonLoader;
