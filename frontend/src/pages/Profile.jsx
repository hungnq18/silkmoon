import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { locationApi, usersApi } from '../services/api';
import SearchableLocationSelect from '../component/SearchableLocationSelect';

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Không thể đọc ảnh đã chọn.'));
  reader.onload = () => resolve(reader.result);
  reader.readAsDataURL(file);
});

export default function Profile() {
  const { user, loading, refreshProfile, logout } = useAuth();
  const [profile, setProfile] = useState({ fullName: '', phone: '', addressDetail: '', provinceCode: '', provinceName: '', wardCode: '', wardName: '' });
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingWards, setLoadingWards] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) setProfile({
      fullName: user.fullName || '',
      phone: user.phone || '',
      addressDetail: user.addressDetail || (!user.provinceCode ? user.address || '' : ''),
      provinceCode: user.provinceCode || '',
      provinceName: user.provinceName || '',
      wardCode: user.wardCode || '',
      wardName: user.wardName || '',
    });
  }, [user]);

  useEffect(() => {
    locationApi.getProvinces()
      .then((items) => setProvinces(Array.isArray(items) ? items : []))
      .catch(() => setProfileError('Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại.'))
      .finally(() => setLoadingLocations(false));
  }, []);

  useEffect(() => {
    if (!profile.provinceCode) { setWards([]); return; }
    let active = true;
    setLoadingWards(true);
    locationApi.getWards(profile.provinceCode)
      .then((items) => { if (active) setWards(Array.isArray(items) ? items : []); })
      .catch(() => { if (active) setProfileError('Không thể tải danh sách phường/xã. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLoadingWards(false); });
    return () => { active = false; };
  }, [profile.provinceCode]);

  if (loading) return <main className="min-h-screen bg-bone px-5 pt-36 text-center text-slate-deep">Đang tải hồ sơ…</main>;
  if (!user) return <Navigate to="/account?redirect=/profile" replace />;

  const initials = (user.fullName || user.email || 'SM').split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase();

  const saveProfile = async (event) => {
    event.preventDefault(); setProfileError(''); setProfileMessage('');
    const phone = profile.phone.trim().replace(/[\s.-]/g, '');
    if (profile.fullName.trim().length < 2) return setProfileError('Vui lòng nhập họ và tên hợp lệ.');
    if (phone && !/^(0|\+84)\d{9,10}$/.test(phone)) return setProfileError('Số điện thoại không đúng định dạng.');
    const hasAddress = profile.addressDetail.trim() || profile.provinceCode || profile.wardCode;
    if (hasAddress && (!profile.provinceCode || !profile.wardCode)) return setProfileError('Vui lòng chọn đầy đủ tỉnh/thành phố và phường/xã.');
    const address = [profile.addressDetail.trim(), profile.wardName, profile.provinceName].filter(Boolean).join(', ');
    setSaving(true);
    try {
      await usersApi.updateProfile({
        fullName: profile.fullName.trim(),
        phone,
        address,
        addressDetail: profile.addressDetail.trim(),
        provinceCode: profile.provinceCode ? Number(profile.provinceCode) : undefined,
        provinceName: profile.provinceName,
        wardCode: profile.wardCode ? Number(profile.wardCode) : undefined,
        wardName: profile.wardName,
      });
      await refreshProfile();
      setProfileMessage('Thông tin cá nhân đã được cập nhật.');
    } catch (error) { setProfileError(error.message || 'Không thể cập nhật hồ sơ.'); }
    finally { setSaving(false); }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    setProfileError(''); setProfileMessage('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setProfileError('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.');
    if (file.size > 2 * 1024 * 1024) return setProfileError('Ảnh đại diện không được vượt quá 2 MB.');
    setUploading(true);
    try {
      await usersApi.uploadAvatar(await fileToDataUrl(file));
      await refreshProfile();
      setProfileMessage('Ảnh đại diện đã được cập nhật.');
    } catch (error) { setProfileError(error.message || 'Không thể tải ảnh đại diện.'); }
    finally { setUploading(false); }
  };

  const changePassword = async (event) => {
    event.preventDefault(); setPasswordError(''); setPasswordMessage('');
    if (passwords.newPassword.length < 6) return setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
    if (passwords.newPassword !== passwords.confirmPassword) return setPasswordError('Mật khẩu xác nhận chưa khớp.');
    setChangingPassword(true);
    try {
      const result = await usersApi.changePassword(passwords.currentPassword, passwords.newPassword);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage(result.message);
    } catch (error) { setPasswordError(error.message || 'Không thể đổi mật khẩu.'); }
    finally { setChangingPassword(false); }
  };

  return <main className="min-h-screen bg-bone px-4 pb-20 pt-32 md:px-8">
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><span className="text-xs font-bold tracking-[.18em] text-secondary">TÀI KHOẢN SILKMOON</span><h1 className="mt-3 text-4xl font-light text-slate-deep">Hồ sơ của tôi</h1><p className="mt-2 text-sm text-on-surface-variant">Quản lý thông tin cá nhân và bảo mật tài khoản.</p></div><div className="flex gap-3"><Link to="/shop" className="rounded-full border border-slate-deep/20 bg-white px-5 py-2.5 text-sm font-medium">Tiếp tục mua sắm</Link><button onClick={logout} className="rounded-full bg-slate-deep px-5 py-2.5 text-sm font-medium text-white">Đăng xuất</button></div></div>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_.85fr]">
        <section className="rounded-2xl border border-slate-deep/10 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 border-b border-slate-deep/10 pb-7 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-slate-deep text-white shadow-lg">{user.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover"/> : <div className="flex h-full w-full items-center justify-center text-3xl font-semibold tracking-wider">{initials}</div>}</div>
            <div><h2 className="text-2xl font-medium text-slate-deep">{user.fullName}</h2><p className="mt-1 text-sm text-on-surface-variant">{user.email}</p><label className={`mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#e8f1ff] px-5 py-2.5 text-sm font-semibold text-slate-deep ${uploading ? 'pointer-events-none opacity-60' : ''}`}><span className="material-symbols-outlined text-lg">photo_camera</span>{uploading ? 'Đang tải ảnh…' : 'Thay ảnh đại diện'}<input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={uploading} onChange={uploadAvatar}/></label><p className="mt-2 text-xs text-on-surface-variant">JPG, PNG hoặc WebP · tối đa 2 MB</p></div>
          </div>
          <form onSubmit={saveProfile} className="mt-7 grid gap-5 md:grid-cols-2"><ProfileField label="Họ và tên"><input className="input-underline" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} required/></ProfileField><ProfileField label="Email"><input className="input-underline" value={user.email} disabled/></ProfileField><ProfileField label="Số điện thoại"><input className="input-underline" inputMode="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}/></ProfileField><ProfileField label="Tỉnh / Thành phố"><SearchableLocationSelect value={profile.provinceCode} options={provinces} loading={loadingLocations} placeholder="Chọn tỉnh/thành phố" searchPlaceholder="Tìm tỉnh/thành phố…" onChange={(selected) => setProfile({ ...profile, provinceCode: selected?.code || '', provinceName: selected?.name || '', wardCode: '', wardName: '' })}/></ProfileField><ProfileField label="Phường / Xã"><SearchableLocationSelect value={profile.wardCode} options={wards} disabled={!profile.provinceCode} loading={loadingWards} placeholder={profile.provinceCode ? 'Chọn phường/xã' : 'Chọn tỉnh/thành phố trước'} searchPlaceholder="Tìm phường/xã…" onChange={(selected) => setProfile({ ...profile, wardCode: selected?.code || '', wardName: selected?.name || '' })}/></ProfileField><div className="md:col-span-2"><ProfileField label="Địa chỉ chi tiết"><input className="input-underline" maxLength="200" placeholder="Số nhà, tên đường, tòa nhà…" value={profile.addressDetail} onChange={(e) => setProfile({ ...profile, addressDetail: e.target.value })}/></ProfileField>{(profile.addressDetail || profile.wardName || profile.provinceName) && <p className="mt-2 text-xs leading-5 text-on-surface-variant">Địa chỉ đầy đủ: {[profile.addressDetail, profile.wardName, profile.provinceName].filter(Boolean).join(', ')}</p>}</div>{profileError && <p className="md:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{profileError}</p>}{profileMessage && <p className="md:col-span-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">{profileMessage}</p>}<div className="md:col-span-2"><button disabled={saving || loadingLocations || loadingWards} className="rounded-md bg-slate-deep px-7 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div></form>
        </section>
        <section className="h-fit rounded-2xl border border-slate-deep/10 bg-white p-6 shadow-sm md:p-8"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f1ff] text-slate-deep"><span className="material-symbols-outlined">lock_reset</span></div><h2 className="mt-5 text-2xl font-medium text-slate-deep">Đổi mật khẩu</h2><p className="mt-2 text-sm leading-6 text-on-surface-variant">Sử dụng mật khẩu riêng và không chia sẻ với người khác.</p><form onSubmit={changePassword} className="mt-6 space-y-5"><ProfileField label="Mật khẩu hiện tại"><input className="input-underline" type="password" autoComplete="current-password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required/></ProfileField><ProfileField label="Mật khẩu mới"><input className="input-underline" type="password" minLength="6" autoComplete="new-password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required/></ProfileField><ProfileField label="Xác nhận mật khẩu mới"><input className="input-underline" type="password" minLength="6" autoComplete="new-password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required/></ProfileField>{passwordError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{passwordError}</p>}{passwordMessage && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{passwordMessage}</p>}<button disabled={changingPassword} className="w-full rounded-md border border-slate-deep bg-white py-3.5 text-sm font-semibold text-slate-deep transition-colors hover:bg-slate-deep hover:text-white disabled:opacity-60">{changingPassword ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}</button></form></section>
      </div>
    </div>
  </main>;
}

function ProfileField({ label, children }) {
  return <label className="block text-xs font-semibold uppercase tracking-wider text-slate-deep"><span className="mb-2 block">{label}</span>{children}</label>;
}
