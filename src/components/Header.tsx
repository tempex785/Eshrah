import { Bell, Search, Menu, Check } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

interface HeaderProps {
  activeTab?: string;
  onMenuClick?: () => void;
}

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function Header({ activeTab = "لوحة التحكم", onMenuClick }: HeaderProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (data && !error) {
        setNotifications(data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up realtime subscription
    const channel = supabase
      .channel("admin_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notifications",
        },
        (payload) => {
          setNotifications((prev) => [payload.new as AdminNotification, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("id", id);
      
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Error marking as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;

      await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .in("id", unreadIds);
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking all as read", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`p-2 transition-colors rounded-full relative ${
              isDropdownOpen ? "bg-bg-input text-primary-500" : "bg-bg-card text-text-body hover:text-text-title"
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 text-[10px] flex items-center justify-center font-bold text-white bg-red-500 rounded-full border border-bg-card">
                {unreadCount > 9 ? "+9" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 max-h-[400px] overflow-y-auto bg-bg-card border border-border-strong rounded-2xl shadow-xl z-50 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border-input sticky top-0 bg-bg-card z-10 rounded-t-2xl">
                <h3 className="font-bold text-text-title text-sm">الإشعارات</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-primary-500 hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> تعيين الكل كمقروء
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-text-muted text-sm">
                    لا توجد إشعارات جديدة
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                        className={`p-4 border-b border-border-input hover:bg-bg-input cursor-pointer transition-colors \${
                          !notif.is_read ? 'bg-primary-500/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-sm font-semibold \${!notif.is_read ? 'text-primary-500' : 'text-text-main'}`}>
                            {notif.title}
                          </h4>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5"></span>
                          )}
                        </div>
                        <p className="text-xs text-text-body line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-text-muted mt-2 block">
                          {new Date(notif.created_at).toLocaleString('ar-EG')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
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
