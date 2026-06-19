import {
  LayoutDashboard,
  Users,
  BookOpen,
  Book,
  GraduationCap,
  CreditCard,
  FileText,
  Award,
  DollarSign,
  Settings,
  BookMarked,
  LogOut,
  X,
  Trophy,
  Bell
} from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", active: true },
  { icon: Users, label: "الطلاب" },
  { icon: Bell, label: "التنبيهات" },
  { icon: BookOpen, label: "الدورات" },
  { icon: BookMarked, label: "محتوى الدورات" },
  { icon: Book, label: "الدورات المجانية" },
  { icon: GraduationCap, label: "المراحل الدراسية" },
  { icon: CreditCard, label: "الاشتراكات" },
  { icon: FileText, label: "الامتحانات" },
  { icon: FileText, label: "الواجبات" },
  { icon: Award, label: "الشهادات" },
  { icon: Trophy, label: "أوائل الشهر" },
  { icon: DollarSign, label: "الإيرادات" },
  { icon: Settings, label: "الإعدادات" },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed md:static inset-y-0 right-0 z-50 w-64 bg-bg-sidebar border-l border-border-card flex flex-col h-full overflow-y-auto transition-transform duration-300 ease-in-out md:translate-x-0 outline-none",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-500 shrink-0">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-title leading-tight">إشرحــ طب</h1>
              <p className="text-xs text-text-muted">نظام إدارة التعليم</p>
            </div>
          </div>
          <button 
            className="md:hidden text-text-muted hover:text-text-title p-2 rounded-lg bg-bg-card"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item, index) => {
          const isActive = activeTab === item.label;
          return (
            <button
              key={index}
              onClick={() => setActiveTab(item.label)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                isActive 
                  ? "bg-primary-500/10 text-primary-500 font-semibold" 
                  : "text-text-muted hover:text-text-title hover:bg-bg-hover"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary-500" : "text-text-muted")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-card">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-red-500 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
    </>
  );
}
