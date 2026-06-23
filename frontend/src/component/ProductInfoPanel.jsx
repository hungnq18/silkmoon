import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

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

export default function ProductInfoPanel({ onOpenAR, onColorChange }) {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('queen');
  const [selectedColor, setSelectedColor] = useState('champagne');
  const [embroideryText, setEmbroideryText] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const activeColorInfo = colors.find((c) => c.id === selectedColor);

  const handleColorClick = (colorId) => {
    setSelectedColor(colorId);
    const colorInfo = colors.find((c) => c.id === colorId);
    if (onColorChange) {
      onColorChange(colorInfo.label);
    }
  };

  const handleEmbroideryChange = (e) => {
    const val = e.target.value;
    if (val.length <= 12) {
      setEmbroideryText(val);
    }
  };

  const handleAddToCart = () => {
    const sizeObj = sizes.find((s) => s.id === selectedSize);
    const colorObj = colors.find((c) => c.id === selectedColor);
    
    const basePrice = 4500000;
    const embroideryPrice = embroideryText ? 250000 : 0;
    const finalPrice = basePrice + embroideryPrice;
    
    const specLabel = `${colorObj.label.toUpperCase()} / ${sizeObj.label.split(' ')[0].toUpperCase()}`;

    const newCartItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: 'mulberry-silk-bedding',
      name: 'Bộ Ga Giường Lụa Mulberry 22 Momme',
      spec: specLabel,
      price: finalPrice,
      quantity: 1,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXSKeAS-krZL7BdTKe-zbjRmYe8lurfn2LsLMoA-uUbKoeZ72OCkjHCp7H8eIothkquNH0ZQ-ZI0gGpUh3e2JjlzZ7mxnjRJOia8aryibPNfIhNAFEnTmmhAtFAQlAWfsFAyx9Tb9Ghii-WpGyQoagjhRIWNHYs-xjdcLiRyvtWuaIVYrNMoq2dhawpnWhQD2EhcHr85aErSjlphn-JGjZABRu-FLi1LseTpov7wsxmg5tutc42PaGgkLZ9LqEWbLa8y6GOncWlzI',
      embroidery: embroideryText || null,
    };

    try {
      const existingCart = JSON.parse(localStorage.getItem('silkmoon_cart') || '[]');
      
      const existingItemIndex = existingCart.findIndex(
        (item) => item.productId === newCartItem.productId && item.spec === newCartItem.spec && item.embroidery === newCartItem.embroidery
      );
      
      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += 1;
      } else {
        existingCart.push(newCartItem);
      }
      
      localStorage.setItem('silkmoon_cart', JSON.stringify(existingCart));
      window.dispatchEvent(new Event('cart-updated'));
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
          Premium Collection
        </span>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-slate-deep mt-stack-sm leading-tight">
          Bộ Ga Giường Lụa Mulberry 22 Momme
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
          4.500.000 VNĐ
        </p>
      </div>

      {/* AR Preview Trigger */}
      <button
        onClick={onOpenAR}
        className="group flex items-center justify-center gap-stack-sm border border-slate-deep/10 py-4 px-6 rounded-full hover:bg-slate-deep hover:text-linen-white transition-all duration-300 bg-primary text-white shadow-sm active:scale-98"
      >
        <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
        <span className="font-button text-button uppercase tracking-wide">
          Thử trong phòng của bạn (AR PREVIEW)
        </span>
      </button>

      {/* Configuration Options */}
      <div className="space-y-stack-lg">
        {/* Size Selection */}
        <div className="space-y-stack-sm">
          <div className="flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-slate-deep">CHỌN KÍCH THƯỚC</span>
            <button className="text-label-caps text-[11px] underline opacity-60 hover:opacity-100 transition-opacity">
              Bảng size
            </button>
          </div>
          <div className="flex flex-wrap gap-stack-sm">
            {sizes.map((size) => {
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
        </div>

        {/* Color Selection */}
        <div className="space-y-stack-sm">
          <span className="font-label-caps text-label-caps text-slate-deep uppercase">
            MÀU SẮC: <span className="opacity-60 font-body-md normal-case pl-1">{activeColorInfo.label}</span>
          </span>
          <div className="flex gap-stack-md">
            {colors.map((color) => {
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
        <div className="bg-bone/50 p-stack-md border-l-2 border-sand-silk space-y-stack-sm rounded-r-md">
          <div className="flex items-center gap-stack-sm text-slate-deep">
            <span className="material-symbols-outlined text-[20px]">edit</span>
            <span className="font-label-caps text-label-caps">TÙY CHỌN IN TÊN CÁ NHÂN</span>
          </div>
          <p className="text-sm text-on-surface-variant opacity-80 leading-snug">
            Thêu tên hoặc chữ ký của bạn lên gối (+250k VNĐ)
          </p>
          <div className="relative">
            <input
              className="w-full bg-transparent border-0 border-b border-slate-deep/20 py-2 pr-12 focus:outline-none focus:ring-0 focus:border-slate-deep transition-all font-body-md text-slate-deep"
              placeholder="Nhập nội dung thêu (Tối đa 12 ký tự)"
              type="text"
              value={embroideryText}
              onChange={handleEmbroideryChange}
            />
            <span className="absolute right-0 bottom-2 text-xs text-on-surface-variant/40 font-mono">
              {embroideryText.length}/12
            </span>
          </div>
        </div>

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
};
