import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Shield,
  Key,
  Check,
  X,
  Lock,
  UserCheck,
  ArrowRight,
  UserPlus,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Briefcase,
  Layers,
  Settings,
  Eye,
  Activity
} from 'lucide-react';
import { getStoredUsers, saveStoredUsers, addActivityLog } from '../lib/storage';
import { User } from '../types';
import { useToast } from './Toast';

interface UsersConfigProps {
  onNavigate: (view: string) => void;
  currentUserEmail: string;
  onUsersChanged?: () => void;
}

// Structured, categorized permissions with descriptions for better staff management
const PERMISSION_CATEGORIES = [
  {
    id: 'orders',
    title: '📂 إدارة كروت طلبات وتصاميم العملاء',
    color: 'text-brand-gold',
    bg: 'bg-brand-cream/50',
    border: 'border-brand-gold/20',
    permissions: [
      { key: 'create_order', label: '📝 إنشاء كروت العملاء الجدد', desc: 'يسمح بفتح كروت تصاميم جديدة للعملاء وتعبئة تفاصيل المطبخ والوحدات' },
      { key: 'edit_order', label: '✏️ تعديل مواصفات وتفاصيل الكروت', desc: 'يسمح بتعديل مواصفات الألومنيوم، القياسات، الأجهزة، والاكسسوارات' },
      { key: 'delete_order', label: '🗑️ حذف كروت العملاء نهائياً', desc: 'صلاحية حساسة جداً لحذف كروت العملاء نهائياً من قاعدة بيانات المصنع' },
      { key: 'archive_order', label: '📦 أرشفة ونقل كروت الطلبات', desc: 'يسمح بأرشفة الطلبات المنتهية لتصفية القوائم، أو استعادة الكروت المؤرشفة' }
    ]
  },
  {
    id: 'factory',
    title: '🔧 إدارة وصيانة مرافق المصنع',
    color: 'text-blue-600',
    bg: 'bg-blue-50/30',
    border: 'border-blue-100',
    permissions: [
      { key: 'manage_machines', label: '🛠️ صيانة وجدولة الآلات والمعدات', desc: 'تتيح إضافة وتعديل المكائن (منشار CNC، كبس حواف) وتحديث مواعيد الصيانة الدورية لها' }
    ]
  },
  {
    id: 'admin',
    title: '📊 التحليلات والرقابة الإدارية العامة',
    color: 'text-purple-600',
    bg: 'bg-purple-50/30',
    border: 'border-purple-100',
    permissions: [
      { key: 'view_all', label: '📈 عرض التحليلات والتقارير المتقدمة', desc: 'تمنح صلاحية الإطلاع على الإحصائيات، الرسوم البيانية، وسجل الأنشطة التفصيلي للعمليات' },
      { key: 'manage_employees', label: '⚙️ إدارة الموظفين وتخصيص الصلاحيات', desc: 'صلاحية إدارة حسابات الموظفين، تغيير كلمات المرور، وتعديل صلاحياتهم الإدارية' }
    ]
  }
];

const ALL_PERMISSIONS = PERMISSION_CATEGORIES.flatMap(c => c.permissions);

