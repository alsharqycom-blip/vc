import React from 'react';
import { FileText, Calendar, CheckCircle, Clock, Star, ArrowLeftCircle, BarChart3, TrendingUp, AlertTriangle, Bell, AlertCircle, Settings } from 'lucide-react';
import { Order } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface DashboardProps {
  orders: Order[];
  onViewOrder: (id: string) => void;
  onPrintOrder: (id: string) => void;
  onNavigate: (view: string) => void;
}

export default function DashboardView({ orders: allOrders, onViewOrder, onPrintOrder, onNavigate }: DashboardProps) {
  // We filter out archived orders to keep the dashboard performant, clean, and fast
  const orders = allOrders.filter(o => !o.archived);

  const totalCount = orders.length;
  const activeCount = orders.filter(o => o.status === 'Active').length;
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;

  // 1. Calculate item statistics across categories (سلال، رفوف، أدراج)
  let basketsQty = 0;
  let flapsQty = 0;
  let drawersQty = 0;

  orders.forEach(o => {
    o.accessories.forEach(acc => {
      const category = acc.category;
      const qty = Number(acc.quantity) || 1;
      if (category === 'Basket') {
        basketsQty += qty;
      } else if (category === 'Flap') {
        flapsQty += qty;
      } else if (category === 'Drawer') {
        drawersQty += qty;
      }
    });
  });

  const hasCategoryData = basketsQty > 0 || flapsQty > 0 || drawersQty > 0;
  const categoryData = [
    { name: 'سلال (Baskets)', value: basketsQty, color: '#B68D40' },
    { name: 'رفوف ورفرف (Flaps)', value: flapsQty, color: '#3F3F3F' },
    { name: 'أدراج (Drawers)', value: drawersQty, color: '#D4A843' }
  ];

  // Visual placeholder if empty
  const visualCategoryData = hasCategoryData
    ? categoryData
    : [
        { name: 'سلال (Baskets) - مثال', value: 18, color: '#B68D40' },
        { name: 'رفوف ورفرف (Flaps) - مثال', value: 12, color: '#3F3F3F' },
        { name: 'أدراج (Drawers) - مثال', value: 25, color: '#D4A843' }
      ];

  // 2. Group orders by Month for "إجمالي الطلبات الشهرية"
  const monthlyCounts: { [key: string]: number } = {};
  const today = new Date();
  
  // Initialize last 6 months to make sure the chart displays beautifully
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyCounts[key] = 0;
  }

  orders.forEach(o => {
    if (!o.date) return;
    const parts = o.date.split('-');
    if (parts.length >= 2) {
      const key = `${parts[0]}-${parts[1]}`;
      if (monthlyCounts[key] !== undefined) {
        monthlyCounts[key] += 1;
      } else {
        // If older than last 6 months, we can add it or ignore for recent trend
        monthlyCounts[key] = 1;
      }
    }
  });

  const monthNames: { [key: string]: string } = {
    '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
    '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
    '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
  };

  const monthlyChartData = Object.entries(monthlyCounts)
    .map(([key, count]) => {
      const [year, month] = key.split('-');
      const monthName = monthNames[month] || month;
      return {
        key,
        name: `${monthName} ${year}`,
        'عدد الطلبات': count
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));

  const hasOrders = orders.length > 0;
  const visualMonthlyData = hasOrders
    ? monthlyChartData
    : monthlyChartData.map((d, idx) => ({
        ...d,
        'عدد الطلبات': [4, 8, 6, 12, 15, 20][idx] || 6
      }));

  // Calculate top accessories
  const accessoryFreq: { [key: string]: number } = {};
  orders.forEach(o => {
    o.accessories.forEach(acc => {
      accessoryFreq[acc.itemName] = (accessoryFreq[acc.itemName] || 0) + acc.quantity;
    });
  });

  const topAccessories = Object.entries(accessoryFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const recentOrders = orders.slice(0, 5);

  // 3. Group orders by Manufacturing Stage
  let designStageCount = 0;
  let cuttingStageCount = 0;
  let assemblyStageCount = 0;
  let paintingStageCount = 0;
  let deliveryStageCount = 0;

  orders.forEach(o => {
    const stage = o.stage || 'تصميم';
    if (stage === 'تصميم') designStageCount++;
    else if (stage === 'تقطيع') cuttingStageCount++;
    else if (stage === 'تجميع') assemblyStageCount++;
    else if (stage === 'طلاء') paintingStageCount++;
    else if (stage === 'تسليم') deliveryStageCount++;
  });

  const stageData = [
    { name: 'تصميم', value: designStageCount, color: '#6366f1' },
    { name: 'تقطيع', value: cuttingStageCount, color: '#f59e0b' },
    { name: 'تجميع', value: assemblyStageCount, color: '#8b5cf6' },
    { name: 'طلاء', value: paintingStageCount, color: '#ec4899' },
    { name: 'تسليم', value: deliveryStageCount, color: '#10b981' }
  ];

  const visualStageData = orders.length > 0 
    ? stageData 
    : [
        { name: 'تصميم', value: 3, color: '#6366f1' },
        { name: 'تقطيع', value: 2, color: '#f59e0b' },
        { name: 'تجميع', value: 5, color: '#8b5cf6' },
        { name: 'طلاء', value: 1, color: '#ec4899' },
        { name: 'تسليم', value: 4, color: '#10b981' }
      ];

  // 4. Calculate estimated values based on kitchen units & appliances
  const getOrderValue = (o: Order): number => {
    let val = 8000; // Base contract price
    val += o.units.filter(u => u.height && u.depth).length * 1200;
    val += o.appliances.filter(a => a.height && a.width).length * 2000;
    val += o.accessories.reduce((acc, curr) => acc + (Number(curr.quantity) || 1) * 750, 0);
    return val;
  };

  const monthlyValues: { [key: string]: number } = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyValues[key] = 0;
  }

  orders.forEach(o => {
    if (!o.date) return;
    const parts = o.date.split('-');
    if (parts.length >= 2) {
      const key = `${parts[0]}-${parts[1]}`;
      const val = getOrderValue(o);
      if (monthlyValues[key] !== undefined) {
        monthlyValues[key] += val;
      } else {
        monthlyValues[key] = val;
      }
    }
  });

  const monthlyValuesChartData = Object.entries(monthlyValues)
    .map(([key, value]) => {
      const [year, month] = key.split('-');
      const monthName = monthNames[month] || month;
      return {
        key,
        name: `${monthName} ${year}`,
        'قيمة الطلبات (SAR)': value
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));

  const visualMonthlyValuesData = hasOrders
    ? monthlyValuesChartData
    : monthlyValuesChartData.map((d, idx) => ({
        ...d,
        'قيمة الطلبات (SAR)': [45000, 72000, 61000, 115000, 134000, 185000][idx] || 50000
      }));

  // 5. Alert & Notification System: Delayed & Approaching soon orders
  interface FactoryAlert {
    id: string;
    customerName: string;
    contractNo: string;
    type: 'delayed' | 'approaching';
    daysLeftOrOverdue: number;
    deadlineDateStr: string;
    stage?: string;
  }

  const factoryAlerts: FactoryAlert[] = [];
  const nowTime = new Date().getTime();

  orders.forEach(o => {
    // Only alert on non-completed, non-cancelled orders
    if (o.status !== 'Active' && o.status !== 'Pending') return;
    if (!o.date) return;

    // Parse duration. e.g. "30 يوم" or "15"
    const daysMatch = o.deliveryDuration ? o.deliveryDuration.match(/\d+/) : null;
    const durationDays = daysMatch ? parseInt(daysMatch[0]) : 30; // default 30 days

    const orderDate = new Date(o.date);
    const deadlineTime = orderDate.getTime() + durationDays * 24 * 60 * 60 * 1000;
    const deadlineDate = new Date(deadlineTime);

    // Calculate difference in days between today and deadline
    const timeDiff = nowTime - deadlineTime;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // positive means overdue

    const deadlineDateStr = deadlineDate.toISOString().split('T')[0];

    if (daysDiff > 0) {
      factoryAlerts.push({
        id: o.id,
        customerName: o.customerName,
        contractNo: o.contractNo,
        type: 'delayed',
        daysLeftOrOverdue: daysDiff,
        deadlineDateStr,
        stage: o.stage
      });
    } else if (daysDiff >= -10) {
      // Approaching within 10 days
      factoryAlerts.push({
        id: o.id,
        customerName: o.customerName,
        contractNo: o.contractNo,
        type: 'approaching',
        daysLeftOrOverdue: Math.abs(daysDiff),
        deadlineDateStr,
        stage: o.stage
      });
    }
  });

  // Sort: worst delayed first, then approaching soonest
  factoryAlerts.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'delayed' ? -1 : 1;
    }
    return b.daysLeftOrOverdue - a.daysLeftOrOverdue;
  });

  const delayedCount = factoryAlerts.filter(a => a.type === 'delayed').length;
  const approachingCount = factoryAlerts.filter(a => a.type === 'approaching').length;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight">لوحة التحكم</h1>
          <p className="text-sm text-brand-med mt-1">الرئيسية / إحصائيات الأداء والمؤشرات العامة لمصنع فيلا كوزين</p>
        </div>
        <button
          onClick={() => onNavigate('lookups')}
          className="px-4 py-2 bg-brand-gold hover:bg-[#9A7008] text-white font-bold rounded-xl text-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-colors shadow-sm font-sans"
        >
          <Settings size={14} />
          إدارة وتسجيل مواصفات المطبخ ⚙️
        </button>
      </div>

      {/* Factory Follow-up Alerts & Notifications Area */}
      {(factoryAlerts.length > 0) ? (
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b pb-2.5">
            <div className="flex items-center gap-2 justify-start">
              <div className="relative">
                <Bell size={18} className="text-brand-gold animate-bounce" />
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-black text-[8px] flex items-center justify-center">
                  {factoryAlerts.length}
                </span>
              </div>
              <h3 className="font-black text-sm text-brand-dark">تنبيهات المصنع وجدول مواعيد تسليم المطابخ</h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black">
              {delayedCount > 0 && (
                <span className="px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
                  ⚠️ متأخر: {delayedCount}
                </span>
              )}
              {approachingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                  ⏰ يقترب موعده: {approachingCount}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
            {factoryAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all hover:shadow-sm ${
                  alert.type === 'delayed'
                    ? 'bg-rose-50/30 border-rose-100/70 hover:bg-rose-50/50'
                    : 'bg-amber-50/30 border-amber-100/70 hover:bg-amber-50/50'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="text-right">
                    <span className="font-black text-xs text-brand-dark block truncate max-w-[160px]">
                      {alert.customerName}
                    </span>
                    <span className="text-[10px] text-brand-med font-mono">
                      عقد: {alert.contractNo}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black ${
                      alert.type === 'delayed'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {alert.type === 'delayed' ? 'متأخر فائق' : 'اقترب التسليم'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-brand-med">المرحلة:</span>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-brand-dark font-black text-[9px]">
                      {alert.stage || 'تصميم'}
                    </span>
                  </div>
                  <span className="text-brand-med font-mono">تاريخ التسليم: {alert.deadlineDateStr}</span>
                </div>

                <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black ${
                      alert.type === 'delayed' ? 'text-rose-700' : 'text-amber-700'
                    }`}
                  >
                    {alert.type === 'delayed'
                      ? `⚠️ متأخر منذ ${alert.daysLeftOrOverdue} أيام`
                      : `⏰ متبقي ${alert.daysLeftOrOverdue} أيام فقط`}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onViewOrder(alert.id)}
                      className="px-2 py-1 bg-white hover:bg-gray-50 text-brand-dark border border-gray-200 rounded text-[9px] font-bold cursor-pointer transition-all"
                    >
                      عرض المواصفات
                    </button>
                    <button
                      onClick={() => onPrintOrder(alert.id)}
                      className="px-2 py-1 bg-brand-gold text-white hover:bg-[#9A7008] rounded text-[9px] font-bold cursor-pointer transition-all"
                    >
                      طباعة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3 text-right">
          <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle size={16} />
          </div>
          <div>
            <h4 className="text-xs font-black text-brand-dark">جميع طلبيات ومطابخ العملاء مطابقة للجدول الزمني بنجاح!</h4>
            <p className="text-[10px] text-brand-med mt-0.5">لا توجد أي طلبيات متأخرة أو قريبة جداً من استحقاق التسليم دون إتمامها.</p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border-r-4 border-brand-gold flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
            <FileText size={22} />
          </div>
          <div>
            <span className="text-2xl font-black text-brand-dark block">{totalCount}</span>
            <span className="text-[11px] text-brand-med font-bold">إجمالي كروت العملاء</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border-r-4 border-blue-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Calendar size={22} />
          </div>
          <div>
            <span className="text-2xl font-black text-brand-dark block">{activeCount}</span>
            <span className="text-[11px] text-brand-med font-bold">الطلبات النشطة (قيد العمل)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border-r-4 border-amber-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-2xl font-black text-brand-dark block">{pendingCount}</span>
            <span className="text-[11px] text-brand-med font-bold">طلبات قيد الانتظار والمراجعة</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border-r-4 border-emerald-500 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle size={22} />
          </div>
          <div>
            <span className="text-2xl font-black text-brand-dark block">{completedCount}</span>
            <span className="text-[11px] text-brand-med font-bold">الطلبات المكتملة والمُسلّمة</span>
          </div>
        </div>
      </div>

      {/* Dynamic Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Orders Area Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-gold" />
              <h3 className="font-bold text-sm text-brand-dark">حجم الطلبات الشهرية المضافة</h3>
            </div>
            {!hasOrders && (
              <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-bold">
                بيانات توضيحية
              </span>
            )}
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visualMonthlyData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B68D40" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#B68D40" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#595959' }} />
                <YAxis tick={{ fontSize: 10, fill: '#595959' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    direction: 'rtl', 
                    textAlign: 'right', 
                    borderRadius: '12px', 
                    border: '1px solid #eee', 
                    fontSize: '11px' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="عدد الطلبات" 
                  stroke="#B68D40" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorOrders)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category distribution (سلال، رفرف، أدراج) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-brand-gold" />
              <h3 className="font-bold text-sm text-brand-dark">توزيع إنتاج الملحقات والأصناف</h3>
            </div>
            {!hasCategoryData && (
              <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-bold">
                بيانات توضيحية
              </span>
            )}
          </div>

          <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-between">
            {/* Pie Chart display */}
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visualCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {visualCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      direction: 'rtl', 
                      textAlign: 'right', 
                      borderRadius: '12px', 
                      border: '1px solid #eee', 
                      fontSize: '11px' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend for category values */}
            <div className="w-full sm:w-1/2 space-y-3.5 pr-0 sm:pr-4">
              <div className="text-[11px] font-black text-brand-med pb-1">إجمالي القطع المصنّعة:</div>
              <div className="space-y-2">
                {visualCategoryData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-brand-dark text-[11px]">{item.name}</span>
                    </div>
                    <span className="font-black text-brand-dark bg-white px-2 py-0.5 rounded border border-gray-100">
                      {item.value} قطع
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Manufacturing and Financial Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Manufacturing Stages distribution */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-brand-gold" />
              <h3 className="font-bold text-sm text-brand-dark">توزيع كروت الطلبات بمراحل تصنيع المصنع</h3>
            </div>
            {!hasOrders && (
              <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-bold">
                بيانات توضيحية
              </span>
            )}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visualStageData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#595959' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#595959' }} />
                <Tooltip
                  contentStyle={{
                    direction: 'rtl',
                    textAlign: 'right',
                    borderRadius: '12px',
                    border: '1px solid #eee',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="value" name="عدد المطابخ" radius={[6, 6, 0, 0]}>
                  {visualStageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Financial/Production Value trends */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-gold" />
              <h3 className="font-bold text-sm text-brand-dark">تقدير قيم عقود كروت الإنتاج الشهرية (SAR)</h3>
            </div>
            {!hasOrders && (
              <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-bold">
                بيانات توضيحية
              </span>
            )}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visualMonthlyValuesData} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#595959' }} />
                <YAxis tick={{ fontSize: 10, fill: '#595959' }} />
                <Tooltip
                  formatter={(value) => [`${Number(value).toLocaleString()} SAR`, 'القيمة التقديرية للعقود']}
                  contentStyle={{
                    direction: 'rtl',
                    textAlign: 'right',
                    borderRadius: '12px',
                    border: '1px solid #eee',
                    fontSize: '11px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="قيمة الطلبات (SAR)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorValues)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Accessories Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Star size={18} className="text-brand-gold fill-brand-gold" />
            <h3 className="font-bold text-sm text-brand-dark">الإكسسوارات الأكثر طلباً</h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-[350px] overflow-y-auto">
            {topAccessories.length > 0 ? (
              topAccessories.map(([name, qty], idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-cream text-brand-gold text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-brand-dark">{name}</span>
                  </div>
                  <span className="bg-brand-cream text-brand-gold font-black text-xs px-2.5 py-1 rounded-full">
                    {qty} قطع
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-brand-med text-xs">لا توجد إكسسوارات مسجلة بعد.</div>
            )}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-gold"></span>
              آخر كروت طلبات العملاء المضافة
            </h3>
            <button
              onClick={() => onNavigate('customers')}
              className="text-xs text-brand-gold font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              عرض الكل
              <ArrowLeftCircle size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-bold text-brand-med">رقم العقد</th>
                  <th className="p-4 font-bold text-brand-med">اسم العميل</th>
                  <th className="p-4 font-bold text-brand-med">الجوال</th>
                  <th className="p-4 font-bold text-brand-med">تاريخ التسجيل</th>
                  <th className="p-4 font-bold text-brand-med">الحالة</th>
                  <th className="p-4 font-bold text-brand-med text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length > 0 ? (
                  recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-brand-cream/10 transition-colors">
                      <td className="p-4 font-mono font-bold text-brand-gold">{o.contractNo}</td>
                      <td className="p-4 font-bold text-brand-dark">{o.customerName}</td>
                      <td className="p-4 font-mono text-brand-med" dir="ltr">{o.phone}</td>
                      <td className="p-4 text-brand-med">{o.date}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          o.status === 'Active' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          o.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {o.status === 'Active' ? 'نشط' : o.status === 'Completed' ? 'مكتمل' : 'قيد الانتظار'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => onViewOrder(o.id)}
                            className="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                            title="عرض تفاصيل كرت العميل"
                          >
                            عرض
                          </button>
                          <button
                            onClick={() => onPrintOrder(o.id)}
                            className="p-1.5 rounded-lg text-brand-gold bg-brand-cream hover:bg-brand-gold hover:text-white transition-all cursor-pointer"
                            title="طباعة الكرت"
                          >
                            طباعة
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-brand-med">
                      لا توجد كروت عملاء مسجلة حالياً. انقر على "كرت جديد" لبدء الإضافة!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
