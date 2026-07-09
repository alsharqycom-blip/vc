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
  UserPlus
} from 'lucide-react';
import { getStoredUsers, saveStoredUsers, addActivityLog } from '../lib/storage';
import { User } from '../types';
import { useToast } from './Toast';

interface UsersConfigProps {
  onNavigate: (view: string) => void;
  currentUserEmail: string;
}

const ALL_PERMISSIONS = [
  { key: 'create_order', label: '📝 إنشاء كروت العملاء الجدد' },
  { key: 'edit_order', label: '✏️ تعديل ومراجعة كروت العملاء' },
  { key: 'delete_order', label: '🗑️ حذف كروت العملاء نهائياً' },
  { key: 'archive_order', label: '📦 أرشفة وإلغاء أرشفة كروت العملاء' },
  { key: 'view_all', label: '📊 عرض التحليلات المتقدمة والرسوم البيانية وسجل الأنشطة' },
  { key: 'manage_employees', label: '⚙️ إدارة الموظفين وصلاحيات الإدارة (المدير العام)' }
];

export default function UsersConfigView({ onNavigate, currentUserEmail }: UsersConfigProps) {
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
    addActivityLog(currentUserEmail, "حذف حساب موظف", `تم إزالة وحذف حساب الموظف: ${user.name}`);
    showToast('🗑️ تم حذف حساب الموظف بنجاح!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1 text-right">
          <div className="flex items-center gap-2 justify-start">
            <Users className="text-brand-gold animate-pulse" size={22} />
            <h1 className="text-xl font-black text-brand-dark">إدارة الموظفين والصلاحيات الإدارية</h1>
          </div>
          <p className="text-xs text-brand-med mt-0.5">لوحة التحكم / التحكم في حسابات الموظفين وتوزيع أدوار العمل بالمصنع</p>
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
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-brand-dark border-b pb-2.5 flex items-center gap-2 justify-start">
            <UserPlus size={16} className="text-brand-gold" />
            <span>تسجيل موظف جديد بالمصنع</span>
          </h2>

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
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:bg-white focus:border-brand-gold outline-none"
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
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold focus:bg-white focus:border-brand-gold outline-none text-left"
                dir="ltr"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-med block">
                🔑 كلمة المرور (السر):
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رقم سري للموظف"
                  className="w-full p-2.5 pr-8 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold focus:bg-white focus:border-brand-gold outline-none text-left"
                  dir="ltr"
                />
                <Key size={13} className="absolute right-2.5 top-3.5 text-brand-med" />
              </div>
            </div>

            {/* Role selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-med block">
                🏷️ الصفة والوظيفة في المصنع:
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:bg-white focus:border-brand-gold outline-none cursor-pointer"
              >
                <option value="designer">🎨 مصمم / مهندس ديكور</option>
                <option value="admin">💼 مدير عام / مسؤول نظام</option>
              </select>
            </div>

            {/* Permissions Selection */}
            <div className="space-y-2 border-t pt-3">
              <label className="text-[10px] font-black text-brand-gold block">
                🛡️ تخصيص الصلاحيات المتاحة للموظف:
              </label>
              
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {ALL_PERMISSIONS.map((perm) => {
                  const hasPerm = selectedPermissions.includes(perm.key);
                  return (
                    <button
                      type="button"
                      key={perm.key}
                      onClick={() => handlePermissionToggle(perm.key, false)}
                      className={`w-full text-right p-2 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-between cursor-pointer ${
                        hasPerm
                          ? 'bg-brand-gold/5 border-brand-gold text-brand-gold'
                          : 'bg-gray-50/50 border-gray-200/50 text-brand-dark'
                      }`}
                    >
                      <span>{perm.label}</span>
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                        hasPerm ? 'bg-brand-gold border-brand-gold text-white' : 'border-gray-300'
                      }`}>
                        {hasPerm && <Check size={10} strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-brand-gold hover:bg-[#9A7008] text-white font-black rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Plus size={15} />
              تسجيل الموظف وتفعيل الحساب
            </button>
          </form>
        </div>

        {/* Employees List Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-brand-dark border-b pb-2.5 flex items-center gap-2 justify-start">
            <Lock size={16} className="text-brand-gold animate-spin-slow" />
            <span>قائمة الموظفين النشطين وصلاحياتهم الفعالة</span>
          </h2>

          <div className="overflow-hidden border border-gray-100 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-[11px]">
                  <th className="p-3.5 font-black text-brand-dark">الموظف / البريد</th>
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
                    <tr key={u.email} className="hover:bg-gray-50/50 transition-colors">
                      {/* Name & Email */}
                      <td className="p-3.5">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="p-1.5 border border-brand-gold bg-white rounded text-xs font-bold outline-none w-full"
                              placeholder="الاسم"
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
                            onChange={(e) => setEditRole(e.target.value as any)}
                            className="p-1 border border-brand-gold bg-white rounded text-xs font-bold outline-none cursor-pointer"
                          >
                            <option value="designer">🎨 مصمم</option>
                            <option value="admin">💼 مدير عام</option>
                          </select>
                        ) : (
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-100'
                              : 'bg-blue-50 text-blue-700 border border-blue-100'
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
                            className="p-1.5 border border-brand-gold bg-white rounded text-xs font-mono font-bold outline-none w-24 text-left"
                            dir="ltr"
                          />
                        ) : (
                          <span className="font-mono text-brand-med bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                            {u.password || '••••••'}
                          </span>
                        )}
                      </td>

                      {/* Permissions */}
                      <td className="p-3.5 max-w-xs">
                        {isEditing ? (
                          <div className="space-y-1.5 max-h-32 overflow-y-auto p-1.5 bg-gray-50 rounded border">
                            {ALL_PERMISSIONS.map(perm => {
                              const hasPerm = editPermissions.includes(perm.key);
                              return (
                                <button
                                  type="button"
                                  key={perm.key}
                                  onClick={() => handlePermissionToggle(perm.key, true)}
                                  className={`w-full text-right p-1 rounded text-[9px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                                    hasPerm ? 'text-brand-gold' : 'text-brand-dark'
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
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {u.role === 'admin' || (u.permissions && u.permissions.includes('all')) ? (
                              <span className="text-[9px] bg-red-50 text-red-700 font-bold border border-red-100 px-1.5 py-0.5 rounded">
                                👑 صلاحيات كاملة للنظام (المدير)
                              </span>
                            ) : (
                              (u.permissions || []).map(p => {
                                const found = ALL_PERMISSIONS.find(itm => itm.key === p);
                                return (
                                  <span key={p} className="text-[9px] bg-gray-100 text-brand-dark border border-gray-150 px-1.5 py-0.5 rounded">
                                    {found ? found.label.substring(3) : p}
                                  </span>
                                );
                              })
                            )}
                            {(!u.permissions || u.permissions.length === 0) && u.role !== 'admin' && (
                              <span className="text-[9px] text-brand-med italic">لا توجد صلاحيات معينة</span>
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
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer transition-all"
                              title="حفظ التعديلات"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="p-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded cursor-pointer transition-all"
                              title="إلغاء"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleStartEdit(index, u)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title="تعديل المسمى والصلاحيات"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(index, u)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
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
        </div>
      </div>
    </div>
  );
}
