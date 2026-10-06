import React from 'react';

interface CollectionItem {
  id: string;
  name: string;
  key: string;
  image: string;
}

const COLLECTIONS_LIST: CollectionItem[] = [
  {
    id: 'zeenat',
    name: 'ZEENAT',
    key: 'luxury-formals',
    image: '/src/assets/images/meheka_emerald_bridal_1790851149166.jpg',
  },
  {
    id: 'noir-luxe',
    name: 'NOIR LUXE',
    key: 'noir-luxury',
    image: '/src/assets/images/seraphina_black_formal_1790851270198.jpg',
  },
  {
    id: 'tabeer',
    name: 'TABEER',
    key: 'chiffon',
    image: '/src/assets/images/naqsh_navy_velvet_1790851164132.jpg',
  },
  {
    id: 'aarzu-luxury',
    name: 'AARZU LUXURY',
    key: 'luxury-formals',
    image: '/src/assets/images/jahanara_champagne_kalidar_1790851177196.jpg',
  },
];

interface ShopByCollectionSectionProps {
  onSelectCollection: (colKey: string) => void;
}

export const ShopByCollectionSection: React.FC<ShopByCollectionSectionProps> = ({
  onSelectCollection,
}) => {
  return (
    <section className="py-12 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title matching reference video */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl tracking-[0.22em] text-stone-950 uppercase font-normal">
            SHOP BY COLLECTION
          </h2>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {COLLECTIONS_LIST.map((col) => (
            <div
              key={col.id}
              onClick={() => onSelectCollection(col.key)}
              className="group cursor-pointer flex flex-col items-center select-none"
            >
              {/* Image Container with hover zoom */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-200 shadow-sm rounded-xs">
                <img
                  src={col.image}
                  alt={col.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Title under image matching reference video */}
              <h3 className="mt-3.5 text-center font-serif-luxury text-base sm:text-lg tracking-[0.2em] uppercase text-stone-900 group-hover:text-stone-600 transition-colors">
                {col.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
