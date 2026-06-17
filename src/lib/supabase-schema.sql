-- Run this script in your Supabase SQL editor to create the necessary tables and insert dummy data.

-- 0. Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.admins (email) VALUES ('admin@academy.com') ON CONFLICT (email) DO NOTHING;

-- 1. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    date TEXT,
    progress NUMERIC,
    status TEXT,
    initial TEXT
);

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

-- 4. Exams Table
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    initial TEXT,
    course TEXT,
    exam TEXT,
    score NUMERIC,
    duration TEXT,
    date TEXT,
    status TEXT,
    status_color TEXT
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
INSERT INTO public.students (name, email, phone, date, progress, status, initial) VALUES
('أحمد محمد علي', 'student1@academy.com', '0574035495', '2026/1/9', 35, 'نشط', 'أ'),
('فاطمة حسن إبراهيم', 'student2@academy.com', '0579127893', '2026/5/16', 91, 'نشط', 'ف'),
('محمد عبدالله السيد', 'student3@academy.com', '0573229813', '2026/4/5', 82, 'نشط', 'م'),
('نورة سعيد الحربي', 'student4@academy.com', '0552744379', '2026/3/10', 25, 'نشط', 'ن'),
('عبدالله سالم الشمري', 'student5@academy.com', '0538561278', '2026/2/8', 58, 'نشط', 'ع');

INSERT INTO public.courses (title, category, gradient, description, instructor, rating, duration, lessons, students, price) VALUES
('دورة التسويق الرقمي', 'تسويق', 'bg-gradient-to-br from-cyan-600 to-blue-900', 'احترف التسويق عبر منصات التواصل الاجتماعي وإعلانات جوجل', 'د. نورة السعيد', 4.7, '35 ساعة', 10, 189, 699),
('دورة البرمجة للمبتدئين', 'برمجة', 'bg-gradient-to-br from-violet-600 to-purple-900', 'ابدأ رحلتك في عالم البرمجة مع Python وتعلم أساسيات التفكير المنطقي', 'م. أحمد الخالد', 4.9, '60 ساعة', 18, 234, 799),
('دورة تصميم الجرافيك', 'تصميم', 'bg-gradient-to-br from-rose-600 to-rose-900', 'تعلم أساسيات التصميم الجرافيكي باستخدام أدوات احترافية مثل فوتوشوب...', 'أ. سارة الأحمد', 4.8, '40 ساعة', 12, 156, 599);

INSERT INTO public.subscriptions (name, initial, course, plan, plan_color, start_date, end_date, progress, amount, status, status_color) VALUES
('سارة أحمد العتيبي', 'س', 'دورة تحليل البيانات', 'شهري', 'text-info-500 bg-info-500/10 border-info-500/20', '2026/3/10', '2026/4/9', 41, '749 ر.س', 'نشط', 'text-success-500 bg-success-500/10 border-success-500/20'),
('ديما خالد الهاشمي', 'د', 'دورة تطوير تطبيقات الموبايل', 'ربع سنوي', 'text-warning-500 bg-warning-500/10 border-warning-500/20', '2026/3/26', '2026/6/24', 13, '1,499 ر.س', 'منتهي', 'text-red-500 bg-red-500/10 border-red-500/20'),
('نورة سعيد الحربي', 'ن', 'دورة تطوير تطبيقات الويب', 'سنوي', 'text-primary-500 bg-primary-500/10 border-primary-500/20', '2026/1/1', '2027/1/1', 85, '2,999 ر.س', 'نشط', 'text-success-500 bg-success-500/10 border-success-500/20');

INSERT INTO public.exams (name, initial, course, exam, score, duration, date, status, status_color) VALUES
('نايف سعود الأحمدي', 'ن', 'دورة البرمجة للمبتدئين', 'الاختبار النهائي - الوحدة الأولى', 79, '56 دقيقة', '2026/5/19', 'ناجح', 'text-success-500 bg-success-500/10 border-success-500/20'),
('خالد عمر الشمري', 'خ', 'دورة تصميم الجرافيك', 'الاختبار النهائي - الوحدة الثانية', 78, '82 دقيقة', '2026/5/30', 'ناجح', 'text-success-500 bg-success-500/10 border-success-500/20'),
('تركي عبدالله السبيعي', 'ت', 'دورة البرمجة للمبتدئين', 'الاختبار النهائي - الوحدة الثالثة', 98, '44 دقيقة', '2026/4/28', 'ناجح', 'text-success-500 bg-success-500/10 border-success-500/20');

INSERT INTO public.certificates (student, course, date, grade, grade_color, active) VALUES
('أحمد محمد علي', 'دورة البرمجة للمبتدئين', '2026/4/3', 'ممتاز', 'text-success-500 bg-success-500/10', true),
('فاطمة حسن إبراهيم', 'دورة التصوير الفوتوغرافي', '2026/6/11', 'جيد جداً', 'text-warning-500 bg-warning-500/10', false),
('محمد عبدالله السيد', 'دورة إدارة المشاريع', '2026/4/2', 'جيد', 'text-info-500 bg-info-500/10', false);
