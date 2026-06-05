import React from 'react';

interface TerminalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prompt?: string;
}

export function TerminalInput({ prompt = "user@sys:~$", className = '', ...props }: TerminalInputProps) {
  return (
    <div className={`flex items-center space-x-2 text-primary ${className}`}>
      <span className="shrink-0">{prompt}</span>
      <input
        className="flex-1 bg-transparent border-none outline-none text-primary placeholder-muted"
        {...props}
      />
      <span className="animate-blink font-bold">_</span>
    </div>
  );
}
