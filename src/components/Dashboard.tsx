import { Users, CreditCard, DollarSign, BarChart2 } from "lucide-react";
import { StatCard } from "./StatCard";
import { RevenueChart } from "./RevenueChart";
import { PopularCourses } from "./PopularCourses";
import { QuickActions } from "./QuickActions";

export function Dashboard() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="إجمالي الطلاب" 
          value="40" 
          subtext="35 نشط" 
          icon={Users} 
          colorClass="bg-primary-500 shadow-primary-500/20" 
        />
        <StatCard 
          title="الاشتراكات النشطة" 
          value="50" 
          subtext="من 60 اشتراك" 
          icon={CreditCard} 
          colorClass="bg-info-500 shadow-info-500/20" 
        />
        <StatCard 
          title="الإيرادات الشهرية" 
          value="43.2K" 
          subtext="ريال سعودي" 
          icon={DollarSign} 
          colorClass="bg-success-500 shadow-success-500/20" 
        />
        <StatCard 
          title="معدل النجاح" 
          value="73%" 
          subtext="10 ناجح من 15" 
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
