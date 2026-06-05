import React from 'react';

interface TerminalWindowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function TerminalWindow({ title, children, className = '' }: TerminalWindowProps) {
  const dashCount = Math.max(10, 40 - title.length);
  const titleBar = `+-${'-'.repeat(dashCount / 2)} ${title.toUpperCase()} ${'-'.repeat(dashCount / 2)}-+`;

  return (
    <div className={`border border-primary p-2 flex flex-col bg-background/90 ${className}`}>
      <div className="text-primary font-bold mb-2 break-all text-xs sm:text-sm">
        {titleBar}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
