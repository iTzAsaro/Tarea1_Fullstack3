import { CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';

export function SuccessMessage({ visible, text }: { visible: boolean; text: string }) {
  return (
    <div
      className={cn(
        'bg-green-100 text-green-800 px-4 py-2 rounded-md flex items-center space-x-2 text-sm font-medium transition',
        !visible && 'opacity-0 pointer-events-none',
      )}
      aria-hidden={!visible}
    >
      <CheckCircle2 className="w-4 h-4" />
      <span>{text}</span>
    </div>
  );
}

