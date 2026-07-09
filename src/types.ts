export interface UnitSize {
  type: 'Base unit' | 'Wall unit 1' | 'Wall unit 2' | 'Gap unit' | 'Tall unit';
  height: string;
  depth: string;
  color: string;
}

export interface ApplianceSize {
  type: 'Oven' | 'MIC' | 'Fridge' | 'Dish Washer' | 'Hood' | 'Sink';
  height: string;
  width: string;
  depth: string;
  sinkModel?: string; // e.g., for Sink type
  mixerModel?: string; // e.g., for Sink type
}

export interface AccessorySelected {
  category: 'Drawer' | 'Flap' | 'Basket';
  itemName: string; // e.g., "TBX_M", "flap_HF", "سلة ماجك كورنر"
  quantity: number;
  size?: string; // e.g., "M", "D", "C" for drawers
}

export interface HardwareSelected {
  type: 'Hingnes' | 'Handel' | 'Glass';
  value: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  contractNo: string;
  deliveryDuration: string;
  notes: string;
  aluminumColor: string;
  shatterCode: string;
  unitStructure: string;
  capShelf: string;
  skirting: string;
  lighting: string;
  shatterGlass: string;
  interiorCabinet: string;
  designerName: string;
  status: 'قيد الانتظار' | 'في التصنيع' | 'قيد التصنيع' | 'جاهز' | 'جاهز للشحن' | 'تم التركيب' | 'Active' | 'Pending' | 'Completed' | 'Cancelled';
  stage?: 'تصميم' | 'تقطيع' | 'تجميع' | 'طلاء' | 'تسليم';
  date: string;
  createdAt: string;
  units: UnitSize[];
  appliances: ApplianceSize[];
  accessories: AccessorySelected[];
  hardware: HardwareSelected[];
  imageUrls?: string[];
  archived?: boolean;
  isDuplicate?: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface User {
  email: string;
  name: string;
  role: 'admin' | 'designer';
  password?: string;
  permissions?: string[];
}

export interface Machine {
  id: string;
  name: string;
  model: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  periodMonths: number;
  status: 'working' | 'maintenance_due' | 'under_maintenance';
  notes?: string;
}

