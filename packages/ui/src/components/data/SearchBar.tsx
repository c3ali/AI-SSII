/**
 * SearchBar Component
 * Barre de recherche avec filtres optionnels
 */

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../primitives/input';
import { Button } from '../primitives/button';
import { cn } from '../../utils/cn';
import { useDebounce } from '../../hooks/useDebounce';

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchBar({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = 'Rechercher...',
  debounceMs = 300,
  className,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = React.useState(controlledValue || '');
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const debouncedValue = useDebounce(value, debounceMs);

  React.useEffect(() => {
    if (onSearch && debouncedValue !== undefined) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleClear = () => {
    if (controlledValue === undefined) {
      setInternalValue('');
    }
    onChange?.('');
    onSearch?.('');
  };

  return (
    <div className={cn('relative flex items-center', className)}>
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          value ? (
            <button
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : undefined
        }
        className="pr-10"
      />
    </div>
  );
}
