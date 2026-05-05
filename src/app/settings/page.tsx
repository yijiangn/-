"use client";

import { useState } from "react";
import { SectionCard } from "@/components/ui/section-card";
import { 
  SettingsIcon, 
  AlertTriangleIcon, 
  DownloadIcon, 
  UploadIcon, 
  BellIcon, 
  MoonIcon, 
  ImageIcon as PhotoIcon, 
  RefreshIcon 
} from "@/components/ui/icons";
import { usePersistentState, localDataKeys } from "@/lib/local-data";
import { DEFAULT_BG } from "@/components/layout/background-manager";

export default function SettingsPage() {
  const [bg, setBg] = usePersistentState(localDataKeys.background, DEFAULT_BG);
  const [urlInput, setUrlInput] = useState(bg.startsWith("data:") ? "本地上传图片" : bg);

  const updateBackground = (newUrl: string) => {
    try {
      setBg(newUrl);
    } catch (e) {
      alert("图片数据过大，无法存储在本地。请尝试使用较小的图片或使用图片链接。");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小 (浏览器 LocalStorage 限制约 5MB，Base64 会让体积变大 33%)
    if (file.size > 3 * 1024 * 1024) {
      alert("文件超过 3MB，可能导致系统运行卡顿或保存失败。系统将尝试为您压缩。");
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 使用 Canvas 进行高质量压缩
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // 限制最大宽度为 2560px (2K) 以平衡画质和存储体积
        const MAX_WIDTH = 2560;
        if (width > MAX_WIDTH) {
          height = (MAX_WIDTH / width) * height;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        // 使用 JPEG 格式并设置 0.7 质量以极大压缩 Base64 体积
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        updateBackground(compressedBase64);
        setUrlInput("本地上传图片 (已优化)");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">设置</h1>
          <p className="mt-2 text-stone-500 dark:text-stone-400">管理你的偏好设置、系统外观和数据备份</p>
        </div>

        <div className="grid gap-6">
          {/* 系统外观 */}
          <SectionCard title="个性化外观" className="hover:shadow-lg transition-shadow">
            <div className="space-y-6">
               <div>
                  <label className="mb-3 block text-sm font-semibold text-stone-700 dark:text-stone-300">全局背景图</label>
                  <div className="flex flex-col gap-4">
                     {/* 预览图 */}
                     <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-xl dark:border-stone-700 dark:bg-stone-900">
                        <img 
                          key={bg.slice(-20)} // 使用结尾摘要作为 key，避免超长 Base64 导致渲染性能问题
                          src={bg} 
                          alt="Current Background" 
                          className="h-full w-full object-cover animate-in fade-in duration-700"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = DEFAULT_BG;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/15" />
                        <div className="absolute bottom-3 left-3 rounded-lg bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                          当前壁纸预览
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="粘贴图片 URL (支持 https://...)" 
                          className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm transition-all focus:border-sage-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-900/50"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                        />
                        <button 
                          onClick={() => updateBackground(urlInput)}
                          className="rounded-xl bg-sage-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-sage-700 hover:shadow-lg active:scale-95"
                        >
                          应用
                        </button>
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 py-4 text-sm font-medium text-stone-500 transition-all hover:border-sage-400 hover:bg-sage-50/50 hover:text-sage-600 dark:border-stone-700 dark:hover:bg-stone-800">
                           <PhotoIcon className="h-5 w-5" />
                           上传本地图片
                           <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>
                        <button 
                          onClick={() => {
                            updateBackground(DEFAULT_BG);
                            setUrlInput(DEFAULT_BG);
                          }}
                          className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 py-4 text-sm font-medium text-stone-500 transition-all hover:bg-stone-100 hover:text-stone-800 dark:border-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                        >
                           <RefreshIcon className="h-5 w-5" />
                           恢复默认壁纸
                        </button>
                     </div>
                     <p className="text-[10px] text-stone-400">
                       提示：本地上传的图片将存储在您的浏览器中（上限 ~5MB）。建议使用 JPG 格式或通过链接导入。
                     </p>
                  </div>
               </div>
            </div>
          </SectionCard>

          {/* 通用设置 */}
          <SectionCard title="通用设置" className="hover:shadow-lg transition-shadow">
             <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-sage-100 p-2 dark:bg-sage-900/30">
                      <BellIcon className="h-5 w-5 text-sage-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">学习提醒</h3>
                      <p className="text-xs text-stone-400">在预设的时间向你发送任务通知</p>
                    </div>
                 </div>
                 <div className="h-6 w-11 rounded-full bg-sage-600 p-1">
                   <div className="h-4 w-4 translate-x-5 rounded-full bg-white transition-all shadow-sm" />
                 </div>
               </div>

               <div className="flex items-center justify-between border-t border-stone-100 pt-6 dark:border-stone-800">
                 <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-100 p-2 dark:bg-amber-900/30">
                      <MoonIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">专注模式</h3>
                      <p className="text-xs text-stone-400">开启后自动过滤干扰性通知</p>
                    </div>
                 </div>
                 <div className="h-6 w-11 rounded-full bg-stone-200 p-1 dark:bg-stone-700">
                   <div className="h-4 w-4 translate-x-0 rounded-full bg-white transition-all shadow-sm" />
                 </div>
               </div>
             </div>
          </SectionCard>

          {/* 数据与备份 */}
          <SectionCard title="数据与备份" className="hover:shadow-lg transition-shadow">
             <div className="grid gap-4 sm:grid-cols-2">
               <button className="flex flex-col items-center gap-2 rounded-2xl border border-stone-200 p-6 transition-all hover:bg-stone-50 hover:shadow-md dark:border-stone-700 dark:hover:bg-stone-800/50">
                 <DownloadIcon className="h-8 w-8 text-stone-400" />
                 <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">导出备份</span>
                 <p className="text-[10px] text-stone-400">将所有打卡和知识点记录导出为 JSON</p>
               </button>
               
               <button className="flex flex-col items-center gap-2 rounded-2xl border border-stone-200 p-6 transition-all hover:bg-stone-50 hover:shadow-md dark:border-stone-700 dark:hover:bg-stone-800/50">
                 <UploadIcon className="h-8 w-8 text-stone-400" />
                 <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">导入备份</span>
                 <p className="text-[10px] text-stone-400">从本地文件恢复你的学习数据</p>
               </button>
             </div>
          </SectionCard>

          {/* 危险操作 */}
          <SectionCard title="危险区域" className="border-red-100 bg-red-50/20 dark:border-red-900/20 dark:bg-red-900/10">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <AlertTriangleIcon className="h-5 w-5 text-red-500" />
                 <div>
                   <h3 className="text-sm font-semibold text-red-600">重置所有数据</h3>
                   <p className="text-xs text-red-400">清除本地存储的所有任务、知识点和打卡记录（不可撤销）</p>
                 </div>
               </div>
               <button className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 transition shadow-sm hover:bg-red-600 hover:text-white dark:border-red-800 dark:bg-stone-900">
                 立即重置
               </button>
             </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
