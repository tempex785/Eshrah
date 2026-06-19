-- Run this script in your Supabase SQL editor to create the necessary tables and insert dummy data.

-- 0. Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.admins (email) VALUES 
('admin@academy.com'),
('tempex785@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 1. Students Table
CREATE TABLE IF NOT EXISTS public.students (
  id uuid references auth.users not null primary key,
  first_name text,
  last_name text,
  phone text unique,
  parent_phone text,
  gender text,
  governorate text,
  college_name text,
  academic_year text,
  address_detailed text,
  how_did_you_know text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.students enable row level security;

-- Create policies
create policy "Users can view their own profile."
  on public.students for select
  using ( auth.uid() = id );

create policy "Users can update their own profile."
  on public.students for update
  using ( auth.uid() = id );

-- Create a policy allowing authenticated users to insert their profile upon registration
create policy "Users can insert their own profile."
  on public.students for insert
  with check ( auth.uid() = id );

-- Allow admins to view all profiles
create policy "Admins can view all profiles."
  on public.students for select
  using ( exists (select 1 from public.admins where email = (select email from auth.users where id = auth.uid())) );


-- 2. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    gradient TEXT,
    description TEXT,
    instructor TEXT,
    rating NUMERIC,
    duration TEXT,
    lessons NUMERIC,
    students NUMERIC,
    price NUMERIC
);

-- 3. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    initial TEXT,
    course TEXT,
    plan TEXT,
    plan_color TEXT,
    start_date TEXT,
    end_date TEXT,
    progress NUMERIC,
    amount TEXT,
    status TEXT,
    status_color TEXT
);

-- 4. Exams Table (New Schema based on user request)
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID, -- References paycourses or freecourses loosely
    module_id UUID, -- Loosely references course_modules
    type VARCHAR(50) DEFAULT 'exam', -- 'exam' or 'homework'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_marks INTEGER NOT NULL DEFAULT 100,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student TEXT NOT NULL,
    course TEXT,
    date TEXT,
    grade TEXT,
    grade_color TEXT,
    active BOOLEAN DEFAULT false
);

-- 6. Revenue Details Table
CREATE TABLE IF NOT EXISTS public.revenue_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month TEXT NOT NULL,
    year TEXT NOT NULL,
    subscriptions TEXT,
    refunds TEXT,
    net_revenue TEXT,
    new_students NUMERIC
);

INSERT INTO public.revenue_details (month, year, subscriptions, refunds, net_revenue, new_students) VALUES
('يناير', '2024', '23,124', '-1,013', '22,111', 19),
('فبراير', '2024', '20,102', '-594', '19,508', 11),
('مارس', '2024', '22,008', '-716', '21,292', 14);

INSERT INTO public.courses (title, category, gradient, description, instructor, rating, duration, lessons, students, price) VALUES
('دورة التسويق الرقمي', 'تسويق', 'bg-gradient-to-br from-cyan-600 to-blue-900', 'احترف التسويق عبر منصات التواصل الاجتماعي وإعلانات جوجل', 'د. نورة السعيد', 4.7, '35 ساعة', 10, 189, 699),
('دورة البرمجة للمبتدئين', 'برمجة', 'bg-gradient-to-br from-violet-600 to-purple-900', 'ابدأ رحلتك في عالم البرمجة مع Python وتعلم أساسيات التفكير المنطقي', 'م. أحمد الخالد', 4.9, '60 ساعة', 18, 234, 799),
('دورة تصميم الجرافيك', 'تصميم', 'bg-gradient-to-br from-rose-600 to-rose-900', 'تعلم أساسيات التصميم الجرافيكي باستخدام أدوات احترافية مثل فوتوشوب...', 'أ. سارة الأحمد', 4.8, '40 ساعة', 12, 156, 599);

INSERT INTO public.subscriptions (name, initial, course, plan, plan_color, start_date, end_date, progress, amount, status, status_color) VALUES
('سارة أحمد العتيبي', 'س', 'دورة تحليل البيانات', 'شهري', 'text-info-500 bg-info-500/10 border-info-500/20', '2026/3/10', '2026/4/9', 41, '749 ر.س', 'نشط', 'text-success-500 bg-success-500/10 border-success-500/20'),
('ديما خالد الهاشمي', 'د', 'دورة تطوير تطبيقات الموبايل', 'ربع سنوي', 'text-warning-500 bg-warning-500/10 border-warning-500/20', '2026/3/26', '2026/6/24', 13, '1,499 ر.س', 'منتهي', 'text-red-500 bg-red-500/10 border-red-500/20'),
('نورة سعيد الحربي', 'ن', 'دورة تطوير تطبيقات الويب', 'سنوي', 'text-primary-500 bg-primary-500/10 border-primary-500/20', '2026/1/1', '2027/1/1', 85, '2,999 ر.س', 'نشط', 'text-success-500 bg-success-500/10 border-success-500/20');



