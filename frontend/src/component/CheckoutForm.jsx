import { useEffect, useState } from 'react';
import { locationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SearchableLocationSelect from './SearchableLocationSelect';

export default function CheckoutForm({ onSubmitForm, isSubmitting = false }) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [provinceName, setProvinceName] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [wardName, setWardName] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('payos');

  useEffect(() => {
    locationApi.getProvinces()
      .then((items) => setProvinces(Array.isArray(items) ? items : []))
      .catch(() => setLocationError('Không thể tải danh sách tỉnh/thành phố. Vui lòng tải lại trang.'))
      .finally(() => setLoadingProvinces(false));
  }, []);

  useEffect(() => {
    if (!provinceCode) { setWards([]); return; }
    let active = true;
    setLoadingWards(true);
    setLocationError('');
    locationApi.getWards(provinceCode)
      .then((items) => { if (active) setWards(Array.isArray(items) ? items : []); })
      .catch(() => { if (active) setLocationError('Không thể tải danh sách phường/xã. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLoadingWards(false); });
    return () => { active = false; };
  }, [provinceCode]);

  useEffect(() => {
    if (!user) return;
    setFullName((value) => value || user.fullName || '');
    setPhone((value) => value || user.phone || '');
    setEmail((value) => value || user.email || '');
    setAddressDetail((value) => value || user.addressDetail || (!user.provinceCode ? user.address || '' : ''));
    setProvinceCode((value) => value || user.provinceCode || '');
    setProvinceName((value) => value || user.provinceName || '');
    setWardCode((value) => value || user.wardCode || '');
    setWardName((value) => value || user.wardName || '');
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !addressDetail.trim() || !provinceCode || !wardCode) {
      alert('Vui lòng điền đầy đủ các thông tin giao hàng bắt buộc.');
      return;
    }
    const address = `${addressDetail.trim()}, ${wardName}`;
    onSubmitForm({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address,
      city: provinceName,
      addressDetail: addressDetail.trim(),
      provinceCode: Number(provinceCode),
      provinceName,
      wardCode: Number(wardCode),
      wardName,
      note: note.trim(),
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
              Địa chỉ chi tiết <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              className="input-underline font-body-md text-body-md text-slate-deep"
              placeholder="Số nhà, tên đường, tòa nhà…"
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
            />
          </div>

          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 block">
              Tỉnh/Thành phố <span className="text-error">*</span>
            </label>
            <SearchableLocationSelect
              value={provinceCode}
              options={provinces}
              loading={loadingProvinces}
              placeholder="Chọn tỉnh/thành phố"
              searchPlaceholder="Tìm tỉnh/thành phố…"
              onChange={(selected) => {
                setProvinceCode(selected?.code || '');
                setProvinceName(selected?.name || '');
                setWardCode('');
                setWardName('');
              }}
            />
          </div>

          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 block">
              Phường/Xã <span className="text-error">*</span>
            </label>
            <SearchableLocationSelect value={wardCode} options={wards} disabled={!provinceCode} loading={loadingWards} placeholder={provinceCode ? 'Chọn phường/xã' : 'Chọn tỉnh/thành phố trước'} searchPlaceholder="Tìm phường/xã…" onChange={(selected) => { setWardCode(selected?.code || ''); setWardName(selected?.name || ''); }} />
          </div>

          <div className="md:col-span-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 block">Ghi chú (Tùy chọn)</label>
            <input type="text" className="input-underline font-body-md text-body-md text-slate-deep" placeholder="Lời nhắn cho shipper..." value={note} onChange={(e) => setNote(e.target.value)}/>
            {(addressDetail || wardName || provinceName) && <p className="mt-2 text-xs text-on-surface-variant">Địa chỉ giao hàng: {[addressDetail, wardName, provinceName].filter(Boolean).join(', ')}</p>}
            {locationError && <p className="mt-2 text-sm text-red-600">{locationError}</p>}
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
              <span className={`text-xl font-bold tracking-tight transition-opacity ${paymentMethod === 'payos' ? 'text-[#5b2cff] opacity-100' : 'text-slate-deep opacity-40 group-hover:opacity-80'}`}>payOS</span>
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

    </form>
  );
}
