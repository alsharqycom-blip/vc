import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  Menu,
  FileSpreadsheet,
  Settings,
  Sliders,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, ActivityLog, User } from './types';
import {
  getOrders,
  saveOrder,
  deleteOrder,
  toggleArchiveOrder,
  getActivityLogs,
  addActivityLog,
  exportDatabase,
  importDatabase
} from './lib/storage';

import DashboardView from './components/DashboardView';
import CustomersView from './components/CustomersView';
import OrderFormView from './components/OrderFormView';
import OrderPrintView from './components/OrderPrintView';
import LookupsConfigView from './components/LookupsConfigView';
import UsersConfigView from './components/UsersConfigView';
import LoginView from './components/LoginView';
import { useToast } from './components/Toast';

type ViewType = 'dashboard' | 'customers' | 'new-order' | 'print' | 'edit' | 'lookups' | 'users-config';

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

  // Load orders and logs on start
  useEffect(() => {
    setOrders(getOrders());
    setLogs(getActivityLogs());
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
        } else if (currentUser?.role === 'admin' && e.key === '4') {
          e.preventDefault();
          setCurrentView('lookups');
          showToast('⚙️ تم الانتقال إلى تهيئة الخيارات', 'success');
        } else if (currentUser?.role === 'admin' && e.key === '5') {
          e.preventDefault();
          setCurrentView('users-config');
          showToast('👥 تم الانتقال إلى إدارة الموظفين', 'success');
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
      {/* Sidebar - Desktop and Mobile wrapper */}
      <aside
        className={`no-print w-64 bg-brand-dark text-brand-cream fixed top-0 bottom-0 right-0 z-50 flex flex-col shadow-xl transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-white/10 text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-white text-2xl font-black mx-auto shadow-inner">
            V
          </div>
          <h2 className="text-lg font-black text-brand-gold-light tracking-wide mt-2">VILLE CUISINE</h2>
          <p className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">Soft Industries Factory.co</p>
        </div>

        <nav className="flex-1 py-6 space-y-1">
          {[
            { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
            { id: 'customers', label: 'كروت العملاء', icon: Users },
            { id: 'new-order', label: 'كرت طلب جديد', icon: PlusCircle },
            { id: 'lookups', label: 'تهيئة المواصفات', icon: Sliders },
            ...(currentUser.role === 'admin' ? [{ id: 'users-config', label: 'إدارة الموظفين', icon: Settings }] : [])
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'customers' && (currentView === 'print' || currentView === 'edit'));
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3.5 px-6 py-3.5 text-xs font-bold transition-all border-r-4 cursor-pointer text-right ${
                  isActive
                    ? 'bg-white/5 border-brand-gold text-brand-gold-light'
                    : 'border-transparent text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-white font-black text-xs shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-right">
                <div className="text-[11px] font-bold text-white max-w-[120px] truncate">{currentUser.name}</div>
                <div className="text-[9px] text-gray-400">
                  {currentUser.role === 'admin' ? '💼 مدير عام المصنع' : '🎨 مهندس ديكور'}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
              title="تسجيل الخروج الآمن"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile background overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        ></div>
      )}

      {/* Main Container */}
      <div className="flex-1 md:margin-right md:mr-64 p-4 sm:p-6 lg:p-8 min-h-screen flex flex-col">
        {/* Mobile Header Bar */}
        <header className="no-print md:hidden flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-brand-dark flex items-center justify-center cursor-pointer"
          >
            <Menu size={18} />
          </button>
          <div className="text-center">
            <div className="text-sm font-black text-brand-dark">VILLE CUISINE</div>
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
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
