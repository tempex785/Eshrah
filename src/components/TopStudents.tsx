import { Trophy, Medal, Star, Plus, X, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { cn } from "../lib/utils";

export function TopStudents() {
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", address: "", emoji: "🤓", score: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchTopStudents() {
    try {
      const { data, error } = await supabase
        .from('top_students')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      if (data) {
        setTopStudents(data);
      }
    } catch (err) {
      console.error("Error fetching top students:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchTopStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.score) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('top_students').insert([{
        name: newStudent.name,
        address: newStudent.address,
        emoji: newStudent.emoji,
        score: Number(newStudent.score)
      }]);
      
      if (error) throw error;
      
      setIsModalOpen(false);
      setNewStudent({ name: "", address: "", emoji: "🤓", score: "" });
      fetchTopStudents();
    } catch (error) {
      console.error("Error adding top student:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {

    try {
      const { error } = await supabase.from('top_students').delete().eq('id', id);
      if (error) throw error;

      fetchTopStudents();
    } catch (err: any) {
      console.error("Error deleting student:", err);

    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-warning-500/20 flex items-center justify-center text-warning-500">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-title tracking-tight">أوائل الشهر</h2>
            <p className="text-sm text-text-muted mt-1">الطلاب المتميزون ذوو أعلى تقدم أكاديمي هذا الشهر</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-500 hover:bg-primary-600 text-bg-main px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة طالب متفوق
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-card rounded-2xl w-full max-w-md overflow-hidden relative">
            <div className="p-6 border-b border-border-card flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-title">إضافة طالب متفوق جديد</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-title transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-body mb-1">اسم الطالب</label>
                <input 
                  type="text"
                  required
                  value={newStudent.name}
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="الاسم الكامل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-body mb-1">العنوان</label>
                <input 
                  type="text"
                  value={newStudent.address}
                  onChange={e => setNewStudent({...newStudent, address: e.target.value})}
                  className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="المدينة أو المنطقة"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">ايموجي الطالب</label>
                  <input 
                    type="text"
                    value={newStudent.emoji}
                    onChange={e => setNewStudent({...newStudent, emoji: e.target.value})}
                    className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors text-center text-xl"
                    placeholder="🤓"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">الدرجة (%)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={newStudent.score}
                    onChange={e => setNewStudent({...newStudent, score: e.target.value})}
                    className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="95"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-border-card flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-bg-main py-2 rounded-xl font-bold transition-colors"
                >
                  {isSubmitting ? "جاري الإضافة..." : "حفظ الطالب"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-bg-hover hover:bg-hover-table text-text-body py-2 rounded-xl font-bold transition-colors border border-border-card"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Top 3 Podium */}
        {topStudents.slice(0, 3).map((student, index) => (
          <div key={student.id} className={cn(
            "relative bg-bg-card rounded-3xl p-6 border text-center flex flex-col items-center justify-center",
            index === 0 ? "border-warning-500 shadow-warning-500/10 md:-translate-y-4 shadow-xl" : "border-border-card"
          )}>
            {index === 0 && (
              <div className="absolute -top-4 bg-warning-500 text-bg-main px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                <Star className="w-4 h-4 fill-current" />
                <span>المركز الأول</span>
              </div>
            )}
            
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg",
              index === 0 ? "bg-warning-500/10 shadow-warning-500/30 w-24 h-24 text-5xl" : 
              index === 1 ? "bg-slate-400/10 shadow-slate-400/30" : 
              "bg-amber-700/10 shadow-amber-700/30"
            )}>
              {student.emoji || "🤓"}
            </div>
            
            <h3 className="text-lg font-bold text-text-title mb-1">{student.name}</h3>
            <p className="text-sm text-text-muted mb-4">{student.address || "-"}</p>
            
            <div className="flex items-center gap-2 bg-hover-table px-4 py-2 rounded-xl">
              <span className="text-sm text-text-body font-medium">الدرجة:</span>
              <span className={cn(
                "font-bold",
                index === 0 ? "text-warning-500" : "text-primary-500"
              )}>{student.score}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Rest of Top 10 Table */}
      <div className="bg-bg-card border border-border-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-border-card flex items-center gap-2">
          <Medal className="w-5 h-5 text-text-muted" />
          <h3 className="text-lg font-bold text-text-title">قائمة الشرف الترتيب</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-border-card bg-bg-hover">
                <th className="py-5 px-6 text-sm font-semibold text-text-body w-16 text-center">الترتيب</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الطالب</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body text-center">الدرجة %</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divide-card">
              {topStudents.map((student, index) => (
                <tr key={student.id} className="hover:bg-hover-table transition-colors">
                  <td className="py-4 px-6 text-center">
                    <span className={cn(
                      "inline-flex items-center justify-center w-8 h-8 rounded-full font-bold",
                      index === 0 ? "bg-warning-500 text-bg-main" :
                      index === 1 ? "bg-slate-400 text-bg-main" :
                      index === 2 ? "bg-amber-700 text-bg-main" :
                      "bg-bg-hover text-text-muted"
                    )}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 text-xl font-bold shrink-0">
                        {student.emoji || "🤓"}
                      </div>
                      <div>
                        <div className="text-text-title font-medium">{student.name}</div>
                        <div className="text-xs text-text-muted">{student.address || "-"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="font-mono font-bold text-primary-500 bg-primary-500/10 px-3 py-1 rounded-lg">
                      {student.score}%
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button 
                      onClick={() => handleDelete(student.id)}
                      className="p-2 text-text-muted hover:text-error-500 transition-colors bg-bg-main rounded-lg border border-border-card"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {topStudents.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-text-muted">
                    لا يوجد بيانات لعرضها
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
