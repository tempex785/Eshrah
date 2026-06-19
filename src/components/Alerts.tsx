import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Alert {
  id: string;
  academic_year: string;
  title: string;
  message: string;
  is_active: boolean;
  created_at: string;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  const [newAlert, setNewAlert] = useState({
    academic_year: 'General',
    title: '',
    message: '',
    is_active: true
  });

  const [academicYears, setAcademicYears] = useState<string[]>(['General']);

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
    fetchAlerts();
    fetchAcademicYears();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setAlerts(data);
    } catch (err: any) {
      console.error('Error fetching alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAlert) {
        const { error } = await supabase
          .from('alerts')
          .update({
            academic_year: newAlert.academic_year,
            title: newAlert.title,
            message: newAlert.message,
            is_active: newAlert.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAlert.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('alerts')
          .insert([{
            academic_year: newAlert.academic_year,
            title: newAlert.title,
            message: newAlert.message,
            is_active: newAlert.is_active
          }]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchAlerts();
    } catch (err: any) {
      console.error('Error saving alert:', err);
      alert(err.message || 'حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التنبيه؟')) return;
    try {
      const { error } = await supabase.from('alerts').delete().eq('id', id);
      if (error) throw error;
      fetchAlerts();
    } catch (err: any) {
      console.error('Error deleting alert:', err);
      alert(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const handleToggleActive = async (alert: Alert) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_active: !alert.is_active })
        .eq('id', alert.id);

      if (error) throw error;
      fetchAlerts();
    } catch (err: any) {
      console.error('Error toggling alert status:', err);
    }
  };

  const openNewModal = () => {
    setEditingAlert(null);
    setNewAlert({
      academic_year: 'General',
      title: '',
      message: '',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (alert: Alert) => {
    setEditingAlert(alert);
    setNewAlert({
      academic_year: alert.academic_year,
      title: alert.title,
      message: alert.message,
      is_active: alert.is_active
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-main mb-2">التنبيهات والإعلانات</h2>
          <p className="text-text-body">إدارة التنبيهات المعروضة للطلاب حسب السنة الدراسية</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة تنبيه</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-text-body">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-bg-card border border-border-strong rounded-2xl p-6 shadow-sm flex flex-col items-start gap-4 hover:border-primary-500/50 transition-colors">
              <div className="flex items-start justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center \${alert.is_active ? 'bg-primary-500/10 text-primary-500' : 'bg-gray-500/10 text-gray-500'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-text-main">{alert.title}</h3>
                    <span className="text-xs font-medium px-2 py-1 bg-bg-input text-text-body rounded-lg">
                      {alert.academic_year}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleActive(alert)}
                  title={alert.is_active ? "تعطيل" : "تفعيل"}
                >
                  {alert.is_active ? (
                    <CheckCircle className="w-6 h-6 text-success-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              </div>
              
              <p className="text-text-body text-sm line-clamp-3">
                {alert.message}
              </p>
              
              <div className="w-full flex justify-end gap-2 mt-auto pt-4 border-t border-border-input">
                <button
                  onClick={() => openEditModal(alert)}
                  className="p-2 text-primary-500 hover:bg-primary-500/10 rounded-xl transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          
          {alerts.length === 0 && (
            <div className="col-span-fulltext-center py-12 text-text-body">
              لا توجد تنبيهات حالياً.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card w-full max-w-md rounded-2xl p-6 border border-border-strong shadow-xl">
            <h3 className="text-xl font-bold text-text-main mb-6">
              {editingAlert ? 'تعديل التنبيه' : 'إضافة تنبيه جديد'}
            </h3>
            
            <form onSubmit={handleSaveAlert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-body mb-2">السنة الدراسية</label>
                <select
                  required
                  value={newAlert.academic_year}
                  onChange={e => setNewAlert({...newAlert, academic_year: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl bg-bg-input border border-border-input text-text-main focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-body mb-2">عنوان التنبيه</label>
                <input
                  required
                  type="text"
                  value={newAlert.title}
                  onChange={e => setNewAlert({...newAlert, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl bg-bg-input border border-border-input text-text-main focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-body mb-2">نص التنبيه</label>
                <textarea
                  required
                  rows={4}
                  value={newAlert.message}
                  onChange={e => setNewAlert({...newAlert, message: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl bg-bg-input border border-border-input text-text-main focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              
              <div className="flex items-center gap-2 pt-2 pb-2 bg-bg-input p-3 rounded-xl border border-border-input">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={newAlert.is_active} 
                  onChange={e => setNewAlert({...newAlert, is_active: e.target.checked})} 
                  className="w-4 h-4 cursor-pointer" 
                />
                <label htmlFor="isActive" className="cursor-pointer font-medium text-text-body">تفعيل التنبيه فوراً</label>
              </div>

              <div className="flex gap-4 mt-6 pt-4 border-t border-border-input">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-bold bg-bg-input text-text-main hover:bg-border-input transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl font-bold bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
