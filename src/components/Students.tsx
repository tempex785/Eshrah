import { Search, Plus, Users, UserCheck, TrendingUp, Edit, Eye, X, BookOpen, FileText, CheckSquare, Trash2 } from "lucide-react";
import { StatCard } from "./StatCard";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, avgProgress: "0%" });

  const [editStudent, setEditStudent] = useState<any>(null);
  const [viewStudent, setViewStudent] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setIsLoading(true);
    try {
      const [{ data: studentsData, error: studentsError }, { data: examsData }] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('exams').select('score')
      ]);
      if (studentsError) throw studentsError;
      if (studentsData) {
        setStudents(studentsData);
        
        let avgProgress = 0;
        if (examsData && examsData.length > 0) {
          avgProgress = Math.round(examsData.reduce((acc, curr) => acc + (curr.score || 0), 0) / examsData.length);
        }
        
        setStats({
          total: studentsData.length,
          active: studentsData.length, // All are active right now
          avgProgress: `${avgProgress}%`
        });
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({
          first_name: editStudent.first_name,
          last_name: editStudent.last_name,
          college_name: editStudent.college_name,
          academic_year: editStudent.academic_year,
          phone: editStudent.phone,
          governorate: editStudent.governorate,
        })
        .eq('id', editStudent.id);

      if (error) throw error;
      setEditStudent(null);
      fetchStudents();
    } catch (err) {
      console.error("Error updating student:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {

    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      fetchStudents();

    } catch (err) {
      console.error("Error deleting student:", err);

    }
  };

  const getMockedStats = (studentId: string) => {
    // Generate pseudo-random consistent data based on the ID string length / characters
    const seed = studentId.length > 0 ? studentId.charCodeAt(0) + studentId.charCodeAt(studentId.length - 1) : 50;
    const lecturesWatched = (seed % 40) + 60; // 60% to 100%
    const examsCompleted = (seed % 10) + 5; // 5 to 15
    const homeworkSubmitted = (seed % 20) + 80; // 80% to 100%

    return {
      lecturesWatched,
      examsCompleted,
      homeworkSubmitted
    };
  };

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
          value={stats.total.toString()}
          subtext="إجمالي الطلاب"
          icon={Users}
          colorClass="bg-primary-500 shadow-primary-500/20"
        />
        <StatCard
          title=""
          value={stats.active.toString()}
          subtext="طلاب نشطين"
          icon={UserCheck}
          colorClass="bg-success-500 shadow-success-500/20"
        />
        <StatCard
          title=""
          value={stats.avgProgress}
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
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الكلية</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">السنة الدراسية</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الهاتف</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">تاريخ التسجيل</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">المحافظة</th>
                <th className="py-5 px-6 text-sm font-semibold text-text-body">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divide-card">
              {students.map((student) => {
                const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'طالب مجهول';
                const initial = fullName.charAt(0);
                const date = new Date(student.created_at).toLocaleDateString('ar-EG');
                
                return (
                <tr key={student.id} className="hover:bg-hover-table transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold shrink-0">
                        {initial}
                      </div>
                      <span className="text-text-title font-medium">{fullName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-text-body text-sm">{student.college_name || '-'}</td>
                  <td className="py-4 px-6 text-text-body text-sm">{student.academic_year || '-'}</td>
                  <td className="py-4 px-6 text-text-body text-sm">{student.phone || '-'}</td>
                  <td className="py-4 px-6 text-text-body text-sm">{date}</td>
                  <td className="py-4 px-6 text-text-body text-sm">{student.governorate || '-'}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-text-muted">
                      <button 
                        onClick={() => setViewStudent(student)}
                        className="hover:text-text-title transition-colors p-1"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditStudent(student)}
                        className="hover:text-primary-500 transition-colors p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="hover:text-error-500 transition-colors p-1 text-error-500"
                        title="حذف الطالب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
      
      {viewStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-card rounded-2xl w-full max-w-md overflow-hidden relative">
            <div className="p-6 border-b border-border-card flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-title">إحصائيات الطالب</h3>
              <button 
                onClick={() => setViewStudent(null)}
                className="text-text-muted hover:text-text-title transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {`${viewStudent.first_name || ''} ${viewStudent.last_name || ''}`.trim().charAt(0) || '?'}
                </div>
                <div>
                  <div className="text-text-title font-medium">{`${viewStudent.first_name || ''} ${viewStudent.last_name || ''}`.trim() || 'طالب مجهول'}</div>
                  <div className="text-sm text-text-muted">{viewStudent.college_name || '-'}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-bg-main p-4 rounded-xl border border-border-card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-500/10 p-2 rounded-lg text-primary-500">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-text-body font-medium">سماع المحاضرات</span>
                  </div>
                  <span className="text-text-title font-bold">{getMockedStats(viewStudent.id).lecturesWatched}%</span>
                </div>
                <div className="bg-bg-main p-4 rounded-xl border border-border-card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-info-500/10 p-2 rounded-lg text-info-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-text-body font-medium">الامتحانات المنجزة</span>
                  </div>
                  <span className="text-text-title font-bold">{getMockedStats(viewStudent.id).examsCompleted}</span>
                </div>
                <div className="bg-bg-main p-4 rounded-xl border border-border-card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-success-500/10 p-2 rounded-lg text-success-500">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <span className="text-text-body font-medium">الواجبات</span>
                  </div>
                  <span className="text-text-title font-bold">{getMockedStats(viewStudent.id).homeworkSubmitted}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-card border border-border-card rounded-2xl w-full max-w-lg overflow-hidden relative">
            <div className="p-6 border-b border-border-card flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-title">تعديل بيانات الطالب</h3>
              <button 
                onClick={() => setEditStudent(null)}
                className="text-text-muted hover:text-text-title transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">الاسم الأول</label>
                  <input 
                    type="text"
                    required
                    value={editStudent?.first_name || ""}
                    onChange={e => setEditStudent({...editStudent, first_name: e.target.value})}
                    className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">الاسم الأخير</label>
                  <input 
                    type="text"
                    required
                    value={editStudent?.last_name || ""}
                    onChange={e => setEditStudent({...editStudent, last_name: e.target.value})}
                    className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">الكلية</label>
                  <input 
                    type="text"
                    value={editStudent?.college_name || ""}
                    onChange={e => setEditStudent({...editStudent, college_name: e.target.value})}
                    className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">السنة الدراسية</label>
                  <input 
                    type="text"
                    value={editStudent?.academic_year || ""}
                    onChange={e => setEditStudent({...editStudent, academic_year: e.target.value})}
                    className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">الهاتف</label>
                  <input 
                    type="text"
                    required
                    value={editStudent?.phone || ""}
                    onChange={e => setEditStudent({...editStudent, phone: e.target.value})}
                    className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">المحافظة</label>
                  <input 
                    type="text"
                    value={editStudent?.governorate || ""}
                    onChange={e => setEditStudent({...editStudent, governorate: e.target.value})}
                    className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-border-card flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-bg-main py-2 rounded-xl font-bold transition-colors"
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditStudent(null)}
                  className="flex-1 bg-bg-hover hover:bg-hover-table text-text-body py-2 rounded-xl font-bold transition-colors border border-border-card"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
