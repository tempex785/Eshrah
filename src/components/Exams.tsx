import { FileText, CheckCircle, XCircle, BarChart2, Plus } from "lucide-react";
import { StatCard } from "./StatCard";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const fallbackExamsData = [
  {
    id: "1",
    name: "نايف سعود الأحمدي",
    initial: "ن",
    course: "دورة البرمجة للمبتدئين",
    exam: "الاختبار النهائي - الوحدة الأولى",
    score: 79,
    duration: "56 دقيقة",
    date: "2026/5/19",
    status: "ناجح",
    status_color: "text-success-500 bg-success-500/10 border-success-500/20"
  },
  {
    id: "2",
    name: "خالد عمر الشمري",
    initial: "خ",
    course: "دورة تصميم الجرافيك",
    exam: "الاختبار النهائي - الوحدة الثانية",
    score: 78,
    duration: "82 دقيقة",
    date: "2026/5/30",
    status: "ناجح",
    status_color: "text-success-500 bg-success-500/10 border-success-500/20"
  },
  {
    id: "3",
    name: "تركي عبدالله السبيعي",
    initial: "ت",
    course: "دورة البرمجة للمبتدئين",
    exam: "الاختبار النهائي - الوحدة الثالثة",
    score: 98,
    duration: "44 دقيقة",
    date: "2026/4/28",
    status: "ناجح",
    status_color: "text-success-500 bg-success-500/10 border-success-500/20"
  }
];

export function Exams() {
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchExams() {
      try {
        const { data, error } = await supabase.from('exams').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          setExams(data);
        } else {
          setExams(fallbackExamsData);
        }
      } catch (err) {
        console.error("Error fetching exams:", err);
        setExams(fallbackExamsData);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExams();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title=""
          value="15"
          subtext="إجمالي الامتحانات"
          icon={FileText}
          colorClass="bg-primary-500 shadow-primary-500/20"
        />
        <StatCard
          title=""
          value="10"
          subtext="ناجحين"
          icon={CheckCircle}
          colorClass="bg-success-500 shadow-success-500/20"
        />
        <StatCard
          title=""
          value="5"
          subtext="راسبين"
          icon={XCircle}
          colorClass="bg-red-500 shadow-red-500/20"
        />
        <StatCard
          title=""
          value="73%"
          subtext="متوسط الدرجات"
          icon={BarChart2}
          colorClass="bg-warning-500 shadow-warning-500/20"
        />
      </div>

      {/* Table Section */}
      <div className="bg-bg-card border border-border-card rounded-3xl overflow-hidden">
        {/* Table Header / Actions */}
        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-card bg-bg-hover">
          <h3 className="text-xl font-bold text-text-title">نتائج الامتحانات</h3>
          <button className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center">
            <Plus className="w-5 h-5" />
            <span>إنشاء امتحان جديد</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-border-card bg-bg-hover">
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الطالب</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الدورة</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الامتحان</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الدرجة</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body text-center">المدة</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">التاريخ</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divide-card">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-hover-table transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold shrink-0">
                        {exam.initial}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-text-title font-medium whitespace-nowrap">{exam.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-text-body text-sm max-w-[150px]">{exam.course}</td>
                  <td className="py-4 px-6 text-text-body text-sm max-w-[200px]">{exam.exam}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 w-32">
                      <span className="text-text-title font-medium w-12">{exam.score}/100</span>
                      <div className="w-full h-2 bg-bg-track rounded-full overflow-hidden flex-1">
                        <div 
                          className={cn("h-full rounded-full", exam.score >= 90 ? "bg-success-500" : "bg-warning-500")}
                          style={{ width: `${exam.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-text-muted text-sm text-center">
                    {exam.duration.split(" ")[0]}
                    <br />
                    <span className="text-xs">{exam.duration.split(" ")[1]}</span>
                  </td>
                  <td className="py-4 px-6 text-text-muted text-sm font-mono tracking-tight">{exam.date}</td>
                  <td className="py-4 px-6">
                    <span className={cn("px-3 py-1 text-xs font-medium border rounded-full whitespace-nowrap", exam.status_color)}>
                      {exam.status}
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
