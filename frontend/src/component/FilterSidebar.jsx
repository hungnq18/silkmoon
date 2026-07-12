const categories = [
  { id: 'all', label: 'Tất cả sản phẩm', icon: 'apps' },
  { id: 'Chăn Ga Gối', label: 'Bộ Chăn Ga Gối', icon: 'bed' },
  { id: 'Chăn', label: 'Vỏ Chăn', icon: 'layers' },
  { id: 'Ga', label: 'Ga Giường', icon: 'bed' },
  { id: 'Gối', label: 'Vỏ Gối', icon: 'bedroom_parent' },
  { id: 'Đồ Ngủ', label: 'Đồ Ngủ', icon: 'checkroom' },
  { id: 'Phụ Kiện', label: 'Phụ Kiện', icon: 'sell' },
  { id: 'sale', label: 'Sale', icon: 'local_offer' },
];

export default function FilterSidebar({ selectedCollection, onSelectCollection }) {
  return (
    <aside className="w-64 flex-shrink-0">
      <div className="sticky top-32">
        <ul className="space-y-1">
          {categories.map((category) => {
            const isActive = selectedCollection === category.id;
            return (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => onSelectCollection(category.id)}
                  className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left font-body-md text-body-md transition-all ${
                    isActive
                      ? 'bg-slate-deep text-white font-bold'
                      : 'text-on-surface-variant hover:bg-slate-deep hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{category.icon}</span>
                  {category.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
