import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({ isOpen, onClose }) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  if (!isOpen) return null;

  const sizes = [
    { size: 'XS', bust: unit === 'inches' ? '34"' : '86 cm', waist: unit === 'inches' ? '28"' : '71 cm', hip: unit === 'inches' ? '36"' : '91 cm', length: unit === 'inches' ? '46"' : '117 cm', sleeve: unit === 'inches' ? '21"' : '53 cm' },
    { size: 'S', bust: unit === 'inches' ? '36"' : '91 cm', waist: unit === 'inches' ? '30"' : '76 cm', hip: unit === 'inches' ? '38"' : '96 cm', length: unit === 'inches' ? '46"' : '117 cm', sleeve: unit === 'inches' ? '21.5"' : '55 cm' },
    { size: 'M', bust: unit === 'inches' ? '39"' : '99 cm', waist: unit === 'inches' ? '33"' : '84 cm', hip: unit === 'inches' ? '42"' : '107 cm', length: unit === 'inches' ? '47"' : '119 cm', sleeve: unit === 'inches' ? '22"' : '56 cm' },
    { size: 'L', bust: unit === 'inches' ? '42"' : '107 cm', waist: unit === 'inches' ? '36"' : '91 cm', hip: unit === 'inches' ? '45"' : '114 cm', length: unit === 'inches' ? '47"' : '119 cm', sleeve: unit === 'inches' ? '22.5"' : '57 cm' },
    { size: 'XL', bust: unit === 'inches' ? '45"' : '114 cm', waist: unit === 'inches' ? '39"' : '99 cm', hip: unit === 'inches' ? '48"' : '122 cm', length: unit === 'inches' ? '48"' : '122 cm', sleeve: unit === 'inches' ? '23"' : '58 cm' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-[#FAF8F5] shadow-2xl p-6 border border-stone-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h2 className="font-serif-luxury text-xl text-stone-950 uppercase">
              Women&apos;s Tailoring Size Guide
            </h2>
            <p className="text-xs text-stone-500">Standard Pret &amp; Bespoke Stitching Dimensions</p>
          </div>
          <button onClick={onClose} className="p-1 text-stone-500 hover:text-stone-950">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unit switch */}
        <div className="flex items-center justify-end my-4 gap-2 text-xs">
          <span className="text-stone-500 font-medium">Measurement Unit:</span>
          <div className="inline-flex border border-stone-300">
            <button
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 font-semibold ${unit === 'inches' ? 'bg-stone-900 text-white' : 'bg-white text-stone-700'}`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 font-semibold ${unit === 'cm' ? 'bg-stone-900 text-white' : 'bg-white text-stone-700'}`}
            >
              Centimeters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-stone-200/70 border-b border-stone-300 text-stone-800 uppercase tracking-wider">
                <th className="p-2.5">Size</th>
                <th className="p-2.5">Bust</th>
                <th className="p-2.5">Waist</th>
                <th className="p-2.5">Hips</th>
                <th className="p-2.5">Shirt Length</th>
                <th className="p-2.5">Sleeve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {sizes.map((row) => (
                <tr key={row.size} className="hover:bg-stone-100/50">
                  <td className="p-2.5 font-bold text-stone-900">{row.size}</td>
                  <td className="p-2.5">{row.bust}</td>
                  <td className="p-2.5">{row.waist}</td>
                  <td className="p-2.5">{row.hip}</td>
                  <td className="p-2.5">{row.length}</td>
                  <td className="p-2.5">{row.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-stone-100 text-[11px] text-stone-600 leading-relaxed border-l-2 border-stone-800">
          <p className="font-semibold text-stone-900">Custom Size Option:</p>
          <p>If your measurements differ from our standard chart, select &ldquo;Custom&rdquo; upon ordering and our master tailor will craft your luxury ensemble according to your bespoke silhouette.</p>
        </div>
      </div>
    </div>
  );
};
