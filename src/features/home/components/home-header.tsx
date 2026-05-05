import Link from "next/link";
import { BellIcon, SearchIcon } from "@/components/ui/icons";

export function HomeHeader() {
  return (
    <header className="flex flex-col gap-4 lg:flex-row items-center justify-between pb-2">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-stone-800 xl:text-4xl">
          Good Morning, Alex
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <Link 
          href="/search"
          className="group flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-sm font-medium text-stone-500 shadow-sm backdrop-blur transition hover:bg-white w-[250px]"
        >
          <SearchIcon className="h-4 w-4 text-stone-400 group-hover:text-sage-600 transition" />
          <span className="flex-1 text-left">Search...</span>
        </Link>
        <button className="relative rounded-full p-2 text-stone-500 hover:bg-white/50 transition">
          <BellIcon className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-400 border border-white"></span>
        </button>
        <button className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm ring-1 ring-stone-900/5">
          {/* Using a placeholder for user image */}
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=E6EFE6" alt="User" className="h-full w-full object-cover" />
        </button>
      </div>
    </header>
  );
}
