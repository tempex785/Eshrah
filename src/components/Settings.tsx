import { Database, AlertCircle, Trash2, RefreshCw, Info } from "lucide-react";

export function Settings() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* System Settings Header Card */}
      <div className="p-6 bg-bg-card border border-border-card rounded-3xl">
        <h2 className="text-xl font-bold text-text-title mb-2">إعدادات النظام</h2>
        <p className="text-text-muted">إدارة إعدادات النظام والبيانات</p>
      </div>

      {/* Data Management Section */}
      <div className="p-6 bg-bg-card border border-border-card rounded-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-primary-400" />
          <h3 className="text-xl font-bold text-text-title">إدارة البيانات</h3>
        </div>

        {/* Info Alert */}
        <div className="flex items-start gap-4 p-5 bg-warning-500/10 border border-warning-500/20 rounded-2xl">
          <AlertCircle className="w-6 h-6 text-warning-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-warning-500 font-bold mb-1">ملاحظة هامة</h4>
            <p className="text-warning-500/80 text-sm leading-relaxed">
              البيانات الحالية هي بيانات تجريبية لأغراض العرض. يمكنك مسحها والبدء من جديد أو إعادة تحميلها.
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reload Data Card */}
          <div className="p-6 bg-bg-hover border border-border-card rounded-2xl flex flex-col items-center text-center gap-4 hover:border-primary-500/30 transition-colors">
            <div className="w-14 h-14 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-text-title font-bold text-lg mb-1">إعادة تحميل البيانات</h4>
              <p className="text-text-muted text-sm">استعادة البيانات التجريبية</p>
            </div>
            <button className="w-full mt-2 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-3 rounded-xl font-medium transition-colors">
              <RefreshCw className="w-5 h-5" />
              <span>إعادة تحميل البيانات</span>
            </button>
          </div>

          {/* Delete Data Card */}
          <div className="p-6 bg-bg-hover border border-border-card rounded-2xl flex flex-col items-center text-center gap-4 hover:border-red-500/30 transition-colors">
            <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-text-title font-bold text-lg mb-1">مسح البيانات التجريبية</h4>
              <p className="text-text-muted text-sm">حذف جميع البيانات والبدء من جديد</p>
            </div>
            <button className="w-full mt-2 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl font-medium transition-colors">
              <Trash2 className="w-5 h-5" />
              <span>مسح البيانات التجريبية</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Information Section */}
      <div className="p-6 bg-bg-card border border-border-card rounded-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-primary-400" />
          <h3 className="text-xl font-bold text-text-title">معلومات النظام</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-bg-hover border border-border-card rounded-2xl flex flex-col items-end gap-1">
            <span className="text-text-muted text-sm">اسم النظام</span>
            <span className="text-text-title font-bold text-lg">إشرحــ طب</span>
          </div>
          <div className="p-5 bg-bg-hover border border-border-card rounded-2xl flex flex-col items-end gap-1">
            <span className="text-text-muted text-sm">الإصدار</span>
            <span className="text-text-title font-bold text-lg">1.0.0</span>
          </div>
          <div className="p-5 bg-bg-hover border border-border-card rounded-2xl flex flex-col items-end gap-1">
            <span className="text-text-muted text-sm">قاعدة البيانات</span>
            <span className="text-text-title font-bold text-lg">Supabase</span>
          </div>
          <div className="p-5 bg-bg-hover border border-border-card rounded-2xl flex flex-col items-end gap-1">
            <span className="text-text-muted text-sm">اللغة</span>
            <span className="text-text-title font-bold text-lg">العربية (RTL)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
