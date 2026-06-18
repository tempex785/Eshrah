import { Bell, Search, Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  activeTab?: string;
  onMenuClick?: () => void;
}

export function Header({ activeTab = "لوحة التحكم", onMenuClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mt-2 mb-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 bg-bg-card rounded-xl text-text-body hover:bg-bg-hover transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-title mb-1">{activeTab}</h2>
          <p className="text-xs sm:text-sm text-text-muted hidden sm:block">مرحباً بك في نظام إدارة إشرحــ طب</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <ThemeToggle />
        
        <button className="relative p-2 text-text-body hover:text-text-title transition-colors bg-bg-card rounded-full">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-bg-card"></span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-text-title">مدير النظام</p>
            <p className="text-xs text-text-muted">admin@academy.com</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-lg cursor-pointer">
            م
          </div>
        </div>
      </div>
    </header>
  );
}
