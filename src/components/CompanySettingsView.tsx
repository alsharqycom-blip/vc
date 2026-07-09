import React, { useState, useRef } from 'react';
import { Save, Building, Image, Upload, Trash2, Palette, Info, Check } from 'lucide-react';
import { CompanySettings, saveCompanySettings } from '../lib/storage';
import { useToast } from './Toast';

interface CompanySettingsProps {
  settings: CompanySettings;
  onSaveSettings: (newSettings: CompanySettings) => void;
  currentUserEmail: string;
}

export default function CompanySettingsView({
  settings,
  onSaveSettings,
  currentUserEmail
}: CompanySettingsProps) {
  const { showToast } = useToast();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [companyDetails, setCompanyDetails] = useState(settings.companyDetails);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [themeColor, setThemeColor] = useState(settings.themeColor);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const palettes = [
    {
      id: 'charcoal' as const,
      name: 'الفحم الكوني والذهبي (الافتراضي)',
      description: 'مظهر احترافي فاخر باللون الفحمي الداكن والذهبي الدافئ المريح للعين.',
      dark: '#3F3F3F',
      gold: '#B68D40',
      cream: '#FDFAED'
    },
    {
      id: 'emerald' as const,
      name: 'الأخضر الملكي والذهبي',
      description: 'مظهر حيوي يعكس الفخامة مستوحى من الغابات الخضراء العميقة واللمسات الذهبية.',
      dark: '#064E3B',
      gold: '#D97706',
      cream: '#F0FDF4'
    },
    {
      id: 'navy' as const,
      name: 'الأزرق الكلاسيكي والذهبي',
      description: 'هوية تقنية رسمية وعميقة باللون الكحلي الأنيق ولمسات متباينة رائعة.',
      dark: '#172554',
      gold: '#F59E0B',
      cream: '#F0F9FF'
    },
    {
      id: 'burgundy' as const,
      name: 'العنابي الحديث والذهبي',
      description: 'تصميم دافئ يعكس الفخامة المطلقة للمطابخ الحديثة ذات التصاميم الفاخرة.',
      dark: '#4C0519',
      gold: '#CA8A04',
      cream: '#FFF1F2'
    },
    {
      id: 'bronze' as const,
      name: 'البرونز والقهوة الترابي',
      description: 'ألوان أرضية دافئة مستوحاة من الأخشاب والقهوة لتناسب بيئات الورش والمصانع العريقة.',
      dark: '#451A03',
      gold: '#B45309',
      cream: '#FFFBEB'
    }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('⚠️ يرجى تحميل ملف صورة صالح فقط (PNG, JPG, JPEG)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setLogoUrl(base64);
        showToast('📸 تم رفع شعار الشركة الجديد بنجاح!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('⚠️ يرجى سحب وإفلات صورة صالحة فقط', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setLogoUrl(base64);
        showToast('📸 تم رفع شعار الشركة الجديد بنجاح!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!companyName.trim()) {
      showToast('⚠️ يرجى ملء حقل اسم الشركة أولاً!', 'warning');
      return;
    }

    const updated: CompanySettings = {
      companyName,
      companyDetails,
      logoUrl,
      themeColor
    };

    onSaveSettings(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-brand-dark flex items-center gap-2 justify-start">
          <Palette size={24} className="text-brand-gold" />
          <span>إعدادات الشركة والهوية البصرية</span>
        </h1>
        <p className="text-sm text-brand-med mt-1">تخصيص الاسم التجاري، شعار الشركة، ومظهر الألوان الكامل لبيئة العمل</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Logo card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-between space-y-6">
          <div className="text-center w-full">
            <h3 className="font-black text-sm text-brand-dark mb-1">شعار الشركة / صورة البروفايل</h3>
            <p className="text-[10px] text-brand-med">يظهر في القائمة الجانبية للتطبيق وفي ترويسة تقارير الطباعة A4</p>
          </div>

          {/* Logo container */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="w-44 h-44 rounded-full border-2 border-dashed border-gray-300 hover:border-brand-gold bg-gray-50 flex flex-col items-center justify-center p-3 cursor-pointer relative group overflow-hidden transition-all duration-300 shadow-inner"
          >
            {logoUrl ? (
              <>
                <img
                  src={logoUrl}
                  alt="شعار الشركة"
                  className="w-full h-full object-contain rounded-full"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity">
                  <Upload size={20} className="mb-1" />
                  <span>تغيير الشعار</span>
                </div>
              </>
            ) : (
              <div className="text-center space-y-2 p-2">
                <Image className="mx-auto text-gray-400" size={32} />
                <div className="text-[9px] font-bold text-gray-500">
                  اسحب الصورة هنا أو <span className="text-brand-gold underline">اضغط للتصفح</span>
                </div>
                <div className="text-[8px] text-gray-400">يدعم PNG, JPG (دائري تلقائي)</div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {logoUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLogoUrl('');
                showToast('🗑️ تم إزالة الشعار والمطالبة بالافتراضي', 'info');
              }}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all border border-red-200"
            >
              <Trash2 size={12} />
              حذف الشعار
            </button>
          )}

          <div className="bg-amber-50 border border-amber-250 p-3 rounded-xl text-[10px] text-amber-800 leading-relaxed text-right flex items-start gap-2">
            <Info size={14} className="shrink-0 mt-0.5 text-amber-600" />
            <span>نصيحة: للمظهر المثالي، استخدم صورة بصيغة PNG شفافة ذات أبعاد مربعة ليتم تنسيقها مع الهيدر الجانبي بشكل لائق.</span>
          </div>
        </div>

        {/* Company Settings form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-black text-sm text-brand-dark border-b border-gray-100 pb-2.5 flex items-center gap-1.5">
            <Building size={16} className="text-brand-gold" />
            <span>البيانات والمسمى التجاري</span>
          </h3>

          <div className="space-y-4 text-right">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-med block">
                اسم الشركة أو المسمى التجاري للمصنع: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="مثال: مصنع فيلا كوزين للمطابخ"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black focus:bg-white focus:border-brand-gold outline-none text-right shadow-sm text-brand-dark"
              />
            </div>

            {/* Details */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-med block">
                تفاصيل الشركة وعنوان التواصل (يظهر أسفل كروت الطباعة):
              </label>
              <textarea
                value={companyDetails}
                onChange={(e) => setCompanyDetails(e.target.value)}
                rows={3}
                placeholder="العنوان، رقم السجل التجاري، أرقام المعرض والهواتف الرسمية للمبيعات والمصنع..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:border-brand-gold outline-none text-right shadow-sm text-brand-dark leading-relaxed"
              />
            </div>
          </div>

          {/* Color Palettes Selection */}
          <div className="space-y-3 pt-2">
            <h3 className="font-black text-sm text-brand-dark border-b border-gray-100 pb-2.5 flex items-center gap-1.5">
              <Palette size={16} className="text-brand-gold" />
              <span>ألوان بيئة العمل والهوية البصرية المتكاملة</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {palettes.map((p) => {
                const isActive = themeColor === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setThemeColor(p.id);
                      showToast(`🎨 تم اختيار مظهر: ${p.name}`, 'info');
                    }}
                    className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer space-y-2 relative group ${
                      isActive
                        ? 'border-brand-gold bg-brand-cream/15 ring-2 ring-brand-gold/10'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {/* Selected Badge */}
                    {isActive && (
                      <span className="absolute left-3 top-3.5 bg-brand-gold text-white w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                        <Check size={10} strokeWidth={4} />
                      </span>
                    )}

                    <div className="space-y-1 pr-1">
                      <div className="text-xs font-black text-brand-dark flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-gray-200 inline-block"
                          style={{ backgroundColor: p.dark }}
                        />
                        <span>{p.name}</span>
                      </div>
                      <p className="text-[10px] text-brand-med leading-relaxed">{p.description}</p>
                    </div>

                    {/* Color Preview strip */}
                    <div className="flex gap-1.5 h-4 w-1/3 rounded overflow-hidden border border-gray-200/50 mt-1">
                      <div className="flex-1" style={{ backgroundColor: p.dark }} title="اللون الداكن الأساسي" />
                      <div className="flex-1" style={{ backgroundColor: p.gold }} title="لون الإبراز والذهب" />
                      <div className="flex-1" style={{ backgroundColor: p.cream }} title="لون الخلفيات والكريم" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              onClick={handleSave}
              className="px-5 py-3 bg-brand-dark hover:bg-brand-gold text-brand-cream hover:text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md border-2 border-brand-gold"
            >
              <Save size={15} />
              حفظ وتطبيق إعدادات الهوية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