export default function UsersConfigView({ onNavigate, currentUserEmail, onUsersChanged }: UsersConfigProps) {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'designer'>('designer');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['create_order', 'edit_order']);

  // Edit states
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'designer'>('designer');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  // Active hover help for UX
  const [hoveredPerm, setHoveredPerm] = useState<string | null>(null);

  useEffect(() => {
    setUsers(getStoredUsers());
  }, []);

  const handlePermissionToggle = (permKey: string, isEdit: boolean = false) => {
    if (isEdit) {
      if (editPermissions.includes(permKey)) {
        setEditPermissions(editPermissions.filter(k => k !== permKey));
      } else {
        setEditPermissions([...editPermissions, permKey]);
      }
    } else {
      if (selectedPermissions.includes(permKey)) {
        setSelectedPermissions(selectedPermissions.filter(k => k !== permKey));
      } else {
        setSelectedPermissions([...selectedPermissions, permKey]);
      }
    }
  };

  // Helper to apply quick presets to save time
  const applyPreset = (presetType: 'designer' | 'supervisor' | 'auditor' | 'full', isEdit: boolean = false) => {
    let perms: string[] = [];
    if (presetType === 'designer') {
      perms = ['create_order', 'edit_order'];
    } else if (presetType === 'supervisor') {
      perms = ['edit_order', 'archive_order', 'manage_machines'];
    } else if (presetType === 'auditor') {
      perms = ['view_all'];
    } else if (presetType === 'full') {
      perms = ['create_order', 'edit_order', 'delete_order', 'archive_order', 'manage_machines', 'view_all', 'manage_employees'];
    }

    if (isEdit) {
      setEditPermissions(perms);
    } else {
      setSelectedPermissions(perms);
    }
    showToast('⚡ تم تطبيق مجموعة الصلاحيات المحددة مسبقاً بنجاح!', 'info');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim() || !password.trim()) {
      showToast('⚠️ يرجى تعبئة جميع الحقول المطلوبة للموظف!', 'warning');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      showToast('⚠️ هذا البريد الإلكتروني أو اسم المستخدم مسجل بالفعل لموظف آخر!', 'warning');
      return;
    }

    const newUser: User = {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role,
      password: password.trim(),
      permissions: role === 'admin' ? ['all', ...selectedPermissions] : selectedPermissions
    };

    const updated = [...users, newUser];
    setUsers(updated);
    saveStoredUsers(updated, currentUserEmail);
    onUsersChanged?.();
    addActivityLog(currentUserEmail, "إضافة موظف جديد", `تم تسجيل موظف جديد: ${newUser.name} بصفة ${role === 'admin' ? 'مدير عام' : 'مصمم'}`);

    // Reset Form
    setEmail('');
    setName('');
    setPassword('');
    setRole('designer');
    setSelectedPermissions(['create_order', 'edit_order']);
    showToast('✅ تم إضافة الموظف الجديد بنجاح ومنحه الصلاحيات المحددة!', 'success');
  };

  const handleStartEdit = (index: number, user: User) => {
    setEditingIndex(index);
    setEditName(user.name);
    setEditPassword(user.password || '');
    setEditRole(user.role);
    setEditPermissions(user.permissions || []);
  };

  const handleSaveEdit = (index: number) => {
    if (!editName.trim() || !editPassword.trim()) {
      showToast('⚠️ لا يمكن ترك الاسم أو كلمة المرور فارغة!', 'warning');
      return;
    }

    const updated = [...users];
    const originalUser = updated[index];

    // Cannot demote last admin
    if (originalUser.email === 'admin@villecuisine.com' && editRole !== 'admin') {
      showToast('🚨 لا يمكنك إلغاء صفة المشرف العام للحساب الرئيسي!', 'error');
      return;
    }

    updated[index] = {
      ...originalUser,
      name: editName.trim(),
      role: editRole,
      password: editPassword.trim(),
      permissions: editRole === 'admin' ? ['all', ...editPermissions] : editPermissions
    };

    setUsers(updated);
    saveStoredUsers(updated, currentUserEmail);
    onUsersChanged?.();
    addActivityLog(currentUserEmail, "تعديل حساب موظف", `تم تعديل بيانات وصلاحيات الموظف: ${editName}`);
    setEditingIndex(null);
    showToast('✅ تم حفظ تعديلات حساب الموظف بنجاح!', 'success');
  };

  const handleDeleteUser = (index: number, user: User) => {
    if (user.email === 'admin@villecuisine.com') {
      showToast('🚨 غير مسموح بحذف الحساب الرئيسي للمشرف العام!', 'error');
      return;
    }

    if (user.email === currentUserEmail) {
      showToast('🚨 لا يمكنك حذف حسابك الحالي الذي تستخدمه لتسجيل الدخول!', 'error');
      return;
    }

    if (!window.confirm(`⚠️ تحذير: هل أنت متأكد من حذف حساب الموظف "${user.name}" نهائياً؟ لن يتمكن من تسجيل الدخول للنظام.`)) {
      return;
    }

    const updated = users.filter((_, idx) => idx !== index);
    setUsers(updated);
    saveStoredUsers(updated, currentUserEmail);
    onUsersChanged?.();
    addActivityLog(currentUserEmail, "حذف حساب موظف", `تم إزالة وحذف حساب الموظف: ${user.name}`);
    showToast('🗑️ تم حذف حساب الموظف بنجاح!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1 text-right">
          <div className="flex items-center gap-2.5 justify-start">
            <div className="p-2 bg-brand-gold/10 rounded-xl">
              <Users className="text-brand-gold animate-pulse" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-brand-dark">هيكلة وإدارة الموظفين وتخصيص الصلاحيات</h1>
              <p className="text-xs text-brand-med mt-0.5">التحكم في حسابات مهندسي الديكور والمصممين وتخصيص صلاحياتهم حسب المهام الفنية</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 bg-brand-dark hover:bg-brand-dark/95 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors font-sans"
        >
          <ArrowRight size={14} />
          العودة للرئيسية
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Employee Form Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
          <div className="border-b pb-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-brand-dark flex items-center gap-2 justify-start">
              <UserPlus size={18} className="text-brand-gold" />
              <span>تسجيل موظف جديد بالمصنع</span>
            </h2>
            <span className="text-[9px] bg-brand-gold/15 text-brand-gold px-2.5 py-1 rounded-full font-bold">نموذج آمن</span>
          </div>

          <form onSubmit={handleAddUser} className="space-y-4 text-right">
            {/* Display Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-med block">
                👤 اسم الموظف الثلاثي:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: المهندس فهد الغامدي"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:border-brand-gold outline-none transition-all"
              />
            </div>

            {/* Email / Username */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-med block">
                📧 اسم المستخدم / البريد الإلكتروني:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@villecuisine.com"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:border-brand-gold outline-none text-left transition-all"
                dir="ltr"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-med block">
                🔑 كلمة المرور (السرية):
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رقم سري للموظف"
                  className="w-full p-2.5 pr-9 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:border-brand-gold outline-none text-left transition-all"
                  dir="ltr"
                />
                <Key size={13} className="absolute right-3.5 top-3.5 text-brand-med" />
              </div>
            </div>

            {/* Role selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-med block">
                🏷️ الصفة والوظيفة الافتراضية في النظام:
              </label>
              <select
                value={role}
                onChange={(e) => {
                  const newRole = e.target.value as 'admin' | 'designer';
                  setRole(newRole);
                  if (newRole === 'admin') {
                    // Admins get everything by default
                    setSelectedPermissions(ALL_PERMISSIONS.map(p => p.key));
                  } else {
                    setSelectedPermissions(['create_order', 'edit_order']);
                  }
                }}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:border-brand-gold outline-none cursor-pointer transition-all"
              >
                <option value="designer">🎨 مصمم / مهندس ديكور (موصى به للمصممين)</option>
                <option value="admin">💼 مدير عام / مسؤول نظام (صلاحيات كاملة)</option>
              </select>
            </div>

            {/* Quick Presets Panel */}
            <div className="space-y-1.5 border-t border-dashed pt-3">
              <span className="text-[9px] font-black text-brand-gold block">⚡ مجموعات التعيين السريع للصلاحيات (Presets):</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset('designer')}
                  className="px-2 py-1.5 bg-brand-cream/60 hover:bg-brand-gold/10 text-brand-dark hover:text-brand-gold border border-[#B68D40]/10 rounded-lg text-[9px] font-bold text-center cursor-pointer transition-all truncate"
                >
                  🎨 مصمم مطابخ
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('supervisor')}
                  className="px-2 py-1.5 bg-blue-50/50 hover:bg-blue-100/40 text-blue-800 border border-blue-100 rounded-lg text-[9px] font-bold text-center cursor-pointer transition-all truncate"
                >
                  ⚙️ مشرف إنتاج وصيانة
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('auditor')}
                  className="px-2 py-1.5 bg-purple-50/50 hover:bg-purple-100/40 text-purple-800 border border-purple-100 rounded-lg text-[9px] font-bold text-center cursor-pointer transition-all truncate"
                >
                  📈 مراقب ومحلل بيانات
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('full')}
                  className="px-2 py-1.5 bg-red-50/50 hover:bg-red-100/40 text-red-800 border border-red-100 rounded-lg text-[9px] font-bold text-center cursor-pointer transition-all truncate"
                >
                  👑 مشرف كامل الصلاحيات
                </button>
              </div>
            </div>

            {/* Permissions Selection - Categorized Grid */}
            <div className="space-y-3 border-t pt-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-brand-gold flex items-center gap-1">
                  <Shield size={12} />
                  <span>تخصيص الصلاحيات المتاحة للموظف:</span>
                </label>
                <span className="text-[9px] font-mono font-black text-brand-med bg-gray-100 px-1.5 py-0.5 rounded">
                  {selectedPermissions.length} من {ALL_PERMISSIONS.length}
                </span>
              </div>

              {/* Warnings/Context Banner */}
              {selectedPermissions.length === 0 && (
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-800 font-bold flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>تنبيه: عدم اختيار أي صلاحية يعطل وصول الموظف للعمليات!</span>
                </div>
              )}

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {PERMISSION_CATEGORIES.map((category) => (
                  <div key={category.id} className="space-y-1.5">
                    <span className={`text-[9px] font-black tracking-wide block border-b pb-0.5 ${category.color}`}>
                      {category.title}
                    </span>
                    <div className="space-y-1">
                      {category.permissions.map((perm) => {
                        const hasPerm = selectedPermissions.includes(perm.key);
                        return (
                          <div
                            key={perm.key}
                            onMouseEnter={() => setHoveredPerm(perm.key)}
                            onMouseLeave={() => setHoveredPerm(null)}
                            onClick={() => handlePermissionToggle(perm.key, false)}
                            className={`w-full text-right p-2 rounded-xl text-[10px] font-bold transition-all border flex flex-col gap-0.5 cursor-pointer select-none ${
                              hasPerm
                                ? 'bg-brand-gold/5 border-brand-gold/70 text-brand-gold'
                                : 'bg-gray-50 hover:bg-gray-100 border-gray-150 text-brand-dark'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold">{perm.label}</span>
                              <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                                hasPerm ? 'bg-brand-gold border-brand-gold text-white' : 'border-gray-300'
                              }`}>
                                {hasPerm && <Check size={10} strokeWidth={3} />}
                              </span>
                            </div>
                            <p className="text-[9px] opacity-65 font-normal leading-tight">
                              {perm.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-brand-gold hover:bg-[#9A7008] text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <UserCheck size={14} />
              تسجيل الموظف وتفعيل الحساب
            </button>
          </form>
        </div>

        {/* Employees List Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="border-b pb-3 flex justify-between items-center">
            <h2 className="text-sm font-black text-brand-dark flex items-center gap-2 justify-start">
              <Lock size={16} className="text-brand-gold animate-spin-slow" />
              <span>قائمة الموظفين النشطين وصلاحياتهم الفعالة</span>
            </h2>
            <span className="text-[10px] text-brand-med font-bold">
              إجمالي الحسابات: <span className="text-brand-gold">{users.length} موظف</span>
            </span>
          </div>

          <div className="overflow-hidden border border-gray-100 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[11px]">
                  <th className="p-3.5 font-black text-brand-dark">الموظف / الحساب</th>
                  <th className="p-3.5 font-black text-brand-dark">الدور والوظيفة</th>
                  <th className="p-3.5 font-black text-brand-dark">الرقم السري</th>
                  <th className="p-3.5 font-black text-brand-dark">الصلاحيات الممنوحة</th>
                  <th className="p-3.5 font-black text-brand-dark text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u, index) => {
                  const isEditing = editingIndex === index;

                  return (
                    <tr key={u.email} className="hover:bg-gray-50/40 transition-colors">
                      {/* Name & Email */}
                      <td className="p-3.5">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="p-2 border border-brand-gold bg-white rounded-xl text-xs font-bold outline-none w-full shadow-sm"
                              placeholder="الاسم الثلاثي للموظف"
                            />
                            <span className="text-[10px] text-brand-med block font-mono">{u.email}</span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-brand-dark text-xs block">{u.name}</span>
                            <span className="text-[10px] text-brand-med block font-mono">{u.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Role */}
                      <td className="p-3.5">
                        {isEditing ? (
                          <select
                            value={editRole}
                            onChange={(e) => {
                              const newRole = e.target.value as 'admin' | 'designer';
                              setEditRole(newRole);
                              if (newRole === 'admin') {
                                setEditPermissions(ALL_PERMISSIONS.map(p => p.key));
                              }
                            }}
                            className="p-1.5 border border-brand-gold bg-white rounded-xl text-xs font-bold outline-none cursor-pointer shadow-sm w-full"
                          >
                            <option value="designer">🎨 مصمم</option>
                            <option value="admin">💼 مدير عام</option>
                          </select>
                        ) : (
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-100'
                              : 'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {u.role === 'admin' ? '💼 مدير عام' : '🎨 مصمم'}
                          </span>
                        )}
                      </td>

                      {/* Password */}
                      <td className="p-3.5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="p-2 border border-brand-gold bg-white rounded-xl text-xs font-mono font-bold outline-none w-28 text-left shadow-sm"
                            dir="ltr"
                          />
                        ) : (
                          <span className="font-mono text-brand-med bg-gray-100 px-2 py-1 rounded-lg text-[10px]">
                            {u.password || '••••••'}
                          </span>
                        )}
                      </td>

                      {/* Permissions */}
                      <td className="p-3.5 max-w-xs">
                        {isEditing ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-150">
                            {/* Preset Buttons for Editing */}
                            <div className="grid grid-cols-2 gap-1 pb-2 border-b border-gray-200">
                              <button
                                type="button"
                                onClick={() => applyPreset('designer', true)}
                                className="px-1.5 py-1 bg-white hover:bg-brand-gold/10 text-brand-dark rounded text-[8px] font-bold border cursor-pointer"
                              >
                                Preset: مصمم
                              </button>
                              <button
                                type="button"
                                onClick={() => applyPreset('supervisor', true)}
                                className="px-1.5 py-1 bg-white hover:bg-blue-50 text-brand-dark rounded text-[8px] font-bold border cursor-pointer"
                              >
                                Preset: مشرف
                              </button>
                            </div>

                            {PERMISSION_CATEGORIES.map(category => (
                              <div key={category.id} className="space-y-1">
                                <span className={`text-[8px] font-black block border-b pb-0.5 ${category.color}`}>
                                  {category.title}
                                </span>
                                {category.permissions.map(perm => {
                                  const hasPerm = editPermissions.includes(perm.key);
                                  return (
                                    <button
                                      type="button"
                                      key={perm.key}
                                      onClick={() => handlePermissionToggle(perm.key, true)}
                                      className={`w-full text-right p-1.5 rounded-lg text-[9px] font-bold transition-all flex items-center justify-between cursor-pointer border ${
                                        hasPerm ? 'border-brand-gold/40 text-brand-gold bg-brand-gold/5' : 'border-transparent text-brand-dark'
                                      }`}
                                    >
                                      <span>{perm.label}</span>
                                      <span className={`w-3 h-3 rounded flex items-center justify-center border ${
                                        hasPerm ? 'bg-brand-gold text-white' : 'border-gray-300'
                                      }`}>
                                        {hasPerm && <Check size={8} strokeWidth={4} />}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {u.role === 'admin' || (u.permissions && u.permissions.includes('all')) ? (
                              <span className="text-[9px] bg-purple-50 text-purple-700 font-bold border border-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                <ShieldCheck size={10} />
                                👑 صلاحيات المدير العام كاملة
                              </span>
                            ) : (
                              (u.permissions || []).map(p => {
                                const found = ALL_PERMISSIONS.find(itm => itm.key === p);
                                return (
                                  <span key={p} className="text-[9px] bg-gray-50 text-brand-dark border border-gray-150 px-2 py-0.5 rounded-lg hover:bg-brand-gold/5 hover:text-brand-gold hover:border-brand-gold/20 transition-all">
                                    {found ? found.label : p}
                                  </span>
                                );
                              })
                            )}
                            {(!u.permissions || u.permissions.length === 0) && u.role !== 'admin' && (
                              <span className="text-[9px] text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg italic font-bold">
                                ⚠️ لا توجد أي صلاحيات فاعلة!
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleSaveEdit(index)}
                              className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded-xl cursor-pointer transition-all shadow-sm"
                              title="حفظ التعديلات"
                            >
                              <Check size={13} strokeWidth={3} />
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="p-2 bg-gray-50 text-gray-700 hover:bg-gray-600 hover:text-white border border-gray-200 rounded-xl cursor-pointer transition-all shadow-sm"
                              title="إلغاء التعديل"
                            >
                              <X size={13} strokeWidth={3} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleStartEdit(index, u)}
                              className="p-2 text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white rounded-xl border border-blue-100/50 transition-all cursor-pointer shadow-sm"
                              title="تعديل المسمى والصلاحيات"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(index, u)}
                              className="p-2 text-rose-600 bg-rose-50/50 hover:bg-rose-600 hover:text-white rounded-xl border border-rose-100/50 transition-all cursor-pointer shadow-sm"
                              title="حذف الموظف نهائياً"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick tips panel */}
          <div className="p-4 bg-brand-cream/30 border border-brand-gold/10 rounded-2xl flex items-start gap-3 mt-4 text-right">
            <Sparkles className="text-brand-gold shrink-0 mt-0.5" size={16} />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-brand-dark">نصائح إدارة أمان المصنع:</h4>
              <p className="text-[10px] text-brand-med leading-relaxed">
                يُنصح بمنح حسابات المصممين فقط صلاحيات <span className="font-bold text-brand-dark">📝 إنشاء كروت العملاء الجدد</span> و <span className="font-bold text-brand-dark">✏️ تعديل المواصفات</span>.
                بينما تُترك صلاحيات الحذف التام <span className="font-bold text-brand-dark">🗑️</span> لمدير المصنع الرئيسي لتفادي الأخطاء وفقدان البيانات الهامة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple fallback to make compiler happy
function ShieldCheck({ size }: { size?: number }) {
  return <Shield className="text-purple-600 animate-pulse" size={size || 14} />;
}
