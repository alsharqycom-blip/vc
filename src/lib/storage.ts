import { Order, ActivityLog, User } from '../types';

const STORAGE_ORDERS_KEY = 'vc_orders';
const STORAGE_LOGS_KEY = 'vc_logs';

const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-20260707-001",
    customerName: "أبو حسين",
    phone: "0534390021",
    address: "الرياض - شارع الستين العليا",
    contractNo: "C-2026-001",
    deliveryDuration: "30 يوم",
    notes: "يرجى تسريع التركيب لغرفة المطبخ الرئيسية.",
    aluminumColor: "A5",
    shatterCode: "G2",
    unitStructure: "Villecuisin",
    capShelf: "ALMINUM",
    skirting: "10",
    lighting: "2700K",
    shatterGlass: "زجاج مثلج",
    interiorCabinet: "فورميكا",
    designerName: "المصمم الرئيسي",
    status: "Active",
    stage: "تجميع",
    date: "2026-07-07",
    createdAt: new Date("2026-07-07T08:00:00Z").toISOString(),
    units: [
      { type: "Base unit", height: "75", depth: "58", color: "SS150" },
      { type: "Wall unit 1", height: "75", depth: "35", color: "TOP129" },
      { type: "Wall unit 2", height: "50", depth: "58", color: "SS150" },
      { type: "Gap unit", height: "60", depth: "0", color: "0" },
      { type: "Tall unit", height: "260", depth: "58", color: "TOP129" }
    ],
    appliances: [
      { type: "Oven", height: "60", width: "90", depth: "58" },
      { type: "MIC", height: "38", width: "60", depth: "35" },
      { type: "Fridge", height: "190", width: "60", depth: "60" },
      { type: "Dish Washer", height: "85", width: "60", depth: "60" },
      { type: "Hood", height: "50", width: "90", depth: "50" },
      { type: "Sink", height: "20", width: "85", depth: "50", sinkModel: "حوض بدون فتحة خلاط 85×45 فضي", mixerModel: "1" }
    ],
    accessories: [
      { category: "Basket", itemName: "سله بهارات 3 دور زجاج", quantity: 1 },
      { category: "Basket", itemName: "سلة ماجك كورنر حرف L", quantity: 1 },
      { category: "Drawer", itemName: "TBX", quantity: 1, size: "M" },
      { category: "Drawer", itemName: "Legra", quantity: 2, size: "C" },
      { category: "Flap", itemName: "HF", quantity: 1 }
    ],
    hardware: [
      { type: "Hingnes", value: "BLUM" },
      { type: "Handel", value: "BRF(B)" },
      { type: "Glass", value: "DUBLE" }
    ]
  },
  {
    id: "ORD-20260706-002",
    customerName: "محمد العلي",
    phone: "0555123456",
    address: "جدة - حي النزهة",
    contractNo: "C-2026-002",
    deliveryDuration: "45 يوم",
    notes: "مطبخ ركني مفتوح على الصالة.",
    aluminumColor: "A3",
    shatterCode: "G1",
    unitStructure: "soft",
    capShelf: "GLASS",
    skirting: "8",
    lighting: "3000K",
    shatterGlass: "أسود شفاف",
    interiorCabinet: "كلادنج",
    designerName: "المصمم أحمد",
    status: "Active",
    stage: "تصميم",
    date: "2026-07-06",
    createdAt: new Date("2026-07-06T11:20:00Z").toISOString(),
    units: [
      { type: "Base unit", height: "80", depth: "60", color: "SS200" },
      { type: "Wall unit 1", height: "72", depth: "35", color: "TOP150" },
      { type: "Wall unit 2", height: "72", depth: "35", color: "TOP150" },
      { type: "Gap unit", height: "0", depth: "0", color: "0" },
      { type: "Tall unit", height: "240", depth: "60", color: "TOP150" }
    ],
    appliances: [
      { type: "Oven", height: "60", width: "60", depth: "60" },
      { type: "MIC", height: "40", width: "60", depth: "40" },
      { type: "Fridge", height: "200", width: "90", depth: "70" },
      { type: "Dish Washer", height: "85", width: "60", depth: "60" },
      { type: "Hood", height: "40", width: "90", depth: "50" },
      { type: "Sink", height: "22", width: "90", depth: "45", sinkModel: "حوض فتحة خلاط 90×45 أسود", mixerModel: "5" }
    ],
    accessories: [
      { category: "Basket", itemName: "ترلي استيل مطور 160سم 205", quantity: 2 },
      { category: "Basket", itemName: "سلة زيت أرضي 3 دور زجاج مطور BH011", quantity: 1 },
      { category: "Flap", itemName: "HL", quantity: 1 }
    ],
    hardware: [
      { type: "Hingnes", value: "CHINA" },
      { type: "Handel", value: "B2" },
      { type: "Glass", value: "BLACK" }
    ]
  },
  {
    id: "ORD-20260705-003",
    customerName: "خالد السالم",
    phone: "0500987654",
    address: "الدمام - شارع الملك فهد",
    contractNo: "C-2026-003",
    deliveryDuration: "20 يوم",
    notes: "طلب عاجل جداً يرجى مراعاة الجودة والسرعة.",
    aluminumColor: "A1",
    shatterCode: "G4",
    unitStructure: "Villecuisin",
    capShelf: "ALMINUM",
    skirting: "12",
    lighting: "4000K",
    shatterGlass: "",
    interiorCabinet: "فورميكا",
    designerName: "المصمم الرئيسي",
    status: "Completed",
    stage: "تسليم",
    date: "2026-07-05",
    createdAt: new Date("2026-07-05T09:30:00Z").toISOString(),
    units: [
      { type: "Base unit", height: "75", depth: "58", color: "SS150" },
      { type: "Wall unit 1", height: "75", depth: "35", color: "TOP129" },
      { type: "Wall unit 2", height: "0", depth: "0", color: "" },
      { type: "Gap unit", height: "0", depth: "0", color: "" },
      { type: "Tall unit", height: "0", depth: "0", color: "" }
    ],
    appliances: [
      { type: "Oven", height: "60", width: "90", depth: "58" },
      { type: "MIC", height: "", width: "", depth: "" },
      { type: "Fridge", height: "", width: "", depth: "" },
      { type: "Dish Washer", height: "", width: "", depth: "" },
      { type: "Hood", height: "", width: "", depth: "" },
      { type: "Sink", height: "20", width: "60", depth: "45", sinkModel: "حوض بدون فتحة خلاط 60×45 ذهبي", mixerModel: "3" }
    ],
    accessories: [
      { category: "Basket", itemName: "ترلي رفوف مطور 50سم", quantity: 1 }
    ],
    hardware: [
      { type: "Hingnes", value: "BLUM" },
      { type: "Handel", value: "B1" },
      { type: "Glass", value: "CEALER" }
    ]
  }
];

