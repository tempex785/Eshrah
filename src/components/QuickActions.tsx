import { UserPlus, BookPlus, GraduationCap, FileBarChart } from "lucide-react";
import { cn } from "../lib/utils";

const actions = [
  { icon: UserPlus, label: "إضافة طالب", colorClass: "bg-primary-500", shadowClass: "shadow-primary-500/20" },
  { icon: BookPlus, label: "إنشاء دورة", colorClass: "bg-info-500", shadowClass: "shadow-info-500/20" },
  { icon: GraduationCap, label: "إصدار شهادة", colorClass: "bg-success-500", shadowClass: "shadow-success-500/20" },
  { icon: FileBarChart, label: "تقرير مالي", colorClass: "bg-warning-500", shadowClass: "shadow-warning-500/20" },
];

export function QuickActions() {
  return (
    <div className="bg-bg-card rounded-3xl p-6 border border-border-card">
      <h3 className="text-xl font-bold text-text-title mb-6">إجراءات سريعة</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-2xl p-6 transition-transform hover:-translate-y-1 shadow-lg",
              action.colorClass,
              action.shadowClass
            )}
          >
            <action.icon className="w-8 h-8 text-text-title" />
            <span className="text-text-title font-bold text-sm sm:text-base">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
