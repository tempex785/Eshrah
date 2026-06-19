import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { Students } from "./components/Students";
import { Courses } from "./components/Courses";
import { CourseContents } from "./components/CourseContents";
import { FreeCourses } from "./components/FreeCourses";
import { StudyLevels } from "./components/StudyLevels";
import { Subscriptions } from "./components/Subscriptions";
import { Exams } from "./components/Exams";
import { Homeworks } from "./components/Homeworks";
import { Certificates } from "./components/Certificates";
import { TopStudents } from "./components/TopStudents";
import { Revenue } from "./components/Revenue";
import { Settings } from "./components/Settings";
import { Login } from "./components/Login";
import Alerts from "./components/Alerts";
import { Loader2 } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("لوحة التحكم");
  const [session, setSession] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email) {
        // verify admin
        const { data: adminData, error } = await supabase
          .from('admins')
          .select('*')
          .eq('email', session.user.email)
          .single();
          
        if (error || !adminData) {
          await supabase.auth.signOut();
          setSession(null);
        } else {
          setSession(session);
        }
      } else {
        setSession(session);
      }
      
      setIsInitializing(false);
    }
    
    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === 'SIGNED_IN' && session?.user?.email) {
        const { data: adminData, error } = await supabase
          .from('admins')
          .select('*')
          .eq('email', session.user.email)
          .single();
          
        if (error || !adminData) {
          await supabase.auth.signOut();
          setSession(null);
          return;
        }
      }
      
      if (_event === 'SIGNED_OUT') {
         setSession(null);
      } else if (session) {
         setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }} 
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />
      
      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 pb-24">
          <Header activeTab={activeTab} onMenuClick={() => setIsMobileMenuOpen(true)} />
          
          {activeTab === "لوحة التحكم" && <Dashboard />}
          {activeTab === "الطلاب" && <Students />}
          {activeTab === "التنبيهات" && <Alerts />}
          {activeTab === "الدورات" && <Courses />}
          {activeTab === "محتوى الدورات" && <CourseContents />}
          {activeTab === "الدورات المجانية" && <FreeCourses />}
          {activeTab === "المراحل الدراسية" && <StudyLevels />}
          {activeTab === "الاشتراكات" && <Subscriptions />}
          {activeTab === "الامتحانات" && <Exams />}
          {activeTab === "الواجبات" && <Homeworks />}
          {activeTab === "الشهادات" && <Certificates />}
          {activeTab === "أوائل الشهر" && <TopStudents />}
          {activeTab === "الإيرادات" && <Revenue />}
          {activeTab === "الإعدادات" && <Settings />}
        </div>
      </main>
    </div>
  );
}
