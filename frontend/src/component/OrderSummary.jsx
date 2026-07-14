import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { productsApi, settingsApi } from '../services/api';
import { getProductSizePrice } from '../utils/productPrice';
import { applyLatestSizeCatalog, getSizeMeasurements } from '../utils/productSizes';

const formatSizeMeasurements = (item) => (item.sizeMeasurements || [])
  .filter((measurement) => measurement.label && measurement.value !== undefined && measurement.value !== null && measurement.value !== '')
  .map((measurement) => `${measurement.label}: ${measurement.value}${measurement.unit || ''}`)
  .join(' · ');
const formatCustomMeasurements = (item) => (item.customMeasurements || [])
  .filter((measurement) => measurement.label && measurement.value)
  .map((measurement) => `${measurement.label}: ${measurement.value}${measurement.unit || ''}`)
  .join(' · ');

export default function OrderSummary() {
  const { cart } = useCart();
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    discountAmount: 0,
    discountPercent: 0,
    total: 0
  });

  useEffect(() => {
    let active = true;
    settingsApi.get('product_sizes').catch(() => null).then((sizeSetting) => Promise.all((cart || []).map(async (item) => {
      const product = applyLatestSizeCatalog(await productsApi.getById(item.productId), sizeSetting);
      const selectedSize = item.sizeId && item.sizeId !== 'custom' ? product.sizes?.find((size) => size.id === item.sizeId) : null;
      const customizationPrice =
        (item.embroidery ? Number(product.embroideryPrice || 0) : 0) +
        (item.customSize ? Number(product.customSizePrice || 0) : 0);
      return { ...item, id: item.productId, name: product.name, price: getProductSizePrice(product, item.sizeId) + customizationPrice, sizeMeasurements: selectedSize ? getSizeMeasurements(selectedSize) : item.sizeMeasurements, image: product.images?.[0] || '', spec: product.category || '' };
    }))).then((nextItems) => { if (active) setItems(nextItems); }).catch(() => { if (active) setItems([]); });

    // Read calculated totals from cart page
    const rawTotals = localStorage.getItem('silkmoon_checkout_totals');
    if (rawTotals) {
      setTotals(JSON.parse(rawTotals));
    }
    return () => { active = false; };
  }, [cart]);

  return (
    <aside className="select-none">
      <div className="glass-panel p-stack-lg rounded-xl sticky top-32">
        <h3 className="font-headline-sm text-headline-sm mb-stack-lg text-slate-deep">
          Tóm tắt đơn hàng
        </h3>

        {/* Product Items List */}
        <div className="space-y-stack-md mb-stack-lg border-b border-slate-deep/5 pb-4 max-h-[300px] overflow-y-auto scrollbar-none">
          {items.length === 0 ? (
            <p className="text-sm text-on-surface-variant opacity-60 py-4 text-center">
              Chưa có sản phẩm nào
            </p>
          ) : (
            items.map((item) => (
              <div key={item.cartItemId || item.id} className="flex gap-4">
                <div className="w-20 h-24 bg-bone overflow-hidden rounded flex-shrink-0 border border-slate-deep/5">
                  <img
                    className="w-full h-full object-cover"
                    src={item.image}
                    alt={item.name}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-body-md font-medium text-slate-deep truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-on-surface-variant opacity-50 mt-1 font-mono uppercase truncate">
                    {item.spec}
                  </div>
                  {item.embroidery && (
                    <div className="text-[11px] text-sand-silk font-medium mt-1">
                      Thêu chữ: "{item.embroidery}"
                    </div>
                  )}
                  {item.sizeLabel && (
                    <div className="text-[11px] text-slate-deep/70 font-medium mt-1">
                      Size: {item.sizeLabel}{formatSizeMeasurements(item) ? ` · ${formatSizeMeasurements(item)}` : ''}{formatCustomMeasurements(item) ? ` · ${formatCustomMeasurements(item)}` : (item.customSize ? ` · ${[item.customSize.width, item.customSize.length, item.customSize.height].filter(Boolean).join(' × ')} cm` : '')}
                    </div>
                  )}
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-label-caps text-slate-deep opacity-60">SL: {item.quantity}</span>
                    <span className="font-body-md text-slate-deep">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cost Summary */}
        <div className="pt-2 space-y-stack-sm mb-stack-lg">
          <div className="flex justify-between text-on-surface-variant font-body-md text-sm">
            <span>Tạm tính</span>
            <span>{totals.subtotal.toLocaleString('vi-VN')}đ</span>
          </div>

          {totals.discountPercent > 0 && (
            <div className="flex justify-between text-error font-body-md text-sm">
              <span>Giảm giá ({totals.discountPercent}%)</span>
              <span>-{totals.discountAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          )}

          <div className="flex justify-between text-on-surface-variant font-body-md text-sm">
            <span>Phí vận chuyển</span>
            <span>Miễn phí</span>
          </div>

          <div className="flex justify-between font-headline-sm text-headline-sm pt-stack-sm border-t border-slate-deep/10 mt-stack-sm">
            <span>Tổng cộng</span>
            <span className="type-price text-slate-deep font-bold">
              {totals.total.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* Order CTA (links to form by id) */}
        <button
          type="submit"
          form="checkout-form"
          disabled={items.length === 0}
          className="type-button w-full bg-slate-deep text-linen-white py-4 font-button text-button rounded-full flex items-center justify-center gap-2 group hover:opacity-90 active:scale-[0.98] transition-all uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ĐẶT HÀNG NGAY
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-[20px]">
            arrow_forward
          </span>
        </button>

        {/* Disclaimer terms */}
        <p className="text-[11px] text-center mt-stack-md opacity-40 px-4 text-slate-deep leading-relaxed">
          Bằng việc nhấn đặt hàng, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của SILKMOON.
        </p>
      </div>
    </aside>
  );
}
