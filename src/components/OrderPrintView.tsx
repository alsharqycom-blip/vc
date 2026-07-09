import React, { useState } from 'react';
import { Order } from '../types';
import { ArrowRight, Printer, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from './Toast';

interface OrderPrintProps {
  order: Order;
  onNavigate: (view: string) => void;
}

export default function OrderPrintView({ order, onNavigate }: OrderPrintProps) {
  const { showToast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleSavePDF = async () => {
    const element = document.getElementById('printable-card-area');
    if (!element) return;
    setIsGeneratingPDF(true);

    const backups: { element: HTMLElement; originalText?: string; originalDisabled?: boolean }[] = [];
    const tempStyleTags: HTMLStyleElement[] = [];

    try {
      // 1. Process all <style> elements
      const styleElements = Array.from(document.querySelectorAll('style'));
      for (const el of styleElements) {
        backups.push({
          element: el,
          originalText: el.textContent || ''
        });
        let text = el.textContent || '';
        if (text.includes('oklch') || text.includes('oklab') || text.includes('color-mix') || text.includes('light-dark')) {
          text = text.replace(/oklch\s*\((?:[^()]+|\([^()]*\))*\)/g, 'rgb(120, 120, 120)');
          text = text.replace(/oklab\s*\((?:[^()]+|\([^()]*\))*\)/g, 'rgb(120, 120, 120)');
          text = text.replace(/color-mix\s*\((?:[^()]+|\([^()]*\))*\)/g, 'rgb(120, 120, 120)');
          text = text.replace(/light-dark\s*\((?:[^()]+|\([^()]*\))*\)/g, 'rgb(120, 120, 120)');
          el.textContent = text;
        }
      }

      // 2. Process all <link rel="stylesheet"> elements
      const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
      for (const link of linkElements) {
        try {
          const response = await fetch(link.href);
          if (response.ok) {
            let cssText = await response.text();
            
            backups.push({
              element: link,
              originalDisabled: link.disabled
            });
            link.disabled = true;

            cssText = cssText.replace(/oklch\s*\((?:[^()]+|\([^()]*\))*\)/g, 'rgb(120, 120, 120)');
            cssText = cssText.replace(/oklab\s*\((?:[^()]+|\([^()]*\))*\)/g, 'rgb(120, 120, 120)');
            cssText = cssText.replace(/color-mix\s*\((?:[^()]+|\([^()]*\))*\)/g, 'rgb(120, 120, 120)');
            cssText = cssText.replace(/light-dark\s*\((?:[^()]+|\([^()]*\))*\)/g, 'rgb(120, 120, 120)');

            const tempStyle = document.createElement('style');
            tempStyle.setAttribute('data-temp-pdf-style', 'true');
            tempStyle.textContent = cssText;
            document.head.appendChild(tempStyle);
            tempStyleTags.push(tempStyle);
          }
        } catch (linkError) {
          console.warn('Failed to pre-process link stylesheet:', link.href, linkError);
        }
      }

      // Wait 150ms for browser styling recalculation
      await new Promise(resolve => setTimeout(resolve, 150));

      // High-resolution screenshot rendering of the printable element
      const canvas = await html2canvas(element, {
        scale: 2, // Retain sharp, vector-quality text
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#FCFAF7' // brand-cream color
      });

      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safeName = order.customerName.replace(/[\s\/:*?"<>|]+/g, '_');
      pdf.save(`كرت_عميل_${safeName}_${order.contractNo}.pdf`);
      showToast('📥 تم تحميل ملف الـ PDF بنجاح للطباعة أو الإرسال!', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('حدث خطأ أثناء إنشاء ملف الـ PDF، يرجى تكرار المحاولة.', 'error');
    } finally {
      // 3. Restore all original styles
      for (const backup of backups) {
        if (backup.originalText !== undefined) {
          backup.element.textContent = backup.originalText;
        }
        if (backup.originalDisabled !== undefined) {
          (backup.element as HTMLLinkElement).disabled = backup.originalDisabled;
        }
      }
      for (const tempStyle of tempStyleTags) {
        tempStyle.remove();
      }
      setIsGeneratingPDF(false);
    }
  };

  const getDrawerQty = (dType: string, dSize: 'M' | 'D' | 'C') => {
    const target = order.accessories.find(
      acc => acc.category === 'Drawer' && acc.itemName === `${dType}_${dSize}`
    );
    return target ? target.quantity : '0';
  };

  const getFlapChecked = (name: string) => {
    return order.accessories.some(acc => acc.category === 'Flap' && acc.itemName === name);
  };

  const getBasketQty = (name: string) => {
    const target = order.accessories.find(acc => acc.category === 'Basket' && acc.itemName === name);
    return target ? target.quantity : '';
  };

  const handlePrint = () => {
    try {
      window.focus();
      window.print();
    } catch (error) {
      console.warn('Direct print blocked by sandbox iframe, falling back to PDF generation:', error);
      showToast('ℹ️ تم تحويل الكرت إلى PDF تلقائياً لأن متصفحك يحظر الطباعة المباشرة داخل نافذة المعاينة.', 'info');
      handleSavePDF();
    }
  };

  // Group accessories of type Basket
  const basketAccessories = order.accessories.filter(acc => acc.category === 'Basket');

  return (
    <div className="space-y-6">
      {/* View controls (hidden during print) */}
      <div className="no-print flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('customers')}
            className="p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-brand-dark cursor-pointer transition-all"
          >
            <ArrowRight size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-brand-dark">معاينة وطباعة كرت العميل</h1>
            <p className="text-[11px] text-brand-med">مُنسق ومُهيأ بالكامل للطباعة الورقية على مقاس A4</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSavePDF}
            disabled={isGeneratingPDF}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer ${
              isGeneratingPDF 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Download size={14} className={isGeneratingPDF ? 'animate-bounce' : ''} />
            {isGeneratingPDF ? 'جاري التحضير...' : 'حفظ كـ PDF للواتساب'}
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-brand-gold hover:bg-[#9A7008] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
          >
            <Printer size={15} />
            بدء الطباعة الآن
          </button>
        </div>
      </div>

      {/* The Printable A4 Customer Card Container */}
      <div id="printable-card-area" className="print-container bg-brand-cream border-[3px] border-brand-dark text-brand-dark p-6 rounded-none shadow-lg max-w-[210mm] min-h-[297mm] mx-auto space-y-5 text-xs font-sans">
        {/* Card Header Section */}
        <div className="flex justify-between items-center border-b-2 border-brand-gold pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-brand-dark flex items-center justify-center text-brand-cream font-black text-lg">
              V
            </div>
            <div>
              <div className="text-base font-black tracking-widest text-brand-gold">VILLE CUISINE</div>
              <div className="text-[8px] uppercase font-bold text-brand-med">Soft Industries Factory.co</div>
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-sm font-black text-brand-dark">كرت مواصفات وطلبات العميل</h1>
            <span className="text-[10px] font-mono font-bold text-brand-gold">{order.id}</span>
          </div>
        </div>

        {/* Top Blocks: Customer Info & General Specifications */}
        <div className="grid grid-cols-2 gap-4">
          {/* Customer info table */}
          <div className="border border-brand-dark/40 bg-white p-3 space-y-2 rounded">
            <h3 className="text-[10px] font-black text-brand-gold uppercase border-b border-brand-gold/20 pb-1.5">
              📋 بيانات العميل / Customer info
            </h3>
            <table className="w-full text-right">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-1 font-bold text-brand-med w-20">اسم العميل :</td>
                  <td className="py-1 font-black text-brand-dark">{order.customerName}</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-brand-med">الجوال :</td>
                  <td className="py-1 font-mono font-bold">{order.phone}</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-brand-med">العنوان :</td>
                  <td className="py-1 text-brand-dark">{order.address || '—'}</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-brand-med">رقم العقد :</td>
                  <td className="py-1 font-mono font-bold text-brand-gold">{order.contractNo}</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-brand-med">مدة التسليم :</td>
                  <td className="py-1 font-bold">{order.deliveryDuration || '—'}</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-brand-med">المصمم :</td>
                  <td className="py-1 font-bold text-brand-med">{order.designerName || 'المصمم المسؤول'}</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-brand-med">مرحلة التصنيع:</td>
                  <td className="py-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                      {order.stage || 'تصميم'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-1 font-bold text-brand-med">حالة الطلب :</td>
                  <td className="py-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                      order.status === 'في التصنيع' || order.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      order.status === 'تم التركيب' || order.status === 'Completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      order.status === 'جاهز' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                      order.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {order.status === 'قيد الانتظار' ? '🕒 قيد الانتظار' :
                       order.status === 'في التصنيع' ? '🏭 في التصنيع' :
                       order.status === 'جاهز' ? '✅ جاهز' :
                       order.status === 'تم التركيب' ? '🏠 تم التركيب' :
                       order.status === 'Active' ? 'نشط (قيد التنفيذ)' :
                       order.status === 'Completed' ? 'تم التسليم (مكتمل)' :
                       order.status === 'Cancelled' ? 'ملغي' :
                       order.status === 'Pending' ? 'معلق' :
                       order.status}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Specs info table */}
          <div className="border border-brand-dark/40 bg-white p-3 space-y-2 rounded">
            <h3 className="text-[10px] font-black text-brand-gold uppercase border-b border-brand-gold/20 pb-1.5">
              ⚙️ المواصفات العامة / General specs
            </h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
              <div>
                <span className="font-bold text-brand-med block">Alluminum (الألمنيوم):</span>
                <span className="font-black text-brand-dark">{order.aluminumColor || '—'}</span>
              </div>
              <div>
                <span className="font-bold text-brand-med block">Shatter (الشطر):</span>
                <span className="font-black text-brand-dark">{order.shatterCode || '—'}</span>
              </div>
              <div>
                <span className="font-bold text-brand-med block">Unit Structure (التركيبة):</span>
                <span className="font-black text-brand-dark">{order.unitStructure || '—'}</span>
              </div>
              <div>
                <span className="font-bold text-brand-med block">Cap Shelf (الرف):</span>
                <span className="font-black text-brand-dark">{order.capShelf || '—'}</span>
              </div>
              <div>
                <span className="font-bold text-brand-med block">Skirting (الاسكرتنج):</span>
                <span className="font-black text-brand-dark">{order.skirting || '—'}</span>
              </div>
              <div>
                <span className="font-bold text-brand-med block">Lighting (الإضاءة):</span>
                <span className="font-black text-brand-dark">{order.lighting || '—'}</span>
              </div>
              <div>
                <span className="font-bold text-brand-med block">Shatter Glass (الزجاج):</span>
                <span className="font-black text-brand-dark">{order.shatterGlass || '—'}</span>
              </div>
              <div>
                <span className="font-bold text-brand-med block">Interior (الدواخل):</span>
                <span className="font-black text-brand-dark">{order.interiorCabinet || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Size Table */}
        <div className="border border-brand-dark/40 bg-white rounded overflow-hidden">
          <div className="bg-brand-dark text-brand-cream px-3 py-1.5 font-bold text-[10px] uppercase">
            📐 مقاسات وألوان الوحدات / Unit Size
          </div>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-gray-100 text-brand-med font-bold border-b border-gray-200">
                <th className="p-1.5 border-r border-gray-200 text-right w-1/4">الوحدة Unit</th>
                <th className="p-1.5 border-r border-gray-200 w-1/4">H (الارتفاع)</th>
                <th className="p-1.5 border-r border-gray-200 w-1/4">D (العمق)</th>
                <th className="p-1.5 w-1/4">اللون COLOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.units.map(u => (
                <tr key={u.type} className="hover:bg-gray-50/50">
                  <td className="p-1.5 border-r border-gray-200 text-right font-bold text-brand-med bg-gray-50/20">{u.type}</td>
                  <td className="p-1.5 border-r border-gray-200 font-bold">{u.height || '—'}</td>
                  <td className="p-1.5 border-r border-gray-200 font-bold">{u.depth || '—'}</td>
                  <td className="p-1.5 font-bold text-brand-gold">{u.color || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Drawers specifications */}
        <div className="border border-brand-dark/40 bg-white p-3 rounded space-y-2">
          <h3 className="text-[10px] font-black text-brand-gold uppercase border-b border-brand-gold/20 pb-1">
            ⚙️ مقاسات وتفاصيل الأدراج / Drawers
          </h3>
          <table className="w-full text-center border-collapse border border-gray-100">
            <thead>
              <tr className="bg-gray-50 font-bold text-brand-med">
                <th className="p-1 border border-gray-100">الموديل</th>
                <th className="p-1 border border-gray-100">M</th>
                <th className="p-1 border border-gray-100">D</th>
                <th className="p-1 border border-gray-100">C</th>
              </tr>
            </thead>
            <tbody>
              {['TBX', 'Iner', 'Legra', 'Duble Wall', 'Under Sink', 'Hitch'].map(dType => (
                <tr key={dType}>
                  <td className="p-1 border border-gray-100 bg-gray-50/10 font-bold text-right pr-2">{dType}</td>
                  <td className="p-1 border border-gray-100 font-bold">{getDrawerQty(dType, 'M')}</td>
                  <td className="p-1 border border-gray-100 font-bold">{getDrawerQty(dType, 'D')}</td>
                  <td className="p-1 border border-gray-100 font-bold">{getDrawerQty(dType, 'C')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Handle type row */}
          {order.accessories.some(acc => acc.category === 'Drawer' && acc.itemName.startsWith('HANDLE_')) && (
            <div className="text-[10px] pt-1.5 flex gap-2">
              <span className="font-bold text-brand-med">نوع ومواصفات السحاب:</span>
              <span className="font-bold text-brand-dark">
                {order.accessories.find(acc => acc.category === 'Drawer' && acc.itemName.startsWith('HANDLE_'))?.itemName.replace('HANDLE_', '')}
              </span>
            </div>
          )}
        </div>

        {/* Flaps & Baskets selection summary */}
        <div className="grid grid-cols-2 gap-4">
          {/* Flaps */}
          <div className="border border-brand-dark/40 bg-white p-3 rounded space-y-2">
            <h3 className="text-[10px] font-black text-brand-gold uppercase border-b border-brand-gold/20 pb-1">
              ⚙️ مواصفات الرفرف / Flap
            </h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
              {['HF', 'HL', 'HK', 'HS', 'HKS', 'HKS(T)', 'HK(T)'].map(fName => {
                const checked = getFlapChecked(fName);
                return (
                  <div key={fName} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded border flex items-center justify-center text-[8px] font-black ${
                      checked ? 'bg-brand-gold border-brand-gold text-white' : 'border-gray-300 text-transparent'
                    }`}>
                      ✓
                    </span>
                    <span className={checked ? 'font-bold text-brand-dark' : 'text-gray-400'}>{fName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Baskets */}
          <div className="border border-brand-dark/40 bg-white p-3 rounded space-y-2">
            <h3 className="text-[10px] font-black text-brand-gold uppercase border-b border-brand-gold/20 pb-1">
              ⚙️ السلال المختارة / Selected Baskets
            </h3>
            <div className="space-y-1 max-h-24 overflow-y-auto divide-y divide-gray-50">
              {basketAccessories.length > 0 ? (
                basketAccessories.map((basket, i) => (
                  <div key={i} className="flex justify-between items-center py-1 text-[10px]">
                    <span className="font-medium text-brand-dark">{basket.itemName}</span>
                    <span className="font-bold text-brand-gold bg-brand-cream px-1.5 py-0.5 rounded">
                      {basket.quantity} قطع
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-[10px] italic py-2">لا توجد سلال مختارة في هذا الكرت.</div>
              )}
            </div>
          </div>
        </div>

        {/* Appliance Sizes (E-A-Size) */}
        <div className="border border-brand-dark/40 bg-white rounded overflow-hidden">
          <div className="bg-brand-dark text-brand-cream px-3 py-1.5 font-bold text-[10px] uppercase">
            🍳 مقاسات وتفاصيل الأجهزة / Appliance Sizes (E-A-Size)
          </div>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-gray-100 text-brand-med font-bold border-b border-gray-200">
                <th className="p-1 border-r border-gray-200 text-right pl-2">الجهاز Appliance</th>
                <th className="p-1 border-r border-gray-200">H (الارتفاع)</th>
                <th className="p-1 border-r border-gray-200">W (العرض)</th>
                <th className="p-1 border-r border-gray-200">D (العمق)</th>
                <th className="p-1">تفاصيل وموديل الملحق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.appliances.map(a => {
                const isSink = a.type === 'Sink';
                return (
                  <tr key={a.type}>
                    <td className="p-1 border-r border-gray-200 text-right font-bold text-brand-med bg-gray-50/20 pl-2">{a.type}</td>
                    <td className="p-1 border-r border-gray-200 font-bold">{a.height || '—'}</td>
                    <td className="p-1 border-r border-gray-200 font-bold">{a.width || '—'}</td>
                    <td className="p-1 border-r border-gray-200 font-bold">{a.depth || '—'}</td>
                    <td className="p-1 text-right pr-2 text-[10px]">
                      {isSink ? (
                        <div className="flex flex-col gap-0.5">
                          {a.sinkModel && <span className="font-bold text-brand-gold">{a.sinkModel}</span>}
                          {a.mixerModel && <span className="text-[9px] text-brand-med">رقم الخلاط: {a.mixerModel}</span>}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Hardware & Components */}
        <div className="border border-brand-dark/40 bg-white p-3 rounded space-y-2">
          <h3 className="text-[10px] font-black text-brand-gold uppercase border-b border-brand-gold/20 pb-1">
            🔩 إكسسوارات الهاردوير / Hardware
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {order.hardware.map((hw, i) => (
              <div key={hw.type} className="bg-gray-50 p-2 border border-gray-200 rounded flex justify-between items-center">
                <span className="font-bold text-brand-med">{hw.type}:</span>
                <span className="font-black text-brand-dark bg-white px-2 py-0.5 rounded border border-gray-100">{hw.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Printable Notes footer */}
        {order.notes && (
          <div className="border border-brand-dark/45 bg-white p-3 rounded">
            <span className="font-bold text-brand-gold block mb-1">📝 ملاحظات هامة :</span>
            <p className="text-[10px] text-brand-dark leading-relaxed font-semibold">{order.notes}</p>
          </div>
        )}
        {/* Printable Drawings / Croquis Section */}
        {order.imageUrls && order.imageUrls.length > 0 && (
          <div className="border border-brand-dark/40 bg-white p-3 rounded space-y-3">
            <h3 className="text-[10px] font-black text-brand-gold uppercase border-b border-brand-gold/20 pb-1">
              🖼️ المخططات الهندسية والرسومات الكروكي / Architectural Drawings
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {order.imageUrls.map((url, index) => (
                <div key={index} className="border border-gray-200 rounded p-1.5 bg-gray-50 flex flex-col items-center">
                  <div className="w-full h-32 overflow-hidden flex items-center justify-center bg-white rounded border border-gray-100">
                    <img
                      src={url}
                      alt={`مخطط فني ${index + 1}`}
                      referrerPolicy="no-referrer"
                      className="object-contain w-full h-full max-h-28"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/300x180/e5e7eb/a1a1aa?text=Drawing+Link';
                      }}
                    />
                  </div>
                  <span className="text-[8px] font-mono text-brand-med mt-1 truncate w-full text-center" dir="ltr">
                    {url}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signature Areas */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="border border-dashed border-brand-dark/40 p-4 text-center rounded bg-white">
            <span className="font-bold text-brand-dark text-xs block mb-6">توقيع العميل واعتماده</span>
            <div className="border-b border-brand-dark/20 w-3/4 mx-auto mb-1"></div>
            <span className="text-[9px] text-gray-400 block" dir="ltr">Customer Specifications Sign-off</span>
          </div>

          <div className="border border-dashed border-brand-dark/40 p-4 text-center rounded bg-white">
            <span className="font-bold text-brand-dark text-xs block mb-6">توقيع المصمم المسؤول والمراجع</span>
            <div className="border-b border-brand-dark/20 w-3/4 mx-auto mb-1"></div>
            <span className="text-[9px] text-gray-400 block" dir="ltr">Designer/Supervisor Sign-off</span>
          </div>
        </div>

        {/* Document Footer */}
        <div className="pt-2 text-center text-[10px] text-brand-med border-t border-brand-gold/30">
          <div className="font-bold">شركة مصنع الصناعات الناعمة المحدودة — Soft Industries Factory.co</div>
          <div>معارض مطابخ فيلا كوزين — طريق الإمام محمد بن سعود — الرياض، المملكة العربية السعودية</div>
        </div>
      </div>
    </div>
  );
}
