import { DollarSign, CreditCard, RefreshCcw, UserPlus } from "lucide-react";
import { StatCard } from "./StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const newStudentsData = [
  { name: "يونيو", value: 11 },
  { name: "مايو", value: 11 },
  { name: "أبريل", value: 7 },
  { name: "مارس", value: 14 },
  { name: "فبراير", value: 11 },
  { name: "يناير", value: 19 },
].reverse();

const monthlyRevenueData = [
  { name: "يونيو", value: 24700, label: "24.7K" },
  { name: "مايو", value: 16200, label: "16.2K" },
  { name: "أبريل", value: 16600, label: "16.6K" },
  { name: "مارس", value: 21300, label: "21.3K" },
  { name: "فبراير", value: 19500, label: "19.5K" },
  { name: "يناير", value: 22100, label: "22.1K" },
].reverse();

const fallbackRevenueDetailsData = [
  {
    month: "يناير",
    year: "2024",
    subscriptions: "23,124",
    refunds: "-1,013",
    net_revenue: "22,111",
    new_students: 19,
  },
  {
    month: "فبراير",
    year: "2024",
    subscriptions: "20,102",
    refunds: "-594",
    net_revenue: "19,508",
    new_students: 11,
  },
  {
    month: "مارس",
    year: "2024",
    subscriptions: "22,008",
    refunds: "-716",
    net_revenue: "21,292",
    new_students: 14,
  },
];

export function Revenue() {
  const [revenueDetails, setRevenueDetails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: "0", activeSubscriptions: 0, refunds: "0", newStudents: 0 });
  const [chartData, setChartData] = useState({ newStudents: newStudentsData, monthlyRevenue: monthlyRevenueData });

  useEffect(() => {
    async function fetchRevenueDetails() {
      try {
        const [{ data: revenueData, error: revenueError }, { data: subsData }] = await Promise.all([
          supabase.from('revenue_details').select('*').order('id', { ascending: false }),
          supabase.from('subscriptions').select('status')
        ]);
        
        if (revenueError) throw revenueError;
        if (revenueData) {
          setRevenueDetails(revenueData);
          
          let totalRevenue = 0;
          let totalRefunds = 0;
          let totalNewStudents = 0;
          
          const dynamicNewStudentsData = [];
           const dynamicMonthlyRevenueData = [];
          
          revenueData.forEach(item => {
             const revValue = parseFloat(item.net_revenue?.replace(/,/g, '') || '0');
             const refundValue = Math.abs(parseFloat(item.refunds?.replace(/,/g, '') || '0'));
             
             totalRevenue += revValue;
             totalRefunds += refundValue;
             totalNewStudents += item.new_students || 0;
             
             dynamicNewStudentsData.push({ name: item.month, value: item.new_students });
             dynamicMonthlyRevenueData.push({ 
                name: item.month, 
                value: revValue, 
                label: revValue >= 1000 ? (revValue / 1000).toFixed(1) + 'K' : revValue.toString() 
             });
          });
          
          if (dynamicNewStudentsData.length > 0) {
             setChartData({
               newStudents: dynamicNewStudentsData.slice(0, 6).reverse(),
               monthlyRevenue: dynamicMonthlyRevenueData.slice(0, 6).reverse()
             });
          }
          
          setStats({
            totalRevenue: totalRevenue >= 1000 ? (totalRevenue / 1000).toFixed(1) + 'K' : totalRevenue.toString(),
            activeSubscriptions: subsData ? subsData.filter(s => s.status === 'نشط').length : 0,
            refunds: totalRefunds >= 1000 ? (totalRefunds / 1000).toFixed(1) + 'K' : totalRefunds.toString(),
            newStudents: totalNewStudents
          });
        }
      } catch (err) {
        console.error("Error fetching revenue details:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRevenueDetails();
  }, []);

  return (
    <div className="space-y-6" style={{"--chart-grid": "var(--border-card)", "--chart-text": "var(--text-muted)"} as any}>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title=""
          value={stats.totalRevenue}
          subtext="إجمالي الإيرادات"
          icon={DollarSign}
          colorClass="bg-success-500 shadow-success-500/20"
        />
        <StatCard
          title=""
          value={stats.activeSubscriptions.toString()}
          subtext="اشتراكات نشطة"
          icon={CreditCard}
          colorClass="bg-primary-500 shadow-primary-500/20"
        />
        <StatCard
          title=""
          value={stats.refunds}
          subtext="المبالغ المستردة"
          icon={RefreshCcw}
          colorClass="bg-red-500 shadow-red-500/20"
        />
        <StatCard
          title=""
          value={stats.newStudents.toString()}
          subtext="طلاب جدد"
          icon={UserPlus}
          colorClass="bg-info-500 shadow-info-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Students Chart */}
        <div className="bg-bg-card border border-border-card rounded-3xl p-6">
          <h3 className="text-xl font-bold text-text-title mb-6">الطلاب الجدد</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.newStudents} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "var(--chart-text)", fontSize: 12 }} 
                  dy={10} 
                />
                <Tooltip
                  cursor={{ fill: "var(--chart-grid)", opacity: 0.5 }}
                  contentStyle={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-card)", borderRadius: "8px", color: "var(--text-title)" }}
                  itemStyle={{ color: "var(--text-title)" }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  fillOpacity={1}
                >
                  {
                    chartData.newStudents.map((entry, index) => (
                      <cell key={`cell-${index}`} fill="url(#colorStudent)" />
                    ))
                  }
                </Bar>
                <defs>
                  <linearGradient id="colorStudent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-bg-card border border-border-card rounded-3xl p-6">
          <h3 className="text-xl font-bold text-text-title mb-6">الإيرادات الشهرية</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.monthlyRevenue} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "var(--chart-text)", fontSize: 12 }} 
                  dy={10} 
                />
                <Tooltip
                  cursor={{ fill: "var(--chart-grid)", opacity: 0.5 }}
                  contentStyle={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-card)", borderRadius: "8px", color: "var(--text-title)" }}
                  formatter={(value: number) => [`${value} ر.س`, 'الإيرادات']}
                  itemStyle={{ color: "var(--text-title)" }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  fill="#10b981"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-bg-card border border-border-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-border-card bg-bg-hover">
          <h3 className="text-xl font-bold text-text-title">تفاصيل الإيرادات الشهرية</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-border-card bg-bg-hover">
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الشهر</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">السنة</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الاشتراكات</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">المستردات</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">صافي الإيرادات</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">طلاب جدد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divide-card">
              {revenueDetails.map((row, idx) => (
                <tr key={idx} className="hover:bg-hover-table transition-colors">
                  <td className="py-4 px-6 text-text-title font-medium">{row.month}</td>
                  <td className="py-4 px-6 text-text-muted font-mono">{row.year}</td>
                  <td className="py-4 px-6 text-success-500 font-medium">{row.subscriptions} ر.س</td>
                  <td className="py-4 px-6 text-red-400 font-medium">{row.refunds} ر.س</td>
                  <td className="py-4 px-6 text-primary-400 font-bold whitespace-nowrap">{row.net_revenue} ر.س</td>
                  <td className="py-4 px-6">
                    <span className="bg-info-500/20 text-info-400 px-3 py-1 rounded-full text-sm font-semibold">
                      {row.new_students}
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
