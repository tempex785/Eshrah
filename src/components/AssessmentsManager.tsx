import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Plus, X, Trash2, Edit, FileText, CheckCircle, PlusCircle, Settings, FileSearch } from "lucide-react";
import { cn } from "../lib/utils";

interface Assessment {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_marks: number;
  is_published: boolean;
  course_id: string;
}

interface Question {
  id: string;
  question_text: string;
  marks: number;
  order_index: number;
}

interface Option {
  id: string;
  option_text: string;
  is_correct: boolean;
}

export function AssessmentsManager({ type }: { type: 'exam' | 'homework' }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  const [managingQuestionsFor, setManagingQuestionsFor] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionOptions, setQuestionOptions] = useState<Record<string, Option[]>>({});
  
  // Subjects and Modules for Module Assignment
  const [subjects, setSubjects] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>(['General']);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('General');
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // New Assessment Data
  const [newAssessment, setNewAssessment] = useState({
    title: "", description: "", duration_minutes: 60, total_marks: 100, is_published: false, module_id: ""
  });

  // New Question Data
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionMarks, setNewQuestionMarks] = useState(1);
  const [newOptions, setNewOptions] = useState<{text: string, is_correct: boolean}[]>([
    {text: "", is_correct: true},
    {text: "", is_correct: false}
  ]);

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('academic_year');
      
      if (error) throw error;
      if (data) {
        const uniqueYears = Array.from(new Set(data.map(s => s.academic_year).filter(Boolean))) as string[];
        setAcademicYears(['General', ...uniqueYears]);
      }
    } catch (err) {
      console.error('Error fetching academic years:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedAcademicYear]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchAssessments(selectedCourseId);
      fetchSubjects(selectedCourseId);
    } else {
      setAssessments([]);
      setSubjects([]);
    }
  }, [selectedCourseId, type]);

  const fetchSubjects = async (courseId: string) => {
    try {
      const { data, error } = await supabase.from('course_subjects')
        .select('*, course_modules(*)')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });
        
      if (data) {
        data.forEach(s => {
          if (s.course_modules) {
            s.course_modules.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          }
        });
        setSubjects(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const [payRes, freeRes] = await Promise.all([
        supabase.from('paycourses').select('id, title, semester'),
        supabase.from('freecourses').select('id, title, semester')
      ]);
      let allCourses = [
        ...(payRes.data || []).map(c => ({...c, title: c.title + ' (مدفوعة)'})),
        ...(freeRes.data || []).map(c => ({...c, title: c.title + ' (مجانية)'}))
      ];
      
      if (selectedAcademicYear !== 'General') {
        allCourses = allCourses.filter(c => c.semester === selectedAcademicYear);
      }

      setCourses(allCourses);
      if (allCourses.length > 0) {
        setSelectedCourseId(allCourses[0].id);
      } else {
        setSelectedCourseId("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async (courseId: string) => {
    const { data } = await supabase.from('exams')
      .select('*')
      .eq('course_id', courseId)
      .eq('type', type)
      .order('created_at', { ascending: false });
    if (data) setAssessments(data);
  };

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    try {
      if (editingAssessment) {
        await supabase.from('exams')
          .update({
            title: newAssessment.title,
            description: newAssessment.description,
            duration_minutes: newAssessment.duration_minutes,
            total_marks: newAssessment.total_marks,
            is_published: newAssessment.is_published,
            module_id: newAssessment.module_id || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAssessment.id);
      } else {
        await supabase.from('exams')
          .insert([{
            course_id: selectedCourseId,
            type,
            title: newAssessment.title,
            description: newAssessment.description,
            duration_minutes: newAssessment.duration_minutes,
            total_marks: newAssessment.total_marks,
            is_published: newAssessment.is_published,
            module_id: newAssessment.module_id || null
          }]);
      }
      setIsAssessmentModalOpen(false);
      fetchAssessments(selectedCourseId);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "حدث خطأ");
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if(!confirm("هل أنت متأكد من الحذف؟")) return;
    await supabase.from('exams').delete().eq('id', id);
    fetchAssessments(selectedCourseId);
  };

  const openManageQuestions = async (assessment: Assessment) => {
    setManagingQuestionsFor(assessment);
    fetchQuestions(assessment.id);
  };

  const fetchQuestions = async (assessmentId: string) => {
    const { data: qData } = await supabase.from('questions')
      .select('*').eq('exam_id', assessmentId).order('order_index', { ascending: true });
    
    if (qData) {
      setQuestions(qData);
      const qIds = qData.map(q => q.id);
      if (qIds.length > 0) {
        const { data: oData } = await supabase.from('options')
          .select('*').in('question_id', qIds).order('order_index', { ascending: true });
        
        const optionsMap: Record<string, Option[]> = {};
        qData.forEach(q => optionsMap[q.id] = []);
        if (oData) {
          oData.forEach(o => {
            if(!optionsMap[o.question_id]) optionsMap[o.question_id] = [];
            optionsMap[o.question_id].push(o);
          });
        }
        setQuestionOptions(optionsMap);
      } else {
        setQuestionOptions({});
      }
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingQuestionsFor || !newQuestionText) return;
    
    // validate options
    const validOptions = newOptions.filter(o => o.text.trim() !== "");
    if(validOptions.length < 2) return alert("يجب إضافة خيارين على الأقل");
    if(!validOptions.some(o => o.is_correct)) return alert("يجب تحديد خيار صحيح واحد على الأقل");

    try {
      // 1. insert question
      const { data: qData, error: qErr } = await supabase.from('questions').insert([{
        exam_id: managingQuestionsFor.id,
        question_text: newQuestionText,
        marks: newQuestionMarks,
        order_index: questions.length
      }]).select().single();
      
      if (qErr) throw qErr;

      // 2. insert options
      const optionsToInsert = validOptions.map((o, idx) => ({
        question_id: qData.id,
        option_text: o.text,
        is_correct: o.is_correct,
        order_index: idx
      }));

      await supabase.from('options').insert(optionsToInsert);

      // reset
      setNewQuestionText("");
      setNewQuestionMarks(1);
      setNewOptions([{text: "", is_correct: true}, {text: "", is_correct: false}]);
      
      fetchQuestions(managingQuestionsFor.id);
    } catch(err: any) {
      console.error(err);
      alert(err.message || "حدث خطأ أثناء حفظ السؤال");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    await supabase.from('questions').delete().eq('id', id);
    if(managingQuestionsFor) fetchQuestions(managingQuestionsFor.id);
  };

  if(!managingQuestionsFor) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-text-title">إدارة {type === 'exam' ? 'الامتحانات' : 'الواجبات'}</h2>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-border-input rounded-lg bg-bg-input text-text-main focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full sm:w-auto min-w-[200px] px-4 py-2 border border-border-input rounded-lg bg-bg-input text-text-main focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="" disabled>اختر الدورة</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedCourseId ? (
          <div className="bg-bg-card rounded-2xl border border-border-card p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-text-title">{type === 'exam' ? 'قائمة الامتحانات' : 'قائمة الواجبات'}</h3>
              <button 
                onClick={() => {
                  setEditingAssessment(null);
                  setNewAssessment({title: "", description: "", duration_minutes: 60, total_marks: 100, is_published: false});
                  setSelectedSubjectId("");
                  setIsAssessmentModalOpen(true);
                }}
                className="bg-primary-500 hover:bg-primary-600 transition-colors text-white px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                إضافة جديد
              </button>
            </div>
            
            <div className="space-y-4">
              {assessments.length === 0 ? (
                <p className="text-center text-text-muted py-6">لا يوجد أي عنصر حتى الآن.</p>
              ) : (
                assessments.map(a => (
                  <div key={a.id} className="border border-border-card rounded-xl p-4 bg-bg-main flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-bg-hover">
                     <div>
                       <h4 className="font-bold text-lg text-text-title">{a.title}</h4>
                       <p className="text-sm text-text-muted">{a.description}</p>
                       <div className="flex items-center gap-4 mt-3 text-xs text-text-body">
                         <span className={cn("px-2 py-1 rounded-md", a.is_published ? "bg-success-500/10 text-success-500" : "bg-warning-500/10 text-warning-500")}>
                           {a.is_published ? 'منشور' : 'مسودة'}
                         </span>
                         <span>الوقت: {a.duration_minutes} دقيقة</span>
                         <span>الدرجات: {a.total_marks}</span>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       <button onClick={() => openManageQuestions(a)} className="px-3 py-1.5 bg-primary-500/10 text-primary-500 rounded-lg hover:bg-primary-500/20 text-sm font-semibold flex items-center gap-1 transition-colors">
                         <FileSearch className="w-4 h-4" />
                         الأسئلة
                       </button>
                       <button title="تعديل" onClick={() => {
                         setEditingAssessment(a);
                         setNewAssessment(a);
                         
                         // Find subject id for this module
                         if (a.module_id) {
                           const sub = subjects.find(s => s.course_modules?.some((m: any) => m.id === a.module_id));
                           setSelectedSubjectId(sub ? sub.id : "");
                         } else {
                           setSelectedSubjectId("");
                         }
                         
                         setIsAssessmentModalOpen(true);
                       }} className="p-2 text-text-muted hover:text-primary-500 bg-bg-input rounded-lg transition-colors">
                         <Edit className="w-4 h-4" />
                       </button>
                       <button title="حذف" onClick={() => handleDeleteAssessment(a.id)} className="p-2 text-text-muted hover:text-error-500 bg-bg-input rounded-lg transition-colors">
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-12 text-text-muted bg-bg-card rounded-2xl border border-border-card">يرجى اختيار الدورة لعرض {type === 'exam' ? 'الامتحانات' : 'الواجبات'}</div>
        )}

        {isAssessmentModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-bg-card w-full max-w-md rounded-2xl border border-border-card overflow-hidden">
               <div className="p-4 border-b border-border-card flex justify-between items-center bg-bg-main">
                 <h3 className="font-bold text-lg">{editingAssessment ? 'تعديل' : 'إضافة'}</h3>
                 <button onClick={() => setIsAssessmentModalOpen(false)} className="text-text-muted hover:text-text-title"><X className="w-5 h-5"/></button>
               </div>
               <form onSubmit={handleSaveAssessment} className="p-4 space-y-4">
                 <div>
                   <label className="block text-sm mb-1 font-medium text-text-body">العنوان</label>
                   <input required type="text" value={newAssessment.title} onChange={e=>setNewAssessment({...newAssessment, title:e.target.value})} className="w-full px-3 py-2 border border-border-input rounded-xl bg-bg-input focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-text-main" />
                 </div>
                 <div>
                   <label className="block text-sm mb-1 font-medium text-text-body">الوصف</label>
                   <textarea rows={3} value={newAssessment.description} onChange={e=>setNewAssessment({...newAssessment, description:e.target.value})} className="w-full px-3 py-2 border border-border-input rounded-xl bg-bg-input focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-text-main" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm mb-1 font-medium text-text-body">الوقت (دقيقة)</label>
                     <input type="number" required value={newAssessment.duration_minutes} onChange={e=>setNewAssessment({...newAssessment, duration_minutes:parseInt(e.target.value)})} className="w-full px-3 py-2 border border-border-input rounded-xl bg-bg-input focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-text-main" />
                   </div>
                   <div>
                     <label className="block text-sm mb-1 font-medium text-text-body">إجمالي الدرجات</label>
                     <input type="number" required value={newAssessment.total_marks} onChange={e=>setNewAssessment({...newAssessment, total_marks:parseInt(e.target.value)})} className="w-full px-3 py-2 border border-border-input rounded-xl bg-bg-input focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-text-main" />
                   </div>
                 </div>
                 
                 <div>
                   <div className="flex flex-col sm:flex-row gap-4">
                     <div className="flex-1">
                       <label className="block text-sm mb-1 font-medium text-text-body">المادة (اختياري)</label>
                       <select 
                         value={selectedSubjectId}
                         onChange={(e) => {
                           setSelectedSubjectId(e.target.value);
                           setNewAssessment({...newAssessment, module_id: ""});
                         }}
                         className="w-full px-3 py-2 border border-border-input rounded-xl bg-bg-input focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-text-main"
                       >
                         <option value="">بدون مادة</option>
                         {subjects.map(subject => (
                           <option key={subject.id} value={subject.id}>{subject.name}</option>
                         ))}
                       </select>
                     </div>
                     <div className="flex-1">
                       <label className="block text-sm mb-1 font-medium text-text-body">الوحدة (اختياري)</label>
                       <select 
                         value={newAssessment.module_id || ""}
                         onChange={(e) => setNewAssessment({...newAssessment, module_id: e.target.value})}
                         className="w-full px-3 py-2 border border-border-input rounded-xl bg-bg-input focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-text-main"
                         disabled={!selectedSubjectId}
                       >
                         <option value="">بدون وحدة</option>
                         {selectedSubjectId && subjects.find(s => s.id === selectedSubjectId)?.course_modules?.map((m: any) => (
                           <option key={m.id} value={m.id}>{m.title}</option>
                         ))}
                       </select>
                     </div>
                   </div>
                 </div>

                 <div className="flex items-center gap-2 pt-2 pb-2 bg-bg-input p-3 rounded-xl border border-border-input">
                   <input type="checkbox" id="published" checked={newAssessment.is_published} onChange={e=>setNewAssessment({...newAssessment, is_published:e.target.checked})} className="w-4 h-4 cursor-pointer" />
                   <label htmlFor="published" className="cursor-pointer font-medium text-text-body">نشر للطلاب</label>
                 </div>
                 <div className="pt-4 border-t border-border-card flex gap-4">
                   <button type="submit" className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 transition-colors text-white font-bold rounded-xl">حفظ</button>
                   <button type="button" onClick={() => setIsAssessmentModalOpen(false)} className="px-6 py-2 bg-bg-input font-bold rounded-xl hover:bg-border-card transition-colors">إلغاء</button>
                 </div>
               </form>
             </div>
          </div>
        )}
      </div>
    );
  }

  // QUESTIONS VIEW
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border-card pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setManagingQuestionsFor(null)} className="text-text-muted hover:text-primary-500 font-bold bg-bg-card border border-border-card px-4 py-2 rounded-xl transition-colors">
             &rarr; عودة
          </button>
          <div>
            <h2 className="text-xl font-bold text-text-title">{managingQuestionsFor.title} - الأسئلة</h2>
            <p className="text-sm text-text-muted">قم بإضافة وتعديل أسئلة {type === 'exam' ? 'الامتحان' : 'الواجب'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="col-span-1 xl:col-span-2 space-y-4">
          {questions.length === 0 ? (
            <div className="bg-bg-card border border-border-card rounded-2xl p-12 text-center text-text-muted">
              لم تتم إضافة أي أسئلة بعد
            </div>
          ) : (
            questions.map((q, qIndex) => (
              <div key={q.id} className="bg-bg-card border border-border-card rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-start">
                    <span className="font-bold text-primary-500 text-lg">{qIndex + 1}.</span>
                    <h4 className="font-semibold text-text-title whitespace-pre-wrap text-lg leading-relaxed">{q.question_text}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold bg-bg-input border border-border-input px-2 py-1 rounded-md">{q.marks} درجات</span>
                    <button title="حذف السؤال" onClick={() => handleDeleteQuestion(q.id)} className="text-text-muted hover:text-error-500 bg-bg-input p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
                <div className="space-y-2 pr-6 border-r-2 border-border-card mr-2">
                  {questionOptions[q.id]?.map((opt, i) => (
                    <div key={opt.id} className={cn("p-3 rounded-xl text-sm border flex items-center justify-between max-w-2xl font-medium", opt.is_correct ? "bg-success-500/10 border-success-500/30 text-success-700" : "bg-bg-input border-border-input text-text-body")}>
                      <span className="mr-2">{opt.option_text}</span>
                      {opt.is_correct && <CheckCircle className="w-5 h-5 text-success-500 ml-2" />}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="col-span-1">
          <div className="border border-border-card rounded-2xl bg-bg-card p-6 h-fit sticky top-6 shadow-sm">
            <h3 className="font-bold text-lg border-b border-border-card pb-4 mb-4">إضافة سؤال جديد</h3>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-text-body">نص السؤال</label>
                <textarea required rows={4} value={newQuestionText} onChange={e=>setNewQuestionText(e.target.value)} className="w-full px-4 py-3 bg-bg-input border border-border-input rounded-xl text-text-main resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" placeholder="اكتب السؤال هنا..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-text-body">الدرجات</label>
                <input type="number" min="1" required value={newQuestionMarks} onChange={e=>setNewQuestionMarks(parseInt(e.target.value))} className="w-full px-4 py-2 bg-bg-input border border-border-input rounded-xl text-text-main focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" />
              </div>
              
              <div className="pt-4 border-t border-border-card">
                <label className="block text-sm font-bold mb-3 text-text-title">الخيارات</label>
                <div className="space-y-3">
                  {newOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="correct_option" 
                          checked={opt.is_correct} 
                          title="تحديد كإجابة صحيحة"
                          className="w-5 h-5 cursor-pointer accent-success-500"
                          onChange={() => {
                            const next = [...newOptions].map((o, i) => ({...o, is_correct: i === idx}));
                            setNewOptions(next);
                          }} 
                        />
                      </div>
                      <input 
                        type="text" 
                        required 
                        value={opt.text} 
                        onChange={e => {
                          const next = [...newOptions];
                          next[idx].text = e.target.value;
                          setNewOptions(next);
                        }}
                        className="flex-1 px-4 py-2.5 bg-bg-input border border-border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" 
                        placeholder={`خيار ${idx + 1}`}
                      />
                      {newOptions.length > 2 && (
                        <button type="button" onClick={() => setNewOptions(newOptions.filter((_, i) => i !== idx))} className="p-2 text-text-muted hover:text-error-500 bg-bg-main border border-border-card rounded-lg transition-colors"><X className="w-4 h-4"/></button>
                      )}
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  onClick={() => setNewOptions([...newOptions, {text: "", is_correct: false}])}
                  className="mt-4 text-sm text-primary-500 font-bold bg-primary-500/10 px-4 py-2 rounded-xl flex items-center justify-center gap-2 w-full hover:bg-primary-500/20 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" /> إضافة خيار
                </button>
              </div>
              
              <button type="submit" className="w-full py-3 bg-primary-500 hover:bg-primary-600 transition-colors text-white font-bold rounded-xl mt-6">
                حفظ وإضافة السؤال
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
