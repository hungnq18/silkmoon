import { useState } from 'react';

export default function CheckoutForm({ onSubmitForm, isSubmitting = false }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Hà Nội');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('payos');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert('Vui lòng điền đầy đủ các thông tin giao hàng bắt buộc.');
      return;
    }
    onSubmitForm({
      fullName,
      phone,
      email,
      address,
      city,
      note,
      paymentMethod,
    });
  };

  return (
    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-stack-lg select-none">
      {/* Delivery Info Section */}
      <div>
        <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-stack-lg text-slate-deep">
          Thông tin giao hàng
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
          <div className="md:col-span-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 block">
              Họ và tên <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              className="input-underline font-body-md text-body-md text-slate-deep"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 block">
              Số điện thoại <span className="text-error">*</span>
            </label>
            <input
              type="tel"
              required
              className="input-underline font-body-md text-body-md text-slate-deep"
              placeholder="090 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 block">
              Email (Tùy chọn)
            </label>
            <input
              type="email"
              className="input-underline font-body-md text-body-md text-slate-deep"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 block">
              Địa chỉ nhận hàng <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              className="input-underline font-body-md text-body-md text-slate-deep"
              placeholder="Số nhà, Tên đường, Phường/Xã..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 block">
              Tỉnh/Thành phố <span className="text-error">*</span>
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input-underline font-body-md text-body-md bg-transparent appearance-none text-slate-deep cursor-pointer"
            >
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
            </select>
          </div>

          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 block">
              Ghi chú (Tùy chọn)
            </label>
            <input
              type="text"
              className="input-underline font-body-md text-body-md text-slate-deep"
              placeholder="Lời nhắn cho shipper..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Payment Options Section */}
      <div className="pt-4">
        <h2 className="font-headline-md text-headline-md mb-stack-md text-slate-deep">
          Phương thức thanh toán
        </h2>
        
        <div className="space-y-stack-md">
          {/* PayOS Option */}
          <label
            onClick={() => setPaymentMethod('payos')}
            className={`flex items-center justify-between p-stack-md border bg-linen-white cursor-pointer group transition-all rounded-lg select-none ${
              paymentMethod === 'payos'
                ? 'border-slate-deep border-2 shadow-sm'
                : 'border-outline-variant hover:border-slate-deep/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'payos'}
                onChange={() => setPaymentMethod('payos')}
                className="w-4 h-4 text-slate-deep focus:ring-slate-deep focus:ring-offset-0 border-outline-variant"
              />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-container flex items-center justify-center rounded-lg text-linen-white flex-shrink-0">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                </div>
                <div>
                  <div className="font-body-md font-bold text-slate-deep leading-snug">Thanh toán qua PayOS</div>
                  <div className="text-[12px] text-on-surface-variant opacity-80 leading-normal">Chuyển khoản QR siêu nhanh, bảo mật cao</div>
                </div>
              </div>
            </div>
            
            {/* PayOS Logo */}
            <div className="hidden sm:block">
              <img
                alt="PayOS"
                className={`h-8 transition-all ${
                  paymentMethod === 'payos' ? 'grayscale-0 opacity-100' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'
                }`}
                src="https://images.unsplash.com/photo-1522771731478-44fb896da52d?auto=format&fit=crop&q=80&w=800"
              />
            </div>
          </label>

          {/* COD Option */}
          <label
            onClick={() => setPaymentMethod('cod')}
            className={`flex items-center justify-between p-stack-md border bg-linen-white cursor-pointer group transition-all rounded-lg select-none ${
              paymentMethod === 'cod'
                ? 'border-slate-deep border-2 shadow-sm'
                : 'border-outline-variant hover:border-slate-deep/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="w-4 h-4 text-slate-deep focus:ring-slate-deep focus:ring-offset-0 border-outline-variant"
              />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-bone flex items-center justify-center rounded-lg text-slate-deep flex-shrink-0">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <div>
                  <div className="font-body-md font-bold text-slate-deep leading-snug">Thanh toán khi nhận hàng (COD)</div>
                  <div className="text-[12px] text-on-surface-variant opacity-80 leading-normal">Thanh toán trực tiếp khi nhận sản phẩm</div>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          form="checkout-form"
          disabled={isSubmitting}
          className="w-full bg-slate-deep text-linen-white py-4 font-button text-button rounded-full flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Đang xử lý...
            </>
          ) : (
            <>
              XÁC NHẬN ĐẶT HÀNG
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

