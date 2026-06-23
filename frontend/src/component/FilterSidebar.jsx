const collections = [
  { id: 'new', label: 'New Arrivals', icon: 'auto_awesome' },
  { id: 'sets', label: 'Bedding Sets', icon: 'bed' },
  { id: 'pillows', label: 'Pillows', icon: 'bedroom_parent' },
  { id: 'duvets', label: 'Duvets', icon: 'layers' },
  { id: 'sale', label: 'Sale', icon: 'sell' },
];

const materials = [
  { id: 'cotton', label: 'Cotton Hữu Cơ' },
  { id: 'silk', label: 'Lụa Tơ Tằm' },
  { id: 'linen', label: 'Vải Linen Pháp' },
];

const colors = [
  { id: 'platinum', hex: '#E5E4E2', name: 'Platinum' },
  { id: 'beige', hex: '#F5F5DC', name: 'Beige' },
  { id: 'sage', hex: '#8FBC8F', name: 'Sage Green' },
  { id: 'slate', hex: '#708090', name: 'Slate Gray' },
  { id: 'sand', hex: '#D2B48C', name: 'Sand Silk' },
];

export default function FilterSidebar({
  selectedCollection,
  onSelectCollection,
  selectedMaterials,
  onToggleMaterial,
  selectedColor,
  onSelectColor,
}) {
  return (
    <aside className="w-64 flex-shrink-0">
      <div className="sticky top-32 space-y-stack-lg">
        {/* Collections */}
        <div>
          <h3 className="font-label-caps text-label-caps mb-stack-md uppercase tracking-widest opacity-60">
            Bộ sưu tập
          </h3>
          <ul className="space-y-stack-sm">
            {collections.map((col) => {
              const isActive = selectedCollection === col.id;
              return (
                <li key={col.id}>
                  <button
                    onClick={() => onSelectCollection(col.id)}
                    className={`flex items-center gap-2 py-2 px-3 rounded-sm w-full text-left font-body-md text-body-md transition-all ${
                      isActive
                        ? 'bg-sand-silk/20 text-slate-deep font-bold'
                        : 'text-on-surface-variant hover:text-slate-deep hover:bg-bone/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {col.icon}
                    </span>
                    {col.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Materials */}
        <div className="pt-stack-lg border-t border-bone">
          <h3 className="font-label-caps text-label-caps mb-stack-md uppercase tracking-widest opacity-60">
            Chất liệu
          </h3>
          <div className="space-y-2">
            {materials.map((mat) => (
              <label
                key={mat.id}
                className="flex items-center gap-3 cursor-pointer group select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedMaterials.includes(mat.id)}
                  onChange={() => onToggleMaterial(mat.id)}
                  className="w-4 h-4 rounded-sm border-slate-deep/20 text-slate-deep focus:ring-slate-deep/10 focus:ring-offset-0"
                />
                <span className="text-body-md text-on-surface-variant group-hover:text-slate-deep transition-colors">
                  {mat.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="pt-stack-lg border-t border-bone">
          <h3 className="font-label-caps text-label-caps mb-stack-md uppercase tracking-widest opacity-60">
            Màu sắc
          </h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = selectedColor === color.id;
              return (
                <button
                  key={color.id}
                  onClick={() => onSelectColor(isSelected ? '' : color.id)}
                  className={`w-6 h-6 rounded-full border border-slate-deep/10 ring-offset-2 hover:ring-1 hover:ring-slate-deep transition-all ${
                    isSelected ? 'ring-2 ring-slate-deep scale-110' : ''
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
