import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { promotionsApi, productsApi } from '../services/api';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, loading: cartLoading } = useCart();
  const [cartDetails, setCartDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Fetch product details whenever cart changes
  useEffect(() => {
    const fetchDetails = async () => {
      if (!cart || cart.length === 0) {
        setCartDetails([]);
        return;
      }
      setLoadingDetails(true);
      try {
        const detailsPromises = cart.map(async (item) => {
          // If the backend has getById, fetch it
          const product = await productsApi.getById(item.productId);
          return {
            ...item,
            id: item.productId, // use productId as id for UI
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
            spec: product.category || 'N/A'
          };
        });
        const details = await Promise.all(detailsPromises);
        setCartDetails(details);
      } catch (err) {
        console.error('Failed to fetch cart details', err);
      } finally {
        setLoadingDetails(false);
      }
    };
    
    if (!cartLoading) {
      fetchDetails();
    }
  }, [cart, cartLoading]);

  // Load discount if already applied
  useEffect(() => {
    const savedDiscount = localStorage.getItem('silkmoon_discount');
    if (savedDiscount) {
      setDiscountPercent(Number(savedDiscount));
      setPromoSuccess(`Đã áp dụng mã giảm giá ${savedDiscount}%`);
    }
  }, []);

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    if (!promoCode.trim()) {
      setPromoError('Vui lòng nhập mã giảm giá.');
      return;
    }

    try {
      const result = await promotionsApi.validate(promoCode.trim());
      setDiscountPercent(result.discountPercent);
      setPromoSuccess(`Áp dụng mã ${result.code} thành công! Giảm ${result.discountPercent}%.`);
      localStorage.setItem('silkmoon_discount', String(result.discountPercent));
      localStorage.setItem('silkmoon_promo_code', result.code);
    } catch (err) {
      setPromoError(err.message || 'Mã giảm giá không hợp lệ.');
    }
  };

  const handleRemovePromo = () => {
    setDiscountPercent(0);
    setPromoCode('');
    setPromoSuccess('');
    localStorage.removeItem('silkmoon_discount');
  };

  const subtotal = cartDetails.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const shippingFee = 0; // free shipping
  const total = subtotal - discountAmount + shippingFee;

  const handleProceedToCheckout = () => {
    // Save current totals to localStorage for checkout display consistency
    localStorage.setItem('silkmoon_checkout_totals', JSON.stringify({
      subtotal,
      discountAmount,
      discountPercent,
      total
    }));
    navigate('/checkout');
  };

  return (
    <main className="pt-24 md:pt-32 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto select-none">
      {/* Title */}
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-slate-deep mb-stack-lg leading-tight">
        Giỏ hàng
      </h1>

      {cartLoading || loadingDetails ? (
        <div className="text-center py-16 animate-pulse">Đang tải giỏ hàng...</div>
      ) : cartDetails.length === 0 ? (
        /* Empty State */
        <section className="text-center py-16 bg-bone/35 rounded-2xl border border-slate-deep/5 space-y-stack-md max-w-2xl mx-auto">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant/40 animate-pulse">
            shopping_bag
          </span>
          <h3 className="font-headline-sm text-headline-sm text-slate-deep">
            Giỏ hàng của bạn đang trống
          </h3>
          <p className="font-body-md text-on-surface-variant/80 max-w-md mx-auto">
            Hãy khám phá các sản phẩm chăn ga gối lụa cao cấp từ SILKMOON và chọn cho mình sản phẩm phù hợp.
          </p>
          <div className="pt-4">
            <Link
              to="/shop"
              className="inline-block bg-slate-deep text-linen-white px-8 py-4 font-button text-button rounded-full hover:opacity-90 active:scale-95 transition-all uppercase tracking-wide"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </section>
      ) : (
        /* Cart Grid Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Items list */}
          <section className="lg:col-span-8 space-y-stack-md">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="border-b border-slate-deep/10 text-label-caps text-on-surface-variant text-[11px] uppercase tracking-wider">
                    <th className="pb-3 font-semibold text-left">Sản phẩm</th>
                    <th className="pb-3 font-semibold text-center w-24">Số lượng</th>
                    <th className="pb-3 font-semibold text-right w-36">Giá</th>
                    <th className="pb-3 font-semibold text-right w-44">Tổng cộng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-deep/5">
                  {cartDetails.map((item) => (
                    <tr key={item.id} className="align-middle">
                      {/* Product details */}
                      <td className="py-6 pr-4">
                        <div className="flex gap-4">
                          <div className="w-20 h-24 bg-bone overflow-hidden rounded flex-shrink-0 border border-slate-deep/5">
                            <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                          </div>
                          <div className="flex-grow min-w-0 flex flex-col justify-between py-1">
                            <div>
                              <h4 className="font-body-md font-medium text-slate-deep truncate">{item.name}</h4>
                              <p className="text-xs text-on-surface-variant opacity-75 mt-1 font-mono uppercase tracking-wide">{item.spec}</p>
                              {item.embroidery && (
                                <div className="inline-flex items-center gap-1 bg-sand-silk/15 border border-sand-silk/30 px-2 py-0.5 rounded text-[11px] text-slate-deep font-medium mt-2">
                                  <span className="material-symbols-outlined text-[13px]">edit</span>
                                  Thêu chữ: "{item.embroidery}"
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Quantity Controls */}
                      <td className="py-6 text-center">
                        <div className="inline-flex items-center border border-slate-deep/15 rounded-full overflow-hidden bg-linen-white">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-slate-deep hover:bg-slate-deep/5 transition-colors font-semibold">-</button>
                          <span className="w-8 text-center font-body-md font-medium text-slate-deep">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-slate-deep hover:bg-slate-deep/5 transition-colors font-semibold">+</button>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-6 text-right font-body-md text-slate-deep">
                        {item.price.toLocaleString('vi-VN')}đ
                      </td>

                      {/* Total and Actions */}
                      <td className="py-6 text-right font-body-md text-slate-deep">
                        <div className="flex items-center justify-end gap-4">
                          <span className="font-semibold">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                          <button onClick={() => removeFromCart(item.productId)} className="flex items-center justify-center p-1.5 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-full transition-all" title="Xóa sản phẩm">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-slate-deep/5">
              {cartDetails.map((item) => (
                <div key={item.id} className="py-stack-md flex flex-col gap-4">
                  {/* Product Details (Image + Spec) */}
                  <div className="flex gap-4 w-full">
                    <div className="w-20 h-24 bg-bone overflow-hidden rounded flex-shrink-0 border border-slate-deep/5">
                      <img
                        className="w-full h-full object-cover"
                        src={item.image}
                        alt={item.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-body-md font-medium text-slate-deep truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-on-surface-variant opacity-75 mt-1 font-mono uppercase tracking-wide">
                          {item.spec}
                        </p>
                        {item.embroidery && (
                          <div className="inline-flex items-center gap-1 bg-sand-silk/15 border border-sand-silk/30 px-2 py-0.5 rounded text-[11px] text-slate-deep font-medium mt-2">
                            <span className="material-symbols-outlined text-[13px]">edit</span>
                            Thêu chữ: "{item.embroidery}"
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="flex items-center gap-1 text-xs text-error/80 hover:text-error transition-colors mt-2"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Xóa sản phẩm
                      </button>
                    </div>
                  </div>

                  {/* Quantity and Subtotal controls on Mobile */}
                  <div className="flex justify-between items-center w-full pt-2 border-t border-dashed border-slate-deep/5">
                    <div className="flex items-center border border-slate-deep/15 rounded-full overflow-hidden bg-linen-white">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-deep hover:bg-slate-deep/5 transition-colors font-semibold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-body-md font-medium text-slate-deep">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-deep hover:bg-slate-deep/5 transition-colors font-semibold"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-on-surface-variant block opacity-60">Tạm tính</span>
                      <span className="font-body-md text-slate-deep font-semibold">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right Column: Order Summary */}
          <aside className="lg:col-span-4">
            <div className="glass-panel p-stack-lg rounded-xl space-y-stack-md sticky top-32">
              <h3 className="font-headline-sm text-headline-sm text-slate-deep border-b border-slate-deep/5 pb-3">
                Thông tin đơn hàng
              </h3>

              {/* Cost Rows */}
              <div className="space-y-stack-sm text-sm">
                <div className="flex justify-between text-on-surface-variant font-body-md">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                
                {discountPercent > 0 && (
                  <div className="flex justify-between text-error font-body-md items-center">
                    <div className="flex items-center gap-1">
                      <span>Giảm giá ({discountPercent}%)</span>
                      <button
                        onClick={handleRemovePromo}
                        className="text-[10px] underline hover:opacity-75"
                        title="Hủy giảm giá"
                      >
                        (Xóa)
                      </button>
                    </div>
                    <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}

                <div className="flex justify-between text-on-surface-variant font-body-md">
                  <span>Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>

                <div className="flex justify-between font-headline-sm text-headline-sm pt-stack-sm border-t border-slate-deep/10 mt-stack-sm">
                  <span>Tổng cộng</span>
                  <span className="text-slate-deep font-bold">
                    {total.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="pt-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-1.5 block">
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-underline font-body-md text-body-md text-slate-deep flex-1 py-1"
                    placeholder="Nhập SILKMOON10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={discountPercent > 0}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 border border-slate-deep text-slate-deep font-button text-xs rounded-full hover:bg-slate-deep hover:text-linen-white transition-all uppercase tracking-wider"
                    disabled={discountPercent > 0}
                  >
                    Áp dụng
                  </button>
                </div>
                {promoError && (
                  <p className="text-xs text-error mt-2 font-medium">{promoError}</p>
                )}
                {promoSuccess && (
                  <p className="text-xs text-sage-haze mt-2 font-medium">{promoSuccess}</p>
                )}
              </form>

              {/* Proceed CTA */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-slate-deep text-linen-white py-4 font-button text-button rounded-full flex items-center justify-center gap-2 group hover:opacity-90 active:scale-[0.98] transition-all uppercase tracking-wide pt-2"
              >
                TIẾN HÀNH THANH TOÁN
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-[20px]">
                  arrow_forward
                </span>
              </button>

              <div className="text-[11px] text-center opacity-40 px-4 text-slate-deep leading-relaxed pt-1">
                Giao hàng miễn phí toàn quốc. Đổi trả hàng trong 7 ngày nếu không vừa ý.
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
