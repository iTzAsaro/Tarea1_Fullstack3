import type React from 'react';
import { cn } from '../utils/cn';

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-1 text-xs font-bold bg-indigo-100 text-indigo-800',
        className,
      )}
      {...props}
    />
  );
}
