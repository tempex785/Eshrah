import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";

export function ThemeToggle() {
  // Try to get saved theme or default to dark
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "light" ? false : true;
    }
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className={cn(
        "relative w-[72px] h-[36px] rounded-full transition-colors duration-500 p-1 overflow-hidden",
        isDark ? "bg-slate-700" : "bg-[#fcd34d]" // yellow-300
      )}
      aria-label="Toggle Theme"
      dir="ltr"
    >
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pt-0.5">
        <Sun className={cn(
          "w-[18px] h-[18px] transition-all duration-500",
          isDark ? "text-text-muted opacity-100" : "opacity-0"
        )} />
        <Moon className={cn(
          "w-[18px] h-[18px] transition-all duration-500",
          isDark ? "opacity-0" : "text-amber-100 opacity-100"
        )} />
      </div>

      {/* Thumb/Knob */}
      <div
        className={cn(
          "relative w-[28px] h-[28px] bg-white rounded-full flex items-center justify-center transition-transform duration-500 shadow-md",
          isDark ? "translate-x-[36px]" : "translate-x-0"
        )}
      >
        <div className="relative w-full h-full">
           <Sun 
             className={cn(
               "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[18px] h-[18px] text-amber-500 transition-all duration-500",
               isDark ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"
             )} 
           />
           <Moon 
             className={cn(
               "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-700 transition-all duration-500",
               isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"
             )} 
           />
        </div>
      </div>
    </button>
  );
}
