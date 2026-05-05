"use client";

import { useEffect, useState } from "react";
import { localDataKeys } from "@/lib/local-data";

export const DEFAULT_BG = "https://lh6.googleusercontent.com/proxy/5YUVHiA1x4KXBMvcnQ_fNcsGFQig9vpKgEbH98vc3mIx6963Jawv4WtVMemvIEdCHGpo60iD8t0OfwnHu5wY5InXTyqTPZx4a77T7iIFnHti=w3840-h2160-p-k-no-nd-mv";

export function BackgroundManager() {
  const [bg, setBg] = useState<string>(DEFAULT_BG);

  useEffect(() => {
    const updateBg = () => {
      const stored = localStorage.getItem(localDataKeys.background);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setBg(parsed || DEFAULT_BG);
        } catch {
          setBg(stored || DEFAULT_BG);
        }
      } else {
        setBg(DEFAULT_BG);
      }
    };

    updateBg();
    
    // 监听其他窗口/标签页的修改
    window.addEventListener("storage", (e) => {
      if (e.key === localDataKeys.background) updateBg();
    });

    // 监听当前窗口通过事件调用的修改
    window.addEventListener(`${localDataKeys.background}-updated`, updateBg);

    return () => {
      window.removeEventListener("storage", updateBg);
      window.removeEventListener(`${localDataKeys.background}-updated`, updateBg);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      <img 
        key={bg} // 强制切换时重置图片元素以触发过渡
        src={bg} 
        alt="Background" 
        className="h-full w-full object-cover animate-in fade-in duration-700"
        onError={(e) => {
          (e.target as HTMLImageElement).src = DEFAULT_BG;
        }}
      />
      <div className="absolute inset-0 bg-stone-900/35 dark:bg-black/55" />
    </div>
  );
}
