import { Minus, Plus } from 'lucide-react';
import { Button } from '../atomos/Button';
import { NumberInput } from '../atomos/NumberInput';

export function StockControl({
  value,
  onDecrement,
  onIncrement,
  onChange,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        type="button"
        variant="danger"
        className="w-8 h-8 rounded-full p-0"
        title="Disminuir stock"
        onClick={onDecrement}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <NumberInput
        min={0}
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <Button
        type="button"
        variant="success"
        className="w-8 h-8 rounded-full p-0"
        title="Aumentar stock"
        onClick={onIncrement}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
