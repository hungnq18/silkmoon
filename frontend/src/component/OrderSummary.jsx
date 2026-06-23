import { useState, useEffect } from 'react';

export default function OrderSummary() {
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    discountAmount: 0,
    discountPercent: 0,
    total: 0
  });

  useEffect(() => {
    // Read cart items
    const rawCart = localStorage.getItem('silkmoon_cart');
    const cartItems = rawCart ? JSON.parse(rawCart) : [];
    setItems(cartItems);

    // Read calculated totals from cart page
    const rawTotals = localStorage.getItem('silkmoon_checkout_totals');
    if (rawTotals) {
      setTotals(JSON.parse(rawTotals));
    } else {
      const sub = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const savedDiscount = localStorage.getItem('silkmoon_discount');
      const discountPct = savedDiscount ? Number(savedDiscount) : 0;
      const discAmt = Math.round(sub * (discountPct / 100));
      const tot = sub - discAmt;
      setTotals({
        subtotal: sub,
        discountAmount: discAmt,
        discountPercent: discountPct,
        total: tot
      });
    }
  }, []);

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
              <div key={item.id} className="flex gap-4">
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
            <span className="text-slate-deep font-bold">
              {totals.total.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* Order CTA (links to form by id) */}
        <button
          type="submit"
          form="checkout-form"
          disabled={items.length === 0}
          className="w-full bg-slate-deep text-linen-white py-4 font-button text-button rounded-full flex items-center justify-center gap-2 group hover:opacity-90 active:scale-[0.98] transition-all uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
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
