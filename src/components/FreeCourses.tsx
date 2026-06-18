import { Search, Plus, LayoutGrid, List, User, Star, Clock, FileText, Users, Edit, Trash2, X } from "lucide-react";
import { cn } from "../lib/utils";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function FreeCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editCourse, setEditCourse] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", image_url: "", semester: "", features: [] as string[] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchCourses() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('freecourses').select('*');
      if (error) throw error;
      if (data) {
        setCourses(data);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourse) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('freecourses')
        .update({
          title: editCourse.title,
          description: editCourse.description,
          image_url: editCourse.image_url,
          semester: editCourse.semester,
        })
        .eq('id', editCourse.id);

      if (error) throw error;
      setEditCourse(null);
      fetchCourses();
    } catch (err) {
      console.error("Error updating course:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('freecourses').insert([{
        title: newCourse.title,
        description: newCourse.description,
        image_url: newCourse.image_url,
        semester: newCourse.semester,
        features: newCourse.features
      }]);
      
      if (error) throw error;
      
      setIsModalOpen(false);
      setNewCourse({ title: "", description: "", image_url: "", semester: "", features: [] });
      fetchCourses();
    } catch (error) {
      console.error("Error adding course:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الدورة؟")) return;
    try {
      const { error } = await supabase.from('freecourses').delete().eq('id', id);
      if (error) throw error;
      fetchCourses();
      alert("تم الحذف بنجاح");
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="البحث عن دورة مجانية..."
            className="w-full bg-bg-card border border-border-card rounded-xl py-3 pr-11 pl-4 text-text-title placeholder:text-text-muted focus:outline-none focus:border-primary-500/50 transition-colors"
          />
          <Search className="w-5 h-5 text-text-muted absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex bg-bg-card border border-border-card rounded-xl p-1 shrink-0">
                <button className="p-2 bg-primary-500 rounded-lg text-white">
                    <LayoutGrid className="w-5 h-5" />
                </button>
                <button className="p-2 text-text-muted hover:text-text-title transition-colors">
                    <List className="w-5 h-5" />
                </button>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-3 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              <span>إنشاء دورة جديدة</span>
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-bg-card border border-border-card rounded-3xl overflow-hidden flex flex-col">
            
            {/* Card Header with Image */}
            <div className="relative h-48 w-full bg-bg-hover">
              {course.image_url ? (
                <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900">
                  <h3 className="text-2xl font-bold text-white text-center px-4">{course.title}</h3>
                </div>
              )}
              {course.semester && (
                <span className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {course.semester}
                </span>
              )}
            </div>

            {/* Card Body */}
            <div className="p-6 flex flex-col gap-4 flex-1">
              <h3 className="text-xl font-bold text-text-title">
                  {course.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed line-clamp-2 min-h-[40px]">
                {course.description}
              </p>

              {course.features && Array.isArray(course.features) && course.features.length > 0 && (
                <div className="space-y-2 mt-2 min-h-[50px]">
                   {course.features.slice(0, 2).map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-text-body">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                         <span className="line-clamp-2">{feature}</span>
                      </div>
                   ))}
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-border-card flex items-center justify-between">
                <div className="flex items-center gap-1 text-primary-500 font-bold text-xl">
                   {course.price || "مجاناً"}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditCourse(course)}
                    className="p-2 text-text-muted hover:text-primary-500 transition-colors bg-bg-main rounded-lg border border-border-card"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="p-2 text-text-muted hover:text-error-500 transition-colors bg-bg-main rounded-lg border border-border-card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-card border border-border-card rounded-2xl w-full max-w-lg overflow-hidden relative">
            <div className="p-6 border-b border-border-card flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-title">إنشاء دورة مجانية جديدة</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-title transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-text-body mb-1">الاسم</label>
                 <input 
                   type="text"
                   required
                   value={newCourse.title}
                   onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                   className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-body mb-1">الوصف</label>
                 <textarea 
                   rows={3}
                   value={newCourse.description}
                   onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                   className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-body mb-1">الفصل الدراسي</label>
                 <input 
                   type="text"
                   value={newCourse.semester}
                   onChange={e => setNewCourse({...newCourse, semester: e.target.value})}
                   className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-body mb-1">رابط الصورة</label>
                 <input 
                   type="text"
                   value={newCourse.image_url}
                   onChange={e => setNewCourse({...newCourse, image_url: e.target.value})}
                   className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-body mb-1">المميزات (مفصولة بفاصلة)</label>
                 <input 
                   type="text"
                   placeholder="شرح وافي, ملزمة pdf, بنك أسئلة"
                   value={newCourse.features.join(", ")}
                   onChange={e => setNewCourse({...newCourse, features: e.target.value.split(",").map(f => f.trim()).filter(Boolean)})}
                   className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                 />
               </div>
               <div className="pt-4 border-t border-border-card flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-bg-main py-2 rounded-xl font-bold transition-colors"
                >
                  {isSubmitting ? "جاري الإضافة..." : "حفظ الدورة"}
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

      {/* Edit Modal */}
      {editCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-card border border-border-card rounded-2xl w-full max-w-lg overflow-hidden relative">
            <div className="p-6 border-b border-border-card flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-title">تعديل الدورة المجانية</h3>
              <button 
                onClick={() => setEditCourse(null)}
                className="text-text-muted hover:text-text-title transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-text-body mb-1">الاسم</label>
                 <input 
                   type="text"
                   required
                   value={editCourse.title || ""}
                   onChange={e => setEditCourse({...editCourse, title: e.target.value})}
                   className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-body mb-1">الوصف</label>
                 <textarea 
                   rows={3}
                   value={editCourse.description || ""}
                   onChange={e => setEditCourse({...editCourse, description: e.target.value})}
                   className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-body mb-1">الفصل الدراسي</label>
                 <input 
                   type="text"
                   value={editCourse.semester || ""}
                   onChange={e => setEditCourse({...editCourse, semester: e.target.value})}
                   className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-body mb-1">رابط الصورة</label>
                 <input 
                   type="text"
                   value={editCourse.image_url || ""}
                   onChange={e => setEditCourse({...editCourse, image_url: e.target.value})}
                   className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-2 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                 />
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
                  onClick={() => setEditCourse(null)}
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
