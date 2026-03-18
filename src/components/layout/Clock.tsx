'use client';

import { useState, useEffect } from 'react';

export function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!time) return null;

  const formattedDate = time.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <div className="hidden md:flex flex-col items-end px-4 border-r border-muted-foreground/20 mr-4">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {formattedDate}
      </span>
      <span className="text-sm font-mono font-bold text-primary tabular-nums">
        {formattedTime}
      </span>
    </div>
  );
}
