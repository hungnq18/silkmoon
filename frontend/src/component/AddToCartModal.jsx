import { Link } from 'react-router-dom';

export default function AddToCartModal({ isOpen, onClose, product }) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-deep/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-linen-white rounded-xl p-stack-lg shadow-2xl z-10 border border-slate-deep/5 space-y-stack-md text-center">
        {/* Success Checkmark */}
        <div className="w-12 h-12 bg-sage-haze/10 text-sage-haze rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>

        {/* Title */}
        <div>
          <h3 className="font-headline-sm text-headline-sm text-slate-deep font-semibold">
            Thêm vào giỏ hàng thành công!
          </h3>
          <p className="text-xs text-on-surface-variant/70 mt-1">
            Sản phẩm đã được thêm vào giỏ hàng của bạn.
          </p>
        </div>

        {/* Product Details Panel */}
        <div className="flex gap-4 p-stack-md bg-bone/45 rounded-lg border border-slate-deep/5 text-left">
          <div className="w-16 h-20 bg-bone overflow-hidden rounded flex-shrink-0 border border-slate-deep/5">
            <img
              className="w-full h-full object-cover"
              src={product.image}
              alt={product.name}
            />
          </div>
          <div className="flex-grow min-w-0 flex flex-col justify-center">
            <h4 className="font-body-md font-semibold text-slate-deep truncate">
              {product.name}
            </h4>
            <p className="text-xs text-on-surface-variant opacity-75 mt-1 font-mono uppercase tracking-wide">
              {product.spec || 'WHITE CLOUD / STANDARD'}
            </p>
            <p className="font-body-md font-medium text-slate-deep mt-2">
              {typeof product.price === 'number'
                ? `${product.price.toLocaleString('vi-VN')}đ`
                : product.price}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <Link
            to="/cart"
            onClick={onClose}
            className="w-full bg-slate-deep text-linen-white py-4 font-button text-button rounded-full hover:opacity-90 active:scale-95 transition-all uppercase tracking-wide text-center"
          >
            Xem giỏ hàng
          </Link>
          <button
            onClick={onClose}
            className="w-full border border-slate-deep/20 text-slate-deep py-4 font-button text-button rounded-full hover:border-slate-deep hover:bg-bone/10 active:scale-95 transition-all uppercase tracking-wide"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
}
