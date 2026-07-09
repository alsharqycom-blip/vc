import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertOctagon, X, Calendar, User, FileText, ArrowLeft, Clock, ShieldAlert } from 'lucide-react';
import { Order } from '../types';

interface OverdueAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onNavigate: (view: string) => void;
}

export default function OverdueAlertModal({ isOpen, onClose, orders, onNavigate }: OverdueAlertModalProps) {
  // Extract overdue orders
  const overdueOrders = React.useMemo(() => {
    const now = new Date().getTime();
    const results: Array<{
      order: Order;
      daysOverdue: number;
      deadlineDateStr: string;
    }> = [];

    orders.forEach(o => {
      // Exclude completed or cancelled
      if (o.status === 'Completed' || o.status === 'تم التركيب' || o.status === 'Cancelled') return;
      if (!o.date) return;

      const daysMatch = o.deliveryDuration ? o.deliveryDuration.match(/\d+/) : null;
      const durationDays = daysMatch ? parseInt(daysMatch[0]) : 30;

      const orderDate = new Date(o.date);
      const deadlineTime = orderDate.getTime() + durationDays * 24 * 60 * 60 * 1000;
      const deadlineDate = new Date(deadlineTime);

      const timeDiff = now - deadlineTime;
      const daysOverdue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      if (daysOverdue > 0) {
        results.push({
          order: o,
          daysOverdue,
          deadlineDateStr: deadlineDate.toISOString().split('T')[0]
        });
      }
    });

    // Sort by worst overdue first
    return results.sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [orders]);

  if (!isOpen || overdueOrders.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-xs no-print" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative bg-white w-full max-w-2xl rounded-2xl border border-rose-100 shadow-2xl overflow-hidden flex flex-col my-8"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 animate-pulse">
                <AlertOctagon size={24} />
              </div>
              <div className="text-right">
                <h3 className="font-black text-base text-white tracking-wide">⚠️ تنبيه إداري: طلبات متأخرة تجاوزت تاريخ التسليم</h3>
                <p className="text-[11px] text-rose-100 mt-0.5 font-medium">يوجد {overdueOrders.length} كارت عميل لم يتم تركيبها ومستحقة التسليم بالفعل!</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X size={18} />
            </button>
          </div>

          {/* Alert content */}
          <div className="p-6 space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar">
            <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-100 flex items-start gap-2.5 text-right">
              <ShieldAlert size={16} className="text-rose-700 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-800 leading-relaxed font-bold">
                تنبيه للمهندسين والمشرفين: الطلبات المدرجة أدناه تجاوزت الموعد التعاقدي المحدد لها مع العميل دون تغيير حالتها إلى (تم التركيب / تم التسليم). يرجى مراجعة الإنتاج فوراً!
              </p>
            </div>

            <div className="space-y-2.5">
              {overdueOrders.map(({ order, daysOverdue, deadlineDateStr }) => (
                <div
                  key={order.id}
                  className="p-4 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-xl transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                >
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-brand-dark block">{order.customerName}</span>
                      <span className="px-2 py-0.5 rounded-md bg-gray-200 text-brand-dark font-black text-[9px]">
                        {order.stage || 'تصميم'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-brand-med font-bold">
                      <span className="flex items-center gap-1">
                        <FileText size={12} className="text-brand-gold" />
                        عقد: <strong className="text-brand-dark font-mono">{order.contractNo}</strong>
                      </span>
                      <span>|</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-brand-gold" />
                        الاستحقاق: <strong className="text-brand-dark font-mono">{deadlineDateStr}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-150">
                    <span className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg animate-pulse flex items-center gap-1">
                      <Clock size={12} />
                      متأخر منذ {daysOverdue} أيام
                    </span>

                    <button
                      onClick={() => {
                        onNavigate('customers');
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-gray-100 text-brand-dark border border-gray-200 rounded-lg text-[10px] font-black cursor-pointer transition-colors"
                    >
                      عرض ومتابعة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
            <span className="text-[10px] text-brand-med font-bold">
              * يتم احتساب التأخير تلقائياً بمقارنة تاريخ اليوم مع تاريخ استحقاق الطلب.
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-brand-dark rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                تجاهل التنبيه مؤقتاً
              </button>
              <button
                onClick={() => {
                  onNavigate('customers');
                  onClose();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              >
                الانتقال لصفحة الطلبات لمراجعتها
                <ArrowLeft size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
