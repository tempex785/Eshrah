import { CreditCard, CheckCircle, Clock, DollarSign, Plus } from "lucide-react";
import { StatCard } from "./StatCard";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const fallbackSubscriptionsData = [
  { 
    id: "1", 
    name: "سارة أحمد العتيبي", 
    initial: "س", 
    course: "دورة تحليل البيانات", 
    plan: "شهري", 
    plan_color: "text-info-500 bg-info-500/10 border-info-500/20", 
    start_date: "2026/3/10", 
    end_date: "2026/4/9", 
    progress: 41, 
    amount: "749 ر.س", 
    status: "نشط", 
    status_color: "text-success-500 bg-success-500/10 border-success-500/20" 
  },
  { 
    id: "2", 
    name: "ديما خالد الهاشمي", 
    initial: "د", 
    course: "دورة تطوير تطبيقات الموبايل", 
    plan: "ربع سنوي", 
    plan_color: "text-warning-500 bg-warning-500/10 border-warning-500/20", 
    start_date: "2026/3/26", 
    end_date: "2026/6/24", 
    progress: 13, 
    amount: "1,499 ر.س", 
    status: "منتهي", 
    status_color: "text-red-500 bg-red-500/10 border-red-500/20" 
  },
  { 
    id: "3", 
    name: "نورة سعيد الحربي", 
    initial: "ن", 
    course: "دورة تطوير تطبيقات الويب", 
    plan: "سنوي", 
    plan_color: "text-primary-500 bg-primary-500/10 border-primary-500/20", 
    start_date: "2026/1/1", 
    end_date: "2027/1/1", 
    progress: 85, 
    amount: "2,999 ر.س", 
    status: "نشط", 
    status_color: "text-success-500 bg-success-500/10 border-success-500/20" 
  }
];

export function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const { data, error } = await supabase.from('subscriptions').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          setSubscriptions(data);
        } else {
          setSubscriptions(fallbackSubscriptionsData);
        }
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        setSubscriptions(fallbackSubscriptionsData);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscriptions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title=""
          value="60"
          subtext="إجمالي الاشتراكات"
          icon={CreditCard}
          colorClass="bg-primary-500 shadow-primary-500/20"
        />
        <StatCard
          title=""
          value="50"
          subtext="اشتراكات نشطة"
          icon={CheckCircle}
          colorClass="bg-success-500 shadow-success-500/20"
        />
        <StatCard
          title=""
          value="20"
          subtext="اشتراكات سنوية"
          icon={Clock}
          colorClass="bg-warning-500 shadow-warning-500/20"
        />
        <StatCard
          title=""
          value="43.2K"
          subtext="إجمالي الإيرادات"
          icon={DollarSign}
          colorClass="bg-info-500 shadow-info-500/20"
        />
      </div>

      {/* Table Section */}
      <div className="bg-bg-card border border-border-card rounded-3xl overflow-hidden">
        {/* Table Header / Actions */}
        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-card bg-bg-hover">
          <h3 className="text-xl font-bold text-text-title">قائمة الاشتراكات</h3>
          <button className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center">
            <Plus className="w-5 h-5" />
            <span>إضافة اشتراك جديد</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-border-card bg-bg-hover">
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الطالب</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الدورة</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body whitespace-nowrap">الخطة</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body whitespace-nowrap">تاريخ البدء</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body whitespace-nowrap">تاريخ الانتهاء</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body w-32">التقدم</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">المبلغ</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divide-card">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-hover-table transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold shrink-0">
                        {sub.initial}
                      </div>
                      <span className="text-text-title font-medium whitespace-nowrap">{sub.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-text-body text-sm max-w-[200px] truncate">{sub.course}</td>
                  <td className="py-4 px-6">
                    <span className={cn("px-3 py-1 text-xs font-medium border rounded-full whitespace-nowrap", sub.plan_color)}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-text-muted text-sm font-mono tracking-tight">{sub.start_date}</td>
                  <td className="py-4 px-6 text-text-muted text-sm font-mono tracking-tight">{sub.end_date}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className="text-text-body text-sm min-w-[32px]">{sub.progress}%</span>
                      <div className="w-full h-2 bg-bg-track rounded-full overflow-hidden flex-1">
                        <div 
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${sub.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-primary-400 font-semibold text-sm whitespace-nowrap">{sub.amount}</td>
                  <td className="py-4 px-6">
                    <span className={cn("px-3 py-1 text-xs font-medium border rounded-full whitespace-nowrap", sub.status_color)}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
