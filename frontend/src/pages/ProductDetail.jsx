import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { analyticsApi, productsApi, settingsApi } from '../services/api';
import ProductImageGallery from '../component/ProductImageGallery';
import ProductInfoPanel from '../component/ProductInfoPanel';
import ProductTabs from '../component/ProductTabs';
import RelatedProducts from '../component/RelatedProducts';
import ProductReviews from '../component/ProductReviews';
import ARRoomPreview from '../component/ar/ARRoomPreview';
import { applyLatestSizeCatalog } from '../utils/productSizes';

// Product images per color — must match ProductInfoPanel colors
export default function ProductDetail() {
  const { id } = useParams();
  const productId = id || 'mulberry-silk-bedding';
  const [product, setProduct] = useState(null);
  const [loadedProductId, setLoadedProductId] = useState('');
  const [isAROpen, setIsAROpen] = useState(false);
  const [activeColorId, setActiveColorId] = useState('champagne'); // default for AR fallback
  const [jumpToImage, setJumpToImage] = useState(null);
  const [arEnabled, setArEnabled] = useState(true);
  const [arButtonVisible, setArButtonVisible] = useState(true);

  useEffect(() => {
    settingsApi.get('assistant_config').then((row) => {
      const arConfig = row?.value?.ar || {};
      setArEnabled(arConfig.enabled !== false);
      setArButtonVisible(arConfig.showProductButton !== false);
    }).catch(() => null);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      productsApi.getById(productId),
      settingsApi.get('product_sizes').catch(() => null),
    ])
      .then(([rawProduct, sizeSetting]) => {
        if (!active) return;
        const data = applyLatestSizeCatalog(rawProduct, sizeSetting);
        setProduct(data);
        analyticsApi.track({ type: 'product_view', path: window.location.pathname, entityId: data._id, label: data.name });
        if (data.colors?.length > 0) {
          setActiveColorId(data.colors[0].id);
        }
      })
      .catch((error) => {
        if (active) {
          console.error(error);
          setProduct(null);
        }
      })
      .finally(() => { if (active) setLoadedProductId(productId); });
    return () => { active = false; };
  }, [productId]);

  useEffect(() => {
    let active = true;
    const refreshProduct = async () => {
      try {
        const [rawProduct, sizeSetting] = await Promise.all([
          productsApi.getById(productId),
          settingsApi.get('product_sizes').catch(() => null),
        ]);
        if (!active) return;
        const data = applyLatestSizeCatalog(rawProduct, sizeSetting);
        setProduct(data);
        setActiveColorId((current) => data.colors?.some((color) => color.id === current) ? current : data.colors?.[0]?.id || 'champagne');
      } catch (error) {
        console.error('Không thể làm mới nội dung sản phẩm', error);
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshProduct();
    };
    window.addEventListener('focus', refreshProduct);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      active = false;
      window.removeEventListener('focus', refreshProduct);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [productId]);

  const handleColorChange = (color) => {
    setActiveColorId(color.id);
    if (color.images?.length > 0) {
      setJumpToImage(color.images[0]);
    }
  };

  if (loadedProductId !== productId) {
    return <div className="min-h-screen flex items-center justify-center bg-linen-white text-slate-deep animate-pulse">Đang tải sản phẩm...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center bg-linen-white text-slate-deep">Sản phẩm không tồn tại.</div>;
  }

  const activeColor = product.colors?.find((color) => color.id === activeColorId);
  const galleryImages = [...new Set([
    ...(product.images || []),
    ...((product.colors || []).flatMap((c) => c.images || []))
  ])];

  return (
    <div className="product-detail-root bg-linen-white flex flex-col min-h-screen relative overflow-x-hidden w-full max-w-[100vw]">
      {/* Detail Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg grid grid-cols-1 lg:grid-cols-12 gap-gutter pt-24 md:pt-32">
        <nav aria-label="Đường dẫn sản phẩm" className="no-scrollbar col-span-full -mb-2 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-slate-deep/70 lg:hidden">
          <Link to="/" className="shrink-0 transition-colors hover:text-slate-deep">Trang chủ</Link>
          <span className="material-symbols-outlined shrink-0 text-[18px]">chevron_right</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category || '')}`} className="shrink-0 transition-colors hover:text-slate-deep">{product.category || 'Sản phẩm'}</Link>
          <span className="material-symbols-outlined shrink-0 text-[18px]">chevron_right</span>
          <span className="truncate font-semibold text-slate-deep">{product.name}</span>
        </nav>
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7">
          <ProductImageGallery images={galleryImages} activeImage={jumpToImage} />
        </div>

        {/* Right Column: Selections and Details */}
        <div className="lg:col-span-5">
          <ProductInfoPanel
            key={product._id || product.id}
            product={product}
            onOpenAR={() => { setIsAROpen(true); analyticsApi.track({ type: 'ar_open', path: window.location.pathname, entityId: product._id, label: product.name }); }}
            onColorChange={handleColorChange}
            arEnabled={arEnabled && arButtonVisible && product.showArButton !== false}
          />
        </div>
      </section>

      {/* Tabs description section */}
      <section className="mx-auto mt-6 max-w-container-max border-t border-slate-deep/5 px-margin-mobile py-8 md:px-margin-desktop md:py-section-gap">
        <ProductTabs product={product} />
      </section>

      {/* Related Products Grid */}
      <RelatedProducts productId={product._id || product.id} />

      {/* Product Reviews */}
      <ProductReviews productId={product._id || product.id} />

      {/* AR Room Preview */}
      {arEnabled && <ARRoomPreview
        key={`${product._id || product.id}-${activeColorId}`}
        isOpen={isAROpen}
        onClose={() => setIsAROpen(false)}
        productColor={activeColor || activeColorId}
        productColors={product.colors}
      />}
    </div>
  );
}
