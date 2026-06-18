import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, X, GraduationCap } from "lucide-react";
import { supabase } from "../lib/supabase";

export function StudyLevels() {
  const [levels, setLevels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLevel, setEditLevel] = useState<any>(null);
  const [newLevel, setNewLevel] = useState({ name: "", description: "", image_url: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchLevels() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("study_levels").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      if (data) {
        setLevels(data);
      }
    } catch (err) {
      console.error("Error fetching study levels:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchLevels();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLevel.name.trim()) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("study_levels").insert([{ 
          name: newLevel.name,
          description: newLevel.description,
          image_url: newLevel.image_url
      }]);
      if (error) throw error;
      setIsModalOpen(false);
      setNewLevel({ name: "", description: "", image_url: "" });
      fetchLevels();
    } catch (err) {
      console.error("Error adding study level:", err);
      alert("حدث خطأ أثناء إضافة المرحلة الدراسية");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLevel) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("study_levels")
        .update({ 
            name: editLevel.name,
            description: editLevel.description,
            image_url: editLevel.image_url
        })
        .eq("id", editLevel.id);
      if (error) throw error;
      setEditLevel(null);
      fetchLevels();
    } catch (err) {
      console.error("Error updating study level:", err);
      alert("حدث خطأ أثناء تحديث المرحلة الدراسية");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المرحلة؟")) return;
    try {
      const { data, error } = await supabase.from("study_levels").delete().eq("id", id).select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("لا توجد صلاحية أو أن العنصر غير موجود (مشكلة في سياسات الأمان RLS).");
      }
      fetchLevels();
      alert("تم الحذف بنجاح");
    } catch (err: any) {
      console.error("Error deleting study level:", err);
      alert("حدث خطأ أثناء حذف المرحلة الدراسية: " + (err.message || "تأكد من صلاحياتك في قاعدة البيانات"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold text-text-title flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary-500" />
          <span>المراحل الدراسية</span>
        </h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-3 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة مرحلة</span>
            </button>
        </div>
      </div>

      {/* Table block */}
      <div className="bg-bg-card border border-border-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-bg-main border-b border-border-card">
              <tr>
                <th className="py-4 px-6 text-text-muted font-medium w-1/4">الصورة</th>
                <th className="py-4 px-6 text-text-muted font-medium w-1/4">الاسم</th>
                <th className="py-4 px-6 text-text-muted font-medium w-1/4">الوصف</th>
                <th className="py-4 px-6 text-text-muted font-medium w-1/4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-muted">جاري التحميل...</td>
                </tr>
              ) : levels.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-muted">لا توجد مراحل دراسية</td>
                </tr>
              ) : (
                levels.map((level) => (
                  <tr key={level.id} className="hover:bg-bg-hover transition-colors">
                    <td className="py-4 px-6">
                      {level.image_url ? (
                        <img src={level.image_url} alt={level.name} className="w-16 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-16 h-12 bg-bg-main rounded-lg flex items-center justify-center text-text-muted text-xs">لا صورة</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-text-title font-medium">{level.name}</td>
                    <td className="py-4 px-6 text-text-muted text-sm max-w-[200px] truncate">{level.description}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditLevel(level)}
                          className="p-2 text-text-muted hover:text-primary-500 transition-colors bg-bg-main rounded-lg border border-border-card"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(level.id)}
                          className="p-2 text-text-muted hover:text-error-500 transition-colors bg-bg-main rounded-lg border border-border-card"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-card rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
            <div className="p-6 border-b border-border-card flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-title">إضافة مرحلة دراسية</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-title transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-text-body mb-2">اسم المرحلة</label>
                 <input 
                   type="text"
                   required
                   value={newLevel.name}
                   onChange={e => setNewLevel({...newLevel, name: e.target.value})}
                   placeholder="مثال: Semester 1"
                   className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-3 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-body mb-2">الوصف</label>
                 <textarea 
                   rows={3}
                   value={newLevel.description}
                   onChange={e => setNewLevel({...newLevel, description: e.target.value})}
                   className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-3 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-body mb-2">رابط الصورة</label>
                 <input 
                   type="text"
                   value={newLevel.image_url}
                   onChange={e => setNewLevel({...newLevel, image_url: e.target.value})}
                   className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-3 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                 />
               </div>
               
               <div className="pt-4 border-t border-border-card flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !newLevel.name.trim()}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-bg-main py-2.5 rounded-xl font-bold transition-colors"
                >
                  {isSubmitting ? "جاري الإضافة..." : "حفظ"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-bg-hover hover:bg-hover-table text-text-body py-2.5 rounded-xl font-bold transition-colors border border-border-card"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editLevel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-card rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">
            <div className="p-6 border-b border-border-card flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-title">تعديل المرحلة الدراسية</h3>
              <button 
                onClick={() => setEditLevel(null)}
                className="text-text-muted hover:text-text-title transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-text-body mb-2">اسم المرحلة</label>
                 <input 
                   type="text"
                   required
                   value={editLevel.name}
                   onChange={e => setEditLevel({...editLevel, name: e.target.value})}
                   className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-3 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-body mb-2">الوصف</label>
                 <textarea 
                   rows={3}
                   value={editLevel.description || ""}
                   onChange={e => setEditLevel({...editLevel, description: e.target.value})}
                   className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-3 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-body mb-2">رابط الصورة</label>
                 <input 
                   type="text"
                   value={editLevel.image_url || ""}
                   onChange={e => setEditLevel({...editLevel, image_url: e.target.value})}
                   className="w-full bg-bg-main border border-border-card rounded-xl px-4 py-3 text-text-body focus:outline-none focus:border-primary-500 transition-colors"
                 />
               </div>
               
               <div className="pt-4 border-t border-border-card flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !editLevel.name.trim()}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-bg-main py-2.5 rounded-xl font-bold transition-colors"
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditLevel(null)}
                  className="flex-1 bg-bg-hover hover:bg-hover-table text-text-body py-2.5 rounded-xl font-bold transition-colors border border-border-card"
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
