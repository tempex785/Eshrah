import { Search, Plus, Users, UserCheck, TrendingUp, Edit, Eye } from "lucide-react";
import { StatCard } from "./StatCard";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const fallbackStudentsData = [
  { id: "1", name: "أحمد محمد علي", email: "student1@academy.com", phone: "0574035495", date: "2026/1/9", progress: 35, status: "نشط", initial: "أ" },
  { id: "2", name: "فاطمة حسن إبراهيم", email: "student2@academy.com", phone: "0579127893", date: "2026/5/16", progress: 91, status: "نشط", initial: "ف" },
  { id: "3", name: "محمد عبدالله السيد", email: "student3@academy.com", phone: "0573229813", date: "2026/4/5", progress: 82, status: "نشط", initial: "م" },
  { id: "4", name: "نورة سعيد الحربي", email: "student4@academy.com", phone: "0552744379", date: "2026/3/10", progress: 25, status: "نشط", initial: "ن" },
  { id: "5", name: "عبدالله سالم الشمري", email: "student5@academy.com", phone: "0538561278", date: "2026/2/8", progress: 58, status: "نشط", initial: "ع" },
];

export function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const { data, error } = await supabase.from('students').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          setStudents(data);
        } else {
          setStudents(fallbackStudentsData); // Empty case fallback for preview
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setStudents(fallbackStudentsData);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudents();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="البحث عن طالب..."
            className="w-full bg-bg-card border border-border-card rounded-xl py-3 pr-11 pl-4 text-text-title placeholder:text-text-muted focus:outline-none focus:border-primary-500/50 transition-colors"
          />
          <Search className="w-5 h-5 text-text-muted absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
        <button className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-3 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center">
          <Plus className="w-5 h-5" />
          <span>إضافة طالب جديد</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title=""
          value="40"
          subtext="إجمالي الطلاب"
          icon={Users}
          colorClass="bg-primary-500 shadow-primary-500/20"
        />
        <StatCard
          title=""
          value="35"
          subtext="طلاب نشطين"
          icon={UserCheck}
          colorClass="bg-success-500 shadow-success-500/20"
        />
        <StatCard
          title=""
          value="54%"
          subtext="متوسط التقدم"
          icon={TrendingUp}
          colorClass="bg-warning-500 shadow-warning-500/20"
        />
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-border-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-border-card bg-bg-hover">
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الطالب</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">البريد الإلكتروني</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الهاتف</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">تاريخ التسجيل</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">التقدم</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الحالة</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divide-card">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-hover-table transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold shrink-0">
                        {student.initial}
                      </div>
                      <span className="text-text-title font-medium">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-text-body text-sm">{student.email}</td>
                  <td className="py-4 px-6 text-text-body text-sm">{student.phone}</td>
                  <td className="py-4 px-6 text-text-body text-sm">{student.date}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className="text-text-body text-sm min-w-[32px]">{student.progress}%</span>
                      <div className="w-24 h-2 bg-bg-track rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 text-xs font-medium text-success-500 justify-center flex bg-success-500/10 border border-success-500/20 rounded-full w-fit">
                      {student.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-text-muted">
                      <button className="hover:text-text-title transition-colors p-1">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="hover:text-primary-500 transition-colors p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
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
