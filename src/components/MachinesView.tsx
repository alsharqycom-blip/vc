import React, { useState } from 'react';
import { Wrench, Plus, Trash2, Edit2, AlertTriangle, CheckCircle, Clock, Calendar, X, AlertCircle } from 'lucide-react';
import { Machine, User } from '../types';
import { getMachines, saveMachines, addMachine, updateMachine, deleteMachine } from '../lib/storage';
import { useToast } from './Toast';

interface MachinesViewProps {
  currentUser: User;
}

export default function MachinesView({ currentUser }: MachinesViewProps) {
  const { showToast } = useToast();
  const [machines, setMachines] = useState<Machine[]>(() => getMachines());
  const [searchQuery, setSearchQuery] = useState('');
  const currentUserEmail = currentUser.email;
  const canManage = currentUser.role === 'admin' || currentUser.permissions?.includes('manage_machines') || currentUser.permissions?.includes('all');
  
  // Modals / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState('');
  const [periodMonths, setPeriodMonths] = useState(3);
  const [status, setStatus] = useState<'working' | 'maintenance_due' | 'under_maintenance'>('working');
  const [notes, setNotes] = useState('');

  const refreshList = () => {
    setMachines(getMachines());
  };

  const handleOpenAdd = () => {
    setEditingMachine(null);
    setName('');
    setModel('');
    const todayStr = new Date().toISOString().split('T')[0];
    setLastMaintenanceDate(todayStr);
    setPeriodMonths(3);
    setStatus('working');
    setNotes('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (m: Machine) => {
    setEditingMachine(m);
    setName(m.name);
    setModel(m.model);
    setLastMaintenanceDate(m.lastMaintenanceDate);
    setPeriodMonths(m.periodMonths);
    setStatus(m.status);
    setNotes(m.notes || '');
    setIsFormOpen(true);
  };

  const calculateNextDate = (lastDateStr: string, months: number): string => {
    if (!lastDateStr) return '';
    const date = new Date(lastDateStr);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !model.trim() || !lastMaintenanceDate) {
      showToast('يرجى ملء الحقول الإلزامية الاسم والموديل وتاريخ آخر صيانة.', 'error');
      return;
    }

    const nextDate = calculateNextDate(lastMaintenanceDate, periodMonths);
    
    // Auto-evaluate status if working but nextDate is past today
    let finalStatus = status;
    const todayStr = new Date().toISOString().split('T')[0];
    if (status === 'working' && nextDate < todayStr) {
      finalStatus = 'maintenance_due';
    }

    if (editingMachine) {
      const updated: Machine = {
        ...editingMachine,
        name,
        model,
        lastMaintenanceDate,
        nextMaintenanceDate: nextDate,
        periodMonths,
        status: finalStatus,
        notes
      };
      updateMachine(updated, currentUserEmail);
      showToast(`تم تحديث بيانات المعدة: ${name} بنجاح`, 'success');
    } else {
      const newMac: Omit<Machine, 'id'> = {
        name,
        model,
        lastMaintenanceDate,
        nextMaintenanceDate: nextDate,
        periodMonths,
        status: finalStatus,
        notes
      };
      addMachine(newMac, currentUserEmail);
      showToast(`تم تسجيل المعدة الجديدة: ${name} بنجاح`, 'success');
    }

    setIsFormOpen(false);
    refreshList();
  };

  const handleDelete = (id: string, macName: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف المعدة [${macName}] نهائياً من المصنع؟`)) {
      deleteMachine(id, currentUserEmail);
      showToast(`تم حذف المعدة [${macName}] بنجاح`, 'info');
      refreshList();
    }
  };

  const handleMarkMaintained = (m: Machine) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nextDate = calculateNextDate(todayStr, m.periodMonths);
    
    const updated: Machine = {
      ...m,
      lastMaintenanceDate: todayStr,
      nextMaintenanceDate: nextDate,
      status: 'working'
    };
    
    updateMachine(updated, currentUserEmail);
    showToast(`🔧 تم تسجيل إتمام صيانة [${m.name}] وتحديث موعد الصيانة القادم إلى ${nextDate}`, 'success');
    refreshList();
  };

  // Helper to determine status style
  const getStatusBadge = (m: Machine) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isOverdue = m.nextMaintenanceDate < todayStr;

    if (m.status === 'under_maintenance') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
          <Clock size={12} className="animate-spin" />
          تحت الصيانة الآن
        </span>
      );
    }

    if (m.status === 'maintenance_due' || isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
          <AlertTriangle size={12} />
          تستحق الصيانة فوراً
        </span>
      );
    }

    // Checking if next maintenance is approaching (within 7 days)
    const tDate = new Date(todayStr);
    const nDate = new Date(m.nextMaintenanceDate);
    const diffTime = nDate.getTime() - tDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7 && diffDays >= 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
          <AlertCircle size={12} />
          اقترب الموعد (بعد {diffDays} أيام)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle size={12} />
        حالة تشغيلية جيدة
      </span>
    );
  };

  const filtered = machines.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight">صيانة وجدولة آلات المصنع</h1>
          <p className="text-sm text-brand-med mt-1">جدولة ومتابعة الحالة التشغيلية لخط الإنتاج، مناشير CNC، آلات كبس الحواف والرش</p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-brand-gold hover:bg-[#9A7008] text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
          >
            <Plus size={16} />
            تسجيل آلة/معدة جديدة
          </button>
        )}
      </div>

      {/* Overview alerts summary banner */}
      {machines.some(m => {
        const todayStr = new Date().toISOString().split('T')[0];
        return m.status === 'maintenance_due' || m.nextMaintenanceDate < todayStr;
      }) && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-5 py-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="bg-amber-500 text-white p-2 rounded-lg">
            <AlertTriangle size={20} className="animate-bounce" />
          </div>
          <div>
            <h4 className="font-black text-sm text-brand-dark">تحذير: توجد معدات في المصنع تتطلب صيانة وقائية عاجلة!</h4>
            <p className="text-xs text-brand-med mt-0.5">يرجى مراجعة الآلات ذات اللون الأحمر بالأسفل وإتمام أعمال صيانتها لضمان استقرار جودة قص وإنتاج المطابخ.</p>
          </div>
        </div>
      )}

      {/* Control panel & search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:max-w-md relative">
          <input
            type="text"
            placeholder="البحث عن آلة بالاسم، الموديل أو الملاحظات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-gold bg-gray-50/50"
          />
        </div>
        <div className="text-[11px] font-bold text-brand-med">
          إجمالي المعدات المسجلة: <span className="text-brand-dark text-sm font-black">{machines.length}</span>
        </div>
      </div>

      {/* Grid of machines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(m => {
          const todayStr = new Date().toISOString().split('T')[0];
          const isOverdue = m.nextMaintenanceDate < todayStr;
          
          return (
            <div key={m.id} className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
              {/* Overdue highlight side-border */}
              <div className={`absolute top-0 bottom-0 right-0 w-1.5 ${isOverdue || m.status === 'maintenance_due' ? 'bg-rose-500' : 'bg-brand-gold'}`}></div>
              
              <div className="space-y-2 pr-1.5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-black text-sm text-brand-dark flex items-center gap-1.5">
                      <Wrench size={16} className="text-brand-gold" />
                      {m.name}
                    </h3>
                    <span className="text-[10px] font-mono text-brand-med font-bold">الموديل: {m.model} | {m.id}</span>
                  </div>
                  {getStatusBadge(m)}
                </div>

                <p className="text-xs text-brand-med leading-relaxed bg-brand-cream/30 p-2.5 rounded-lg border border-brand-gold/10">
                  {m.notes || 'لا توجد ملاحظات أو تعليمات تشغيل فنية خاصة.'}
                </p>

                {/* Dates & Period */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5">
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-gray-400 block font-bold">آخر صيانة (Last Maintenance):</span>
                    <span className="font-bold text-brand-dark flex items-center gap-1 mt-0.5">
                      <Calendar size={12} className="text-brand-med" />
                      {m.lastMaintenanceDate}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-gray-400 block font-bold">الصيانة القادمة (Next Due):</span>
                    <span className={`font-black flex items-center gap-1 mt-0.5 ${isOverdue ? 'text-rose-600' : 'text-brand-dark'}`}>
                      <Calendar size={12} className={isOverdue ? 'text-rose-500' : 'text-brand-gold'} />
                      {m.nextMaintenanceDate}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-brand-med flex items-center gap-1">
                  <span>🔄 دورة الصيانة المقررة:</span>
                  <span className="font-black text-brand-dark">كل {m.periodMonths} أشهر</span>
                </div>
              </div>

              {/* Action Buttons */}
              {canManage ? (
                <div className="flex gap-2 pt-3 border-t border-gray-100 mt-2 pr-1.5">
                  <button
                    onClick={() => handleMarkMaintained(m)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                  >
                    <CheckCircle size={13} />
                    تسجيل إتمام الصيانة اليوم ✅
                  </button>
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-200/50 text-brand-dark border border-gray-200 flex items-center justify-center cursor-pointer transition-colors"
                    title="تعديل المعدة"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id, m.name)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center cursor-pointer transition-colors"
                    title="حذف من السجل"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-100 mt-2 text-center text-[10px] text-brand-med font-bold flex items-center justify-center gap-1 bg-gray-50 py-1.5 rounded-lg">
                  🔒 يتطلب صلاحية "صيانة الآلات والمعدات" لتعديل أو تسجيل الصيانة
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Form Dialog Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl border border-gray-150 p-6 w-full max-w-lg shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 left-4 p-1.5 text-gray-400 hover:text-brand-dark hover:bg-gray-100 rounded-lg cursor-pointer transition-all"
            >
              <X size={18} />
            </button>
            
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-black text-brand-dark">
                {editingMachine ? 'تحديث بيانات وجدولة الآلة' : 'تسجيل آلة/معدة جديدة في المصنع'}
              </h2>
              <p className="text-[11px] text-brand-med">يرجى تسجيل مواصفات الآلة لجدولة التنبيهات وصيانتها بشكل دوري.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-brand-dark block">اسم الآلة/المعدة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: منشار CNC دقيق"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-brand-dark block">الموديل/المصنع *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: Homag-V2"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] font-bold text-brand-dark block">تاريخ آخر صيانة وقائية *</label>
                  <input
                    type="date"
                    required
                    value={lastMaintenanceDate}
                    onChange={(e) => setLastMaintenanceDate(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-brand-dark block">التكرار (شهور) *</label>
                  <select
                    value={periodMonths}
                    onChange={(e) => setPeriodMonths(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  >
                    <option value={1}>شهرياً (1)</option>
                    <option value={2}>كل شهرين (2)</option>
                    <option value={3}>كل 3 أشهر (3)</option>
                    <option value={6}>نصف سنوي (6)</option>
                    <option value={12}>سنوياً (12)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brand-dark block">حالة التشغيل</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                >
                  <option value="working">تعمل بكفاءة (Working)</option>
                  <option value="maintenance_due">تستحق الصيانة الوقائية (Due)</option>
                  <option value="under_maintenance">تحت الصيانة والإصلاح (Under Maintenance)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-brand-dark block">ملاحظات فنية أو تعليمات دورية</label>
                <textarea
                  placeholder="ملاحظات حول طريقة تزييت الأجزاء، أو فلاتر التغيير ونوع الزيت الموصى به..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-dark text-white font-black rounded-lg text-xs hover:bg-[#2C2C2C] cursor-pointer"
                >
                  {editingMachine ? 'تعديل وحفظ البيانات 💾' : 'إضافة وتسجيل الآلة ⚙️'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-gray-150 hover:bg-gray-200 text-brand-dark font-black rounded-lg text-xs cursor-pointer"
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
