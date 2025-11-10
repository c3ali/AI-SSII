/**
 * Terminal Component
 * Composant terminal pour afficher des logs/output
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X } from 'lucide-react';
import { Button } from '../primitives/button';
import { cn } from '../../utils/cn';

export interface TerminalLine {
  id?: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  content: string;
  timestamp?: Date;
}

export interface TerminalProps {
  lines: TerminalLine[];
  title?: string;
  height?: string;
  className?: string;
  onClear?: () => void;
  autoScroll?: boolean;
}

export function Terminal({
  lines,
  title = 'Terminal',
  height = '400px',
  className,
  onClear,
  autoScroll = true,
}: TerminalProps) {
  const terminalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines, autoScroll]);

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      case 'success':
        return 'text-green-400';
      case 'info':
        return 'text-cyan-400';
      default:
        return 'text-gray-300';
    }
  };

  const getLinePrefix = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input':
        return '$ ';
      case 'error':
        return '[ERROR] ';
      case 'success':
        return '[SUCCESS] ';
      case 'info':
        return '[INFO] ';
      default:
        return '';
    }
  };

  return (
    <div className={cn('overflow-hidden rounded-lg border bg-gray-900', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">{title}</span>
          </div>
        </div>

        {onClear && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClear}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        className="overflow-y-auto p-4 font-mono text-sm"
        style={{ height }}
      >
        <AnimatePresence mode="popLayout">
          {lines.map((line, index) => (
            <motion.div
              key={line.id || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className={cn('py-0.5', getLineColor(line.type))}
            >
              <span className="select-none opacity-60">{getLinePrefix(line.type)}</span>
              <span>{line.content}</span>
              {line.timestamp && (
                <span className="ml-2 text-xs opacity-50">
                  {line.timestamp.toLocaleTimeString()}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {lines.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-600">
            Terminal vide
          </div>
        )}
      </div>
    </div>
  );
}
