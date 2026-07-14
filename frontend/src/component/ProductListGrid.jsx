import { useState } from 'react';
import { Link } from 'react-router-dom';
import AddToCartModal from './AddToCartModal';
import { useCart } from '../context/CartContext';
import { getLowestPriceSize, getProductListPrice } from '../utils/productPrice';
import { getSizeMeasurements } from '../utils/productSizes';

export default function ProductListGrid({ products }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const { addToCart } = useCart();

  const handleQuickAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const lowestPriceSize = getLowestPriceSize(product);
    const listPrice = getProductListPrice(product);
    const specLabel = lowestPriceSize?.label || product.category || 'STANDARD';

    try {
      addToCart(product.id, 1, lowestPriceSize ? {
        sizeId: lowestPriceSize.id,
        sizeLabel: lowestPriceSize.label,
        sizeMeasurements: getSizeMeasurements(lowestPriceSize),
      } : {});

      setModalProduct({
        name: product.name,
        price: listPrice,
        image: product.image,
        spec: specLabel
      });
      setModalOpen(true);
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng.');
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-stack-lg border border-slate-deep/5 bg-bone/20 rounded-lg">
        <span className="material-symbols-outlined text-[48px] opacity-40 mb-2">
          search_off
        </span>
        <p className="font-body-lg text-on-surface-variant">
          Không tìm thấy sản phẩm nào khớp với bộ lọc của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-gutter gap-y-10">
      {products.map((product) => (
        <Link
          key={product.id}
          to={`/product/${product.id}`}
          className="product-card group cursor-pointer flex flex-col"
        >
          {/* Image Container */}
          <div className="relative aspect-[4/5] bg-bone mb-stack-md overflow-hidden rounded-lg">
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src={product.image}
              alt={product.name}
            />

            {/* Quick Add Overlay */}
            <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={(e) => handleQuickAdd(e, product)}
                className="type-button w-full bg-slate-deep text-white py-3 font-button hover:bg-slate-deep/90 rounded shadow-sm active:scale-95 transition-transform"
              >
                THÊM VÀO GIỎ
              </button>
            </div>

            {/* Tags */}
            {product.tag && (
              <div
                className={`absolute top-4 ${product.tag === 'NEW' ? 'left-4 bg-white/90 text-slate-deep' : 'right-4 bg-error text-white'
                  } px-3 py-1 text-label-caps font-semibold rounded-sm`}
              >
                {product.tag}
              </div>
            )}
          </div>

          {/* Product Details */}
          <h4 className="type-card-title font-headline-sm text-[20px] mb-1 group-hover:text-secondary transition-colors">
            {product.name}
          </h4>
          <p className="type-card-body text-on-surface-variant font-body-md mb-2">
            {product.description?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
          </p>
          <div className="flex items-center gap-3 mt-auto">
            <span className="type-price font-semibold text-slate-deep">
              {getProductListPrice(product).toLocaleString('vi-VN')}₫
            </span>
            {Number(product.originalPrice) > getProductListPrice(product) && (
              <span className="text-on-surface-variant/50 line-through text-sm">
                {product.originalPrice.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>
        </Link>
      ))}

      {modalOpen && modalProduct && (
        <AddToCartModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          product={modalProduct} 
        />
      )}
    </div>
  );
}
