import { Star } from "lucide-react";
import { cn } from "../lib/utils";

const courses = [
  { id: 1, title: "دورة البرمجة للمبتدئين", students: 234, rating: 4.9 },
  { id: 2, title: "دورة التصوير الفوتوغرافي", students: 203, rating: 4.5 },
  { id: 3, title: "دورة التسويق الرقمي", students: 189, rating: 4.7 },
  { id: 4, title: "دورة تحليل البيانات", students: 167, rating: 4.7 },
  { id: 5, title: "دورة تصميم الجرافيك", students: 156, rating: 4.8 },
];

export function PopularCourses() {
  return (
    <div className="bg-bg-card rounded-3xl p-6 border border-border-card h-full">
      <h3 className="text-xl font-bold text-text-title mb-6">الدورات الأكثر شعبية</h3>
      
      <div className="space-y-4">
        {courses.map((course, index) => (
          <div key={course.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-bg-hover transition-colors">
            
            <div className="flex text-sm font-semibold items-center gap-2 bg-bg-main px-2 py-1 rounded-lg">
              <span className="text-text-title">{course.rating}</span>
              <Star className="w-4 h-4 text-warning-500 fill-warning-500" />
            </div>

            <div className="text-right flex-1 px-4">
              <h4 className="text-text-title font-medium text-sm sm:text-base">{course.title}</h4>
              <p className="text-text-muted text-xs sm:text-sm">{course.students} طالب</p>
            </div>

            <div className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold shadow-md shrink-0 text-sm sm:text-base",
              index === 0 || index === 2 ? "bg-warning-500 text-text-title" : "bg-slate-700 text-text-body"
            )}>
              {course.id}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
