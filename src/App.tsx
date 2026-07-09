import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  Menu,
  FileSpreadsheet,
  Settings,
  Sliders,
  LogOut,
  Clock,
  Building,
  Wrench,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, ActivityLog, User, Machine } from './types';
import {
  getOrders,
  saveOrder,
  deleteOrder,
  toggleArchiveOrder,
  getActivityLogs,
  addActivityLog,
  exportDatabase,
  importDatabase,
  getCompanySettings,
  saveCompanySettings,
  getStoredUsers,
  CompanySettings
} from './lib/storage';

import DashboardView from './components/DashboardView';
import CustomersView from './components/CustomersView';
import OrderFormView from './components/OrderFormView';
import OrderPrintView from './components/OrderPrintView';
import LookupsConfigView from './components/LookupsConfigView';
import UsersConfigView from './components/UsersConfigView';
import ActivityLogsView from './components/ActivityLogsView';
import CompanySettingsView from './components/CompanySettingsView';
import MachinesView from './components/MachinesView';
import LoginView from './components/LoginView';
import OverdueAlertModal from './components/OverdueAlertModal';
import { useToast } from './components/Toast';

type ViewType = 'dashboard' | 'customers' | 'new-order' | 'print' | 'edit' | 'lookups' | 'users-config' | 'activity-logs' | 'company-settings' | 'machines';

const themeColors = {
  charcoal: {
    dark: '#3F3F3F',
    med: '#595959',
    gold: '#B68D40',
    goldLight: '#D4A843',
    cream: '#FDFAED',
    creamLight: '#FCFAF7'
  },
  emerald: {
    dark: '#064E3B',
    med: '#15803D',
    gold: '#D97706',
    goldLight: '#F59E0B',
    cream: '#F0FDF4',
    creamLight: '#F9FEFA'
  },
  navy: {
    dark: '#172554',
    med: '#1D4ED8',
    gold: '#F59E0B',
    goldLight: '#FBBF24',
    cream: '#F0F9FF',
    creamLight: '#F8FAFC'
  },
  burgundy: {
    dark: '#4C0519',
    med: '#BE123C',
    gold: '#CA8A04',
    goldLight: '#FBBF24',
    cream: '#FFF1F2',
    creamLight: '#FAFAF9'
  },
  bronze: {
    dark: '#451A03',
    med: '#9A3412',
    gold: '#B45309',
    goldLight: '#F59E0B',
    cream: '#FFFBEB',
    creamLight: '#FFFCF5'
  }
};

