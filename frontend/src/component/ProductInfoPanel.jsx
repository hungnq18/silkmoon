import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getLowestPriceSize, getProductSizePrice } from '../utils/productPrice';
import { getSizeMeasurements } from '../utils/productSizes';

const colors = [
  { id: 'champagne', hex: '#E5D5C5', label: 'Champagne Silk' },
  { id: 'white', hex: '#E8E8E5', label: 'White Silk' },
  { id: 'sage', hex: '#567E73', label: 'Sage Silk' },
  { id: 'slate', hex: '#334641', label: 'Slate Silk' },
];

const sizeDisplayName = (size) => (size?.label || '').replace(/\s*\([^)]*\d[^)]*\)\s*$/, '').trim() || size?.label || 'Size';

export default function ProductInfoPanel({ product, onOpenAR, onColorChange, arEnabled = true }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(getLowestPriceSize(product)?.id || '');
  
  // Use product colors or fallback
  const productColors = product.colors?.length > 0 ? product.colors : colors;
  const [selectedColor, setSelectedColor] = useState(productColors[0]?.id || 'champagne');
  
  const [embroideryText, setEmbroideryText] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [customSize, setCustomSize] = useState({ length: '', width: '', height: '' });
  const allowCustomSize = Boolean(product.allowCustomSize);
  const allowEmbroidery = Boolean(product.allowEmbroidery);
  const embroideryMaxLength = product.embroideryMaxLength || 12;
  const productSizeOptions = product.sizes || [];
  const selectedSizeInfo = selectedSize === 'custom' ? null : productSizeOptions.find((size) => size.id === selectedSize);
  const selectedPrice = getProductSizePrice(product, selectedSize);
  const selectedSizeMeasurements = getSizeMeasurements(selectedSizeInfo);
  const referenceSize = (product.sizes || []).find((size) => getSizeMeasurements(size).length > 0);
  const customSizeFields = (referenceSize ? getSizeMeasurements(referenceSize) : [
    { id: 'width', label: 'Rộng', unit: 'cm' },
    { id: 'length', label: 'Dài', unit: 'cm' },
    { id: 'height', label: 'Dày/Cao', unit: 'cm' },
  ]).map((field, index) => ({ id: field.id || `custom-field-${index}`, label: field.label, unit: field.unit || 'cm' }));

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

  const handleCustomSizeChange = (field, value) => {
    if (value === '' || Number(value) >= 0) {
      setCustomSize((current) => ({ ...current, [field]: value }));
    }
  };

  const preventNegativeInput = (e) => {
    if (e.key === '-') e.preventDefault();
  };

  const handleAddToCart = () => {
    try {
      const missingCustomFields = selectedSize === 'custom' ? customSizeFields.filter((field) => !Number(customSize[field.id])) : [];
      if (missingCustomFields.length) {
        alert(`Vui lòng nhập đủ thông số size riêng: ${missingCustomFields.map((field) => field.label).join(', ')}.`);
        return;
      }
      addToCart(product._id || product.id, 1, {
        sizeId: selectedSize,
        sizeLabel: selectedSize === 'custom' ? 'May size riêng' : sizeDisplayName(selectedSizeInfo),
        sizeMeasurements: selectedSize === 'custom' ? [] : getSizeMeasurements(selectedSizeInfo),
        customSize: selectedSize === 'custom' ? Object.fromEntries(customSizeFields.map((field) => [field.id, Number(customSize[field.id]) || 0])) : null,
        customMeasurements: selectedSize === 'custom' ? customSizeFields.map((field) => ({ ...field, value: Number(customSize[field.id]) || 0 })) : [],
        embroidery: embroideryText.trim() || null,
      });
      
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
        <span className="type-eyebrow font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
          {product.category || 'Premium Collection'}
        </span>
        <h1 className="product-detail-title font-display-lg text-display-lg-mobile md:text-display-lg text-slate-deep mt-stack-sm leading-tight">
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
          <span className="type-meta font-body-md text-on-surface-variant">(124 đánh giá)</span>
        </div>

        {/* Price */}
        <p className="product-detail-price font-headline-sm text-headline-sm text-slate-deep mt-stack-md">
          {selectedPrice.toLocaleString('vi-VN')} VNĐ
        </p>
      </div>

      {/* AR Preview Trigger */}
      {arEnabled && <button
        onClick={onOpenAR}
        className="group flex flex-wrap md:flex-nowrap items-center justify-center gap-2 md:gap-stack-sm border border-slate-deep/10 py-4 px-4 md:px-6 rounded-full hover:bg-slate-deep hover:text-linen-white transition-all duration-300 bg-primary text-white shadow-sm active:scale-98 w-full"
      >
        <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
        <span className="type-button font-button text-[11px] md:text-button uppercase tracking-wide text-center">
          Thử trong phòng của bạn
        </span>
      </button>}

      {/* Configuration Options */}
      <div className="space-y-stack-lg">
        {/* Size Selection */}
        <div className="space-y-stack-sm">
          <div className="flex justify-between items-center">
            <span className="product-detail-option-label font-label-caps text-label-caps text-slate-deep">CHỌN KÍCH THƯỚC</span>
          </div>
          <div className="flex flex-wrap gap-stack-sm">
            {[...productSizeOptions, ...(allowCustomSize ? [{ id: 'custom', label: 'May size riêng' }] : [])].map((size) => {
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
                  <span className="type-option-value block">{size.id === 'custom' ? size.label : sizeDisplayName(size)}</span>
                  {size.id !== 'custom' && <small className={`mt-0.5 block text-[10px] ${isSelected ? 'text-linen-white/75' : 'text-slate-deep/55'}`}>{getProductSizePrice(product, size.id).toLocaleString('vi-VN')} VNĐ</small>}
                </button>
              );
            })}
          </div>

          {selectedSize !== 'custom' && selectedSizeInfo && selectedSizeMeasurements.length > 0 && (
            <div className="mt-4 rounded-lg border border-slate-deep/10 bg-bone/35 p-4 animate-fade-in">
              <div className="mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-[19px] text-slate-deep/70">straighten</span><div><strong className="block text-sm text-slate-deep">Thông số size {sizeDisplayName(selectedSizeInfo)}</strong><span className="text-[11px] text-slate-deep/55">Thông số chi tiết của kích thước đang chọn</span></div></div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {selectedSizeMeasurements.map((measurement, index) => <div className="rounded-md border border-slate-deep/10 bg-white px-3 py-2.5" key={measurement.id || `${measurement.label}-${index}`}><span className="block text-[9px] font-semibold uppercase tracking-wide text-slate-deep/50">{measurement.label}</span><strong className="mt-1 block text-sm font-medium text-slate-deep">{measurement.value} <small className="font-normal text-slate-deep/55">{measurement.unit || ''}</small></strong></div>)}
              </div>
            </div>
          )}
          
          {selectedSize === 'custom' && (
            <div className="mt-4 rounded-lg border border-slate-deep/10 bg-bone/35 p-4 animate-fade-in">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><strong className="text-sm text-slate-deep">Thông số may size riêng</strong><p className="mt-0.5 text-[11px] text-slate-deep/60">Nhập đầy đủ số đo theo yêu cầu của sản phẩm.</p></div>{product.customSizePrice > 0 && <span className="rounded-full bg-sand-silk/15 px-3 py-1 text-[11px] font-medium text-slate-deep">+{product.customSizePrice.toLocaleString('vi-VN')} VNĐ</span>}</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {customSizeFields.map((field) => <label className="block" key={field.id}><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-deep/70">{field.label} ({field.unit})</span><div className="relative"><input type="number" min="0" placeholder={`Nhập ${field.label.toLowerCase()}`} className="w-full rounded-md border border-slate-deep/20 bg-white px-3 py-3 pr-12 text-sm text-slate-deep focus:border-slate-deep focus:outline-none" value={customSize[field.id] ?? ''} onKeyDown={preventNegativeInput} onChange={(event) => handleCustomSizeChange(field.id, event.target.value)} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-deep/45">{field.unit}</span></div></label>)}
              </div>
            </div>
          )}
        </div>

        {/* Color Selection */}
        <div className="space-y-stack-sm">
          <span className="product-detail-option-label font-label-caps text-label-caps text-slate-deep uppercase">
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
