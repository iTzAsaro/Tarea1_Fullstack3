import React from 'react';
import { cn } from '../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gray-900 hover:bg-gray-800 text-white',
  secondary: 'bg-indigo-700 hover:bg-indigo-800 text-white',
  ghost: 'hover:bg-indigo-700 text-white',
  danger: 'bg-red-100 hover:bg-red-200 text-red-700',
  success: 'bg-green-100 hover:bg-green-200 text-green-700'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition font-medium disabled:opacity-60 disabled:cursor-not-allowed',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
});
