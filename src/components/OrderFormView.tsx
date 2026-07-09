import React, { useState, useEffect, useRef } from 'react';
import { Save, Eraser, Printer, ArrowRight, Layers, Layout, Grid, Sparkles, Upload, Camera, Trash2, Image, X, Video, RefreshCw } from 'lucide-react';
import { Order, UnitSize, ApplianceSize, AccessorySelected, HardwareSelected } from '../types';
import { getStoredLookups } from '../lib/storage';
import { useToast } from './Toast';

interface OrderFormProps {
  initialOrder: Order | null;
  onSave: (order: Order) => void;
  onNavigate: (view: string) => void;
}

export default function OrderFormView({ initialOrder, onSave, onNavigate }: OrderFormProps) {
  const { showToast } = useToast();
  // Load dynamic LOOKUPS
  const [LOOKUPS, setLOOKUPS] = useState<Record<string, string[]>>(() => getStoredLookups());

  // 1. Basic Fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [contractNo, setContractNo] = useState('');
  const [deliveryDuration, setDeliveryDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Order['status']>('قيد الانتظار');
  const [stage, setStage] = useState<'تصميم' | 'تقطيع' | 'تجميع' | 'طلاء' | 'تسليم'>('تصميم');
  const [designerName, setDesignerName] = useState('المصمم الرئيسي');

  // 2. Specifications
  const [aluminumColor, setAluminumColor] = useState('');
  const [shatterCode, setShatterCode] = useState('');
  const [unitStructure, setUnitStructure] = useState('soft');
  const [capShelf, setCapShelf] = useState('');
  const [skirting, setSkirting] = useState('');
  const [lighting, setLighting] = useState('');
  const [shatterGlass, setShatterGlass] = useState('');
  const [interiorCabinet, setInteriorCabinet] = useState('');

  // 3. Unit Sizes
  const [baseUnit, setBaseUnit] = useState<UnitSize>({ type: 'Base unit', height: '', depth: '', color: '' });
  const [wallUnit1, setWallUnit1] = useState<UnitSize>({ type: 'Wall unit 1', height: '', depth: '', color: '' });
  const [wallUnit2, setWallUnit2] = useState<UnitSize>({ type: 'Wall unit 2', height: '', depth: '', color: '' });
  const [gapUnit, setGapUnit] = useState<UnitSize>({ type: 'Gap unit', height: '', depth: '', color: '' });
  const [tallUnit, setTallUnit] = useState<UnitSize>({ type: 'Tall unit', height: '', depth: '', color: '' });

  // 4. Accessories - Drawers (TBX, Iner, Legra, Duble Wall, Under Sink, Hitch)
  const [tbxSizes, setTbxSizes] = useState({ M: '', D: '', C: '' });
  const [inerSizes, setInerSizes] = useState({ M: '', D: '', C: '' });
  const [legraSizes, setLegraSizes] = useState({ M: '', D: '', C: '' });
  const [dubleSizes, setDubleSizes] = useState({ M: '', D: '', C: '' });
  const [underSizes, setUnderSizes] = useState({ M: '', D: '', C: '' });
  const [hitchSizes, setHitchSizes] = useState({ M: '', D: '', C: '' });
  const [drawerHandleType, setDrawerHandleType] = useState('');

  // 5. Accessories - Flap (HF, HL, HK, HS, HKS, HKS(T), HK(T))
  const [flaps, setFlaps] = useState<{ [key: string]: boolean }>({
    HF: false,
    HL: false,
    HK: false,
    HS: false,
    HKS: false,
    'HKS(T)': false,
    'HK(T)': false
  });

  // 6. Accessories - Basket (list of selected baskets)
  const [selectedBaskets, setSelectedBaskets] = useState<{ [itemName: string]: number }>({});
  const [basketSearchQuery, setBasketSearchQuery] = useState('');

  // 7. Appliances (Oven, MIC, Fridge, Dish Washer, Hood, Sink)
  const [oven, setOven] = useState<ApplianceSize>({ type: 'Oven', height: '', width: '', depth: '' });
  const [mic, setMic] = useState<ApplianceSize>({ type: 'MIC', height: '', width: '', depth: '' });
  const [fridge, setFridge] = useState<ApplianceSize>({ type: 'Fridge', height: '', width: '', depth: '' });
  const [dishWasher, setDishWasher] = useState<ApplianceSize>({ type: 'Dish Washer', height: '', width: '', depth: '' });
  const [hood, setHood] = useState<ApplianceSize>({ type: 'Hood', height: '', width: '', depth: '' });
  const [sink, setSink] = useState<ApplianceSize>({ type: 'Sink', height: '', width: '', depth: '', sinkModel: '', mixerModel: '' });

  // 8. Hardware
  const [hingnes, setHingnes] = useState('');
  const [handel, setHandel] = useState('');
  const [glass, setGlass] = useState('');

  // 9. External Image / Croqui URLs & Camera Uploads
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError('');
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access failed, trying fallback input", err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err2) {
        setCameraError('فشل تشغيل الكاميرا. يرجى التحقق من صلاحيات المتصفح أو تحميل الصورة كملف.');
        showToast('⚠️ تعذر الوصول للكاميرا، يرجى تفعيل الصلاحية أو رفع الملف.', 'error');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImageUrls(prev => [...prev, dataUrl]);
        showToast('📸 تم التقاط الصورة وإضافتها للطلب بنجاح!', 'success');
        stopCamera();
      }
    } catch (err) {
      console.error("Failed to capture photo", err);
      showToast('❌ فشل التقاط الصورة من الكاميرا', 'error');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        showToast('⚠️ يرجى اختيار ملفات صور فقط (PNG, JPG, JPEG)', 'warning');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setImageUrls(prev => [...prev, base64]);
          showToast(`📸 تم تحميل الصورة "${file.name}" بنجاح!`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (e.target) e.target.value = '';
  };

  // Tabs for accessories section
  const [activeAccTab, setActiveAccTab] = useState<'drawers' | 'flap' | 'basket'>('drawers');

  // Populate data if modifying an existing card
  useEffect(() => {
    if (initialOrder) {
      setCustomerName(initialOrder.customerName || '');
      setPhone(initialOrder.phone || '');
      setAddress(initialOrder.address || '');
      setContractNo(initialOrder.contractNo || '');
      setDeliveryDuration(initialOrder.deliveryDuration || '');
      setNotes(initialOrder.notes || '');
      setStatus(initialOrder.status || 'قيد الانتظار');
      setDesignerName(initialOrder.designerName || 'المصمم الرئيسي');

      setAluminumColor(initialOrder.aluminumColor || '');
      setShatterCode(initialOrder.shatterCode || '');
      setUnitStructure(initialOrder.unitStructure || 'soft');
      setCapShelf(initialOrder.capShelf || '');
      setSkirting(initialOrder.skirting || '');
      setLighting(initialOrder.lighting || '');
      setShatterGlass(initialOrder.shatterGlass || '');
      setInteriorCabinet(initialOrder.interiorCabinet || '');

      const findUnit = (type: string, def: UnitSize) => initialOrder.units.find(u => u.type === type) || def;
      setBaseUnit(findUnit('Base unit', { type: 'Base unit', height: '', depth: '', color: '' }));
      setWallUnit1(findUnit('Wall unit 1', { type: 'Wall unit 1', height: '', depth: '', color: '' }));
      setWallUnit2(findUnit('Wall unit 2', { type: 'Wall unit 2', height: '', depth: '', color: '' }));
      setGapUnit(findUnit('Gap unit', { type: 'Gap unit', height: '', depth: '', color: '' }));
      setTallUnit(findUnit('Tall unit', { type: 'Tall unit', height: '', depth: '', color: '' }));

      // Reset drawer inputs
      const drawTbx = { M: '', D: '', C: '' };
      const drawIner = { M: '', D: '', C: '' };
      const drawLegra = { M: '', D: '', C: '' };
      const drawDuble = { M: '', D: '', C: '' };
      const drawUnder = { M: '', D: '', C: '' };
      const drawHitch = { M: '', D: '', C: '' };

      initialOrder.accessories.forEach(acc => {
        if (acc.category === 'Drawer') {
          const parts = acc.itemName.split('_');
          const dType = parts[0];
          const dSize = acc.size as 'M' | 'D' | 'C';
          if (dSize) {
            if (dType === 'TBX') drawTbx[dSize] = acc.quantity.toString();
            if (dType === 'Iner') drawIner[dSize] = acc.quantity.toString();
            if (dType === 'Legra') drawLegra[dSize] = acc.quantity.toString();
            if (dType === 'Duble') drawDuble[dSize] = acc.quantity.toString();
            if (dType === 'Under') drawUnder[dSize] = acc.quantity.toString();
            if (dType === 'Hitch') drawHitch[dSize] = acc.quantity.toString();
          }
        }
      });
      setTbxSizes(drawTbx);
      setInerSizes(drawIner);
      setLegraSizes(drawLegra);
      setDubleSizes(drawDuble);
      setUnderSizes(drawUnder);
      setHitchSizes(drawHitch);

      // Handle type
      const hAcc = initialOrder.accessories.find(acc => acc.category === 'Drawer' && acc.itemName.startsWith('HANDLE_'));
      setDrawerHandleType(hAcc ? hAcc.itemName.replace('HANDLE_', '') : '');

      // Flaps
      const activeFlaps = { HF: false, HL: false, HK: false, HS: false, HKS: false, 'HKS(T)': false, 'HK(T)': false };
      initialOrder.accessories.forEach(acc => {
        if (acc.category === 'Flap' && acc.itemName in activeFlaps) {
          activeFlaps[acc.itemName as keyof typeof activeFlaps] = true;
        }
      });
      setFlaps(activeFlaps);

      // Baskets
      const basketsObj: { [itemName: string]: number } = {};
      initialOrder.accessories.forEach(acc => {
        if (acc.category === 'Basket') {
          basketsObj[acc.itemName] = acc.quantity;
        }
      });
      setSelectedBaskets(basketsObj);

      // Appliances
      const findApp = (type: string, def: ApplianceSize) => initialOrder.appliances.find(a => a.type === type) || def;
      setOven(findApp('Oven', { type: 'Oven', height: '', width: '', depth: '' }));
      setMic(findApp('MIC', { type: 'MIC', height: '', width: '', depth: '' }));
      setFridge(findApp('Fridge', { type: 'Fridge', height: '', width: '', depth: '' }));
      setDishWasher(findApp('Dish Washer', { type: 'Dish Washer', height: '', width: '', depth: '' }));
      setHood(findApp('Hood', { type: 'Hood', height: '', width: '', depth: '' }));
      setSink(findApp('Sink', { type: 'Sink', height: '', width: '', depth: '', sinkModel: '', mixerModel: '' }));

      // Hardware
      setHingnes(initialOrder.hardware.find(h => h.type === 'Hingnes')?.value || '');
      setHandel(initialOrder.hardware.find(h => h.type === 'Handel')?.value || '');
      setGlass(initialOrder.hardware.find(h => h.type === 'Glass')?.value || '');

      // Images
      setImageUrls(initialOrder.imageUrls || []);
      setStage(initialOrder.stage || 'تصميم');
    }
  }, [initialOrder]);

  // Save Event
  const handleSave = () => {
    if (!customerName.trim()) {
      showToast('⚠️ الرجاء كتابة اسم العميل أولاً!', 'warning');
      return;
    }
    if (!contractNo.trim()) {
      showToast('⚠️ الرجاء كتابة رقم العقد لحفظ الطلب!', 'warning');
      return;
    }

    // Accumulate unit sizes
    const units: UnitSize[] = [baseUnit, wallUnit1, wallUnit2, gapUnit, tallUnit];

    // Accumulate appliances
    const appliances: ApplianceSize[] = [oven, mic, fridge, dishWasher, hood, sink];

    // Accumulate accessories
    const accessories: AccessorySelected[] = [];

    // Drawers
    const saveDrawers = (dType: string, sizes: { M: string, D: string, C: string }) => {
      if (sizes.M && parseInt(sizes.M) > 0) accessories.push({ category: 'Drawer', itemName: `${dType}_M`, quantity: parseInt(sizes.M), size: 'M' });
      if (sizes.D && parseInt(sizes.D) > 0) accessories.push({ category: 'Drawer', itemName: `${dType}_D`, quantity: parseInt(sizes.D), size: 'D' });
      if (sizes.C && parseInt(sizes.C) > 0) accessories.push({ category: 'Drawer', itemName: `${dType}_C`, quantity: parseInt(sizes.C), size: 'C' });
    };
    saveDrawers('TBX', tbxSizes);
    saveDrawers('Iner', inerSizes);
    saveDrawers('Legra', legraSizes);
    saveDrawers('Duble', dubleSizes);
    saveDrawers('Under', underSizes);
    saveDrawers('Hitch', hitchSizes);

    if (drawerHandleType) {
      accessories.push({ category: 'Drawer', itemName: `HANDLE_${drawerHandleType}`, quantity: 1 });
    }

    // Flaps
    Object.entries(flaps).forEach(([name, checked]) => {
      if (checked) {
        accessories.push({ category: 'Flap', itemName: name, quantity: 1 });
      }
    });

    // Baskets
    (Object.entries(selectedBaskets) as [string, number][]).forEach(([name, qty]) => {
      if (qty > 0) {
        accessories.push({ category: 'Basket', itemName: name, quantity: qty });
      }
    });

    // Hardware
    const hardware: HardwareSelected[] = [
      { type: 'Hingnes', value: hingnes },
      { type: 'Handel', value: handel },
      { type: 'Glass', value: glass }
    ];

    const orderData: Order = {
      id: (initialOrder && !initialOrder.isDuplicate) ? initialOrder.id : `ORD-${Date.now()}`,
      customerName,
      phone,
      address,
      contractNo,
      deliveryDuration,
      notes,
      aluminumColor,
      shatterCode,
      unitStructure,
      capShelf,
      skirting,
      lighting,
      shatterGlass,
      interiorCabinet,
      designerName,
      status,
      stage,
      date: (initialOrder && !initialOrder.isDuplicate) ? initialOrder.date : new Date().toISOString().split('T')[0],
      createdAt: (initialOrder && !initialOrder.isDuplicate) ? initialOrder.createdAt : new Date().toISOString(),
      units,
      appliances,
      accessories,
      hardware,
      imageUrls
    };

    onSave(orderData);
  };

  // Clear Form Event
  const handleClear = () => {
    if (confirm('هل أنت متأكد من رغبتك في تفريغ ومسح كافة الحقول؟')) {
      setCustomerName('');
      setPhone('');
      setAddress('');
      setContractNo('');
      setDeliveryDuration('');
      setNotes('');
      setAluminumColor('');
      setShatterCode('');
      setUnitStructure('soft');
      setCapShelf('');
      setSkirting('');
      setLighting('');
      setShatterGlass('');
      setInteriorCabinet('');
      setBaseUnit({ type: 'Base unit', height: '', depth: '', color: '' });
      setWallUnit1({ type: 'Wall unit 1', height: '', depth: '', color: '' });
      setWallUnit2({ type: 'Wall unit 2', height: '', depth: '', color: '' });
      setGapUnit({ type: 'Gap unit', height: '', depth: '', color: '' });
      setTallUnit({ type: 'Tall unit', height: '', depth: '', color: '' });
      setTbxSizes({ M: '', D: '', C: '' });
      setInerSizes({ M: '', D: '', C: '' });
      setLegraSizes({ M: '', D: '', C: '' });
      setDubleSizes({ M: '', D: '', C: '' });
      setUnderSizes({ M: '', D: '', C: '' });
      setHitchSizes({ M: '', D: '', C: '' });
      setDrawerHandleType('');
      setFlaps({ HF: false, HL: false, HK: false, HS: false, HKS: false, 'HKS(T)': false, 'HK(T)': false });
      setSelectedBaskets({});
      setOven({ type: 'Oven', height: '', width: '', depth: '' });
      setMic({ type: 'MIC', height: '', width: '', depth: '' });
      setFridge({ type: 'Fridge', height: '', width: '', depth: '' });
      setDishWasher({ type: 'Dish Washer', height: '', width: '', depth: '' });
      setHood({ type: 'Hood', height: '', width: '', depth: '' });
      setSink({ type: 'Sink', height: '', width: '', depth: '', sinkModel: '', mixerModel: '' });
      setHingnes('');
      setHandel('');
      setGlass('');
      setImageUrls([]);
      setStage('تصميم');
    }
  };

  const handleBasketQtyChange = (name: string, qtyStr: string) => {
    const qty = parseInt(qtyStr) || 0;
    setSelectedBaskets(prev => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[name];
      } else {
        next[name] = qty;
      }
      return next;
    });
  };

  const filteredBasketsList = LOOKUPS.basketOptions.filter(basketName =>
    basketName.toLowerCase().includes(basketSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Back button and page title */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('customers')}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-brand-dark cursor-pointer shadow-sm transition-all"
          >
            <ArrowRight size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-brand-dark">{initialOrder ? 'تعديل كرت طلب العميل' : 'تسجيل كرت طلب جديد'}</h1>
            <p className="text-xs text-brand-med mt-0.5">الرئيسية / العملاء / بطاقة الطلب الفنية</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-[10px] text-brand-med font-bold whitespace-nowrap">مرحلة التصنيع:</span>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as 'تصميم' | 'تقطيع' | 'تجميع' | 'طلاء' | 'تسليم')}
              className="bg-transparent text-xs font-black text-brand-gold focus:outline-none cursor-pointer"
            >
              <option value="تصميم">✏️ تصميم</option>
              <option value="تقطيع">🪚 تقطيع</option>
              <option value="تجميع">🔨 تجميع</option>
              <option value="طلاء">🎨 طلاء</option>
              <option value="تسليم">🚚 تسليم</option>
            </select>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="p-2 rounded-lg border border-gray-200 bg-white text-xs font-bold focus:outline-none focus:border-brand-gold shadow-sm cursor-pointer"
          >
            <option value="قيد الانتظار">🕒 قيد الانتظار</option>
            <option value="في التصنيع">🏭 في التصنيع</option>
            <option value="قيد التصنيع">🏭 قيد التصنيع</option>
            <option value="جاهز">📦 جاهز للتركيب</option>
            <option value="جاهز للشحن">🚚 جاهز للشحن</option>
            <option value="تم التركيب">🏠 تم التركيب</option>
            <option value="Active">⚙️ نشط (قيد التنفيذ)</option>
            <option value="Pending">🕒 معلق (قيد الانتظار)</option>
            <option value="Completed">✅ مكتمل (تم التسليم)</option>
            <option value="Cancelled">❌ ملغي</option>
          </select>
        </div>
      </div>

      {/* Main Order Card Sheet representation */}
      <div className="bg-brand-cream border-2 border-brand-gold/60 rounded-2xl p-6 shadow-md space-y-6 max-w-5xl mx-auto">
        {/* Logo/Identity Header of Ville Cuisine */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-brand-dark text-brand-cream px-6 py-4 rounded-xl border-b-4 border-brand-gold -mx-6 -mt-6 rounded-b-none">
          <div className="flex items-center gap-3 mb-2 sm:mb-0">
            <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-white font-black text-xl shadow">
              V
            </div>
            <div>
              <div className="text-xl font-black tracking-widest text-brand-gold-light">VILLE CUISINE</div>
              <div className="text-[10px] tracking-wider opacity-85 uppercase font-semibold">Soft Industries Factory.co</div>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-black tracking-wide">كرت بيانات مواصفات العميل الفنية</h2>
            <div className="text-[10px] opacity-75 uppercase" dir="ltr">Customer Specifications Sheet</div>
          </div>
        </div>

        {/* Customer Data Block & General Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3.5 shadow-sm">
            <h3 className="text-xs font-black text-brand-gold border-b pb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
              📋 بيانات العميل ومستندات العقد
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <label className="w-24 text-right font-bold text-brand-med">اسم العميل :</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="الاسم الكامل للعميل"
                  className="flex-1 p-2 border border-gray-200 bg-gray-50 rounded-lg outline-none focus:border-brand-gold focus:bg-white transition-all text-xs font-bold"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-24 text-right font-bold text-brand-med">الجوال :</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="flex-1 p-2 border border-gray-200 bg-gray-50 rounded-lg outline-none focus:border-brand-gold focus:bg-white transition-all text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-24 text-right font-bold text-brand-med">العنوان :</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="المدينة - الحي - اسم الشارع"
                  className="flex-1 p-2 border border-gray-200 bg-gray-50 rounded-lg outline-none focus:border-brand-gold focus:bg-white transition-all text-xs"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-24 text-right font-bold text-brand-med">رقم العقد :</label>
                <input
                  type="text"
                  value={contractNo}
                  onChange={(e) => setContractNo(e.target.value)}
                  placeholder="رقم العقد الرسمي لدى المصنع"
                  className="flex-1 p-2 border border-gray-200 bg-gray-50 rounded-lg outline-none focus:border-brand-gold focus:bg-white transition-all text-xs font-bold"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-24 text-right font-bold text-brand-med">مدة التسليم :</label>
                <input
                  type="text"
                  value={deliveryDuration}
                  onChange={(e) => setDeliveryDuration(e.target.value)}
                  placeholder="مثال: 45 يوماً من تاريخ التوقيع"
                  className="flex-1 p-2 border border-gray-200 bg-gray-50 rounded-lg outline-none focus:border-brand-gold focus:bg-white transition-all text-xs font-bold"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-24 text-right font-bold text-brand-med">اسم المصمم :</label>
                <input
                  type="text"
                  value={designerName}
                  onChange={(e) => setDesignerName(e.target.value)}
                  className="flex-1 p-2 border border-gray-200 bg-gray-50 rounded-lg outline-none focus:border-brand-gold focus:bg-white transition-all text-xs font-bold"
                />
              </div>

              <div className="flex items-start gap-3">
                <label className="w-24 text-right font-bold text-brand-med mt-1">الملاحظات :</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي مواصفات خاصة، شروط دفع، أو ملاحظات التسليم..."
                  rows={2}
                  className="flex-1 p-2 border border-gray-200 bg-gray-50 rounded-lg outline-none focus:border-brand-gold focus:bg-white transition-all text-xs resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-brand-gold border-b pb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
              ⚙️ المواصفات الفنية العامة للمطبخ
            </h3>
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-brand-med block">كود الألمنيوم Aluminum :</label>
                <select
                  value={aluminumColor}
                  onChange={(e) => setAluminumColor(e.target.value)}
                  className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg focus:border-brand-gold focus:bg-white outline-none"
                >
                  <option value="">اختر كود اللون</option>
                  {LOOKUPS.aluminumOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-med block">كود الشطر Shatter :</label>
                <select
                  value={shatterCode}
                  onChange={(e) => setShatterCode(e.target.value)}
                  className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg focus:border-brand-gold focus:bg-white outline-none"
                >
                  <option value="">اختر كود الشطر</option>
                  {LOOKUPS.shatterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-med block">التركيبة Unit Structure :</label>
                <select
                  value={unitStructure}
                  onChange={(e) => setUnitStructure(e.target.value)}
                  className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg focus:border-brand-gold focus:bg-white outline-none"
                >
                  {LOOKUPS.unitStructureOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-med block">غطاء الرف Cap Shelf :</label>
                <select
                  value={capShelf}
                  onChange={(e) => setCapShelf(e.target.value)}
                  className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg focus:border-brand-gold focus:bg-white outline-none"
                >
                  <option value="">اختر</option>
                  {LOOKUPS.capShelfOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-med block">الاسكرتنج Skirting :</label>
                <input
                  type="text"
                  value={skirting}
                  onChange={(e) => setSkirting(e.target.value)}
                  placeholder="رقم الارتفاع/الموديل"
                  className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg focus:border-brand-gold focus:bg-white outline-none text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-med block">الإضاءة Lighting :</label>
                <select
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value)}
                  className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg focus:border-brand-gold focus:bg-white outline-none"
                >
                  <option value="">اختر درجة الإضاءة</option>
                  {LOOKUPS.lightingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="space-y-1 col-span-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-brand-med block mb-1">زجاج الشطر Shatter Glass :</label>
                    <input
                      type="text"
                      value={shatterGlass}
                      onChange={(e) => setShatterGlass(e.target.value)}
                      placeholder="نوع زجاج الشطر"
                      className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg focus:border-brand-gold focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-brand-med block mb-1">الدواخل Interior Cabinet :</label>
                    <select
                      value={interiorCabinet}
                      onChange={(e) => setInteriorCabinet(e.target.value)}
                      className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg focus:border-brand-gold focus:bg-white outline-none"
                    >
                      <option value="">اختر مادة التغليف</option>
                      {LOOKUPS.interiorCabinetOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Architectural Drawings & Images Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-brand-gold border-b pb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
            🖼️ المخططات الهندسية والرسومات الكروكي وصور العقد (روابط خارجية)
          </h3>
          <p className="text-[11px] text-brand-med">
            أدخل روابط الصور والرسومات الفنية الخاصة بالمطبخ لدمجها وعرضها بداخل كرت مواصفات العميل وضمن ورقة الطباعة وحفظ الـ PDF.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="ضع رابط الصورة هنا (مثال: https://example.com/drawing.jpg)"
              className="flex-1 p-2 border border-gray-200 bg-gray-50 rounded-lg outline-none focus:border-brand-gold focus:bg-white text-xs text-left"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => {
                if (!newImageUrl.trim()) return;
                if (!newImageUrl.startsWith('http://') && !newImageUrl.startsWith('https://')) {
                  showToast('⚠️ الرجاء إدخال رابط صحيح يبدأ بـ http:// أو https://', 'warning');
                  return;
                }
                setImageUrls(prev => [...prev, newImageUrl.trim()]);
                setNewImageUrl('');
                showToast('🖼️ تم إضافة رابط المخطط بنجاح!', 'success');
              }}
              className="px-4 py-2 bg-brand-gold hover:bg-[#9A7008] text-white font-bold rounded-lg text-xs cursor-pointer transition-colors font-sans"
            >
              إضافة الرابط
            </button>
          </div>

          {imageUrls.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="border border-gray-100 rounded-lg p-2.5 bg-gray-50/50 flex flex-col justify-between space-y-2 relative group">
                  <div className="aspect-video w-full rounded bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                    <img
                      src={url}
                      alt={`مخطط ${index + 1}`}
                      referrerPolicy="no-referrer"
                      className="object-contain w-full h-full max-h-[140px]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/300x180/e5e7eb/a1a1aa?text=Drawing+Link';
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1 text-[10px]">
                    <span className="text-brand-med truncate font-mono max-w-[120px]" dir="ltr">{url}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrls(prev => prev.filter((_, idx) => idx !== index));
                      }}
                      className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center text-xs text-brand-med">
              لا توجد صور أو رسومات هندسية مضافة بعد. ضع الرابط بالصفحة بالأعلى واضغط على "إضافة".
            </div>
          )}
        </div>

        {/* Unit Sizes Grid */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-xs font-black text-brand-gold border-b pb-2 mb-4 flex items-center gap-1.5">
            <Layers size={15} />
            📐 جدول مقاسات وألوان الوحدات (Unit Size)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-xs">
              <thead>
                <tr className="bg-brand-dark text-brand-cream font-bold">
                  <th className="p-2.5 border border-gray-200 text-right w-1/4">نوع الوحدة Unit</th>
                  <th className="p-2.5 border border-gray-200 text-center w-1/4">الارتفاع H</th>
                  <th className="p-2.5 border border-gray-200 text-center w-1/4">العمق D</th>
                  <th className="p-2.5 border border-gray-200 text-center w-1/4">اللون COLOR</th>
                </tr>
              </thead>
              <tbody>
                {[baseUnit, wallUnit1, wallUnit2, gapUnit, tallUnit].map((unit, idx) => {
                  const setter = [setBaseUnit, setWallUnit1, setWallUnit2, setGapUnit, setTallUnit][idx];
                  return (
                    <tr key={unit.type} className="hover:bg-gray-50">
                      <td className="p-2.5 border border-gray-200 bg-gray-100 font-bold text-brand-med">
                        {unit.type}
                      </td>
                      <td className="p-1 border border-gray-200">
                        <input
                          type="text"
                          value={unit.height}
                          onChange={(e) => setter({ ...unit, height: e.target.value })}
                          placeholder="—"
                          className="w-full p-1 text-center bg-transparent outline-none font-bold"
                        />
                      </td>
                      <td className="p-1 border border-gray-200">
                        <input
                          type="text"
                          value={unit.depth}
                          onChange={(e) => setter({ ...unit, depth: e.target.value })}
                          placeholder="—"
                          className="w-full p-1 text-center bg-transparent outline-none font-bold"
                        />
                      </td>
                      <td className="p-1 border border-gray-200">
                        <input
                          type="text"
                          value={unit.color}
                          onChange={(e) => setter({ ...unit, color: e.target.value })}
                          placeholder="—"
                          className="w-full p-1 text-center bg-transparent outline-none font-bold text-brand-gold"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Accessories Options (Tabs) */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-xs font-black text-brand-gold border-b pb-2 mb-4 flex items-center gap-1.5">
            <Grid size={15} />
            🔧 قسم الإكسسوارات الفنية والتنظيمية
          </h3>

          <div className="flex border-b border-gray-100 gap-1 mb-4">
            <button
              onClick={() => setActiveAccTab('drawers')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer ${
                activeAccTab === 'drawers' ? 'bg-brand-dark text-brand-cream' : 'bg-gray-50 text-brand-med hover:bg-gray-100'
              }`}
            >
              الأدراج (Drawers)
            </button>
            <button
              onClick={() => setActiveAccTab('flap')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer ${
                activeAccTab === 'flap' ? 'bg-brand-dark text-brand-cream' : 'bg-gray-50 text-brand-med hover:bg-gray-100'
              }`}
            >
              الرفرف (Flap)
            </button>
            <button
              onClick={() => setActiveAccTab('basket')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer ${
                activeAccTab === 'basket' ? 'bg-brand-dark text-brand-cream' : 'bg-gray-50 text-brand-med hover:bg-gray-100'
              }`}
            >
              السلال والتنظيم (Baskets)
            </button>
          </div>

          {/* Drawers Tab Content */}
          {activeAccTab === 'drawers' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'TBX', state: tbxSizes, setter: setTbxSizes },
                  { label: 'Iner', state: inerSizes, setter: setInerSizes },
                  { label: 'Legra', state: legraSizes, setter: setLegraSizes },
                  { label: 'Duble Wall', state: dubleSizes, setter: setDubleSizes },
                  { label: 'Under Sink', state: underSizes, setter: setUnderSizes },
                  { label: 'Hitch', state: hitchSizes, setter: setHitchSizes }
                ].map((draw) => (
                  <div key={draw.label} className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-center">
                    <span className="text-[11px] font-black text-brand-dark block mb-2">{draw.label}</span>
                    <div className="flex gap-1 justify-center text-[10px]">
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-bold text-gray-400">M</span>
                        <input
                          type="text"
                          value={draw.state.M}
                          onChange={(e) => draw.setter({ ...draw.state, M: e.target.value })}
                          className="w-7 p-1 text-center bg-white border border-gray-200 rounded font-bold"
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-bold text-gray-400">D</span>
                        <input
                          type="text"
                          value={draw.state.D}
                          onChange={(e) => draw.setter({ ...draw.state, D: e.target.value })}
                          className="w-7 p-1 text-center bg-white border border-gray-200 rounded font-bold"
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-bold text-gray-400">C</span>
                        <input
                          type="text"
                          value={draw.state.C}
                          onChange={(e) => draw.setter({ ...draw.state, C: e.target.value })}
                          className="w-7 p-1 text-center bg-white border border-gray-200 rounded font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 text-xs bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="font-bold text-brand-dark">نوع السحاب ومستوى الجودة :</span>
                <select
                  value={drawerHandleType}
                  onChange={(e) => setDrawerHandleType(e.target.value)}
                  className="flex-1 max-w-sm p-2 border border-gray-200 bg-white rounded-lg focus:border-brand-gold outline-none"
                >
                  <option value="">لا يوجد / عادي</option>
                  {LOOKUPS.drawerRunnersOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Flap Tab Content */}
          {activeAccTab === 'flap' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.keys(flaps).map((flapName) => (
                <label
                  key={flapName}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    flaps[flapName]
                      ? 'bg-brand-gold/10 border-brand-gold text-brand-gold font-bold'
                      : 'bg-gray-50 border-gray-200 text-brand-med'
                  }`}
                >
                  <span className="text-xs">{flapName}</span>
                  <input
                    type="checkbox"
                    checked={flaps[flapName]}
                    onChange={(e) => setFlaps(prev => ({ ...prev, [flapName]: e.target.checked }))}
                    className="w-4 h-4 rounded text-brand-gold accent-brand-gold"
                  />
                </label>
              ))}
            </div>
          )}

          {/* Baskets Tab Content */}
          {activeAccTab === 'basket' && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="🔍 اكتب اسم السلة للبحث السريع والتصفية..."
                value={basketSearchQuery}
                onChange={(e) => setBasketSearchQuery(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:border-brand-gold focus:bg-white text-right"
              />

              <div className="max-h-60 overflow-y-auto border border-gray-150 rounded-lg bg-gray-50 divide-y divide-gray-200">
                {filteredBasketsList.length > 0 ? (
                  filteredBasketsList.map((name) => {
                    const isSelected = !!selectedBaskets[name];
                    const count = selectedBaskets[name] || 0;

                    return (
                      <div
                        key={name}
                        className={`p-2.5 flex justify-between items-center text-xs transition-colors ${
                          isSelected ? 'bg-brand-cream/40 font-bold' : 'hover:bg-gray-100'
                        }`}
                      >
                        <label className="flex items-center gap-3 flex-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleBasketQtyChange(name, e.target.checked ? '1' : '0')}
                            className="w-4 h-4 accent-brand-gold rounded cursor-pointer"
                          />
                          <span className="text-brand-dark">{name}</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400">الكمية Q:</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="Q"
                            value={count > 0 ? count : ''}
                            onChange={(e) => handleBasketQtyChange(name, e.target.value)}
                            className="w-12 p-1 text-center bg-white border border-gray-200 rounded font-black text-brand-gold focus:outline-none focus:border-brand-gold"
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-brand-med">لا توجد سلال مطابقة لبحثك.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Appliances Block */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-xs font-black text-brand-gold border-b pb-2 mb-4 flex items-center gap-1.5">
            <Layout size={15} />
            🍳 مقاسات وأكواد الأجهزة والمغاسل (E-A-Size)
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Oven', state: oven, setter: setOven },
              { label: 'MIC', state: mic, setter: setMic },
              { label: 'Fridge', state: fridge, setter: setFridge },
              { label: 'Dish Washer', state: dishWasher, setter: setDishWasher },
              { label: 'Hood', state: hood, setter: setHood },
              { label: 'Sink', state: sink, setter: setSink }
            ].map((app) => {
              const isSink = app.label === 'Sink';
              return (
                <div
                  key={app.label}
                  className="flex flex-col lg:flex-row lg:items-center bg-gray-50 border border-gray-150 rounded-lg p-3 gap-3 text-xs"
                >
                  <span className="font-bold text-brand-dark min-w-[100px]">{app.label}</span>
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400">الارتفاع H:</span>
                      <input
                        type="text"
                        value={app.state.height}
                        onChange={(e) => app.setter({ ...app.state, height: e.target.value })}
                        className="w-16 p-1 bg-white border border-gray-200 rounded text-center font-bold"
                        placeholder="H"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400">العرض W:</span>
                      <input
                        type="text"
                        value={app.state.width}
                        onChange={(e) => app.setter({ ...app.state, width: e.target.value })}
                        className="w-16 p-1 bg-white border border-gray-200 rounded text-center font-bold"
                        placeholder="W"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400">العمق D:</span>
                      <input
                        type="text"
                        value={app.state.depth}
                        onChange={(e) => app.setter({ ...app.state, depth: e.target.value })}
                        className="w-16 p-1 bg-white border border-gray-200 rounded text-center font-bold"
                        placeholder="D"
                      />
                    </div>

                    {isSink && (
                      <div className="flex flex-1 flex-col sm:flex-row gap-2 mt-2 lg:mt-0">
                        <select
                          value={sink.sinkModel || ''}
                          onChange={(e) => setSink({ ...sink, sinkModel: e.target.value })}
                          className="flex-1 p-1.5 bg-white border border-gray-200 rounded text-[11px] font-bold outline-none focus:border-brand-gold text-right"
                        >
                          <option value="">نوع ومقاس الحوض (Sink Type)</option>
                          {LOOKUPS.sinkOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>

                        <select
                          value={sink.mixerModel || ''}
                          onChange={(e) => setSink({ ...sink, mixerModel: e.target.value })}
                          className="w-32 p-1.5 bg-white border border-gray-200 rounded text-[11px] font-bold outline-none focus:border-brand-gold text-right"
                        >
                          <option value="">رقم الخلاط</option>
                          {Array.from({ length: 35 }).map((_, i) => (
                            <option key={i + 1} value={(i + 1).toString()}>
                              خلاط موديل {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hardware & Components */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-xs font-black text-brand-gold border-b pb-2 mb-4 flex items-center gap-1.5">
            <Sparkles size={15} />
            🔩 قسم الهاردوير والإكسسوارات المكملة (Hardware)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-250 flex items-center justify-between gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-dark text-brand-cream text-xs font-bold flex items-center justify-center">1</span>
              <label className="font-bold text-brand-med flex-1">المفصلات Hingnes :</label>
              <select
                value={hingnes}
                onChange={(e) => setHingnes(e.target.value)}
                className="w-36 p-1.5 border border-gray-200 bg-white rounded-md outline-none focus:border-brand-gold"
              >
                <option value="">اختر المفصلة</option>
                {LOOKUPS.hingnesOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-250 flex items-center justify-between gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-dark text-brand-cream text-xs font-bold flex items-center justify-center">2</span>
              <label className="font-bold text-brand-med flex-1">اليد Handel :</label>
              <select
                value={handel}
                onChange={(e) => setHandel(e.target.value)}
                className="w-36 p-1.5 border border-gray-200 bg-white rounded-md outline-none focus:border-brand-gold"
              >
                <option value="">اختر المقبض</option>
                {LOOKUPS.handelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-250 flex items-center justify-between gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-dark text-brand-cream text-xs font-bold flex items-center justify-center">3</span>
              <label className="font-bold text-brand-med flex-1">الزجاج Glass :</label>
              <select
                value={glass}
                onChange={(e) => setGlass(e.target.value)}
                className="w-36 p-1.5 border border-gray-200 bg-white rounded-md outline-none focus:border-brand-gold"
              >
                <option value="">اختر نوع الزجاج</option>
                {LOOKUPS.glassOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 📁 قسم المخططات الهندسية وتصاميم المطابخ بالكاميرا / Blueprints & Camera Designs */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
          <div className="border-b pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-xs font-black text-brand-gold flex items-center gap-1.5">
              <Image size={15} />
              📁 المخططات الهندسية وصور تصاميم المطابخ (Blueprints & Kitchen Designs)
            </h3>
            <span className="text-[10px] text-brand-med font-bold bg-brand-gold/10 text-brand-gold px-2.5 py-0.5 rounded-full">
              عدد الصور المرفقة: {imageUrls.length}
            </span>
          </div>

          <p className="text-[11px] text-brand-med leading-relaxed">
            يمكنك تحميل صور المخططات الفنية أو كروكي المطبخ مباشرة من جهازك، أو استخدام الكاميرا لالتقاط صورة فورية للمخطط في المعرض أو الورشة.
          </p>

          {/* الكاميرا المباشرة */}
          {isCameraActive && (
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col items-center space-y-3 relative overflow-hidden shadow-inner">
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-red-600/95 text-white px-2.5 py-1 rounded-full text-[9px] font-black animate-pulse shadow">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                بث الكاميرا النشط / LIVE
              </div>

              <div className="w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden relative border border-gray-700">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>

              {cameraError && (
                <div className="text-rose-500 font-bold text-[11px] text-center max-w-sm">
                  {cameraError}
                </div>
              )}

              <div className="flex gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <Camera size={14} />
                  التقاط الصورة الآن 📸
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-lg text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <X size={14} />
                  إغلاق الكاميرا
                </button>
              </div>
            </div>
          )}

          {/* خيارات الإدخال والتحميل */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* تحميل ملف */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer shadow-sm hover:border-brand-gold group"
            >
              <Upload size={20} className="text-brand-gold group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black text-brand-dark">تحميل صور من الجهاز</span>
              <span className="text-[9px] text-gray-400">يدعم PNG, JPG, JPEG</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </button>

            {/* استخدام الكاميرا مباشرة */}
            <button
              type="button"
              onClick={startCamera}
              disabled={isCameraActive}
              className={`p-4 border border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer shadow-sm group ${
                isCameraActive
                  ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-300 hover:border-brand-gold text-brand-dark'
              }`}
            >
              <Camera size={20} className={`${isCameraActive ? 'text-gray-400' : 'text-brand-gold group-hover:scale-110 transition-transform'}`} />
              <span className="text-xs font-black">التقاط مباشرة بالكاميرا</span>
              <span className="text-[9px] text-gray-400">استخدام كاميرا الجوال / الويب</span>
            </button>

            {/* إضافة رابط خارجي كخيار إضافي مريح */}
            <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex flex-col justify-center gap-2">
              <span className="text-xs font-black text-brand-dark text-center">أو إضافة صورة برابط إنترنت (URL)</span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 p-1.5 border border-gray-200 rounded text-[10px] text-left outline-none focus:border-brand-gold bg-white"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newImageUrl.trim()) {
                      setImageUrls(prev => [...prev, newImageUrl.trim()]);
                      setNewImageUrl('');
                      showToast('✅ تم إضافة رابط الصورة للطلب!', 'success');
                    } else {
                      showToast('⚠️ يرجى كتابة رابط صورة صحيح أولاً.', 'warning');
                    }
                  }}
                  className="px-2 py-1 bg-brand-dark text-white rounded text-[10px] font-black hover:bg-brand-gold cursor-pointer"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>

          {/* معرض الصور المرفقة حالياً بالطلب */}
          {imageUrls.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <span className="text-[11px] font-black text-brand-dark block">🖼️ الصور والمخططات المرفقة حالياً:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-1 flex flex-col justify-between shadow-sm">
                    <div className="aspect-square bg-white rounded-lg overflow-hidden flex items-center justify-center border border-gray-150">
                      <img
                        src={url}
                        alt={`مخطط فني ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="object-contain w-full h-full max-h-[120px]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/150x150/f3f4f6/a1a1aa?text=Image+Drawing';
                        }}
                      />
                    </div>
                    
                    <div className="mt-1 flex items-center justify-between gap-1 px-1">
                      <span className="text-[9px] font-bold text-brand-med">صورة #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('هل أنت متأكد من رغبتك في حذف هذه الصورة المرفقة؟')) {
                            setImageUrls(prev => prev.filter((_, i) => i !== idx));
                            showToast('🗑️ تم حذف الصورة المرفقة بنجاح.', 'info');
                          }
                        }}
                        className="p-1 hover:bg-rose-50 rounded text-rose-600 transition-colors cursor-pointer"
                        title="حذف الصورة"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Print Layout Signature Simulation block */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200">
          <div className="bg-white border-2 border-dashed border-gray-250 rounded-xl p-4 text-center">
            <h4 className="text-xs font-bold text-brand-dark mb-1">توقيع العميل واعتماده للمواصفات</h4>
            <div className="h-10 border-b border-gray-200 w-3/4 mx-auto mb-1"></div>
            <span className="text-[9px] text-gray-400 block" dir="ltr">Customer Authorization Signature</span>
          </div>

          <div className="bg-white border-2 border-dashed border-gray-250 rounded-xl p-4 text-center">
            <h4 className="text-xs font-bold text-brand-dark mb-1">توقيع المصمم المسؤول والمراجع</h4>
            <div className="h-10 border-b border-gray-200 w-3/4 mx-auto mb-1"></div>
            <span className="text-[9px] text-gray-400 block" dir="ltr">Designer/Supervisor Verification</span>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-gray-150">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-brand-dark hover:bg-brand-gold text-brand-cream font-bold rounded-xl border-2 border-brand-gold flex items-center gap-2 shadow-sm transition-all cursor-pointer text-sm"
          >
            <Save size={16} />
            حفظ الطلب قاعدة البيانات
          </button>

          <button
            onClick={handleClear}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-brand-dark border border-gray-300 font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer text-sm"
          >
            <Eraser size={16} />
            مسح النموذج
          </button>
        </div>
      </div>
    </div>
  );
}
