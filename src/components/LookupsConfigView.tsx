import React, { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ArrowRight,
  Search,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { getStoredLookups, saveStoredLookups } from '../lib/storage';
import { useToast } from './Toast';

interface LookupsConfigProps {
  onNavigate: (view: string) => void;
  currentUserEmail: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  basketOptions: "🛒 السلال والإكسسوارات (Accessories)",
  hingnesOptions: "🔩 المفصلات (Hinges)",
  handelOptions: "🚪 المقابض (Handles)",
  glassOptions: "🪟 الزجاج (Glass Options)",
  shatterOptions: "🪚 كود الشتر (Shatter Codes)",
  aluminumOptions: "🎨 ألوان الألمنيوم (Aluminum Colors)",
  sinkOptions: "🚰 المجلى والمغاسل (Sinks)",
  drawerRunnersOptions: "🛝 سحابات الأدراج (Drawer Runners)",
  capShelfOptions: "📦 غطاء الرفوف (Cap Shelves)",
  lightingOptions: "💡 الإضاءة (Lighting)",
  unitStructureOptions: "🧱 هيكل الوحدات (Unit Structure)",
  interiorCabinetOptions: "🚪 الحشو الداخلي / الخزانة (Interior Cabinet)"
};

export default function LookupsConfigView({ onNavigate, currentUserEmail }: LookupsConfigProps) {
  const { showToast } = useToast();
  const [lookups, setLookups] = useState<Record<string, string[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('basketOptions');
  const [newItemText, setNewItemText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inline editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    setLookups(getStoredLookups());
  }, []);

  const currentList = lookups[selectedCategory] || [];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    if (currentList.includes(newItemText.trim())) {
      showToast('⚠️ هذا العنصر موجود بالفعل في هذه القائمة!', 'warning');
      return;
    }

    const updatedList = [...currentList, newItemText.trim()];
    const updatedLookups = {
      ...lookups,
      [selectedCategory]: updatedList
    };

    setLookups(updatedLookups);
    saveStoredLookups(updatedLookups, currentUserEmail);
    setNewItemText('');
    showToast('✨ تم إضافة الخيار الجديد بنجاح!', 'success');
  };

  const handleStartEdit = (index: number, val: string) => {
    setEditingIndex(index);
    setEditingText(val);
  };

  const handleSaveEdit = (index: number) => {
    if (!editingText.trim()) return;
    
    const updatedList = [...currentList];
    updatedList[index] = editingText.trim();
    
    const updatedLookups = {
      ...lookups,
      [selectedCategory]: updatedList
    };

    setLookups(updatedLookups);
    saveStoredLookups(updatedLookups, currentUserEmail);
    setEditingIndex(null);
    setEditingText('');
    showToast('✏️ تم تعديل الخيار وحفظ التحديثات بنجاح!', 'success');
  };

  const handleDeleteItem = (index: number, val: string) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف "${val}" من القائمة؟`)) {
      return;
    }

    const updatedList = currentList.filter((_, idx) => idx !== index);
    const updatedLookups = {
      ...lookups,
      [selectedCategory]: updatedList
    };

    setLookups(updatedLookups);
    saveStoredLookups(updatedLookups, currentUserEmail);
    
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingText('');
    }
    showToast('🗑️ تم حذف الخيار من القائمة بنجاح!', 'success');
  };

  const handleResetToDefault = () => {
    if (!window.confirm('🚨 تحذير: هل أنت متأكد من رغبتك في إعادة تعيين جميع القوائم للخيارات الافتراضية للشركة؟ هذا سيحذف أي إضافات قمت بها.')) {
      return;
    }
    localStorage.removeItem('vc_lookups');
    const defaults = getStoredLookups();
    setLookups(defaults);
    saveStoredLookups(defaults, currentUserEmail);
    showToast('🔄 تم استعادة جميع القوائم الافتراضية بنجاح!', 'success');
  };

  const filteredList = currentList.filter(item => 
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1 text-right">
          <div className="flex items-center gap-2 justify-start">
            <Settings className="text-brand-gold animate-spin-slow" size={22} />
            <h1 className="text-xl font-black text-brand-dark">تهيئة وتسجيل مواصفات المطبخ</h1>
          </div>
          <p className="text-xs text-brand-med mt-0.5">لوحة التحكم / تهيئة قوائم الخيارات المنسدلة في كرت مواصفات العميل</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleResetToDefault}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-2 border border-rose-200/50 cursor-pointer transition-colors font-sans"
          >
            <RotateCcw size={14} />
            إعادة التعيين للافتراضي
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 bg-brand-dark hover:bg-brand-dark/95 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors font-sans"
          >
            <ArrowRight size={14} />
            العودة للرئيسية
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Sidebar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-black text-brand-gold border-b pb-2 flex items-center gap-1.5 justify-start">
            <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
            📂 قائمة جداول المواصفات (الدوال)
          </h3>
          <p className="text-[11px] text-brand-med leading-relaxed">
            اختر الجدول أو القائمة المنسدلة لتعديل خياراتها وتحديث الأصناف التي تظهر للمصممين داخل كرت العميل:
          </p>

          <div className="space-y-1.5 pt-2">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const isSelected = selectedCategory === key;
              const itemCount = lookups[key]?.length || 0;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedCategory(key);
                    setEditingIndex(null);
                    setSearchQuery('');
                  }}
                  className={`w-full text-right p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
                    isSelected
                      ? 'bg-brand-gold/10 border-brand-gold text-brand-gold'
                      : 'bg-gray-50/50 hover:bg-gray-100/50 border-transparent text-brand-dark'
                  }`}
                >
                  <span className="truncate">{label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    isSelected ? 'bg-brand-gold text-white' : 'bg-gray-200 text-brand-med'
                  }`}>
                    {itemCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected List Operations Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* List Details Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h2 className="text-sm font-black text-brand-dark flex items-center gap-2 justify-start">
                  <Sparkles size={16} className="text-brand-gold" />
                  <span>تعديل قائمة: {CATEGORY_LABELS[selectedCategory]}</span>
                </h2>
                <p className="text-[11px] text-brand-med mt-1">
                  يمكنك إضافة عناصر جديدة للجدول، أو تعديل المسميات، أو حذفها نهائياً لتحديث كرت مواصفات العميل.
                </p>
              </div>
            </div>

            {/* Operations Bar: Add item form and search */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Add form */}
              <form onSubmit={handleAddItem} className="space-y-1.5">
                <label className="text-[10px] font-black text-brand-dark block text-right">
                  ➕ إضافة عنصر جديد للقائمة:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="مثال: مسمى الموديل أو الصنف..."
                    className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-brand-gold outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-brand-gold hover:bg-[#9A7008] text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors font-sans"
                  >
                    <Plus size={14} />
                    إضافة
                  </button>
                </div>
              </form>

              {/* Search filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-brand-dark block text-right">
                  🔍 تصفية وعرض الخيارات:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث داخل هذا الجدول..."
                    className="w-full p-2.5 pr-9 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-brand-gold outline-none"
                  />
                  <Search size={14} className="absolute right-3 top-3.5 text-brand-med" />
                </div>
              </div>
            </div>

            {/* Items display container */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50/70 p-3 border-b border-gray-100 flex justify-between items-center text-[10px] font-black text-brand-med">
                <span>اسم ومواصفة العنصر (صنف القائمة المنسدلة)</span>
                <span>الإجراءات</span>
              </div>

              {filteredList.length > 0 ? (
                <div className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
                  {filteredList.map((item, index) => {
                    const originalIndex = currentList.indexOf(item);
                    const isEditing = editingIndex === originalIndex;

                    return (
                      <div key={item + '-' + index} className="p-3.5 flex items-center justify-between gap-4 bg-white hover:bg-gray-50/40 transition-colors">
                        {isEditing ? (
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="flex-1 p-1.5 border border-brand-gold bg-white rounded text-xs font-bold outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(originalIndex)}
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 flex items-center justify-center cursor-pointer"
                              title="حفظ التعديل"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="p-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded border border-gray-200 flex items-center justify-center cursor-pointer"
                              title="إلغاء"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 text-right">
                            <span className="text-xs font-bold text-brand-dark font-sans">{item}</span>
                          </div>
                        )}

                        {!isEditing && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEdit(originalIndex, item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title="تعديل"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(originalIndex, item)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 text-center text-xs text-brand-med space-y-1 bg-white">
                  <p>لا توجد خيارات مطابقة لبحثك في هذا الجدول.</p>
                  <p className="text-[10px]">اكتب المسمى في الأعلى واضغط على "إضافة" لتسجيل بند جديد.</p>
                </div>
              )}
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 text-[10px] text-amber-800 leading-relaxed text-right">
              💡 <strong>توضيح فني للمصنع:</strong> أي تغييرات أو إضافات يتم إجراؤها على هذه القوائم ستنعكس فوراً بداخل صفحة "كرت طلب جديد" و "تعديل طلب" عند اختيار مواصفات المطبخ، مما يتيح التخصيص الكامل للعميل وحفظ بيانات دقيقة تظهر أيضاً بوضوح داخل ورقة الطباعة وملفات الـ PDF.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
