import React, { useState, useMemo } from 'react';
import { ActivityLog } from '../types';
import { 
  Clock, 
  ShieldAlert, 
  Search, 
  Filter, 
  Users, 
  Trash2, 
  FileEdit, 
  LogIn, 
  FilePlus, 
  Database,
  Archive,
  RefreshCw,
  X,
  TrendingUp,
  FileText
} from 'lucide-react';

interface ActivityLogsProps {
  logs: ActivityLog[];
}

export default function ActivityLogsView({ logs }: ActivityLogsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('All');
  const [selectedUser, setSelectedUser] = useState('All');
  const [selectedContract, setSelectedContract] = useState('All');

  // Format timestamp helper
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

  // Get unique users from logs for filter dropdown
  const uniqueUsers = useMemo(() => {
    const users = new Set<string>();
    logs.forEach(log => {
      if (log.user) users.add(log.user);
    });
    return Array.from(users);
  }, [logs]);

  // Get unique actions from logs for filter dropdown
  const uniqueActions = useMemo(() => {
    const actions = new Set<string>();
    logs.forEach(log => {
      if (log.action) actions.add(log.action);
    });
    return Array.from(actions);
  }, [logs]);

  // Get unique contracts/orders from logs for specific order filter dropdown
  const uniqueContracts = useMemo(() => {
    const contracts = new Set<string>();
    logs.forEach(log => {
      // Look for mentions of "العقد" or "عقد رقم" or raw numbers associated with order modifications
      const match = log.details.match(/(?:العقد|عقد|عقد رقم|رقم العقد|عقد\s*#)\s*:?\s*([A-Za-z0-9-]+)/);
      if (match && match[1]) {
        contracts.add(match[1]);
      }
    });
    return Array.from(contracts);
  }, [logs]);

  // Statistics calculation
  const stats = useMemo(() => {
    let logins = 0;
    let creations = 0;
    let updates = 0;
    let deletions = 0;

    logs.forEach(log => {
      const act = log.action.toLowerCase() || '';
      if (act.includes('دخول') || act.includes('login')) logins++;
      else if (act.includes('حفظ') || act.includes('إنشاء') || act.includes('create') || act.includes('save')) creations++;
      else if (act.includes('تعديل') || act.includes('تحديث') || act.includes('update') || act.includes('edit')) updates++;
      else if (act.includes('حذف') || act.includes('delete') || act.includes('remove')) deletions++;
    });

    return { logins, creations, updates, deletions };
  }, [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. Search Query
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        (log.user || '').toLowerCase().includes(query) ||
        (log.action || '').toLowerCase().includes(query) ||
        (log.details || '').toLowerCase().includes(query);

      // 2. Action Filter
      const matchesAction = selectedAction === 'All' || log.action === selectedAction;

      // 3. User Filter
      const matchesUser = selectedUser === 'All' || log.user === selectedUser;

      // 4. Contract Filter (Operations related to specific order/contract)
      const matchesContract = selectedContract === 'All' || log.details.includes(selectedContract);

      return matchesSearch && matchesAction && matchesUser && matchesContract;
    });
  }, [logs, searchQuery, selectedAction, selectedUser, selectedContract]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedAction('All');
    setSelectedUser('All');
    setSelectedContract('All');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-dark flex items-center gap-2">
            <Clock size={24} className="text-brand-gold shrink-0" />
            نظام مراقبة ونشاط الموظفين
          </h1>
          <p className="text-sm text-brand-med mt-1">الرئيسية / سجل التدقيق والأمان للعمليات والتحركات</p>
        </div>
        <button
          onClick={handleResetFilters}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white text-xs font-bold text-brand-dark border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw size={14} className="text-brand-gold" />
          إعادة تعيين الفلاتر
        </button>
      </div>

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Actions */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black text-brand-med">إجمالي العمليات</div>
            <div className="text-lg font-black text-brand-dark mt-0.5">{logs.length}</div>
          </div>
        </div>

        {/* Logins */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
            <LogIn size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black text-brand-med">تسجيل الدخول</div>
            <div className="text-lg font-black text-brand-dark mt-0.5">{stats.logins}</div>
          </div>
        </div>

        {/* Creations */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
            <FilePlus size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black text-brand-med">إنشاء كروت وطلبات</div>
            <div className="text-lg font-black text-brand-dark mt-0.5">{stats.creations}</div>
          </div>
        </div>

        {/* Updates */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <FileEdit size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black text-brand-med">تعديل وتحديث</div>
            <div className="text-lg font-black text-brand-dark mt-0.5">{stats.updates}</div>
          </div>
        </div>

        {/* Deletions */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5 col-span-2 lg:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
            <Trash2 size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black text-brand-med">حذف وإلغاء</div>
            <div className="text-lg font-black text-brand-dark mt-0.5 text-rose-600">{stats.deletions}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن موظف، تفاصيل، أو رقم عقد..."
              className="w-full pr-10 pl-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* User Filter */}
          <div className="relative">
            <Users className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold cursor-pointer appearance-none"
            >
              <option value="All">جميع الموظفين والمستخدمين</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div className="relative">
            <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold cursor-pointer appearance-none"
            >
              <option value="All">كل أنواع العمليات والتحركات</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>

          {/* Specific Order / Contract Filter */}
          <div className="relative">
            <FileText className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold cursor-pointer appearance-none"
            >
              <option value="All">العمليات المرتبطة بأي طلب / عقد</option>
              {uniqueContracts.map(contract => (
                <option key={contract} value={contract}>عقد رقم: {contract}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
            <Clock size={16} className="text-brand-gold animate-pulse" />
            بيانات التحركات والعمليات المفصلة
          </h3>
          <span className="text-xs bg-brand-gold/15 text-brand-gold font-bold px-2.5 py-1 rounded-full">
            عرض {filteredLogs.length} من {logs.length} عملية
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150">
                <th className="p-4 font-bold text-brand-med w-[20%]">التوقيت والتاريخ</th>
                <th className="p-4 font-bold text-brand-med w-[25%]">المستخدم (الموظف)</th>
                <th className="p-4 font-bold text-brand-med w-[20%]">نوع العملية</th>
                <th className="p-4 font-bold text-brand-med w-[35%]">تفاصيل العملية والبيانات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  let actionClass = 'bg-gray-50 text-gray-700 border border-gray-100';
                  let icon = <Database size={10} />;

                  const actLower = log.action.toLowerCase();
                  if (actLower.includes('دخول') || actLower.includes('login')) {
                    actionClass = 'bg-blue-50 text-blue-600 border border-blue-100';
                    icon = <LogIn size={10} />;
                  } else if (actLower.includes('حفظ') || actLower.includes('إنشاء') || actLower.includes('create') || actLower.includes('save')) {
                    actionClass = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
                    icon = <FilePlus size={10} />;
                  } else if (actLower.includes('حذف') || actLower.includes('delete') || actLower.includes('remove')) {
                    actionClass = 'bg-red-50 text-red-600 border border-red-100';
                    icon = <Trash2 size={10} />;
                  } else if (actLower.includes('تعديل') || actLower.includes('تحديث') || actLower.includes('update') || actLower.includes('edit')) {
                    actionClass = 'bg-amber-50 text-amber-600 border border-amber-100';
                    icon = <FileEdit size={10} />;
                  } else if (actLower.includes('أرشفة') || actLower.includes('archive')) {
                    actionClass = 'bg-teal-50 text-teal-600 border border-teal-100';
                    icon = <Archive size={10} />;
                  } else if (actLower.includes('استيراد') || actLower.includes('import')) {
                    actionClass = 'bg-purple-50 text-purple-600 border border-purple-100';
                    icon = <Database size={10} />;
                  }

                  return (
                    <tr key={log.id} className="hover:bg-brand-cream/20 transition-colors">
                      <td className="p-4 font-mono text-brand-med" dir="ltr">{formatTime(log.timestamp)}</td>
                      <td className="p-4 font-bold text-brand-dark">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center font-black text-[9px]">
                            {log.user.charAt(0).toUpperCase()}
                          </span>
                          {log.user}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${actionClass}`}>
                          {icon}
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
                    لم يتم العثور على أي عمليات مطابقة للفلاتر المحددة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
        <ShieldAlert className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="text-xs font-black text-amber-800">إشعار التدقيق والأمان الإداري</h4>
          <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
            يتم تسجيل كافة العمليات المنجزة على هذا النظام (مثل الدخول، إضافة كرت جديد، التعديل والمواصفات، الحذف، والتحميل والنسخ الاحتياطي) تلقائياً لضمان النزاهة والجودة التامة داخل مصنع فيلا كوزين. لا يمكن حذف هذا السجل الإداري أو التلاعب به.
          </p>
        </div>
      </div>
    </div>
  );
}
