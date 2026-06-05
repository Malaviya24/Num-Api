import React from 'react';

interface AsciiProgressBarProps {
  progress: number; // 0 to 100
  length?: number;
  label?: string;
}

export function AsciiProgressBar({ progress, length = 20, label }: AsciiProgressBarProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));
  const filledCount = Math.round((safeProgress / 100) * length);
  const emptyCount = length - filledCount;
  
  const filledStr = '|'.repeat(filledCount);
  const emptyStr = '.'.repeat(emptyCount);
  
  return (
    <div className="flex items-center space-x-2 text-primary whitespace-pre">
      {label && <span>{label}</span>}
      <span>[</span>
      <span>{filledStr}{emptyStr}</span>
      <span>]</span>
      <span className="w-12 text-right">{safeProgress}%</span>
    </div>
  );
}
