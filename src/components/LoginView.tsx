import React, { useState } from 'react';
import { Lock, User, Key, Eye, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';
import { getStoredUsers, addActivityLog } from '../lib/storage';
import { User as UserType } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserType) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      try {
        const users = getStoredUsers();
        // Match by email/username
        const matched = users.find(
          u => u.email.toLowerCase() === username.trim().toLowerCase() && u.password === password.trim()
        );

        if (matched) {
          addActivityLog(matched.email, "تسجيل دخول", `تم تسجيل دخول الموظف: ${matched.name} بنجاح.`);
          onLoginSuccess(matched);
        } else {
          setErrorMsg('⚠️ اسم المستخدم أو كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('حدث خطأ أثناء محاولة تسجيل الدخول.');
      } finally {
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-4 text-right" dir="rtl">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-150 shadow-xl overflow-hidden p-8 space-y-6">
        
        {/* Logo and Titles */}
        <div className="text-center space-y-3.5">
          <div className="w-16 h-16 rounded-full bg-brand-dark border-2 border-brand-gold flex items-center justify-center text-brand-gold font-black mx-auto text-3xl shadow-lg relative">
            V
            <span className="absolute -bottom-1 -right-1 text-xs">✨</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black text-brand-dark">بوابة الموظفين والمهندسين</h1>
            <h2 className="text-xs font-bold text-brand-gold">برنامج فيلا كوزين للإنتاج والمواصفات | Ville Cuisine</h2>
          </div>
          <div className="h-0.5 w-12 bg-brand-gold/40 mx-auto rounded-full"></div>
        </div>

        {/* Info notice */}
        <div className="bg-brand-cream/40 border border-brand-gold/15 p-3.5 rounded-2xl text-[11px] text-brand-dark leading-relaxed">
          💼 <strong>المستخدم الافتراضي للموقع:</strong>
          <div className="mt-1 font-mono text-[10px] space-y-0.5 text-left" dir="ltr">
            <div>Email: admin@villecuisine.com</div>
            <div>Password: admin</div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 justify-start">
            <ShieldAlert size={16} className="text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-brand-med block">
              📧 البريد الإلكتروني أو اسم المستخدم:
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="example@villecuisine.com"
                className="w-full p-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:border-brand-gold outline-none text-left"
                dir="ltr"
              />
              <User size={15} className="absolute right-3.5 top-3.5 text-brand-med" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-brand-med block">
              🔑 كلمة المرور الخاصة بك:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 pr-10 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:border-brand-gold outline-none text-left"
                dir="ltr"
              />
              <Lock size={15} className="absolute right-3.5 top-3.5 text-brand-med" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-3.5 text-brand-med hover:text-brand-dark transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-dark hover:bg-brand-dark/95 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>تسجيل الدخول الآمن</span>
                <Sparkles size={14} className="text-brand-gold animate-bounce" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-[10px] text-brand-med">
            مصنع فيلا كوزين لإنتاج أثاث المطابخ الحديثة © 2026. جميع الحقوق محفوظة لجهة الإدارة.
          </p>
        </div>
      </div>
    </div>
  );
}
