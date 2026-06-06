'use client';

import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { ReactNode } from 'react';

interface ErrorCardProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  severity?: 'error' | 'warning' | 'info';
  icon?: ReactNode;
  className?: string;
}

export function ErrorCard({
  title = 'Error',
  message,
  details,
  onRetry,
  onDismiss,
  severity = 'error',
  icon,
  className = '',
}: ErrorCardProps) {
  const bgColor = {
    error: 'bg-red-500/10 border-red-500/30',
    warning: 'bg-amber-500/10 border-amber-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
  }[severity];

  const textColor = {
    error: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
  }[severity];

  const accentColor = {
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  }[severity];

  return (
    <div className={`relative rounded-lg border ${bgColor} p-4 md:p-6 backdrop-blur-sm ${className}`}>
      <div className="flex gap-4">
        <div className={`flex-shrink-0 flex-col flex items-center justify-start pt-0.5`}>
          {icon || <AlertTriangle className={`h-5 w-5 md:h-6 md:w-6 ${accentColor}`} />}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm md:text-base ${textColor}`}>
            {title}
          </h3>
          <p className="text-slate-300 text-xs md:text-sm mt-1 leading-relaxed">
            {message}
          </p>
          {details && (
            <details className="mt-2 text-xs text-slate-400 cursor-pointer group">
              <summary className="hover:text-slate-300 transition-colors">View details</summary>
              <pre className="mt-2 p-2 bg-slate-950/50 rounded text-[10px] md:text-xs overflow-x-auto max-h-40 border border-slate-800 group-open:border-slate-700">
                {details}
              </pre>
            </details>
          )}
        </div>

        {(onDismiss || onRetry) && (
          <div className="flex-shrink-0 flex items-start gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`p-1.5 md:p-2 rounded-lg hover:bg-slate-900/60 transition-colors group ${accentColor}`}
                title="Retry"
                aria-label="Retry"
              >
                <RefreshCw className="h-4 w-4 md:h-5 md:w-5 group-hover:animate-spin" />
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1.5 md:p-2 rounded-lg hover:bg-slate-900/60 transition-colors text-slate-400 hover:text-slate-300"
                title="Dismiss"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ErrorCard;
