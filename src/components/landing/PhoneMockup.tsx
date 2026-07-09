import type { ReactNode } from "react";

export function PhoneMockup({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative mx-auto w-[260px] rounded-[2.6rem] border border-white/10 bg-surface p-2 shadow-card">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/70" />
        <div className="relative h-[540px] w-full overflow-hidden rounded-[2.1rem] bg-background">
          {children}
        </div>
      </div>
      {label ? (
        <p className="mt-4 text-center text-sm text-muted-foreground">{label}</p>
      ) : null}
    </div>
  );
}
