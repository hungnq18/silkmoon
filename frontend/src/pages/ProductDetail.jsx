import { useState } from 'react';
import ProductImageGallery from '../component/ProductImageGallery';
import ProductInfoPanel from '../component/ProductInfoPanel';
import ProductTabs from '../component/ProductTabs';
import RelatedProducts from '../component/RelatedProducts';
import ProductReviews from '../component/ProductReviews';
import ARRoomPreview from '../component/ar/ARRoomPreview';

// Product images per color — must match ProductInfoPanel colors
const PRODUCT_IMAGES = {
  champagne: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5ydK7aCRv1y7RaejNp-Ax9LhpHaU2vtWRIcHOLxn6NokUmgyNpUGiKbwdQUytnjtQ7J0VYu2NXIlPUQTgHYAXUL5y5FRuCIXviBggAYwt5KVFlbT-YVCRjexHDUBbtJ82Va8ihcrt7FTkOFmWD7d4gr1heMUmADKb-HeuP7dOGkmFc4bXpNJ4i6KVJNHhgrHUtwTIvqvwWyJf7w_1HVjpdYKXXro_zPX8NGlwuiDpcDLQ9NvBPZltOjPScmzTabt7iaCO-bhqSb4',
  white:     'https://lh3.googleusercontent.com/aida-public/AB6AXuD7BFKWk1o5mRKRclEZVyBUPmtjoLOKAYzUY_vTg9r_DzTzEB4UeTrWapZ649raqux7U_cFhj-BF4KG_ZgLoQuJA5aeqsXFkdSrPYko2xbScizKkfbRmcNAx1REZ76G6PAgwJiZW3Mp5b2ATQt3MhrFCHulAOt_HKIU1eP3A2vbBDdTtQqVC1GO-HzFYZi2UffsjjjqFU3Z142_XsJBFM85o6ZF33EhSFeczCVDKhfxxqYKYvLel8OyUocomhRmSCX-nPWG7It_-3c',
  sage:      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJbhsTCwF4xH7z1WLMrs5fPQu5V4ZbldfAuJIgsFgzDHlmSxs5dQeKRUQVt3VZCB9U8spht-Jbzg44VON0lkHD7kWAJogxqL13ZX8Qevx50d7U9in2bKbZcKiG1U6pOGKYCIh11lZgF6HMeCeRHe3xeIy6M38G9cuKv1w8ZCdUBOjrqyhDNy_Xgo4l1lnaa31iwwjHvwCyIavTvcTdohgfmrFw0vDOJio96HieIuSK-jqXpZojQQyisDWzYKy9N4afpwQLh4IgREY',
  slate:     'https://lh3.googleusercontent.com/aida-public/AB6AXuBJbhsTCwF4xH7z1WLMrs5fPQu5V4ZbldfAuJIgsFgzDHlmSxs5dQeKRUQVt3VZCB9U8spht-Jbzg44VON0lkHD7kWAJogxqL13ZX8Qevx50d7U9in2bKbZcKiG1U6pOGKYCIh11lZgF6HMeCeRHe3xeIy6M38G9cuKv1w8ZCdUBOjrqyhDNy_Xgo4l1lnaa31iwwjHvwCyIavTvcTdohgfmrFw0vDOJio96HieIuSK-jqXpZojQQyisDWzYKy9N4afpwQLh4IgREY',
};

export default function ProductDetail() {
  const [isAROpen, setIsAROpen] = useState(false);
  const [activeColorLabel, setActiveColorLabel] = useState('Champagne Silk');
  const [activeColorId, setActiveColorId] = useState('champagne');

  const handleColorChange = (colorLabel) => {
    setActiveColorLabel(colorLabel);
    setActiveColorId(colorLabel.split(' ')[0].toLowerCase());
  };

  return (
    <div className="bg-linen-white flex flex-col min-h-screen relative">
      {/* Detail Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg grid grid-cols-1 lg:grid-cols-12 gap-gutter pt-24 md:pt-32">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7">
          <ProductImageGallery />
        </div>

        {/* Right Column: Selections and Details */}
        <div className="lg:col-span-5">
          <ProductInfoPanel
            onOpenAR={() => setIsAROpen(true)}
            onColorChange={handleColorChange}
          />
        </div>
      </section>

      {/* Tabs description section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-section-gap border-t border-slate-deep/5 mt-10">
        <ProductTabs />
      </section>

      {/* Related Products Grid */}
      <RelatedProducts />

      {/* Product Reviews */}
      <ProductReviews />

      {/* AR Room Preview */}
      <ARRoomPreview
        isOpen={isAROpen}
        onClose={() => setIsAROpen(false)}
        productColor={activeColorId}
        productImage={PRODUCT_IMAGES[activeColorId] || PRODUCT_IMAGES.champagne}
      />
    </div>
  );
}
