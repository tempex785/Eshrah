import { useState, useEffect } from "react";
import { Users, CreditCard, DollarSign, BarChart2 } from "lucide-react";
import { StatCard } from "./StatCard";
import { RevenueChart } from "./RevenueChart";
import { PopularCourses } from "./PopularCourses";
import { QuickActions } from "./QuickActions";
import { supabase } from "../lib/supabase";

export function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: "0",
    successRate: 0,
    passedExams: 0,
    totalExams: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [{ data: students }, { data: subscriptions }, { data: revenue }, { data: exams }] = await Promise.all([
          supabase.from('students').select('*'),
          supabase.from('subscriptions').select('*'),
          supabase.from('revenue_details').select('*'),
          supabase.from('exams').select('*')
        ]);

        const totalStudents = students?.length || 0;
        const activeStudents = totalStudents; // Status doesn't exist anymore, all profiles are considered active

        const totalSubscriptions = subscriptions?.length || 0;
        const activeSubscriptions = subscriptions?.filter(s => s.status === 'نشط').length || 0;

        const totalExams = exams?.length || 0;
        const passedExams = exams?.filter(e => e.status === 'ناجح' || e.status === 'اجتاز').length || 0;
        const successRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

        let totalRevenue = 0;
        if (revenue) {
          totalRevenue = revenue.reduce((sum, item) => {
            const val = parseFloat(item.net_revenue?.replace(/,/g, '') || '0');
            return sum + val;
          }, 0);
        }

        setStats({
          totalStudents,
          activeStudents,
          totalSubscriptions,
          activeSubscriptions,
          monthlyRevenue: totalRevenue >= 1000 ? (totalRevenue / 1000).toFixed(1) + 'K' : totalRevenue.toString(),
          successRate,
          passedExams,
          totalExams,
        });

      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }

    fetchStats();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="إجمالي الطلاب" 
          value={stats.totalStudents.toString()} 
          subtext={`${stats.activeStudents} نشط`} 
          icon={Users} 
          colorClass="bg-primary-500 shadow-primary-500/20" 
        />
        <StatCard 
          title="الاشتراكات النشطة" 
          value={stats.activeSubscriptions.toString()} 
          subtext={`من ${stats.totalSubscriptions} اشتراك`} 
          icon={CreditCard} 
          colorClass="bg-info-500 shadow-info-500/20" 
        />
        <StatCard 
          title="الإيرادات الشهرية" 
          value={stats.monthlyRevenue} 
          subtext="ريال سعودي" 
          icon={DollarSign} 
          colorClass="bg-success-500 shadow-success-500/20" 
        />
        <StatCard 
          title="معدل النجاح" 
          value={`${stats.successRate}%`} 
          subtext={`${stats.passedExams} ناجح من ${stats.totalExams}`} 
          icon={BarChart2} 
          colorClass="bg-warning-500 shadow-warning-500/20" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-7 xl:col-span-8">
          <RevenueChart />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <PopularCourses />
        </div>
      </div>

      <QuickActions />
    </>
  );
}
