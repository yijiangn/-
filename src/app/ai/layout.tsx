import type { ReactNode } from "react";

export default function AILayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-57px)] lg:h-[calc(100vh-65px)]">
      {children}
    </div>
  );
}
