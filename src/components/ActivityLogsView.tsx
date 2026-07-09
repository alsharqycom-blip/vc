import { ActivityLog } from '../types';
import { Clock, ShieldAlert } from 'lucide-react';

interface ActivityLogsProps {
  logs: ActivityLog[];
}

export default function ActivityLogsView({ logs }: ActivityLogsProps) {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-brand-dark">نشاط الموظفين</h1>
        <p className="text-sm text-brand-med mt-1">الرئيسية / سجل العمليات والتدقيق</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
            <Clock size={16} className="text-brand-gold" />
            سجل التدقيق والأمن للعمليات المنجزة
          </h3>
          <span className="text-xs bg-brand-gold/15 text-brand-gold font-bold px-2.5 py-1 rounded-full">
            آخر {logs.length} عملية
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150">
                <th className="p-4 font-bold text-brand-med">التوقيت والتاريخ</th>
                <th className="p-4 font-bold text-brand-med">المستخدم (الموظف)</th>
                <th className="p-4 font-bold text-brand-med">نوع العملية</th>
                <th className="p-4 font-bold text-brand-med">تفاصيل العملية والبيانات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length > 0 ? (
                logs.map((log) => {
                  let actionClass = 'bg-gray-50 text-gray-700 border border-gray-100';
                  if (log.action.includes('دخول')) {
                    actionClass = 'bg-blue-50 text-blue-600 border border-blue-100';
                  } else if (log.action.includes('حفظ') || log.action.includes('إنشاء')) {
                    actionClass = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                  } else if (log.action.includes('حذف')) {
                    actionClass = 'bg-red-50 text-red-600 border border-red-100';
                  } else if (log.action.includes('تعديل') || log.action.includes('تحديث')) {
                    actionClass = 'bg-amber-50 text-amber-600 border border-amber-100';
                  } else if (log.action.includes('استيراد')) {
                    actionClass = 'bg-purple-50 text-purple-600 border border-purple-100';
                  }

                  return (
                    <tr key={log.id} className="hover:bg-brand-cream/10 transition-colors">
                      <td className="p-4 font-mono text-brand-med">{formatTime(log.timestamp)}</td>
                      <td className="p-4 font-bold text-brand-dark">{log.user}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${actionClass}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-brand-dark leading-relaxed">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-brand-med">
                    سجل العمليات فارغ تماماً حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
        <ShieldAlert className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="text-xs font-black text-amber-800">إشعار التدقيق والأمان</h4>
          <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
            يتم تسجيل كافة العمليات المنجزة على هذا النظام (مثل الإضافة، التحديث، الحذف، والطباعة) تلقائياً لأغراض المراقبة والجودة. لا يمكن تعديل أو حذف هذا السجل لضمان الشفافية الكاملة داخل مصنع فيلا كوزين.
          </p>
        </div>
      </div>
    </div>
  );
}
