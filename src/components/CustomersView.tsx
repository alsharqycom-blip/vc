import React, { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Printer,
  Trash2,
  Edit2,
  Download,
  Upload,
  SlidersHorizontal,
  Calendar,
  User,
  Hash,
  RefreshCw,
  X,
  Archive,
  FolderHeart,
  FileDown,
  FileUp,
  FileSpreadsheet,
  Clock,
  Hammer,
  Truck,
  CheckCircle,
  Home,
  Play,
  AlertCircle,
  XCircle,
  Package,
  Copy,
  MessageSquare
} from 'lucide-react';
import { Order, User as UserType } from '../types';
import { exportToCSV, importFromCSV } from '../lib/storage';
import { useToast } from './Toast';

interface CustomersProps {
  orders: Order[];
  currentUser: UserType;
  onViewOrder: (id: string) => void;
  onPrintOrder: (id: string) => void;
  onEditOrder: (id: string) => void;
  onDeleteOrder: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDuplicateOrder: (id: string) => void;
  onNavigate: (view: string) => void;
  onImportBackup: (json: string) => boolean;
  onExportBackup: () => void;
  onRefreshOrders: () => void;
}

export function renderStatusBadge(status: Order['status']) {
  let badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/30";
  let icon = <Clock size={12} className="text-amber-500 shrink-0" />;
  let text = status || "غير محدد";

  switch (status) {
    case 'قيد الانتظار':
    case 'Pending':
      badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/30";
      icon = <Clock size={12} className="text-amber-500 shrink-0 animate-pulse" />;
      text = "قيد الانتظار";
      break;
    case 'في التصنيع':
    case 'قيد التصنيع':
      badgeStyle = "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/30";
      icon = <Hammer size={12} className="text-blue-500 shrink-0" />;
      text = "قيد التصنيع";
      break;
    case 'جاهز':
      badgeStyle = "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100/30";
      icon = <Package size={12} className="text-teal-500 shrink-0" />;
      text = "جاهز للتركيب";
      break;
    case 'جاهز للشحن':
      badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/30";
      icon = <Truck size={12} className="text-indigo-500 shrink-0" />;
      text = "جاهز للشحن";
      break;
    case 'تم التركيب':
      badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/30";
      icon = <Home size={12} className="text-emerald-500 shrink-0" />;
      text = "تم التركيب والانتهاء";
      break;
    case 'Completed':
      badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/30";
      icon = <CheckCircle size={12} className="text-emerald-500 shrink-0" />;
      text = "تم التسليم (مكتمل)";
      break;
    case 'Active':
      badgeStyle = "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100/30";
      icon = <Play size={12} className="text-sky-500 shrink-0" />;
      text = "قيد التنفيذ (نشط)";
      break;
    case 'Cancelled':
      badgeStyle = "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/30";
      icon = <XCircle size={12} className="text-rose-500 shrink-0" />;
      text = "ملغي";
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border transition-all duration-200 ${badgeStyle}`}>
      {icon}
      <span>{text}</span>
    </span>
  );
}

export default function CustomersView({
  orders,
  currentUser,
  onViewOrder,
  onPrintOrder,
  onEditOrder,
  onDeleteOrder,
  onToggleArchive,
  onDuplicateOrder,
  onNavigate,
  onImportBackup,
  onExportBackup,
  onRefreshOrders
}: CustomersProps) {
  const { showToast } = useToast();

  const getWhatsAppUrl = (order: Order) => {
    let phone = order.phone.replace(/[\s-+]/g, '');
    if (phone.startsWith('05')) {
      phone = '966' + phone.substring(1);
    } else if (phone.startsWith('5')) {
      phone = '966' + phone;
    }
    
    const stageName = order.stage === 'تقطيع' ? '🪚 تقطيع الألواح' :
                      order.stage === 'تجميع' ? '🔨 تجميع الوحدات' :
                      order.stage === 'طلاء' ? '🎨 طلاء وتجهيز' :
                      order.stage === 'تسليم' ? '🚚 تسليم وتركيب' :
                      '✏️ تصميم وإعداد المخططات';
                      
    const message = `مرحباً بك عميلنا العزيز: ${order.customerName} 👋

نود تذكيركم وإفادتكم بآخر تحديث لطلبكم/عقدكم رقم [ ${order.contractNo || '—'} ]:

📌 حالة الطلب: ${order.status || 'قيد الانتظار'}
🛠️ مرحلة العمل: ${stageName}

نسعد دائماً بخدمتكم وتلبية تطلعاتكم! ✨`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };
  // Primary Quick search
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced filters state
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [designerFilter, setDesignerFilter] = useState<string>('All');
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchContract, setSearchContract] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quickDate, setQuickDate] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Find unique designers
  const designers = Array.from(new Set(orders.map(o => o.designerName || 'غير محدد'))).filter(Boolean);

  const filteredOrders = orders.filter(o => {
    // Filter by Archive state
    const isArchivedOrder = !!o.archived;
    if (showArchived !== isArchivedOrder) return false;

    // 1. General search across multiple fields (Customer Name, Phone, Contract No, and Status)
    const matchesSearch = !searchQuery ? true : (
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.contractNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery) ||
      (o.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (
        o.status === 'قيد الانتظار' || o.status === 'Pending' ? 'قيد الانتظار معلق' :
        o.status === 'في التصنيع' || o.status === 'قيد التصنيع' ? 'في التصنيع قيد التصنيع' :
        o.status === 'جاهز' ? 'جاهز للتركيب مكتمل التصنيع' :
        o.status === 'جاهز للشحن' ? 'جاهز للشحن' :
        o.status === 'تم التركيب' ? 'تم التركيب' :
        o.status === 'Active' ? 'نشط قيد التنفيذ' :
        o.status === 'Completed' ? 'تم التسليم مكتمل' :
        o.status === 'Cancelled' ? 'ملغي' : ''
      ).includes(searchQuery)
    );

    // 2. Specific search: Customer Name
    const matchesName = !searchName ? true : o.customerName.toLowerCase().includes(searchName.toLowerCase());

    // 3. Specific search: Phone
    const matchesPhone = !searchPhone ? true : o.phone.includes(searchPhone);

    // 4. Specific search: Contract No
    const matchesContract = !searchContract ? true : o.contractNo.toLowerCase().includes(searchContract.toLowerCase());

    // 5. Date filtering
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && (o.date >= startDate);
    }
    if (endDate) {
      matchesDate = matchesDate && (o.date <= endDate);
    }

    // 6. Quick Date Preset Presets
    if (quickDate !== 'all') {
      const orderDateStr = o.date; // "YYYY-MM-DD"
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      if (quickDate === 'today') {
        matchesDate = matchesDate && (orderDateStr === todayStr);
      } else if (quickDate === 'week') {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastWeekStr = lastWeek.toISOString().split('T')[0];
        matchesDate = matchesDate && (orderDateStr >= lastWeekStr);
      } else if (quickDate === 'month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
        matchesDate = matchesDate && (orderDateStr >= startOfMonthStr);
      } else if (quickDate === 'last-month') {
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const startOfLastMonthStr = startOfLastMonth.toISOString().split('T')[0];
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        const endOfLastMonthStr = endOfLastMonth.toISOString().split('T')[0];
        matchesDate = matchesDate && (orderDateStr >= startOfLastMonthStr && orderDateStr <= endOfLastMonthStr);
      }
    }

    // 7. Select filters
    let matchesStatus = statusFilter === 'All';
    if (!matchesStatus) {
      if (statusFilter === 'في التصنيع') {
        matchesStatus = o.status === 'في التصنيع' || o.status === 'قيد التصنيع';
      } else {
        matchesStatus = o.status === statusFilter;
      }
    }
    const matchesStage = stageFilter === 'All' || o.stage === stageFilter;
    const matchesDesigner = designerFilter === 'All' || (o.designerName || 'غير محدد') === designerFilter;

    return matchesSearch && matchesName && matchesPhone && matchesContract && matchesDate && matchesStatus && matchesStage && matchesDesigner;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSearchName('');
    setSearchPhone('');
    setSearchContract('');
    setStartDate('');
    setEndDate('');
    setQuickDate('all');
    setStatusFilter('All');
    setStageFilter('All');
    setDesignerFilter('All');
  };

  const hasActiveAdvancedFilters = !!(searchName || searchPhone || searchContract || startDate || endDate || quickDate !== 'all' || stageFilter !== 'All');

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onImportBackup(content);
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV(orders);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ville_cuisine_excel_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📊 تم تصدير كروت العملاء إلى ملف إكسل (CSV) بنجاح!', 'success');
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importFromCSV(content, currentUser.email);
      if (res.success) {
        showToast(`✅ تم استيراد عدد (${res.count}) كروت عملاء بنجاح من ملف إكسل!`, 'success');
        onRefreshOrders();
      } else {
        showToast(`❌ فشل استيراد ملف إكسل: ${res.error}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-dark">قائمة كروت العملاء</h1>
          <p className="text-sm text-brand-med mt-1">الرئيسية / العملاء</p>
        </div>

        <div className="flex gap-2 self-stretch sm:self-auto flex-wrap">
          {/* Excel Export & Import */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-600 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            title="تصدير كروت العملاء لملف Excel (CSV)"
          >
            <FileSpreadsheet size={14} />
            تصدير إكسل (CSV)
          </button>

          <label className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-600 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
            <FileUp size={14} />
            استيراد إكسل (CSV)
            <input type="file" accept=".csv" className="hidden" onChange={handleExcelImport} />
          </label>

          {/* Backup Action Buttons */}
          <button
            onClick={onExportBackup}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-brand-dark bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer transition-all"
            title="تصدير نسخة احتياطية كاملة (JSON)"
          >
            <Download size={14} />
            تصدير JSON
          </button>

          <label className="px-3.5 py-2 rounded-xl text-xs font-bold text-brand-dark bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer transition-all">
            <Upload size={14} />
            استيراد JSON
            <input type="file" accept=".json" className="hidden" onChange={handleFileImport} />
          </label>

          {(currentUser.role === 'admin' || currentUser.permissions?.includes('create_order') || currentUser.permissions?.includes('all')) && (
            <button
              onClick={() => onNavigate('new-order')}
              className="px-4 py-2 bg-brand-dark text-brand-cream border-2 border-brand-gold hover:bg-brand-gold hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Plus size={16} />
              كرت جديد
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="space-y-3">
        {/* Toggle between Active and Archived */}
        <div className="flex items-center gap-2 justify-start">
          <button
            onClick={() => {
              setShowArchived(false);
              handleResetFilters();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              !showArchived
                ? 'bg-brand-dark text-white shadow-sm scale-102 border-2 border-brand-gold'
                : 'bg-white text-brand-dark border border-gray-150 hover:bg-gray-50'
            }`}
          >
            <FolderHeart size={14} className={!showArchived ? 'text-brand-gold' : 'text-brand-med'} />
            <span>📁 الطلبات النشطة والجديدة</span>
            <span className="px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-[10px] font-black">
              {orders.filter(o => !o.archived).length}
            </span>
          </button>
          <button
            onClick={() => {
              setShowArchived(true);
              handleResetFilters();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              showArchived
                ? 'bg-amber-600 text-white shadow-sm scale-102 border-2 border-yellow-300'
                : 'bg-white text-brand-dark border border-gray-150 hover:bg-gray-50'
            }`}
          >
            <Archive size={14} className={showArchived ? 'text-white' : 'text-amber-600'} />
            <span>📦 الطلبات القديمة والأرشيف</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-black">
              {orders.filter(o => o.archived).length}
            </span>
          </button>
        </div>

        {/* Main Filters Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Quick general search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 ابحث فوراً عن العميل باسمه أو رقم هاتفه..."
              className="w-full pr-11 pl-28 py-3 rounded-xl border border-gray-200 bg-gray-50 text-xs font-black focus:outline-none focus:border-brand-gold focus:bg-white transition-all text-right shadow-inner text-brand-dark"
            />
            <Search size={16} className="absolute right-4 top-3.5 text-brand-gold" />
            <span className="absolute left-3 top-2 px-2.5 py-1 text-[9px] font-black text-brand-cream bg-brand-dark rounded-lg border border-brand-gold shadow-sm">
              ⚡ بحث فوري نشط
            </span>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Dropdown status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-bold focus:outline-none focus:border-brand-gold focus:bg-white text-right cursor-pointer transition-all"
            >
              <option value="All">كل الحالات</option>
              <option value="قيد الانتظار">🕒 قيد الانتظار</option>
              <option value="في التصنيع">🏭 قيد التصنيع / في التصنيع</option>
              <option value="جاهز">📦 جاهز للتركيب</option>
              <option value="جاهز للشحن">🚚 جاهز للشحن</option>
              <option value="تم التركيب">🏠 تم التركيب</option>
              <option value="Active">⚙️ قيد التنفيذ (نشط)</option>
              <option value="Pending">🕒 معلق / انتظار</option>
              <option value="Completed">✅ مكتمل (تم التسليم)</option>
              <option value="Cancelled">❌ ملغي</option>
            </select>

            {/* Dropdown stage */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-bold focus:outline-none focus:border-brand-gold focus:bg-white text-right cursor-pointer transition-all"
            >
              <option value="All">كل مراحل التصنيع</option>
              <option value="تصميم">✏️ تصميم</option>
              <option value="تقطيع">🪚 تقطيع</option>
              <option value="تجميع">🔨 تجميع</option>
              <option value="طلاء">🎨 طلاء</option>
              <option value="تسليم">🚚 تسليم</option>
            </select>

            {/* Dropdown Designer */}
            <select
              value={designerFilter}
              onChange={(e) => setDesignerFilter(e.target.value)}
              className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-bold focus:outline-none focus:border-brand-gold focus:bg-white text-right cursor-pointer transition-all max-w-[150px]"
            >
              <option value="All">كل المصممين</option>
              {designers.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Toggle Advanced Filters Button */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-4 py-2.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showAdvanced || hasActiveAdvancedFilters
                  ? 'bg-brand-gold/15 border-brand-gold text-brand-gold'
                  : 'bg-white border-gray-200 text-brand-dark hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>خيارات تصفية متقدمة</span>
              {hasActiveAdvancedFilters && (
                <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
              )}
            </button>

            {/* Reset Filters button */}
            {(hasActiveAdvancedFilters || searchQuery || statusFilter !== 'All' || designerFilter !== 'All') && (
              <button
                onClick={handleResetFilters}
                className="p-2.5 rounded-lg border border-red-250 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                title="إعادة تعيين كافة الفلاتر"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Advanced Filtering Panel */}
        {showAdvanced && (
          <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-md space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <div className="flex items-center gap-1.5 text-brand-dark font-black text-xs">
                <SlidersHorizontal size={14} className="text-brand-gold" />
                <span>أدوات التصفية المتقدمة لملفات المصنع</span>
              </div>
              <button
                onClick={() => setShowAdvanced(false)}
                className="text-gray-400 hover:text-brand-dark p-1 rounded-full hover:bg-gray-100"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Filter by Customer Name */}
              <div className="space-y-1 text-right">
                <label className="text-[10px] font-bold text-brand-med block flex items-center gap-1 justify-start">
                  <User size={12} className="text-brand-gold" />
                  اسم العميل المخصص:
                </label>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="ابحث باسم العميل المحدد..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-brand-gold outline-none text-right"
                />
              </div>

              {/* Filter by Phone Number */}
              <div className="space-y-1 text-right">
                <label className="text-[10px] font-bold text-brand-med block flex items-center gap-1 justify-start">
                  <span className="text-brand-gold text-[11px]">📞</span>
                  رقم الهاتف (الجوال):
                </label>
                <input
                  type="text"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="ابحث برقم الجوال..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-brand-gold outline-none text-left"
                  dir="ltr"
                />
              </div>

              {/* Filter by Contract Number */}
              <div className="space-y-1 text-right">
                <label className="text-[10px] font-bold text-brand-med block flex items-center gap-1 justify-start">
                  <Hash size={12} className="text-brand-gold" />
                  رقم العقد المخصص:
                </label>
                <input
                  type="text"
                  value={searchContract}
                  onChange={(e) => setSearchContract(e.target.value)}
                  placeholder="ابحث برقم العقد..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-brand-gold outline-none text-left"
                  dir="ltr"
                />
              </div>

              {/* Filter by From Date */}
              <div className="space-y-1 text-right">
                <label className="text-[10px] font-bold text-brand-med block flex items-center gap-1 justify-start">
                  <Calendar size={12} className="text-brand-gold" />
                  من تاريخ الطلب:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-brand-gold outline-none text-right"
                />
              </div>

              {/* Filter by To Date */}
              <div className="space-y-1 text-right">
                <label className="text-[10px] font-bold text-brand-med block flex items-center gap-1 justify-start">
                  <Calendar size={12} className="text-brand-gold" />
                  إلى تاريخ الطلب:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-brand-gold outline-none text-right"
                />
              </div>
            </div>

            {/* Quick Date Presets and summary stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-gray-50 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-brand-med text-[10px]">فترات سريعة:</span>
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'today', label: 'اليوم' },
                  { id: 'week', label: 'آخر ٧ أيام' },
                  { id: 'month', label: 'الشهر الحالي' },
                  { id: 'last-month', label: 'الشهر الماضي' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setQuickDate(preset.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                      quickDate === preset.id
                        ? 'bg-[#3F3F3F] text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-brand-med'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-brand-med flex items-center gap-1.5 bg-brand-cream/40 px-3 py-1.5 rounded-lg border border-[#B68D40]/10">
                <span className="font-bold">حالة الفلترة النشطة:</span>
                {hasActiveAdvancedFilters ? (
                  <span className="text-brand-gold font-black">فلترة مخصصة نشطة ومطبقة</span>
                ) : (
                  <span className="text-gray-400">لا يوجد تصفية مخصصة</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-sm text-brand-dark">كروت طلبات المصنع</h3>
          <span className="text-xs bg-brand-gold/15 text-brand-gold font-bold px-2.5 py-1 rounded-full">
            {filteredOrders.length} كرت
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150">
                <th className="p-4 font-bold text-brand-med">رقم العقد</th>
                <th className="p-4 font-bold text-brand-med">اسم العميل</th>
                <th className="p-4 font-bold text-brand-med">الجوال</th>
                <th className="p-4 font-bold text-brand-med">العنوان</th>
                <th className="p-4 font-bold text-brand-med">مدة التسليم</th>
                <th className="p-4 font-bold text-brand-med">المصمم</th>
                <th className="p-4 font-bold text-brand-med">مرحلة التصنيع</th>
                <th className="p-4 font-bold text-brand-med">الحالة</th>
                <th className="p-4 font-bold text-brand-med text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-brand-cream/10 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-gold">{o.contractNo}</td>
                    <td className="p-4 font-bold text-brand-dark">{o.customerName}</td>
                    <td className="p-4 font-mono text-brand-med" dir="ltr">
                      {o.phone}
                    </td>
                    <td className="p-4 text-brand-med truncate max-w-[150px]" title={o.address}>
                      {o.address || 'غير محدد'}
                    </td>
                    <td className="p-4 font-bold text-brand-dark">{o.deliveryDuration || '—'}</td>
                    <td className="p-4 text-brand-med">{o.designerName || 'غير محدد'}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          o.stage === 'تقطيع' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          o.stage === 'تجميع' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                          o.stage === 'طلاء' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                          o.stage === 'تسليم' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        {o.stage === 'تقطيع' ? '🪚 تقطيع' :
                         o.stage === 'تجميع' ? '🔨 تجميع' :
                         o.stage === 'طلاء' ? '🎨 طلاء' :
                         o.stage === 'تسليم' ? '🚚 تسليم' :
                         '✏️ تصميم'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {renderStatusBadge(o.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => onViewOrder(o.id)}
                          className="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                          title="عرض تفاصيل كرت العميل"
                        >
                          <Eye size={13} />
                        </button>

                        <a
                          href={getWhatsAppUrl(o)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                          title="إرسال تذكير عبر واتساب"
                        >
                          <MessageSquare size={13} />
                        </a>

                        {(currentUser.role === 'admin' || currentUser.permissions?.includes('edit_order') || currentUser.permissions?.includes('all')) && (
                          <button
                            onClick={() => onEditOrder(o.id)}
                            className="p-1.5 rounded-lg text-brand-dark bg-gray-100 hover:bg-brand-dark hover:text-white transition-all cursor-pointer"
                            title="تعديل كرت العميل"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}

                        {(currentUser.role === 'admin' || currentUser.permissions?.includes('create_order') || currentUser.permissions?.includes('all')) && (
                          <button
                            onClick={() => {
                              if (confirm(`هل ترغب في نسخ كرت العميل "${o.customerName}" لإنشاء طلب جديد بنفس المواصفات؟`)) {
                                onDuplicateOrder(o.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-600 hover:text-white transition-all cursor-pointer"
                            title="نسخ وتكرار الكرت (Duplicate)"
                          >
                            <Copy size={13} />
                          </button>
                        )}

                        <button
                          onClick={() => onPrintOrder(o.id)}
                          className="p-1.5 rounded-lg text-brand-gold bg-brand-cream hover:bg-brand-gold hover:text-white transition-all cursor-pointer"
                          title="طباعة ورقية"
                        >
                          <Printer size={13} />
                        </button>

                        {(currentUser.role === 'admin' || currentUser.permissions?.includes('archive_order') || currentUser.permissions?.includes('all')) && (
                          <button
                            onClick={() => onToggleArchive(o.id)}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                              o.archived
                                ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white'
                                : 'text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white'
                            }`}
                            title={o.archived ? "إلغاء الأرشفة ونقل للنشط" : "أرشفة الطلب لتخفيف الضغط"}
                          >
                            <Archive size={13} />
                          </button>
                        )}

                        {(currentUser.role === 'admin' || currentUser.permissions?.includes('delete_order') || currentUser.permissions?.includes('all')) && (
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف كرت العميل "${o.customerName}"؟`)) {
                                onDeleteOrder(o.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                            title="حذف الكرت"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-brand-med font-medium">
                    لا توجد نتائج تطابق خيارات البحث والتصفية المحددة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
