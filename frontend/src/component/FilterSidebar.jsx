export default function FilterSidebar({ categories = [], selectedCollection, onSelectCollection }) {
  const filterCategories = [
    { id: 'all', label: 'Tất cả sản phẩm', icon: 'apps' },
    ...categories
      .filter((category) => category.isActive !== false)
      .map((category) => ({ id: category.name, label: category.name, icon: category.icon || 'category', iconUrl: category.iconUrl || '' })),
    { id: 'sale', label: 'Sale', icon: 'local_offer' },
  ];

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="sticky top-32">
        <ul className="space-y-1">
          {filterCategories.map((category) => {
            const isActive = selectedCollection === category.id;
            return (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => onSelectCollection(category.id)}
                  className={`category-filter-button flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left font-body-md text-body-md transition-all ${
                    isActive
                      ? 'bg-slate-deep text-white font-bold'
                      : 'text-on-surface-variant hover:bg-slate-deep hover:text-white'
                  }`}
                >
                  {category.iconUrl
                    ? <img src={category.iconUrl} alt="" className={`category-upload-icon h-[18px] w-[18px] shrink-0 object-contain ${isActive ? 'is-active' : ''}`} />
                    : <span className="material-symbols-outlined shrink-0 text-[18px]">{category.icon}</span>}
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