INSERT INTO public.certificates (student, course, date, grade, grade_color, active) VALUES
('أحمد محمد علي', 'دورة البرمجة للمبتدئين', '2026/4/3', 'ممتاز', 'text-success-500 bg-success-500/10', true),
('فاطمة حسن إبراهيم', 'دورة التصوير الفوتوغرافي', '2026/6/11', 'جيد جداً', 'text-warning-500 bg-warning-500/10', false),
('محمد عبدالله السيد', 'دورة إدارة المشاريع', '2026/4/2', 'جيد', 'text-info-500 bg-info-500/10', false);

-- 7. Row Level Security (RLS) setup
-- 8. Top Students Table
CREATE TABLE IF NOT EXISTS public.top_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    emoji TEXT,
    score NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies For Top Students
ALTER TABLE public.top_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to top students" ON public.top_students FOR ALL TO authenticated USING (public.is_admin());

-- 9. Pay Courses Table
CREATE TABLE IF NOT EXISTS public.paycourses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price TEXT,
    image_url TEXT,
    semester TEXT,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE
);

INSERT INTO public.paycourses (title, description, price, image_url, semester, features)
VALUES 
('كورس المناعة', 'شرح المناعة بالتفصيل', '250', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop', 'Semester 1', '["شرح وافي ومبسط لكل دروس الباب.", "ملزمة pdf لكل درس تحتوي على كل التفاصيل.", "بنك أسئلة مجاب عنه لتطبيق ما درسته."]'),
('كورس الهرمونات', 'شرح الهرمونات', '200', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop', 'Semester 1', '["شرح شامل لتنظيم الهرمونات في جسم الإنسان.", "مذكرة مراجعة نهائية لكل فصل.", "أسئلة تفاعلية بعد كل فيديو."]');

-- 10. Free Courses Table
CREATE TABLE IF NOT EXISTS public.freecourses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    semester TEXT NOT NULL,
    features TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE
);

INSERT INTO public.freecourses (title, description, image_url, semester, features)
VALUES 
('كورس التكاثر المجاني', 'مقدمة في التكاثر', 'https://images.unsplash.com/photo-1549643276-fbc2d8ce01df?q=80&w=800&auto=format&fit=crop', 'Semester 2', '{"شرح مبسط ومجاني", "أسئلة محلولة", "خطة مذاكرة"}');

-- 11. Study Levels Table
CREATE TABLE IF NOT EXISTS public.study_levels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

INSERT INTO public.study_levels (name, image_url, description) VALUES 
('الفرقة الأولى', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop', 'معلومات تفصيلية عن المرحلة الأولى'),
('الفرقة الثانية', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=800&auto=format&fit=crop', 'معلومات تفصيلية عن المرحلة الثانية'),
('الفرقة الثالثة', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop', 'معلومات تفصيلية عن المرحلة الثالثة'),
('الفرقة الرابعة', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=800&auto=format&fit=crop', 'معلومات تفصيلية عن المرحلة الرابعة'),
('الفرقة الخامسة', 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=800&auto=format&fit=crop', 'معلومات تفصيلية عن المرحلة الخامسة')
ON CONFLICT (name) DO NOTHING;

-- ENABLE RLS on all tables
ALTER TABLE public.study_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freecourses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paycourses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_details ENABLE ROW LEVEL SECURITY;

-- Helper Function to Check Admin Status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE email = (auth.jwt() ->> 'email')::text
  );
$$;

-- RLS Policies For Admins
-- Add policy to allow admins to read all admins (or themselves)
-- Without recursion because function is SECURITY DEFINER
CREATE POLICY "Admins can view admins" ON public.admins FOR SELECT TO authenticated USING (public.is_admin() OR email = (auth.jwt() ->> 'email')::text);
CREATE POLICY "Admins can update admins" ON public.admins FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete admins" ON public.admins FOR DELETE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert admins" ON public.admins FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- RLS Policies For Students
CREATE POLICY "Admins have full access to students" ON public.students FOR ALL TO authenticated USING (public.is_admin());

-- RLS Policies For Courses
CREATE POLICY "Admins have full access to courses" ON public.courses FOR ALL TO authenticated USING (public.is_admin());

-- RLS Policies For Subscriptions
CREATE POLICY "Admins have full access to subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (public.is_admin());

-- RLS Policies For Exams
CREATE POLICY "Admins have full access to exams" ON public.exams FOR ALL TO authenticated USING (public.is_admin());

-- RLS Policies For Certificates
CREATE POLICY "Admins have full access to certificates" ON public.certificates FOR ALL TO authenticated USING (public.is_admin());

-- RLS Policies For Paycourses
CREATE POLICY "Admins have full access to paycourses" ON public.paycourses FOR ALL TO authenticated USING (public.is_admin());

-- RLS Policies For Freecourses
CREATE POLICY "Admins have full access to freecourses" ON public.freecourses FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Allow public read access to freecourses" ON public.freecourses FOR SELECT USING (true);

-- RLS Policies For Study Levels
CREATE POLICY "Admins have full access to study_levels" ON public.study_levels FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Allow public read access to study_levels" ON public.study_levels FOR SELECT USING (true);

-- RLS Policies For Revenue Details
CREATE POLICY "Admins have full access to revenue details" ON public.revenue_details FOR ALL TO authenticated USING (public.is_admin());

-- 12. Course Subjects
CREATE TABLE IF NOT EXISTS public.course_subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon_name TEXT DEFAULT 'FileText',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.course_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to course_subjects" ON public.course_subjects FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Allow public read access to course_subjects" ON public.course_subjects FOR SELECT USING (true);


-- 13. Course Modules
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.course_subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT,
  items JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to course_modules" ON public.course_modules FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Allow public read access to course_modules" ON public.course_modules FOR SELECT USING (true);


-- 14. Course Assessments (Exams & Homeworks)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    image_url TEXT,
    marks INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER DEFAULT 0,
    UNIQUE(user_id, exam_id)
);

CREATE TABLE IF NOT EXISTS public.student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.options(id) ON DELETE SET NULL,
    UNIQUE(attempt_id, question_id)
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to exams" ON public.exams FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins have full access to questions" ON public.questions FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins have full access to options" ON public.options FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins have full access to exam_attempts" ON public.exam_attempts FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Admins have full access to student_answers" ON public.student_answers FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow public read access to exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Allow public read access to questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow public read access to options" ON public.options FOR SELECT USING (true);

-- Student policies for attempts and answers
CREATE POLICY "Users can view their own attempts" ON public.exam_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own attempts" ON public.exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own attempts" ON public.exam_attempts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can see own answers" ON public.student_answers FOR SELECT USING (attempt_id IN (SELECT id FROM public.exam_attempts WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own answers" ON public.student_answers FOR INSERT WITH CHECK (attempt_id IN (SELECT id FROM public.exam_attempts WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own answers" ON public.student_answers FOR UPDATE USING (attempt_id IN (SELECT id FROM public.exam_attempts WHERE user_id = auth.uid()));

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 15. Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to alerts" ON public.alerts FOR ALL TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "Anyone can read active alerts" ON public.alerts;
CREATE POLICY "Students can read their active alerts" ON public.alerts 
FOR SELECT 
USING (
  is_active = true 
  AND 
  (
    academic_year = 'General' 
    OR 
    academic_year = (SELECT academic_year FROM public.students WHERE id = auth.uid())
  )
);

-- 16. Admin Notifications Table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to admin_notifications" ON public.admin_notifications FOR ALL TO authenticated USING (public.is_admin());

-- Database Triggers for Admin Notifications
CREATE OR REPLACE FUNCTION public.create_admin_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'students' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('تسجيل طالب جديد', 'تم تسجيل طالب جديد: ' || NEW.name, 'success');
        END IF;
    ELSIF TG_TABLE_NAME = 'subscriptions' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('اشتراك جديد', 'تم تسجيل اشتراك جديد في دورة: ' || COALESCE(NEW.course, 'غير معروف'), 'info');
        END IF;
    ELSIF TG_TABLE_NAME = 'certificates' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('إصدار شهادة', 'تم إصدار شهادة للطالب: ' || COALESCE(NEW.student, 'غير معروف'), 'success');
        END IF;
    ELSIF TG_TABLE_NAME = 'exam_attempts' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('بدء اختبار', 'طالب بدأ محاولة اختبار جديدة', 'info');
        ELSIF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('إكمال اختبار', 'طالب أكمل اختبار بنتيجة: ' || COALESCE(NEW.score::text, '0'), 'success');
        END IF;
    ELSIF TG_TABLE_NAME = 'courses' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('دورة جديدة', 'تمت إضافة دورة جديدة: ' || NEW.name, 'success');
        ELSIF TG_OP = 'UPDATE' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('تحديث دورة', 'تم تحديث بيانات الدورة: ' || NEW.name, 'info');
        ELSIF TG_OP = 'DELETE' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('حذف دورة', 'تم حذف الدورة: ' || OLD.name, 'warning');
            RETURN OLD;
        END IF;
    ELSIF TG_TABLE_NAME = 'exams' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('اختبار جديد', 'تمت إضافة اختبار جديد: ' || NEW.title, 'success');
        ELSIF TG_OP = 'UPDATE' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('تحديث اختبار', 'تم تحديث الاختبار: ' || NEW.title, 'info');
        ELSIF TG_OP = 'DELETE' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('حذف اختبار', 'تم حذف الاختبار: ' || OLD.title, 'warning');
            RETURN OLD;
        END IF;
    ELSIF TG_TABLE_NAME = 'alerts' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('تنبيه جديد', 'تمت إضافة تنبيه جديد: ' || NEW.title, 'success');
        ELSIF TG_OP = 'UPDATE' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('تحديث تنبيه', 'تم تحديث التنبيه: ' || NEW.title, 'info');
        ELSIF TG_OP = 'DELETE' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('حذف تنبيه', 'تم حذف التنبيه: ' || OLD.title, 'warning');
            RETURN OLD;
        END IF;
    ELSIF TG_TABLE_NAME = 'freecourses' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('دورة مجانية جديدة', 'تمت إضافة دورة مجانية جديدة: ' || NEW.name, 'success');
        ELSIF TG_OP = 'DELETE' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('حذف دورة مجانية', 'تم حذف الدورة المجانية: ' || OLD.name, 'warning');
            RETURN OLD;
        END IF;
    ELSIF TG_TABLE_NAME = 'paycourses' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('دورة مدفوعة جديدة', 'تمت إضافة دورة مدفوعة جديدة: ' || NEW.name, 'success');
        ELSIF TG_OP = 'DELETE' THEN
            INSERT INTO public.admin_notifications (title, message, type)
            VALUES ('حذف دورة مدفوعة', 'تم حذف الدورة المدفوعة: ' || OLD.name, 'warning');
            RETURN OLD;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
DROP TRIGGER IF EXISTS on_student_added ON public.students;
CREATE TRIGGER on_student_added
    AFTER INSERT ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification();
    
DROP TRIGGER IF EXISTS on_subscription_added ON public.subscriptions;
CREATE TRIGGER on_subscription_added
    AFTER INSERT ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification();

DROP TRIGGER IF EXISTS on_certificate_added ON public.certificates;
CREATE TRIGGER on_certificate_added
    AFTER INSERT ON public.certificates
    FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification();
    
DROP TRIGGER IF EXISTS on_exam_attempt_change ON public.exam_attempts;
CREATE TRIGGER on_exam_attempt_change
    AFTER INSERT OR UPDATE ON public.exam_attempts
    FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification();
    
DROP TRIGGER IF EXISTS on_courses_change ON public.courses;
CREATE TRIGGER on_courses_change
    AFTER INSERT OR UPDATE OR DELETE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification();

DROP TRIGGER IF EXISTS on_exams_change ON public.exams;
CREATE TRIGGER on_exams_change
    AFTER INSERT OR UPDATE OR DELETE ON public.exams
    FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification();

DROP TRIGGER IF EXISTS on_alerts_change ON public.alerts;
CREATE TRIGGER on_alerts_change
    AFTER INSERT OR UPDATE OR DELETE ON public.alerts
    FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification();

DROP TRIGGER IF EXISTS on_freecourses_change ON public.freecourses;
CREATE TRIGGER on_freecourses_change
    AFTER INSERT OR UPDATE OR DELETE ON public.freecourses
    FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification();

DROP TRIGGER IF EXISTS on_paycourses_change ON public.paycourses;
CREATE TRIGGER on_paycourses_change
    AFTER INSERT OR UPDATE OR DELETE ON public.paycourses
    FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification();

