import { useState, useEffect, useMemo } from 'react';
import FilterSidebar from '../component/FilterSidebar';
import ProductListGrid from '../component/ProductListGrid';
import Pagination from '../component/Pagination';
import { categoriesApi, productsApi } from '../services/api';
import { useLocation } from 'react-router-dom';
import { getProductListPrice, hasProductSale } from '../utils/productPrice';
import { productMatchesCategory } from '../utils/productCategory';

export default function Shop() {
  const location = useLocation();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const query = new URLSearchParams(location.search);
  const categoryFromMenu = query.get('category') || '';
  const saleOnly = query.get('sale') === 'true';

  useEffect(() => {
    setSelectedCollection(categoryFromMenu || 'all');
    setCurrentPage(1);
  }, [location.search]);

  useEffect(() => {
    productsApi.getAll({ limit: '100' })
      .then((data) => setAllProducts(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    categoriesApi.getAll()
      .then(setCategories)
      .catch(console.error);
  }, []);

  // Filter and Sort logic (client-side on fetched data)
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (selectedCollection === 'sale') {
      result = result.filter((product) => hasProductSale(product) || String(product.tag || '').toLowerCase() === 'sale');
    } else if (selectedCollection && selectedCollection !== 'all') {
      result = result.filter((product) => productMatchesCategory(product, selectedCollection));
    }

    if (saleOnly) result = result.filter((product) => hasProductSale(product) || String(product.tag || '').toLowerCase() === 'sale');

    if (selectedMaterials.length > 0) {
      result = result.filter((p) =>
        selectedMaterials.some((m) =>
          p.material?.toLowerCase().includes(m.toLowerCase())
        )
      );
    }

    if (selectedColor) {
      result = result.filter((p) =>
        p.colors?.some((c) => c.id === selectedColor)
      );
    }

    if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === 'price-asc') {
      result.sort((a, b) => getProductListPrice(a) - getProductListPrice(b));
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => getProductListPrice(b) - getProductListPrice(a));
    }

    return result;
  }, [allProducts, selectedCollection, selectedMaterials, selectedColor, sortOption, saleOnly]);

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleToggleMaterial = (materialId) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId]
    );
    setCurrentPage(1);
  };

  const handleSelectCollection = (colId) => {
    setSelectedCollection(colId);
    setCurrentPage(1);
  };

  const handleSelectColor = (colorId) => {
    setSelectedColor(colorId);
    setCurrentPage(1);
  };

  return (
    <main className="pt-24 md:pt-32 pb-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      {/* Category Header */}
      <section className="mb-stack-lg animate-fade-in">
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-stack-sm text-slate-deep">
          {saleOnly ? 'Sản phẩm Sale' : categoryFromMenu || 'Tất cả sản phẩm'}
        </h1>
        <p className="type-intro text-on-surface-variant max-w-2xl font-body-lg text-body-md md:text-body-lg">
          Khám phá bộ sưu tập chăn ga gối đệm được thiết kế cho sự nghỉ ngơi tuyệt đối, sử dụng những chất liệu tự nhiên bền vững nhất.
        </p>
      </section>

      <div className="flex flex-col md:flex-row gap-gutter">
        {/* Desktop Side Navigation / Filters */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <FilterSidebar
            categories={categories}
            selectedCollection={selectedCollection}
            onSelectCollection={handleSelectCollection}
            selectedMaterials={selectedMaterials}
            onToggleMaterial={handleToggleMaterial}
            selectedColor={selectedColor}
            onSelectColor={handleSelectColor}
          />
        </div>

        {/* Product Grid Area */}
        <div className="flex-grow">
          {/* Mobile Filter Trigger & Sorting */}
          <div className="flex justify-between items-center mb-stack-lg border-b border-slate-deep/5 pb-stack-sm gap-stack-md">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-2 font-button text-button py-2 px-4 border border-slate-deep/10 text-slate-deep hover:bg-bone transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Bộ lọc
            </button>

            <div className="text-label-caps font-label-caps opacity-60 text-slate-deep">
              {loading ? 'Đang tải...' : `Hiển thị ${filteredProducts.length} sản phẩm`}
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline font-button text-button text-on-surface-variant">Sắp xếp:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent border-0 border-b border-slate-deep/20 text-slate-deep font-button text-button py-1 focus:ring-0 focus:border-slate-deep cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="aspect-[3/4] bg-slate-deep/10 rounded animate-pulse" />
                  <div className="h-4 bg-slate-deep/10 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-slate-deep/5 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <ProductListGrid products={paginatedProducts.map(p => ({
                ...p,
                id: p._id,
                image: p.images?.[0],
                description: p.description,
              }))} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[70] flex md:hidden">
          <div
            className="absolute inset-0 bg-slate-deep/40 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative ml-0 mr-auto w-80 max-w-[85vw] h-full bg-linen-white p-6 shadow-2xl flex flex-col overflow-y-auto animate-slide-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-sm text-headline-sm text-slate-deep">Bộ Lọc</h2>
              <button className="p-1 hover:bg-bone rounded" onClick={() => setIsMobileFilterOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <FilterSidebar
              categories={categories}
              selectedCollection={selectedCollection}
              onSelectCollection={handleSelectCollection}
              selectedMaterials={selectedMaterials}
              onToggleMaterial={handleToggleMaterial}
              selectedColor={selectedColor}
              onSelectColor={handleSelectColor}
            />
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="mt-stack-lg bg-slate-deep text-linen-white py-3 font-button text-button rounded uppercase"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
