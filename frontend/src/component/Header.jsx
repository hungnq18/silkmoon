import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/xanh_ngang.png';
import { productsApi, settingsApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const defaultHeader = {
  logoUrl: '',
  topLinks: 'Về chúng tôi|/about\nBlog|/blog',
  mainLinks: 'Chăn|/shop?category=Chăn\nGa|/shop?category=Ga\nGối|/shop?category=Gối\nBộ đồ ngủ|/shop?category=Đồ ngủ\nPhụ kiện|/shop?category=Phụ kiện\nHướng dẫn chăm sóc|/blog?type=care\nSale|/shop?sale=true',
  flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg',
};

const parseHeaderLinks = (value) => (value || '').split('\n').map((line) => {
  const separator = line.indexOf('|');
  if (separator < 0) return null;
  const label = line.slice(0, separator).trim();
  const to = line.slice(separator + 1).trim();
  if (!label || !to) return null;
  const query = new URLSearchParams(to.split('?')[1] || '');
  const category = query.get('category');
  return { label, to, category, dropdown: Boolean(category), sale: query.get('sale') === 'true', blogType: query.get('type') };
}).filter(Boolean);

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('Giảm giá 20% cho đơn hàng từ 500.000 vnđ');
  const [headerContent, setHeaderContent] = useState(defaultHeader);
  const [menuProducts, setMenuProducts] = useState([]);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const { cart } = useCart();
  const { user } = useAuth();
  const cartCount = (cart || []).reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  const location = useLocation();
  const isTransparentRoute = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/showroom';
  const isSolid = !isTransparentRoute || isScrolled;
  const params = new URLSearchParams(location.search);
  const mainMenu = parseHeaderLinks(headerContent.mainLinks);
  const topLinks = parseHeaderLinks(headerContent.topLinks);
  const isMenuActive = (item) => item.category
    ? location.pathname === '/shop' && params.get('category') === item.category
    : item.sale
      ? location.pathname === '/shop' && params.get('sale') === 'true'
      : item.blogType
        ? location.pathname === '/blog' && params.get('type') === item.blogType
        : location.pathname === item.to.split('?')[0];

  useEffect(() => {
    const loadHeader = () => settingsApi.get('website_content').then(setting => {
      if (setting?.value?.marketing?.announcement) setAnnouncement(setting.value.marketing.announcement);
      setHeaderContent({ ...defaultHeader, ...(setting?.value?.header || {}) });
    }).catch(() => {});
    loadHeader();
    window.addEventListener('focus', loadHeader);
    const timer = window.setInterval(loadHeader, 5000);
    productsApi.getAll().then((data) => setMenuProducts(data?.items || [])).catch(() => setMenuProducts([]));
    return () => { window.removeEventListener('focus', loadHeader); window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 flex flex-col transition-all duration-300">
      {/* Top Bar */}
      <div className={`${isSolid ? 'bg-slate-deep' : 'bg-transparent'} text-linen-white py-2 px-margin-mobile md:px-margin-desktop text-[12px] md:text-sm font-body-sm w-full hidden md:block transition-colors duration-300`}>
        <div className="max-w-container-max mx-auto flex justify-between items-center w-full">
           {/* Left */}
           <div className="flex items-center gap-6">{topLinks.map((item) => <Link key={`${item.label}-${item.to}`} to={item.to} className="hover:opacity-80 transition-opacity flex items-center gap-1 font-medium">{item.label}</Link>)}</div>
           {/* Center */}
           <div className="flex-1 text-center font-medium">
             {announcement}
           </div>
           {/* Right */}
           <div className="flex items-center gap-2 justify-end">
             {headerContent.flagUrl && <img src={headerContent.flagUrl} alt="VN" className="w-5 h-auto rounded-sm object-cover shadow-sm" />}
           </div>
        </div>
      </div>

      {/* Main Nav */}
      <div
        onMouseLeave={() => setHoveredMenu(null)}
        className={`relative w-full transition-all duration-300 border-b ${isSolid
            ? 'bg-linen-white py-3 shadow-sm border-slate-deep/10'
            : 'bg-transparent py-4 border-transparent'
          }`}
      >
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center select-none w-[150px] shrink-0">
            <img
              src={headerContent.logoUrl || logoImg}
              alt="SILKMOON Logo"
              className="h-8 md:h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="mx-3 hidden min-w-0 flex-1 items-center justify-center gap-2 xl:flex xl:gap-4">
            {mainMenu.map((item) => <Link onMouseEnter={() => setHoveredMenu(item.category ? item : null)} key={item.label} className={`relative flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 font-body-md text-sm font-medium transition-all duration-200 ease-out hover:bg-[#e8f1ff] hover:text-slate-deep lg:px-3 ${isSolid ? 'text-slate-deep' : 'text-linen-white'} ${isMenuActive(item) ? 'after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-current' : ''}`} to={item.to}>{item.label}{item.dropdown && <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${hoveredMenu?.label === item.label ? 'rotate-180' : ''}`}>expand_more</span>}</Link>)}
          </nav>

          {/* Actions */}
          <div className="flex items-center justify-end gap-stack-sm md:gap-stack-md w-[150px] shrink-0">
            <Link to={user ? '/profile' : '/account'} aria-label="Tài khoản" className={`hidden rounded-full border-b-2 p-2 transition-all duration-200 ease-out hover:-translate-y-px hover:border-slate-deep hover:bg-slate-deep hover:text-white hover:shadow-md xl:block ${location.pathname === '/account' || location.pathname === '/profile' ? 'border-current' : 'border-transparent'} ${isSolid ? 'text-slate-deep' : 'text-linen-white'}`}>
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="h-7 w-7 rounded-full object-cover"/> : <span className="material-symbols-outlined text-[24px]">account_circle</span>}
            </Link>
            <Link to="/cart" className={`relative flex items-center rounded-full p-2 transition-all duration-200 ease-out hover:-translate-y-px hover:bg-slate-deep hover:text-white hover:shadow-md ${isSolid ? 'text-slate-deep' : 'text-linen-white'}`}>
              <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
              {cartCount > 0 && (
                <span className={`absolute top-1 right-1 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border ${isSolid ? 'bg-slate-deep text-linen-white border-linen-white' : 'bg-linen-white text-slate-deep border-slate-deep'}`}>
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className={`xl:hidden p-2 ${isSolid ? 'text-slate-deep' : 'text-linen-white'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-[24px]">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
        {hoveredMenu?.category && <div className="header-mega-menu absolute left-0 top-full hidden w-full border-t border-slate-deep/10 bg-white text-slate-deep shadow-2xl md:block"><div className="mx-auto max-w-container-max px-margin-desktop py-7"><div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-medium">{hoveredMenu.label}</h2><Link to={hoveredMenu.to} onClick={() => setHoveredMenu(null)} className="rounded-full bg-slate-deep px-6 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:shadow-md">Xem tất cả</Link></div><div className="grid grid-cols-4 gap-5">{menuProducts.filter((product) => product.category?.toLowerCase().includes(hoveredMenu.category.toLowerCase())).slice(0,4).map((product)=><Link key={product._id} to={`/product/${product._id}`} onClick={()=>setHoveredMenu(null)} className="group"><div className="aspect-[4/3] overflow-hidden rounded-lg bg-bone"><img src={product.images?.[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"/></div><h3 className="mt-3 truncate text-sm font-semibold transition-colors duration-200 group-hover:text-secondary">{product.name}</h3><p className="mt-1 text-xs text-on-surface-variant">{Number(product.price||0).toLocaleString('vi-VN')}₫</p></Link>)}</div></div></div>}
      </div>

      {/* Mobile Drawer */}
      <div
        className={`xl:hidden absolute top-full left-0 w-full bg-linen-white border-b border-slate-deep/10 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <nav className="flex flex-col p-stack-md gap-stack-sm max-h-[70vh] overflow-y-auto">
          <Link to={user ? '/profile' : '/account'} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg bg-slate-deep/5 px-3 py-3 font-medium text-slate-deep"><span className="material-symbols-outlined">account_circle</span>{user ? 'Hồ sơ của tôi' : 'Đăng nhập / Đăng ký'}</Link>
          {/* Top Bar Items on Mobile */}
          <div className="flex flex-col gap-2 pb-4 border-b border-slate-deep/10 mb-2 text-on-surface-variant font-body-sm">
             <div className="bg-slate-deep/5 text-slate-deep font-medium text-center py-2 rounded mb-2 text-xs">
               {announcement}
             </div>
             {topLinks.map((item) => <Link key={`${item.label}-${item.to}`} to={item.to} onClick={() => setIsMobileMenuOpen(false)} className="py-1">{item.label}</Link>)}
          </div>
          
          {/* Main Links on Mobile */}
          {mainMenu.map((item, index) => <Link key={`${item.label}-${item.to}`} className={`py-3 font-body-md text-body-md text-slate-deep font-medium flex justify-between items-center ${index < mainMenu.length - 1 ? 'border-b border-slate-deep/5' : ''}`} to={item.to} onClick={() => setIsMobileMenuOpen(false)}>{item.label}<span className="material-symbols-outlined text-[20px]">chevron_right</span></Link>)}
        </nav>
      </div>
    </header>
  );
}
