import type { ReactNode } from "react";

export default function AILayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100svh-120px)] min-h-[520px] overflow-hidden px-3 pb-[74px] pt-2 sm:h-[calc(100svh-112px)] sm:px-4 md:h-[calc(100svh-112px)] md:min-h-[620px] md:pb-4 lg:h-[calc(100svh-116px)] lg:px-4 lg:pb-4">
      {children}
    </div>
  );
}
