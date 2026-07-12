import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { analyticsApi, productsApi, settingsApi } from '../services/api';
import ProductImageGallery from '../component/ProductImageGallery';
import ProductInfoPanel from '../component/ProductInfoPanel';
import ProductTabs from '../component/ProductTabs';
import RelatedProducts from '../component/RelatedProducts';
import ProductReviews from '../component/ProductReviews';
import ARRoomPreview from '../component/ar/ARRoomPreview';

// Product images per color — must match ProductInfoPanel colors
const PRODUCT_IMAGES = {
  champagne: 'https://images.unsplash.com/photo-1522771731478-44fb896da52d?auto=format&fit=crop&q=80&w=800',
  white:     'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800',
  sage:      'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800',
  slate:     'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=800',
};

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAROpen, setIsAROpen] = useState(false);
  const [activeColorLabel, setActiveColorLabel] = useState('');
  const [activeColorId, setActiveColorId] = useState('champagne'); // default for AR fallback
  const [arEnabled, setArEnabled] = useState(true);

  useEffect(() => {
    settingsApi.get('assistant_config').then((row) => setArEnabled(row?.value?.ar?.enabled !== false)).catch(() => null);
  }, []);

  useEffect(() => {
    setLoading(true);
    productsApi.getById(id || 'mulberry-silk-bedding')
      .then((data) => {
        setProduct(data);
        analyticsApi.track({ type: 'product_view', path: window.location.pathname, entityId: data._id, label: data.name });
        if (data.colors?.length > 0) {
          setActiveColorLabel(data.colors[0].label);
          setActiveColorId(data.colors[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleColorChange = (color) => {
    setActiveColorLabel(color.label);
    setActiveColorId(color.id);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-linen-white text-slate-deep animate-pulse">Đang tải sản phẩm...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center bg-linen-white text-slate-deep">Sản phẩm không tồn tại.</div>;
  }

  const activeColor = product.colors?.find((color) => color.id === activeColorId);
  const galleryImages = activeColor?.images?.length ? activeColor.images : (product.images || []);

  return (
    <div className="bg-linen-white flex flex-col min-h-screen relative overflow-x-hidden w-full max-w-[100vw]">
      {/* Detail Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg grid grid-cols-1 lg:grid-cols-12 gap-gutter pt-24 md:pt-32">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7">
          <ProductImageGallery images={galleryImages} />
        </div>

        {/* Right Column: Selections and Details */}
        <div className="lg:col-span-5">
          <ProductInfoPanel
            product={product}
            onOpenAR={() => { setIsAROpen(true); analyticsApi.track({ type: 'ar_open', path: window.location.pathname, entityId: product._id, label: product.name }); }}
            onColorChange={handleColorChange}
            arEnabled={arEnabled}
          />
        </div>
      </section>

      {/* Tabs description section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-section-gap border-t border-slate-deep/5 mt-10">
        <ProductTabs product={product} />
      </section>

      {/* Related Products Grid */}
      <RelatedProducts productId={product._id || product.id} />

      {/* Product Reviews */}
      <ProductReviews productId={product._id || product.id} />

      {/* AR Room Preview */}
      {arEnabled && <ARRoomPreview
        isOpen={isAROpen}
        onClose={() => setIsAROpen(false)}
        productColor={activeColorId}
        productImage={activeColor?.images?.[0] || PRODUCT_IMAGES[activeColorId] || product.images?.[0] || PRODUCT_IMAGES.champagne}
      />}
    </div>
  );
}
