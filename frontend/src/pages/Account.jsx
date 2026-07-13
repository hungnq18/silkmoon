import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import logo from '../assets/xanh_ngang.png';
import visual from '../assets/carousel-slide3.png';

export default function Account() {
  const { user, login, register, verifyRegistration, logout } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const resetToken = params.get('resetToken') || '';
  const requestedRedirect = params.get('redirect') || '/';
  const redirectAfterAuth = requestedRedirect.startsWith('/') && !requestedRedirect.startsWith('//') ? requestedRedirect : '/';
  const [mode, setMode] = useState(resetToken ? 'reset' : 'login');
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', confirmPassword: '', otp: '' });
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const switchMode = (next) => { setMode(next); setError(''); setNotice(''); };

  const submit = async (event) => {
    event.preventDefault(); setError(''); setNotice('');
    const email = form.email.trim();
    if (mode !== 'reset' && mode !== 'verify' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Email không đúng định dạng.');
    if (mode === 'verify' && !/^\d{6}$/.test(form.otp)) return setError('Vui lòng nhập đủ 6 chữ số trong email.');
    if (mode !== 'forgot' && mode !== 'verify' && form.password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự.');
    if ((mode === 'register' || mode === 'reset') && form.password !== form.confirmPassword) return setError('Mật khẩu xác nhận chưa khớp.');
    if (mode === 'register' && form.fullName.trim().length < 2) return setError('Vui lòng nhập họ và tên hợp lệ.');
    const phone = form.phone.trim().replace(/[\s.-]/g, '');
    if (mode === 'register' && phone && !/^(0|\+84)\d{9,10}$/.test(phone)) return setError('Số điện thoại không đúng định dạng.');
    setSubmitting(true);
    try {
      if (mode === 'login') { await login({ email, password: form.password }); navigate(redirectAfterAuth); }
      if (mode === 'register') {
        const result = await register({ fullName: form.fullName.trim(), phone: phone || undefined, email, password: form.password });
        setPendingEmail(result.email || email);
        setForm((current) => ({ ...current, password: '', confirmPassword: '', otp: '' }));
        setMode('verify');
        setNotice(result.message);
      }
      if (mode === 'verify') { await verifyRegistration(pendingEmail, form.otp); navigate(redirectAfterAuth); }
      if (mode === 'forgot') {
        await authApi.forgotPassword(email);
        setPendingEmail(email);
        setMode('forgot-sent');
      }
      if (mode === 'reset') { const result = await authApi.resetPassword(resetToken, form.password); setNotice(result.message); setTimeout(() => navigate('/account'), 1200); }
    } catch (requestError) {
      const message = Array.isArray(requestError?.message) ? requestError.message.join(' ') : requestError?.message;
      setError(message || (mode === 'login' ? 'Email hoặc mật khẩu chưa chính xác.' : 'Không thể xử lý yêu cầu. Anh/chị vui lòng thử lại.'));
    }
    finally { setSubmitting(false); }
  };

  if (user) return <Navigate to="/profile" replace />;

  const resendOtp = async () => {
    setError(''); setNotice(''); setSubmitting(true);
    try { const result = await authApi.resendRegistrationOtp(pendingEmail); setNotice(result.message); }
    catch (requestError) { setError(requestError?.message || 'Không thể gửi lại mã OTP.'); }
    finally { setSubmitting(false); }
  };

  const title = { login: 'Chào mừng trở lại', register: 'Tạo tài khoản Silkmoon', verify: 'Xác minh email', forgot: 'Quên mật khẩu', 'forgot-sent': 'Kiểm tra hộp thư', reset: 'Đặt lại mật khẩu' }[mode];
  return <main className="grid min-h-screen grid-cols-1 bg-white pt-20 lg:grid-cols-2">
    <section className="relative hidden min-h-[calc(100vh-80px)] overflow-hidden bg-slate-deep lg:block"><img src={visual} alt="Không gian nghỉ ngơi Silkmoon" className="absolute inset-0 h-full w-full object-cover opacity-55"/><div className="absolute inset-0 bg-gradient-to-t from-slate-deep via-slate-deep/25 to-transparent"/><div className="relative z-10 flex h-full min-h-[calc(100vh-80px)] flex-col justify-between p-14"><img src={logo} alt="Silkmoon" className="w-56 brightness-0 invert"/><div className="max-w-xl text-white"><p className="text-5xl font-light leading-tight">Chăm chút giấc ngủ,<br/>nâng niu từng khoảnh khắc.</p><span className="mt-6 block text-xs font-bold tracking-[.2em] text-white/70">KHÔNG GIAN KHÁCH HÀNG SILKMOON</span></div></div></section>
    <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-14 lg:min-h-screen lg:px-14"><form onSubmit={submit} className="w-full max-w-md"><span className="type-eyebrow text-[10px] font-bold tracking-[.18em] text-secondary">TÀI KHOẢN SILKMOON</span><h1 className="type-page-title mt-4 text-4xl font-light text-slate-deep">{title}</h1><p className="type-intro mt-3 text-sm leading-relaxed text-on-surface-variant">{mode === 'forgot' ? 'Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.' : mode === 'forgot-sent' ? 'Hướng dẫn đặt lại mật khẩu đã được xử lý.' : mode === 'reset' ? 'Tạo mật khẩu mới cho tài khoản của anh/chị.' : mode === 'verify' ? <>Nhập mã gồm 6 chữ số đã gửi tới <strong className="text-slate-deep">{pendingEmail}</strong>. Mã có hiệu lực trong 10 phút.</> : 'Đăng nhập là tùy chọn. Anh/chị vẫn có thể mua hàng và thanh toán mà không cần tài khoản.'}</p>
      {(mode === 'login' || mode === 'register') && <div className="type-meta mt-7 flex border-b border-slate-deep/10"><button type="button" onClick={() => switchMode('login')} className={`flex-1 pb-3 text-sm font-semibold ${mode === 'login' ? 'border-b-2 border-slate-deep' : 'text-on-surface-variant'}`}>Đăng nhập</button><button type="button" onClick={() => switchMode('register')} className={`flex-1 pb-3 text-sm font-semibold ${mode === 'register' ? 'border-b-2 border-slate-deep' : 'text-on-surface-variant'}`}>Đăng ký</button></div>}
      {mode === 'forgot-sent' && <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50/70 px-6 py-8 text-center"><span className="material-symbols-outlined flex h-16 w-16 items-center justify-center rounded-full bg-slate-deep text-3xl text-white mx-auto">mark_email_read</span><h2 className="mt-5 text-xl font-semibold text-slate-deep">Email đã được gửi</h2><p className="mt-3 text-sm leading-7 text-on-surface-variant">Nếu tài khoản <strong className="break-all text-slate-deep">{pendingEmail}</strong> tồn tại, bạn sẽ nhận được liên kết đặt lại mật khẩu trong ít phút. Vui lòng kiểm tra cả thư rác.</p></div>}
      <div className="mt-7 space-y-5">{mode === 'register' && <><Field label="Họ và tên"><input className="input-underline" value={form.fullName} onChange={(e)=>update('fullName',e.target.value)} required/></Field><Field label="Số điện thoại"><input className="input-underline" value={form.phone} onChange={(e)=>update('phone',e.target.value)}/></Field></>}{mode !== 'reset' && mode !== 'verify' && mode !== 'forgot-sent' && <Field label="Email"><input className="input-underline" type="email" value={form.email} onChange={(e)=>update('email',e.target.value)} required/></Field>}{mode !== 'forgot' && mode !== 'verify' && mode !== 'forgot-sent' && <Field label="Mật khẩu"><input className="input-underline" type="password" minLength="6" value={form.password} onChange={(e)=>update('password',e.target.value)} required/></Field>}{(mode === 'register' || mode === 'reset') && <Field label="Xác nhận mật khẩu"><input className="input-underline" type="password" minLength="6" value={form.confirmPassword} onChange={(e)=>update('confirmPassword',e.target.value)} required/></Field>}{mode === 'verify' && <Field label="Mã xác minh"><input className="input-underline text-center text-2xl font-semibold tracking-[.45em]" inputMode="numeric" autoComplete="one-time-code" maxLength="6" value={form.otp} onChange={(e)=>update('otp', e.target.value.replace(/\D/g, '').slice(0, 6))} autoFocus required/></Field>}</div>
      {mode === 'login' && <button type="button" onClick={() => switchMode('forgot')} className="mt-4 text-sm font-medium text-secondary hover:underline">Quên mật khẩu?</button>}{mode === 'reset' && !resetToken && <button type="button" onClick={() => switchMode('login')} className="mt-4 text-sm font-medium text-secondary hover:underline">Quay lại đăng nhập</button>}{mode === 'verify' && <div className="mt-4 flex items-center justify-between gap-4 text-sm"><button type="button" onClick={resendOtp} disabled={submitting} className="font-medium text-secondary hover:underline disabled:opacity-50">Gửi lại mã</button><button type="button" onClick={() => switchMode('register')} className="text-on-surface-variant hover:underline">Đổi email</button></div>}{mode === 'forgot-sent' && <div className="mt-6 space-y-3"><button type="button" onClick={() => switchMode('login')} className="w-full rounded-md bg-slate-deep py-4 text-sm font-semibold uppercase tracking-wide text-white">Quay lại đăng nhập</button><button type="button" onClick={() => switchMode('forgot')} className="w-full py-2 text-sm font-medium text-secondary hover:underline">Chưa nhận được? Gửi lại liên kết</button></div>}
      {error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice && <p className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}{mode === 'forgot' ? <div className="mt-6 flex items-center justify-between gap-3"><button type="button" onClick={() => switchMode('login')} className="inline-flex items-center gap-2 rounded-md px-3 py-4 text-sm font-semibold text-secondary hover:bg-secondary/5"><span className="material-symbols-outlined text-xl">arrow_back</span>Quay lại</button><button disabled={submitting} className="min-w-[180px] rounded-md bg-slate-deep px-8 py-4 text-sm font-semibold uppercase tracking-wide text-white disabled:opacity-60">{submitting ? 'Đang xử lý…' : 'Tiếp theo'}</button></div> : mode !== 'forgot-sent' && <button disabled={submitting} className="mt-6 w-full rounded-md bg-slate-deep py-4 text-sm font-semibold uppercase tracking-wide text-white disabled:opacity-60">{submitting ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Gửi mã xác minh' : mode === 'verify' ? 'Xác minh và đăng nhập' : 'Cập nhật mật khẩu'}</button>}
    </form></section>
  </main>;
}

function Field({ label, children }) { return <label className="block text-xs font-semibold uppercase tracking-wider text-slate-deep"><span className="mb-2 block">{label}</span>{children}</label>; }
