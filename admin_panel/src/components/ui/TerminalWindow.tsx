import React from 'react';

interface TerminalWindowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}

export function TerminalWindow({ title, children, className = '', scrollable = false }: TerminalWindowProps) {
  const dashCount = Math.max(10, 40 - title.length);
  const titleBar = `+-${'-'.repeat(dashCount / 2)} ${title.toUpperCase()} ${'-'.repeat(dashCount / 2)}-+`;

  return (
    <div className={`border border-primary p-2 flex flex-col bg-background/90 ${className}`}>
      <div className="text-primary font-bold mb-2 break-all text-xs sm:text-sm">
        {titleBar}
      </div>
      <div className={`flex-1 ${scrollable ? 'overflow-y-auto max-h-[350px] custom-scrollbar pr-2' : ''}`}>
        {children}
      </div>
    </div>
  );
}
