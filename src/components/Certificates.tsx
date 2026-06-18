import { ShieldCheck, Sparkles, Award, XCircle } from "lucide-react";
import { StatCard } from "./StatCard";
import { cn } from "../lib/utils";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const fallbackCertificatesData = [
  {
    id: "1",
    student: "أحمد محمد علي",
    course: "دورة البرمجة للمبتدئين",
    date: "2026/4/3",
    grade: "ممتاز",
    grade_color: "text-success-500 bg-success-500/10",
    active: true,
  },
  {
    id: "2",
    student: "فاطمة حسن إبراهيم",
    course: "دورة التصوير الفوتوغرافي",
    date: "2026/6/11",
    grade: "جيد جداً",
    grade_color: "text-warning-500 bg-warning-500/10",
    active: false,
  },
  {
    id: "3",
    student: "محمد عبدالله السيد",
    course: "دورة إدارة المشاريع",
    date: "2026/4/2",
    grade: "جيد",
    grade_color: "text-info-500 bg-info-500/10",
    active: false,
  }
];

export function Certificates() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, excellent: 0, verifyRate: "100%" });

  useEffect(() => {
    async function fetchCertificates() {
      try {
        const { data, error } = await supabase.from('certificates').select('*');
        if (error) throw error;
        if (data) {
          setCertificates(data);
          
          setStats({
            total: data.length,
            excellent: data.filter(c => c.grade === 'ممتاز').length,
            verifyRate: "100%" // Hardcoded or calculated later
          });
        }
      } catch (err) {
        console.error("Error fetching certificates:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCertificates();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const { error } = await supabase.from('certificates').delete().eq('id', id);
      if (error) throw error;
      const { data } = await supabase.from('certificates').select('*');
      if (data) {
         setCertificates(data);
         const total = data.length;
         const highlyRated = data.filter(c => ['امتياز', 'ممتاز', 'جيد جداً', 'A+', 'A'].includes(c.grade)).length;
         setStats((prev) => ({ ...prev, total, excellent: highlyRated }));
      }

    } catch (err: any) {
      console.error("Error deleting certificate:", err);

    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title=""
          value={stats.total.toString()}
          subtext="شهادات صادرة"
          icon={Award}
          colorClass="bg-primary-500 shadow-primary-500/20"
        />
        <StatCard
          title=""
          value={stats.excellent.toString()}
          subtext="تقدير ممتاز"
          icon={Sparkles}
          colorClass="bg-warning-500 shadow-warning-500/20"
        />
        <StatCard
          title=""
          value={stats.verifyRate}
          subtext="معدل التحقق"
          icon={ShieldCheck}
          colorClass="bg-success-500 shadow-success-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Right side: List */}
        <div className="lg:col-span-7 bg-bg-card border border-border-card rounded-3xl p-6 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text-title">الشهادات الصادرة</h3>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors text-sm">
              إصدار شهادة جديدة
            </button>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1">
             {certificates.map((cert) => (
               <div 
                 key={cert.id} 
                 className={cn(
                   "flex flex-row items-center justify-between p-5 transition-colors rounded-2xl border cursor-pointer",
                   cert.active 
                     ? "bg-bg-hover border-border-card border-r-[4px] border-r-primary-500" 
                     : "bg-bg-hover hover:bg-bg-hover border-border-card"
                 )}
               >
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-warning-500 flex items-center justify-center shrink-0 shadow-lg shadow-warning-500/20">
                      <Award className="w-7 h-7 text-text-title" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between mb-1">
                          <h4 className="text-text-title font-semibold text-lg whitespace-nowrap overflow-hidden text-ellipsis mr-2">{cert.student}</h4>
                          <button 
                            onClick={(e) => handleDelete(cert.id, e)}
                            className="text-text-muted hover:text-error-500 transition-colors p-1"
                            title="حذف الشهادة"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                      </div>
                      <p className="text-text-muted text-sm mt-1">{cert.course}</p>
                      <p className="text-text-muted text-xs mt-1 font-mono">{cert.date}</p>
                    </div>
                 </div>
                 
                 <div>
                   <span className={cn("px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap", cert.grade_color)}>
                     {cert.grade}
                   </span>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Left side: Preview */}
        <div className="lg:col-span-5 bg-bg-card border border-border-card rounded-3xl p-6 flex flex-col min-h-[500px]">
           <h3 className="text-xl font-bold text-text-title mb-6">معاينة الشهادة</h3>
           <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border-card rounded-3xl bg-bg-hover">
              <div className="w-24 h-24 rounded-full bg-bg-track flex items-center justify-center mb-6">
                 <ShieldCheck className="w-12 h-12 text-text-muted" />
              </div>
              <p className="text-text-muted text-lg font-medium">اختر شهادة لمعاينتها</p>
           </div>
        </div>
      </div>
    </div>
  );
}