export default function App() {
  const { showToast } = useToast();

  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vc_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // App routing and workspace state
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => getCompanySettings());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('vc_sidebar_collapsed') === 'true');

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('vc_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleSaveCompanySettings = (newSettings: CompanySettings) => {
    const updated = saveCompanySettings(newSettings, currentUser?.email || 'مجهول');
    setCompanySettings(updated);
    showToast('⚙️ تم تطبيق إعدادات الشركة وتنسيق الألوان بنجاح!', 'success');
  };

  // Load orders and logs on start
  useEffect(() => {
    const loadedOrders = getOrders();
    setOrders(loadedOrders);
    setLogs(getActivityLogs());

    // Check for overdue orders on application load
    const now = new Date().getTime();
    const hasOverdue = loadedOrders.some(o => {
      if (o.status === 'Completed' || o.status === 'تم التركيب' || o.status === 'Cancelled') return false;
      if (!o.date) return false;

      const daysMatch = o.deliveryDuration ? o.deliveryDuration.match(/\d+/) : null;
      const durationDays = daysMatch ? parseInt(daysMatch[0]) : 30;

      const orderDate = new Date(o.date);
      const deadlineTime = orderDate.getTime() + durationDays * 24 * 60 * 60 * 1000;
      return now > deadlineTime;
    });

    if (hasOverdue) {
      // Set a brief delay to allow App render first, then show modal
      setTimeout(() => {
        setShowOverdueModal(true);
      }, 800);
    }
  }, []);

  // Keyboard shortcuts for rapid navigation: Ctrl + 1 (Dashboard), Ctrl + 2 (Customers), Ctrl + 3 (New order), etc.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in form controls
      const target = e.target as HTMLElement;
      if (target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      )) {
        return;
      }

      if (e.ctrlKey && !e.altKey && !e.shiftKey) {
        if (e.key === '1') {
          e.preventDefault();
          setCurrentView('dashboard');
          showToast('🏠 تم الانتقال إلى لوحة التحكم', 'success');
        } else if (e.key === '2') {
          e.preventDefault();
          setCurrentView('customers');
          showToast('👥 تم الانتقال إلى كروت العملاء', 'success');
        } else if (e.key === '3') {
          e.preventDefault();
          setSelectedOrder(null);
          setCurrentView('new-order');
          showToast('➕ تم الانتقال إلى تسجيل كرت جديد', 'success');
        } else if (e.key === '4') {
          e.preventDefault();
          setCurrentView('lookups');
          showToast('⚙️ تم الانتقال إلى تهيئة الخيارات', 'success');
        } else if ((currentUser?.role === 'admin' || currentUser?.permissions?.includes('manage_employees') || currentUser?.permissions?.includes('all')) && e.key === '5') {
          e.preventDefault();
          setCurrentView('users-config');
          showToast('👥 تم الانتقال إلى إدارة الموظفين', 'success');
        } else if ((currentUser?.role === 'admin' || currentUser?.permissions?.includes('view_all') || currentUser?.permissions?.includes('all')) && e.key === '6') {
          e.preventDefault();
          setCurrentView('activity-logs');
          showToast('📜 تم الانتقال إلى سجل نشاط الموظفين', 'success');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentUser, showToast]);

  const handleSaveOrder = (orderData: Order) => {
    const updated = saveOrder(orderData, currentUser.email);
    setOrders(updated);
    setLogs(getActivityLogs());
    setCurrentView('customers');
    showToast('✅ تم حفظ طلب العميل بنجاح في قاعدة البيانات!', 'success');
  };

  const handleDeleteOrder = (orderId: string) => {
    const updated = deleteOrder(orderId, currentUser.email);
    setOrders(updated);
    setLogs(getActivityLogs());
    showToast('🗑️ تم حذف كرت العميل بنجاح!', 'success');
  };

  const handleToggleArchive = (orderId: string) => {
    const updated = toggleArchiveOrder(orderId, currentUser.email);
    setOrders(updated);
    setLogs(getActivityLogs());
    const ord = updated.find(o => o.id === orderId);
    if (ord?.archived) {
      showToast('📦 تم نقل الطلب إلى الأرشيف بنجاح!', 'success');
    } else {
      showToast('📁 تم نقل الطلب إلى القائمة النشطة بنجاح!', 'success');
    }
  };

  const handleDuplicateOrder = (orderId: string) => {
    const orderToDuplicate = orders.find(o => o.id === orderId);
    if (orderToDuplicate) {
      const duplicated: Order = {
        ...orderToDuplicate,
        id: `ORD-${Date.now()}`,
        contractNo: `${orderToDuplicate.contractNo}-نسخة`,
        customerName: `${orderToDuplicate.customerName} (نسخة)`,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        isDuplicate: true,
        status: 'قيد الانتظار',
        stage: 'تصميم'
      };
      setSelectedOrder(duplicated);
      setCurrentView('new-order');
      showToast('📋 تم نسخ بيانات الكرت بنجاح، يرجى مراجعة المواصفات وحفظه كطلب جديد!', 'success');
    }
  };

  const handleRefreshOrders = () => {
    setOrders(getOrders());
    setLogs(getActivityLogs());
  };

  const handleLogout = () => {
    localStorage.removeItem('vc_current_user');
    setCurrentUser(null);
    setCurrentView('dashboard');
    showToast('🔒 تم تسجيل الخروج بنجاح!', 'success');
  };

  const handleImportBackup = (jsonContent: string): boolean => {
    const success = importDatabase(jsonContent, currentUser.email);
    if (success) {
      setOrders(getOrders());
      setLogs(getActivityLogs());
      showToast('✅ تم استيراد النسخة الاحتياطية بنجاح!', 'success');
    } else {
      showToast('❌ فشل استيراد النسخة الاحتياطية. يرجى التحقق من الملف!', 'error');
    }
    return success;
  };

  const handleExportBackup = () => {
    const jsonStr = exportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ville_cuisine_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setCurrentView('print');
    }
  };

  const handleEditOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setCurrentView('edit');
    }
  };

  const handlePrintOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setCurrentView('print');
      setTimeout(() => {
        window.print();
      }, 500);
    }
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view as ViewType);
    if (view === 'new-order') {
      setSelectedOrder(null);
    }
  };

  // Application Layout
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('vc_current_user', JSON.stringify(user));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream flex font-sans text-right text-brand-dark" dir="rtl">
      {/* Dynamic Theme Color Variables Injection */}
      <style>{`
        :root {
          --color-brand-dark: ${themeColors[companySettings.themeColor]?.dark || '#3F3F3F'} !important;
          --color-brand-med: ${themeColors[companySettings.themeColor]?.med || '#595959'} !important;
          --color-brand-gold: ${themeColors[companySettings.themeColor]?.gold || '#B68D40'} !important;
          --color-brand-gold-light: ${themeColors[companySettings.themeColor]?.goldLight || '#D4A843'} !important;
          --color-brand-cream: ${themeColors[companySettings.themeColor]?.cream || '#FDFAED'} !important;
        }
      `}</style>
      {/* Sidebar - Desktop and Mobile wrapper */}
      <aside
        className={`no-print bg-brand-dark text-brand-cream fixed top-0 bottom-0 right-0 z-50 flex flex-col shadow-xl transition-all duration-300 ${
          mobileSidebarOpen
            ? 'w-64 translate-x-0'
            : sidebarCollapsed
            ? 'w-64 md:w-16 translate-x-full md:translate-x-0'
            : 'w-64 translate-x-full md:translate-x-0'
        }`}
      >
        <div className={`p-5 border-b border-white/10 text-center space-y-2 transition-all duration-300 ${sidebarCollapsed ? 'md:p-3 md:space-y-0' : ''}`}>
          {companySettings.logoUrl ? (
            <img
              src={companySettings.logoUrl}
              alt={companySettings.companyName}
              className={`rounded-full object-contain mx-auto border-2 border-brand-gold bg-white p-0.5 shadow-md transition-all duration-300 ${
                sidebarCollapsed ? 'w-14 h-14 md:w-9 md:h-9' : 'w-14 h-14'
              }`}
            />
          ) : (
            <div className={`rounded-full bg-brand-gold flex items-center justify-center text-white font-black mx-auto shadow-inner transition-all duration-300 ${
              sidebarCollapsed ? 'w-12 h-12 md:w-9 md:h-9 text-xl md:text-base' : 'w-12 h-12 text-2xl'
            }`}>
              V
            </div>
          )}
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
              <h2 className="text-sm font-black text-brand-gold-light tracking-wide truncate max-w-[200px]" title={companySettings.companyName}>
                {companySettings.companyName}
              </h2>
              <p className="text-[9px] opacity-65 truncate max-w-[200px]" title={companySettings.companyDetails}>
                {companySettings.companyDetails}
              </p>
            </motion.div>
          )}
        </div>

        <nav className={`flex-1 py-6 space-y-1 ${sidebarCollapsed ? 'md:py-4' : ''}`}>
          {[
            { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
            { id: 'customers', label: 'كروت العملاء', icon: Users },
            { id: 'new-order', label: 'كرت طلب جديد', icon: PlusCircle },
            { id: 'machines', label: 'صيانة الآلات والمعدات', icon: Wrench },
            { id: 'lookups', label: 'تهيئة المواصفات', icon: Sliders },
            ...((currentUser.role === 'admin' || currentUser.permissions?.includes('manage_employees') || currentUser.permissions?.includes('all')) ? [
              { id: 'users-config', label: 'إدارة الموظفين', icon: Settings }
            ] : []),
            ...((currentUser.role === 'admin' || currentUser.permissions?.includes('all')) ? [
              { id: 'company-settings', label: 'إعدادات الشركة', icon: Building }
            ] : []),
            ...((currentUser.role === 'admin' || currentUser.permissions?.includes('view_all') || currentUser.permissions?.includes('all')) ? [
              { id: 'activity-logs', label: 'نشاط الموظفين', icon: Clock }
            ] : [])
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'customers' && (currentView === 'print' || currentView === 'edit'));
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center transition-all cursor-pointer text-right ${
                  sidebarCollapsed
                    ? 'md:justify-center md:px-0 md:py-3.5 md:border-r-4'
                    : 'gap-3.5 px-6 py-3.5 text-xs font-bold border-r-4'
                } ${
                  isActive
                    ? 'bg-white/5 border-brand-gold text-brand-gold-light'
                    : 'border-transparent text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
                title={item.label}
              >
                <Icon size={sidebarCollapsed ? 18 : 16} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className={`p-4 border-t border-white/10 space-y-3 transition-all duration-300 ${sidebarCollapsed ? 'md:p-2' : ''}`}>
          <div className={`flex items-center justify-between gap-2 bg-white/5 rounded-xl border border-white/5 transition-all duration-300 ${
            sidebarCollapsed ? 'md:flex-col md:p-1 md:gap-2' : 'p-2.5'
          }`}>
            <div className={`flex items-center gap-3 transition-all duration-300 ${sidebarCollapsed ? 'md:flex-col md:gap-1' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-white font-black text-xs shadow-sm" title={currentUser.name}>
                {currentUser.name.charAt(0)}
              </div>
              {!sidebarCollapsed && (
                <div className="text-right">
                  <div className="text-[11px] font-bold text-white max-w-[120px] truncate">{currentUser.name}</div>
                  <div className="text-[9px] text-gray-400">
                    {currentUser.role === 'admin' ? '💼 مدير عام المصنع' : '🎨 مهندس ديكور'}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className={`rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer ${
                sidebarCollapsed ? 'p-1' : 'p-1.5'
              }`}
              title="تسجيل الخروج الآمن"
            >
              <LogOut size={sidebarCollapsed ? 15 : 14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar Collapse/Expand Button for Desktop */}
      <button
        onClick={toggleSidebar}
        className={`no-print hidden md:flex fixed top-1/2 -translate-y-1/2 z-50 items-center justify-center w-8 h-8 rounded-full bg-brand-dark border-2 border-brand-gold text-brand-cream hover:bg-brand-gold hover:text-white shadow-lg transition-all duration-300 cursor-pointer ${
          sidebarCollapsed ? 'right-16' : 'right-64'
        }`}
        title={sidebarCollapsed ? 'توسيع القائمة الجانبية' : 'تصغير القائمة الجانبية'}
      >
        {sidebarCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Mobile background overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        ></div>
      )}

      {/* Main Container */}
      <div className={`flex-1 p-4 sm:p-6 lg:p-8 min-h-screen flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'md:mr-0' : 'md:mr-64'
      }`}>
        {/* Mobile Header Bar */}
        <header className="no-print md:hidden flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-brand-dark flex items-center justify-center cursor-pointer"
          >
            <Menu size={18} />
          </button>
          <div className="text-center">
            <div className="text-sm font-black text-brand-dark truncate max-w-[150px]">{companySettings.companyName}</div>
            <div className="text-[9px] opacity-60">نظام إدارة مصنع المطابخ</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-white font-black text-xs">
            {currentUser.name.charAt(0)}
          </div>
        </header>

        {/* Dynamic Route View container */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && (
                <DashboardView
                  orders={orders}
                  onViewOrder={handleViewOrder}
                  onPrintOrder={handlePrintOrder}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'customers' && (
                <CustomersView
                  orders={orders}
                  currentUser={currentUser}
                  onViewOrder={handleViewOrder}
                  onEditOrder={handleEditOrder}
                  onPrintOrder={handlePrintOrder}
                  onDeleteOrder={handleDeleteOrder}
                  onToggleArchive={handleToggleArchive}
                  onDuplicateOrder={handleDuplicateOrder}
                  onNavigate={handleNavigate}
                  onImportBackup={handleImportBackup}
                  onExportBackup={handleExportBackup}
                  onRefreshOrders={handleRefreshOrders}
                />
              )}

              {(currentView === 'new-order' || currentView === 'edit') && (
                <OrderFormView
                  initialOrder={selectedOrder}
                  onSave={handleSaveOrder}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'print' && selectedOrder && (
                <OrderPrintView
                  order={selectedOrder}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'lookups' && (
                <LookupsConfigView
                  onNavigate={handleNavigate}
                  currentUserEmail={currentUser.email}
                />
              )}

              {currentView === 'users-config' && (
                <UsersConfigView
                  onNavigate={handleNavigate}
                  currentUserEmail={currentUser.email}
                  onUsersChanged={() => {
                    const allUsers = getStoredUsers();
                    const updated = allUsers.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
                    if (updated) {
                      setCurrentUser(updated);
                      localStorage.setItem('vc_current_user', JSON.stringify(updated));
                    }
                  }}
                />
              )}

              {currentView === 'company-settings' && (
                <CompanySettingsView
                  settings={companySettings}
                  onSaveSettings={handleSaveCompanySettings}
                  currentUserEmail={currentUser.email}
                />
              )}

              {currentView === 'activity-logs' && (
                <ActivityLogsView
                  logs={logs}
                />
              )}

              {currentView === 'machines' && (
                <MachinesView
                  currentUser={currentUser}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <OverdueAlertModal
        isOpen={showOverdueModal}
        onClose={() => setShowOverdueModal(false)}
        orders={orders}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
