import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const sizes = [
  { id: 'queen', label: 'Queen (160x200)' },
  { id: 'king', label: 'King (180x200)' },
  { id: 'super-king', label: 'Super King (220x200)' },
];

const colors = [
  { id: 'champagne', hex: '#E5D5C5', label: 'Champagne Silk' },
  { id: 'white', hex: '#E8E8E5', label: 'White Silk' },
  { id: 'sage', hex: '#567E73', label: 'Sage Silk' },
  { id: 'slate', hex: '#334641', label: 'Slate Silk' },
];

export default function ProductInfoPanel({ product, onOpenAR, onColorChange, arEnabled = true }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('queen');
  
  // Use product colors or fallback
  const productColors = product.colors?.length > 0 ? product.colors : colors;
  const [selectedColor, setSelectedColor] = useState(productColors[0]?.id || 'champagne');
  
  const [embroideryText, setEmbroideryText] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [customSize, setCustomSize] = useState({ length: '', width: '', height: '' });
  const allowCustomSize = product.allowCustomSize ?? true;
  const allowEmbroidery = product.allowEmbroidery ?? product?.category === 'Đồ Ngủ';
  const embroideryMaxLength = product.embroideryMaxLength || 12;

  const activeColorInfo = productColors.find((c) => c.id === selectedColor) || productColors[0];

  const handleColorClick = (colorId) => {
    setSelectedColor(colorId);
    const colorInfo = productColors.find((c) => c.id === colorId);
    if (onColorChange && colorInfo) {
      onColorChange(colorInfo);
    }
  };

  const handleEmbroideryChange = (e) => {
    const val = e.target.value;
    if (val.length <= embroideryMaxLength) {
      setEmbroideryText(val);
    }
  };

  const handleAddToCart = () => {
    try {
      // Add product ID and exact quantity (1 for panel add)
      addToCart(product._id || product.id, 1);
      
      // We can also trigger a custom event or toast here if we want
      navigate('/cart');
    } catch (e) {
      console.error('Error adding item to cart:', e);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng.');
    }
  };

  return (
    <div className="flex flex-col gap-stack-lg lg:sticky lg:top-[120px] h-fit select-none">
      {/* Brand & Title */}
      <div>
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
          {product.category || 'Premium Collection'}
        </span>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-slate-deep mt-stack-sm leading-tight">
          {product.name}
        </h1>

        {/* Ratings & Reviews */}
        <div className="flex items-center gap-stack-sm mt-stack-sm text-slate-deep">
          <div className="flex text-sand-silk">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
          </div>
          <span className="font-body-md text-on-surface-variant">(124 đánh giá)</span>
        </div>

        {/* Price */}
        <p className="font-headline-sm text-headline-sm text-slate-deep mt-stack-md">
          {product.price?.toLocaleString('vi-VN')} VNĐ
        </p>
      </div>

      {/* AR Preview Trigger */}
      {arEnabled && <button
        onClick={onOpenAR}
        className="group flex flex-wrap md:flex-nowrap items-center justify-center gap-2 md:gap-stack-sm border border-slate-deep/10 py-4 px-4 md:px-6 rounded-full hover:bg-slate-deep hover:text-linen-white transition-all duration-300 bg-primary text-white shadow-sm active:scale-98 w-full"
      >
        <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
        <span className="font-button text-[11px] md:text-button uppercase tracking-wide text-center">
          Thử trong phòng của bạn
        </span>
      </button>}

      {/* Configuration Options */}
      <div className="space-y-stack-lg">
        {/* Size Selection */}
        <div className="space-y-stack-sm">
          <div className="flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-slate-deep">CHỌN KÍCH THƯỚC</span>
          </div>
          <div className="flex flex-wrap gap-stack-sm">
            {[...(product.sizes?.length > 0 ? product.sizes : sizes), ...(allowCustomSize ? [{ id: 'custom', label: 'May size riêng' }] : [])].map((size) => {
              const isSelected = selectedSize === size.id;
              return (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id)}
                  className={`px-5 py-2 border font-body-md text-body-md transition-all ${
                    isSelected
                      ? 'border-slate-deep bg-slate-deep text-linen-white font-semibold'
                      : 'border-slate-deep/20 text-slate-deep hover:border-slate-deep'
                  }`}
                >
                  {size.label}
                </button>
              );
            })}
          </div>
          
          {selectedSize === 'custom' && (
            <div className="mt-4 grid grid-cols-3 gap-3 animate-fade-in">
              {product.customSizePrice > 0 && <p className="col-span-3 text-xs text-slate-deep/70">Phụ thu may size riêng: +{product.customSizePrice.toLocaleString('vi-VN')} VNĐ</p>}
              <div>
                <label className="block text-xs text-slate-deep/70 mb-1 font-medium">Chiều dài (cm)</label>
                <input 
                  type="number" 
                  placeholder="VD: 200"
                  className="w-full border border-slate-deep/20 rounded p-2 text-sm focus:outline-none focus:border-slate-deep"
                  value={customSize.length}
                  onChange={(e) => setCustomSize({...customSize, length: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-deep/70 mb-1 font-medium">Chiều rộng (cm)</label>
                <input 
                  type="number" 
                  placeholder="VD: 180"
                  className="w-full border border-slate-deep/20 rounded p-2 text-sm focus:outline-none focus:border-slate-deep"
                  value={customSize.width}
                  onChange={(e) => setCustomSize({...customSize, width: e.target.value})}
                />
              </div>
              {product?.category?.toLowerCase().includes('gối') ? null : (
                <div>
                  <label className="block text-xs text-slate-deep/70 mb-1 font-medium">Độ dày nệm (cm)</label>
                  <input 
                    type="number" 
                    placeholder="VD: 20"
                    className="w-full border border-slate-deep/20 rounded p-2 text-sm focus:outline-none focus:border-slate-deep"
                    value={customSize.height}
                    onChange={(e) => setCustomSize({...customSize, height: e.target.value})}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Color Selection */}
        <div className="space-y-stack-sm">
          <span className="font-label-caps text-label-caps text-slate-deep uppercase">
            MÀU SẮC: <span className="opacity-60 font-body-md normal-case pl-1">{activeColorInfo?.label}</span>
          </span>
          <div className="flex gap-stack-md">
            {productColors.map((color) => {
              const isSelected = selectedColor === color.id;
              return (
                <button
                  key={color.id}
                  onClick={() => handleColorClick(color.id)}
                  className={`w-10 h-10 rounded-full ring-2 ring-offset-2 transition-all ${
                    isSelected
                      ? 'ring-slate-deep scale-105'
                      : 'ring-transparent hover:ring-slate-deep/20'
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    border: color.id === 'white' ? '1px solid rgba(51, 70, 65, 0.1)' : 'none',
                  }}
                  title={color.label}
                />
              );
            })}
          </div>
        </div>

        {/* Personalized Customization */}
        {allowEmbroidery && (
          <div className="bg-bone/50 p-stack-md border-l-2 border-sand-silk space-y-stack-sm rounded-r-md">
            <div className="flex items-center gap-stack-sm text-slate-deep">
              <span className="material-symbols-outlined text-[20px]">edit</span>
              <span className="font-label-caps text-label-caps">TÙY CHỌN IN TÊN CÁ NHÂN</span>
            </div>
            <p className="text-sm text-on-surface-variant opacity-80 leading-snug">
              May tên hoặc chữ ký của bạn lên sản phẩm{product.embroideryPrice > 0 ? ` (+${product.embroideryPrice.toLocaleString('vi-VN')} VNĐ)` : ''}
            </p>
            <div className="relative">
              <input
                className="w-full bg-transparent border-0 border-b border-slate-deep/20 py-2 pr-12 focus:outline-none focus:ring-0 focus:border-slate-deep transition-all font-body-md text-slate-deep"
                placeholder={`Nhập nội dung may (Tối đa ${embroideryMaxLength} ký tự)`}
                type="text"
                value={embroideryText}
                onChange={handleEmbroideryChange}
              />
              <span className="absolute right-0 bottom-2 text-xs text-on-surface-variant/40 font-mono">
                {embroideryText.length}/{embroideryMaxLength}
              </span>
            </div>
          </div>
        )}

        {/* Add to Cart / Favorites Buttons */}
        <div className="flex gap-stack-sm pt-2">
          <button
            onClick={handleAddToCart}
            className="flex-[3] bg-slate-deep text-white py-5 px-stack-lg font-button text-button rounded hover:opacity-90 active:scale-95 transition-all text-center select-none uppercase tracking-wider"
          >
            THÊM VÀO GIỎ HÀNG
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="flex-1 border border-slate-deep rounded flex items-center justify-center hover:bg-slate-deep hover:text-white transition-all active:scale-95 group"
            aria-label="Add to favorites"
          >
            <span
              className={`material-symbols-outlined transition-all text-[24px] ${
                isFavorite ? 'text-red-500' : 'group-hover:scale-110'
              }`}
              style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>
      </div>

      {/* Minimalist Benefits list */}
      <div className="grid grid-cols-2 gap-stack-md border-t border-slate-deep/10 pt-stack-md">
        <div className="flex items-center gap-2 opacity-70">
          <span className="material-symbols-outlined text-lg text-slate-deep">local_shipping</span>
          <span className="text-[10px] font-label-caps text-slate-deep tracking-wider">
            Giao hàng miễn phí
          </span>
        </div>
        <div className="flex items-center gap-2 opacity-70">
          <span className="material-symbols-outlined text-lg text-slate-deep">eco</span>
          <span className="text-[10px] font-label-caps text-slate-deep tracking-wider">
            100% Lụa Tự Nhiên
          </span>
        </div>
      </div>
    </div>
  );
}

ProductInfoPanel.propTypes = {
  onOpenAR: PropTypes.func.isRequired,
  onColorChange: PropTypes.func,
  arEnabled: PropTypes.bool,
};
