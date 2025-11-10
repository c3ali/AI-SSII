/**
 * CodeBlock Component
 * Composant pour afficher du code avec copie
 */

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '../primitives/button';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { cn } from '../../utils/cn';

export interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = 'text',
  title,
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const [copiedText, copy] = useCopyToClipboard();
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = async () => {
    const success = await copy(code);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const lines = code.split('\n');

  return (
    <div className={cn('group relative overflow-hidden rounded-lg border bg-muted/30', className)}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>

          <div className="flex items-center gap-2">
            {language && (
              <span className="text-xs text-muted-foreground uppercase">{language}</span>
            )}
          </div>
        </div>
      )}

      {/* Code content */}
      <div className="relative">
        <pre className="overflow-x-auto p-4">
          <code className="font-mono text-sm">
            {showLineNumbers ? (
              <table className="w-full border-collapse">
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index}>
                      <td className="select-none pr-4 text-right text-muted-foreground/50">
                        {index + 1}
                      </td>
                      <td>{line || '\n'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              code
            )}
          </code>
        </pre>

        {/* Copy button */}
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleCopy}
            className="bg-background/80 backdrop-blur-sm"
          >
            {isCopied ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
