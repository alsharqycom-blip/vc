import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-5 left-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none" dir="rtl">
        <AnimatePresence>
          {toasts.map((toast) => {
            // Choose styles and icon based on type
            let bgStyle = 'bg-white text-gray-900 border-gray-100 shadow-xl';
            let iconColor = 'text-brand-gold';
            let Icon = Info;

            if (toast.type === 'success') {
              bgStyle = 'bg-emerald-900 text-emerald-50 border-emerald-800 shadow-emerald-900/10 shadow-lg';
              iconColor = 'text-emerald-400';
              Icon = CheckCircle;
            } else if (toast.type === 'error') {
              bgStyle = 'bg-rose-950 text-rose-50 border-rose-900 shadow-rose-900/10 shadow-lg';
              iconColor = 'text-rose-400';
              Icon = AlertCircle;
            } else if (toast.type === 'warning') {
              bgStyle = 'bg-amber-950 text-amber-50 border-amber-900 shadow-amber-900/10 shadow-lg';
              iconColor = 'text-amber-400';
              Icon = AlertTriangle;
            } else if (toast.type === 'info') {
              bgStyle = 'bg-brand-dark text-brand-cream border-white/10 shadow-black/20 shadow-lg';
              iconColor = 'text-brand-gold';
              Icon = SparklesIcon;
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 50, scale: 0.9, x: -50 }}
                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className={`pointer-events-auto border flex items-center justify-between p-4 rounded-xl gap-3 ${bgStyle}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={iconColor} />
                  <span className="text-xs font-black leading-relaxed">{toast.message}</span>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 rounded-lg hover:bg-white/10 text-current opacity-60 hover:opacity-100 transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// Sparkles local icon fallback to prevent dynamic imports or missing references
function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
    </svg>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
