import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Plus, X, Trash2, Edit, FileText, MonitorPlay, ClipboardList, 
  ChevronDown, ChevronUp, FolderPlus, FilePlus, PlaySquare, BookOpen, Search
} from "lucide-react";
import { cn } from "../lib/utils";

interface Course {
  id: string;
  title: string;
}

interface Subject {
  id: string;
  name: string;
  icon_name: string;
}

interface ModuleItem {
  title: string;
  icon: string;
  url?: string;
}

interface Module {
  id: string;
  subject_id: string;
  title: string;
  subtitle: string | null;
  content: string | null;
  items: ModuleItem[];
}

export function CourseContents() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [targetSubjectId, setTargetSubjectId] = useState<string>("");
  const [newModule, setNewModule] = useState<Partial<Module>>({
    title: "", subtitle: "", content: "", items: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchSubjects(selectedCourseId);
    } else {
      setSubjects([]);
      setModules([]);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (subjects.length > 0) {
      const subjectIds = subjects.map(s => s.id);
      fetchModules(subjectIds);
    } else {
      setModules([]);
    }
  }, [subjects]);

  const fetchCourses = async () => {
    try {
      const [payRes, freeRes] = await Promise.all([
        supabase.from('paycourses').select('id, title'),
        supabase.from('freecourses').select('id, title')
      ]);
      
      const allCourses = [
        ...(payRes.data || []).map(c => ({...c, title: c.title + ' (مدفوعة)'})),
        ...(freeRes.data || []).map(c => ({...c, title: c.title + ' (مجانية)'}))
      ];
      
      setCourses(allCourses);
      if (allCourses.length > 0) {
        setSelectedCourseId(allCourses[0].id);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_subjects')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchModules = async (subjectIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('course_modules')
        .select('*')
        .in('subject_id', subjectIds)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !selectedCourseId) return;
    try {
      const { error } = await supabase.from('course_subjects').insert([{
        course_id: selectedCourseId,
        name: newSubjectName,
        icon_name: 'FolderReflect'
      }]);
      if (error) throw error;
      setNewSubjectName("");
      setIsAddingSubject(false);
      fetchSubjects(selectedCourseId);
    } catch (error) {
      console.error("Error adding subject:", error);
    }
  };

  const handleDeleteSubject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from('course_subjects').delete().eq('id', id);
      if (error) throw error;
      fetchSubjects(selectedCourseId);
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModule.title?.trim() || !targetSubjectId) return;
    try {
      const { error } = await supabase.from('course_modules').insert([{
        subject_id: targetSubjectId,
        title: newModule.title,
        subtitle: newModule.subtitle,
        content: newModule.content,
        items: newModule.items || []
      }]);
      if (error) throw error;
      setNewModule({ title: "", subtitle: "", content: "", items: [] });
      setIsAddingModule(false);
      fetchModules(subjects.map(s => s.id));
    } catch (error) {
      console.error("Error adding module:", error);
    }
  };

  const handleDeleteModule = async (id: string) => {
    try {
      const { error } = await supabase.from('course_modules').delete().eq('id', id);
      if (error) throw error;
      fetchModules(subjects.map(s => s.id));
    } catch (error) {
      console.error("Error deleting module:", error);
    }
  };

  const toggleSubject = (id: string) => {
    setExpandedSubjectId(prev => prev === id ? null : id);
  };

  const addModuleItem = () => {
    setNewModule(prev => ({
      ...prev,
      items: [...(prev.items || []), { title: "", icon: "FileText", url: "" }]
    }));
  };

  const updateModuleItem = (index: number, field: keyof ModuleItem, value: string) => {
    setNewModule(prev => {
      const newItems = [...(prev.items || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const removeModuleItem = (index: number) => {
    setNewModule(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index)
    }));
  };

  const renderIcon = (name: string, className = "w-5 h-5") => {
    switch (name) {
      case 'MonitorPlay': return <MonitorPlay className={className} />;
      case 'ClipboardList': return <ClipboardList className={className} />;
      case 'PlaySquare': return <PlaySquare className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      default: return <FileText className={className} />;
    }
  };

  if (loading) return <div className="p-8 text-center text-text-muted">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-text-title">محتوى الدورات</h2>
        
        {/* Course Selector */}
        <div className="w-full sm:w-auto min-w-[250px]">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-4 py-2 border border-border-input rounded-lg bg-bg-input text-text-main focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="" disabled>اختر الدورة</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourseId ? (
        <div className="bg-bg-card rounded-2xl border border-border-card shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-title">المواد الدراسية (Subjects)</h3>
            <button
              onClick={() => setIsAddingSubject(true)}
              className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة مادة</span>
            </button>
          </div>

          <div className="space-y-4">
            {subjects.length === 0 ? (
              <div className="text-center py-10 text-text-muted border-2 border-dashed border-border-card rounded-xl">
                لا توجد مواد مضافة لهذه الدورة حتى الآن.
              </div>
            ) : (
              subjects.map(subject => {
                const subjectModules = modules.filter(m => m.subject_id === subject.id);
                const isExpanded = expandedSubjectId === subject.id;

                return (
                  <div key={subject.id} className="border border-border-card rounded-xl overflow-hidden bg-bg-main transition-colors">
                    {/* Subject Header */}
                    <div 
                      className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 cursor-pointer hover:bg-bg-input/50", isExpanded && "bg-bg-input/50")}
                      onClick={() => toggleSubject(subject.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-text-title font-semibold text-lg">{subject.name}</h4>
                          <p className="text-text-muted text-sm">{subjectModules.length} وحدات</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTargetSubjectId(subject.id);
                            setIsAddingModule(true);
                          }}
                          className="flex items-center gap-1 text-primary-500 hover:text-primary-600 bg-primary-500/10 hover:bg-primary-500/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
                        >
                          <FilePlus className="w-4 h-4" />
                          <span>إضافة وحدة</span>
                        </button>
                        <button
                          onClick={(e) => handleDeleteSubject(subject.id, e)}
                          className="p-2 text-text-muted hover:text-error-500 hover:bg-error-500/10 rounded-lg transition-colors"
                          title="حذف المادة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-border-card mx-2 hidden sm:block"></div>
                        <button className="p-1 text-text-muted">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Modules List */}
                    {isExpanded && (
                      <div className="p-4 bg-bg-card border-t border-border-card space-y-4">
                        {subjectModules.length === 0 ? (
                          <div className="text-center py-6 text-text-muted text-sm">
                            لا توجد وحدات في هذه المادة. أضف الوحدة الأولى الآن!
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subjectModules.map(module => (
                              <div key={module.id} className="border border-border-card bg-bg-main rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-4 border-b border-border-card flex items-start justify-between">
                                  <div>
                                    <h5 className="font-semibold text-text-title mb-1">{module.title}</h5>
                                    {module.subtitle && <p className="text-xs text-text-muted">{module.subtitle}</p>}
                                  </div>
                                  <button onClick={() => handleDeleteModule(module.id)} className="text-text-muted hover:text-error-500 opacity-50 hover:opacity-100 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="p-4 space-y-3 bg-bg-input/20">
                                  {(!module.items || module.items.length === 0) ? (
                                    <p className="text-xs text-text-muted text-center italic">لا توجد دروس مضافة</p>
                                  ) : (
                                    module.items.map((item, idx) => (
                                      <div key={idx} className="flex flex-col gap-1 bg-bg-main p-2 rounded-lg border border-border-card">
                                        <div className="flex items-center gap-3 text-sm text-text-body">
                                          <div className="text-primary-500 shrink-0">
                                            {renderIcon(item.icon, "w-4 h-4")}
                                          </div>
                                          <span className="flex-1 truncate">{item.title}</span>
                                        </div>
                                        {item.url && (
                                           <a 
                                             href={item.url} 
                                             target="_blank" 
                                             rel="noreferrer" 
                                             className="text-xs text-primary-500 hover:text-primary-600 truncate pr-7"
                                             dir="ltr"
                                             title={item.url}
                                           >
                                             {item.url}
                                           </a>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="bg-bg-card rounded-2xl border border-border-card shadow-sm p-12 text-center text-text-muted">
          يرجى إضافة أو اختيار دورة أولاً للتمكن من إدارة محتواها.
        </div>
      )}

      {/* Add Subject Modal */}
      {isAddingSubject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card rounded-2xl w-full max-w-md overflow-hidden border border-border-card">
            <div className="p-6 border-b border-border-card flex justify-between items-center bg-bg-main">
              <h2 className="text-xl font-bold text-text-title text-right">إضافة مادة جديدة</h2>
              <button onClick={() => setIsAddingSubject(false)} className="text-text-muted hover:text-text-title">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-title mb-2 text-right">اسم المادة</label>
                <input
                  type="text"
                  required
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="مثال: اللغة العربية، الفيزياء..."
                  className="w-full px-4 py-3 bg-bg-input border border-border-input rounded-xl text-text-main focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                  dir="rtl"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-primary-500 text-white py-3 rounded-xl hover:bg-primary-600 transition-colors font-semibold">
                  إضافة
                </button>
                <button type="button" onClick={() => setIsAddingSubject(false)} className="px-6 bg-bg-input text-text-main py-3 rounded-xl hover:bg-border-card transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {isAddingModule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card rounded-2xl w-full max-w-2xl overflow-hidden border border-border-card flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border-card flex justify-between items-center bg-bg-main shrink-0">
              <h2 className="text-xl font-bold text-text-title text-right">إضافة وحدة جديدة</h2>
              <button onClick={() => setIsAddingModule(false)} className="text-text-muted hover:text-text-title">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-title mb-2 text-right">عنوان الوحدة</label>
                  <input
                    type="text"
                    required
                    value={newModule.title}
                    onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                    placeholder="مثال: الوحدة الأولى: المفاهيم الأساسية"
                    className="w-full px-4 py-3 bg-bg-input border border-border-input rounded-xl text-text-main focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                    dir="rtl"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-title mb-2 text-right">وصف الوحدة (اختياري)</label>
                  <input
                    type="text"
                    value={newModule.subtitle || ""}
                    onChange={(e) => setNewModule({...newModule, subtitle: e.target.value})}
                    placeholder="وصف قصير للوحدة"
                    className="w-full px-4 py-3 bg-bg-input border border-border-input rounded-xl text-text-main focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="bg-bg-main border border-border-card rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-border-card pb-3">
                  <h3 className="font-semibold text-text-title">الدروس والمحتوى (Items)</h3>
                  <button type="button" onClick={addModuleItem} className="text-xs bg-primary-500/10 text-primary-500 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-primary-500/20 transition-colors">
                    <Plus className="w-3 h-3" />
                    <span>إضافة درس</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {!newModule.items || newModule.items.length === 0 ? (
                    <div className="text-center py-6 text-sm text-text-muted">لم يتم إضافة دروس بعد</div>
                  ) : (
                    newModule.items.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-bg-input p-3 rounded-lg border border-border-card">
                        <select
                          value={item.icon}
                          onChange={(e) => updateModuleItem(index, 'icon', e.target.value)}
                          className="px-3 py-2 bg-bg-main border border-border-input rounded-lg text-text-main text-sm outline-none"
                        >
                          <option value="MonitorPlay">فيديو</option>
                          <option value="PlaySquare">مقطع</option>
                          <option value="FileText">ملف PDF</option>
                          <option value="ClipboardList">اختبار</option>
                          <option value="BookOpen">قراءة</option>
                        </select>
                        <div className="flex-1 flex flex-col gap-2 w-full">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateModuleItem(index, 'title', e.target.value)}
                            placeholder="عنوان الدرس..."
                            className="px-3 py-2 bg-bg-main border border-border-input rounded-lg text-text-main text-sm min-w-0 outline-none w-full"
                            dir="rtl"
                            required
                          />
                          <input
                            type="url"
                            value={item.url || ''}
                            onChange={(e) => updateModuleItem(index, 'url', e.target.value)}
                            placeholder="الرابط (اختياري)..."
                            className="px-3 py-2 bg-bg-main border border-border-input rounded-lg text-text-main text-sm min-w-0 outline-none w-full"
                            dir="ltr"
                          />
                        </div>
                        <button type="button" onClick={() => removeModuleItem(index)} className="p-2 text-error-500 hover:bg-error-500/10 rounded-lg shrink-0 self-end sm:self-auto">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border-card bg-bg-main shrink-0 flex gap-4">
              <button onClick={handleAddModule} type="button" className="flex-1 bg-primary-500 text-white py-3 rounded-xl hover:bg-primary-600 transition-colors font-semibold">
                حفظ الوحدة
              </button>
              <button type="button" onClick={() => setIsAddingModule(false)} className="px-6 bg-bg-input text-text-main py-3 rounded-xl hover:bg-border-card transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
