import React from 'react';

interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function TerminalButton({ children, className = '', ...props }: TerminalButtonProps) {
  return (
    <button
      className={`
        px-2 py-1 
        border border-primary text-primary 
        hover:bg-primary hover:text-black 
        transition-colors duration-100
        focus:outline-none focus:ring-1 focus:ring-primary
        uppercase font-bold
        ${className}
      `}
      {...props}
    >
      [ {children} ]
    </button>
  );
}
