import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import logo from '../assets/xanh_ngang.png';
import visual from '../assets/carousel-slide3.png';

export default function Account() {
  const { user, login, register, logout } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const resetToken = params.get('resetToken') || '';
  const [mode, setMode] = useState(resetToken ? 'reset' : 'login');
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const switchMode = (next) => { setMode(next); setError(''); setNotice(''); };

  const submit = async (event) => {
    event.preventDefault(); setError(''); setNotice('');
    const email = form.email.trim();
    if (mode !== 'reset' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Email không đúng định dạng.');
    if (mode !== 'forgot' && form.password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự.');
    if ((mode === 'register' || mode === 'reset') && form.password !== form.confirmPassword) return setError('Mật khẩu xác nhận chưa khớp.');
    if (mode === 'register' && form.fullName.trim().length < 2) return setError('Vui lòng nhập họ và tên hợp lệ.');
    const phone = form.phone.trim().replace(/[\s.-]/g, '');
    if (mode === 'register' && phone && !/^(0|\+84)\d{9,10}$/.test(phone)) return setError('Số điện thoại không đúng định dạng.');
    setSubmitting(true);
    try {
      if (mode === 'login') { await login({ email, password: form.password }); navigate('/'); }
      if (mode === 'register') { await register({ fullName: form.fullName.trim(), phone: phone || undefined, email, password: form.password }); navigate('/'); }
      if (mode === 'forgot') { const result = await authApi.forgotPassword(email); setNotice(result.message); }
      if (mode === 'reset') { const result = await authApi.resetPassword(resetToken, form.password); setNotice(result.message); setTimeout(() => navigate('/account'), 1200); }
    } catch { setError(mode === 'login' ? 'Email hoặc mật khẩu chưa chính xác.' : 'Không thể xử lý yêu cầu. Anh/chị vui lòng kiểm tra thông tin và thử lại.'); }
    finally { setSubmitting(false); }
  };

  if (user) return <main className="min-h-screen bg-bone px-4 pb-20 pt-32"><section className="mx-auto max-w-xl rounded-2xl border border-slate-deep/10 bg-white p-10 text-center shadow-xl"><span className="material-symbols-outlined text-6xl text-secondary">account_circle</span><h1 className="mt-5 text-3xl text-slate-deep">Xin chào, {user.fullName}</h1><p className="mt-2 text-on-surface-variant">{user.email}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/shop" className="rounded-full bg-slate-deep px-6 py-3 text-sm text-white">Tiếp tục mua sắm</Link><button onClick={logout} className="rounded-full border border-slate-deep/20 px-6 py-3 text-sm">Đăng xuất</button></div></section></main>;

  const title = { login: 'Chào mừng trở lại', register: 'Tạo tài khoản Silkmoon', forgot: 'Quên mật khẩu', reset: 'Đặt lại mật khẩu' }[mode];
  return <main className="grid min-h-screen grid-cols-1 bg-white pt-20 lg:grid-cols-2">
    <section className="relative hidden min-h-[calc(100vh-80px)] overflow-hidden bg-slate-deep lg:block"><img src={visual} alt="Không gian nghỉ ngơi Silkmoon" className="absolute inset-0 h-full w-full object-cover opacity-55"/><div className="absolute inset-0 bg-gradient-to-t from-slate-deep via-slate-deep/25 to-transparent"/><div className="relative z-10 flex h-full min-h-[calc(100vh-80px)] flex-col justify-between p-14"><img src={logo} alt="Silkmoon" className="w-56 brightness-0 invert"/><div className="max-w-xl text-white"><p className="text-5xl font-light leading-tight">Chăm chút giấc ngủ,<br/>nâng niu từng khoảnh khắc.</p><span className="mt-6 block text-xs font-bold tracking-[.2em] text-white/70">KHÔNG GIAN KHÁCH HÀNG SILKMOON</span></div></div></section>
    <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-14 lg:min-h-screen lg:px-14"><form onSubmit={submit} className="w-full max-w-md"><span className="text-[10px] font-bold tracking-[.18em] text-secondary">TÀI KHOẢN SILKMOON</span><h1 className="mt-4 text-4xl font-light text-slate-deep">{title}</h1><p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{mode === 'forgot' ? 'Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.' : mode === 'reset' ? 'Tạo mật khẩu mới cho tài khoản của anh/chị.' : 'Đăng nhập là tùy chọn. Anh/chị vẫn có thể mua hàng và thanh toán mà không cần tài khoản.'}</p>
      {(mode === 'login' || mode === 'register') && <div className="mt-7 flex border-b border-slate-deep/10"><button type="button" onClick={() => switchMode('login')} className={`flex-1 pb-3 text-sm font-semibold ${mode === 'login' ? 'border-b-2 border-slate-deep' : 'text-on-surface-variant'}`}>Đăng nhập</button><button type="button" onClick={() => switchMode('register')} className={`flex-1 pb-3 text-sm font-semibold ${mode === 'register' ? 'border-b-2 border-slate-deep' : 'text-on-surface-variant'}`}>Đăng ký</button></div>}
      <div className="mt-7 space-y-5">{mode === 'register' && <><Field label="Họ và tên"><input className="input-underline" value={form.fullName} onChange={(e)=>update('fullName',e.target.value)} required/></Field><Field label="Số điện thoại"><input className="input-underline" value={form.phone} onChange={(e)=>update('phone',e.target.value)}/></Field></>}{mode !== 'reset' && <Field label="Email"><input className="input-underline" type="email" value={form.email} onChange={(e)=>update('email',e.target.value)} required/></Field>}{mode !== 'forgot' && <Field label="Mật khẩu"><input className="input-underline" type="password" minLength="6" value={form.password} onChange={(e)=>update('password',e.target.value)} required/></Field>}{(mode === 'register' || mode === 'reset') && <Field label="Xác nhận mật khẩu"><input className="input-underline" type="password" minLength="6" value={form.confirmPassword} onChange={(e)=>update('confirmPassword',e.target.value)} required/></Field>}</div>
      {mode === 'login' && <button type="button" onClick={() => switchMode('forgot')} className="mt-4 text-sm font-medium text-secondary hover:underline">Quên mật khẩu?</button>}{(mode === 'forgot' || mode === 'reset') && !resetToken && <button type="button" onClick={() => switchMode('login')} className="mt-4 text-sm font-medium text-secondary hover:underline">Quay lại đăng nhập</button>}
      {error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice && <p className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}<button disabled={submitting} className="mt-6 w-full rounded-md bg-slate-deep py-4 text-sm font-semibold uppercase tracking-wide text-white disabled:opacity-60">{submitting ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Tạo tài khoản' : mode === 'forgot' ? 'Gửi liên kết' : 'Cập nhật mật khẩu'}</button>
    </form></section>
  </main>;
}

function Field({ label, children }) { return <label className="block text-xs font-semibold uppercase tracking-wider text-slate-deep"><span className="mb-2 block">{label}</span>{children}</label>; }