const INITIAL_LOGS: ActivityLog[] = [
  { id: "L-1", timestamp: "2026-07-07T08:30:00Z", user: "admin@villecuisine.com", action: "تسجيل دخول", details: "تم تسجيل الدخول إلى النظام من العنوان IP: 192.168.1.10" },
  { id: "L-2", timestamp: "2026-07-07T08:15:00Z", user: "admin@villecuisine.com", action: "حفظ طلب", details: "إنشاء كرت طلب جديد للعميل: أبو حسين ورقم العقد C-2026-001" },
  { id: "L-3", timestamp: "2026-07-06T11:45:00Z", user: "ahmed@villecuisine.com", action: "حفظ طلب", details: "إنشاء كرت طلب جديد للعميل: محمد العلي ورقم العقد C-2026-002" },
  { id: "L-4", timestamp: "2026-07-06T11:20:00Z", user: "ahmed@villecuisine.com", action: "تسجيل دخول", details: "تم تسجيل دخول الموظف أحمد" },
  { id: "L-5", timestamp: "2026-07-05T10:00:00Z", user: "admin@villecuisine.com", action: "طباعة كرت", details: "طباعة كرت العميل: خالد السالم رقم العقد C-2026-003" },
  { id: "L-6", timestamp: "2026-07-05T09:40:00Z", user: "admin@villecuisine.com", action: "حفظ طلب", details: "إنشاء كرت طلب جديد للعميل: خالد السالم ورقم العقد C-2026-003" }
];

export function getOrders(): Order[] {
  const local = localStorage.getItem(STORAGE_ORDERS_KEY);
  if (!local) {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  try {
    return JSON.parse(local);
  } catch (e) {
    console.error("Error parsing orders", e);
    return INITIAL_ORDERS;
  }
}

export function saveOrder(order: Order, currentUserEmail: string): Order[] {
  const orders = getOrders();
  const existingIdx = orders.findIndex(o => o.id === order.id);

  if (existingIdx > -1) {
    orders[existingIdx] = { ...order };
    addActivityLog(
      currentUserEmail,
      "تحديث طلب",
      `تم تحديث كرت العميل: ${order.customerName} رقم العقد ${order.contractNo}`
    );
  } else {
    orders.unshift(order);
    addActivityLog(
      currentUserEmail,
      "حفظ طلب",
      `تم إنشاء كرت طلب جديد للعميل: ${order.customerName} ورقم العقد ${order.contractNo}`
    );
  }

  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  return orders;
}

export function deleteOrder(orderId: string, currentUserEmail: string): Order[] {
  const orders = getOrders();
  const target = orders.find(o => o.id === orderId);
  const filtered = orders.filter(o => o.id !== orderId);
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(filtered));

  if (target) {
    addActivityLog(
      currentUserEmail,
      "حذف طلب",
      `تم حذف كرت العميل: ${target.customerName} رقم العقد ${target.contractNo}`
    );
  }
  return filtered;
}

