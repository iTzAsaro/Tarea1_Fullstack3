import React from 'react';
import { cn } from '../utils/cn';

type NumberInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="number"
        className={cn(
          'w-16 text-center border border-gray-300 rounded-md py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none',
          className,
        )}
        {...props}
      />
    );
  },
);