export function getActivityLogs(): ActivityLog[] {
  const local = localStorage.getItem(STORAGE_LOGS_KEY);
  if (!local) {
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(INITIAL_LOGS));
    return INITIAL_LOGS;
  }
  try {
    return JSON.parse(local);
  } catch (e) {
    console.error("Error parsing logs", e);
    return INITIAL_LOGS;
  }
}

export function addActivityLog(user: string, action: string, details: string): ActivityLog[] {
  const logs = getActivityLogs();
  const newLog: ActivityLog = {
    id: `L-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    user,
    action,
    details
  };
  logs.unshift(newLog);
  // Keep last 200 logs only to optimize storage
  const trimmed = logs.slice(0, 200);
  localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(trimmed));
  return trimmed;
}

export function importDatabase(jsonData: string, currentUserEmail: string): boolean {
  try {
    const parsed = JSON.parse(jsonData);
    if (parsed && Array.isArray(parsed.orders)) {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(parsed.orders));
      if (Array.isArray(parsed.logs)) {
        localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(parsed.logs));
      }
      addActivityLog(currentUserEmail, "استيراد قاعدة البيانات", "تم استيراد قاعدة البيانات بنجاح من ملف خارجي");
      return true;
    }
    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export function exportDatabase(): string {
  const orders = getOrders();
  const logs = getActivityLogs();
  return JSON.stringify({ orders, logs, exportedAt: new Date().toISOString() }, null, 2);
}

// Stored dynamic lookups management
import { LOOKUPS as STATIC_LOOKUPS } from '../lookups';

const STORAGE_LOOKUPS_KEY = 'vc_lookups';

export function getStoredLookups(): Record<string, string[]> {
  const local = localStorage.getItem(STORAGE_LOOKUPS_KEY);
  if (!local) {
    localStorage.setItem(STORAGE_LOOKUPS_KEY, JSON.stringify(STATIC_LOOKUPS));
    return STATIC_LOOKUPS;
  }
  try {
    return JSON.parse(local);
  } catch (e) {
    console.error("Error parsing lookups", e);
    return STATIC_LOOKUPS;
  }
}

export function saveStoredLookups(lookups: Record<string, string[]>, currentUserEmail: string) {
  localStorage.setItem(STORAGE_LOOKUPS_KEY, JSON.stringify(lookups));
  addActivityLog(currentUserEmail, "تعديل قوائم المواصفات", "تم تحديث وحفظ قوائم الخيارات المنسدلة للمواصفات بنجاح.");
}

// Order Archive Logic
export function toggleArchiveOrder(orderId: string, currentUserEmail: string): Order[] {
  const orders = getOrders();
  const existingIdx = orders.findIndex(o => o.id === orderId);
  if (existingIdx > -1) {
    const prevStatus = orders[existingIdx].archived;
    orders[existingIdx].archived = !prevStatus;
    const action = !prevStatus ? "أرشفة طلب" : "إلغاء أرشفة طلب";
    const details = !prevStatus
      ? `تم أرشفة كرت العميل: ${orders[existingIdx].customerName} ونقله للأرشيف`
      : `تم استعادة كرت العميل: ${orders[existingIdx].customerName} من الأرشيف للنشط`;
    addActivityLog(currentUserEmail, action, details);
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  }
  return orders;
}

// User Management Logic
const STORAGE_USERS_KEY = 'vc_users';

const DEFAULT_USERS: User[] = [
  {
    email: 'admin@villecuisine.com',
    name: 'المشرف العام (الإدارة)',
    role: 'admin',
    password: 'admin',
    permissions: ['all', 'create_order', 'edit_order', 'delete_order', 'archive_order', 'view_all', 'manage_employees']
  },
  {
    email: 'designer@villecuisine.com',
    name: 'المصمم فهد',
    role: 'designer',
    password: '123',
    permissions: ['create_order', 'edit_order', 'view_all']
  }
];

export function getStoredUsers(): User[] {
  const local = localStorage.getItem(STORAGE_USERS_KEY);
  if (!local) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    return JSON.parse(local);
  } catch (e) {
    console.error("Error parsing users", e);
    return DEFAULT_USERS;
  }
}

export function saveStoredUsers(users: User[], currentUserEmail: string) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  addActivityLog(currentUserEmail, "تعديل الموظفين والصلاحيات", "تم تحديث وحفظ بيانات الموظفين وصلاحياتهم الإدارية.");
}

// CSV/Excel Import and Export system
export function exportToCSV(orders: Order[]): string {
  const headers = [
    'رقم العقد',
    'تاريخ الطلب',
    'اسم العميل',
    'رقم الجوال',
    'العنوان',
    'مدة التسليم',
    'الحالة',
    'مرحلة التصنيع',
    'المصمم',
    'لون الألمنيوم',
    'كود الشتر',
    'هيكل الوحدات',
    'غطاء الرفوف',
    'الوزرة',
    'الإضاءة',
    'الزجاج',
    'الحشو الداخلي',
    'مؤرشف؟',
    'ملاحظات'
  ];

  const rows = orders.map(o => [
    o.contractNo || '',
    o.date || '',
    o.customerName || '',
    o.phone || '',
    o.address || '',
    o.deliveryDuration || '',
    o.status || '',
    o.stage || 'تصميم',
    o.designerName || '',
    o.aluminumColor || '',
    o.shatterCode || '',
    o.unitStructure || '',
    o.capShelf || '',
    o.skirting || '',
    o.lighting || '',
    o.shatterGlass || '',
    o.interiorCabinet || '',
    o.archived ? 'نعم' : 'لا',
    (o.notes || '').replace(/\n/g, ' ')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return '\uFEFF' + csvContent; // Excel UTF-8 BOM
}

export function importFromCSV(csvText: string, currentUserEmail: string): { success: boolean; count: number; error?: string } {
  try {
    const cleanText = csvText.startsWith('\uFEFF') ? csvText.slice(1) : csvText;
    const lines = cleanText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      return { success: false, count: 0, error: 'الملف فارغ أو لا يحتوي على صفوف بيانات للعملاء' };
    }

    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(s => s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1).replace(/""/g, '"') : s);
    };

    const headers = parseCSVLine(lines[0]);
    const importedOrders: Order[] = [];

    const hMap: Record<string, number> = {};
    headers.forEach((h, idx) => {
      hMap[h.trim()] = idx;
    });

    const getVal = (row: string[], headerName: string, fallback = ''): string => {
      const idx = hMap[headerName];
      if (idx !== undefined && row[idx] !== undefined) return row[idx];
      return fallback;
    };

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length === 0 || !row[0]) continue;

      const customerName = getVal(row, 'اسم العميل') || getVal(row, 'العميل');
      if (!customerName) continue;

      const contractNo = getVal(row, 'رقم العقد') || `C-IMP-${Date.now()}-${i}`;
      
      const importedOrder: Order = {
        id: `ORD-IMP-${Date.now()}-${i}`,
        customerName,
        phone: getVal(row, 'رقم الجوال') || getVal(row, 'الهاتف') || '',
        address: getVal(row, 'العنوان') || '',
        contractNo,
        deliveryDuration: getVal(row, 'مدة التسليم') || '30 يوم',
        notes: getVal(row, 'ملاحظات') || '',
        aluminumColor: getVal(row, 'لون الألمنيوم') || '',
        shatterCode: getVal(row, 'كود الشتر') || '',
        unitStructure: getVal(row, 'هيكل الوحدات') || '',
        capShelf: getVal(row, 'غطاء الرفوف') || '',
        skirting: getVal(row, 'الوزرة') || '',
        lighting: getVal(row, 'الإضاءة') || '',
        shatterGlass: getVal(row, 'الزجاج') || '',
        interiorCabinet: getVal(row, 'الحشو الداخلي') || '',
        designerName: getVal(row, 'المصمم') || 'مستورد خارجي',
        status: (getVal(row, 'الحالة') as any) || 'Active',
        stage: (getVal(row, 'مرحلة التصنيع') as any) || 'تصميم',
        date: getVal(row, 'تاريخ الطلب') || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        units: [],
        appliances: [],
        accessories: [],
        hardware: [],
        archived: getVal(row, 'مؤرشف؟') === 'نعم' || getVal(row, 'مؤرشف') === 'نعم'
      };

      importedOrders.push(importedOrder);
    }

    if (importedOrders.length === 0) {
      return { success: false, count: 0, error: 'لم يتم العثور على بيانات صالحة للاستيراد' };
    }

    const currentOrders = getOrders();
    // Prepend to show them on top
    const merged = [...importedOrders, ...currentOrders];
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(merged));

    addActivityLog(currentUserEmail, "استيراد ملف إكسل CSV", `تم استيراد ${importedOrders.length} كروت عملاء بنجاح من ملف جدول بيانات.`);
    return { success: true, count: importedOrders.length };
  } catch (err: any) {
    console.error(err);
    return { success: false, count: 0, error: err.message || 'حدث خطأ أثناء معالجة الملف المستورد' };
  }
}
