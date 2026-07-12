import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/xanh_ngang.png';
import { settingsApi } from '../services/api';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [announcement, setAnnouncement] = useState('Giảm giá 20% cho đơn hàng từ 500.000 vnđ');
  const location = useLocation();
  const isTransparentRoute = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/showroom';
  const isSolid = !isTransparentRoute || isScrolled;

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('silkmoon_cart') || '[]');
      const count = cart.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);
    } catch (e) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    settingsApi.get('website_content').then(setting => { if (setting?.value?.marketing?.announcement) setAnnouncement(setting.value.marketing.announcement); }).catch(() => {});
  }, []);

  useEffect(() => {
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
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
           <div className="flex items-center gap-6">
             <Link to="/about" className="hover:opacity-80 transition-opacity flex items-center gap-1 font-medium">
               Về chúng tôi
             </Link>
             <Link to="/blog" className="hover:opacity-80 transition-opacity font-medium">Blog</Link>
           </div>
           {/* Center */}
           <div className="flex-1 text-center font-medium">
             {announcement}
           </div>
           {/* Right */}
           <div className="flex items-center gap-2 justify-end">
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg" alt="VN" className="w-5 h-auto rounded-sm object-cover shadow-sm" />
           </div>
        </div>
      </div>

      {/* Main Nav */}
      <div
        className={`w-full transition-all duration-300 border-b ${isSolid
            ? 'bg-linen-white py-3 shadow-sm border-slate-deep/10'
            : 'bg-transparent py-4 border-transparent'
          }`}
      >
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center select-none w-[150px] shrink-0">
            <img
              src={logoImg}
              alt="SILKMOON Logo"
              className="h-8 md:h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center justify-center gap-stack-lg flex-1 mx-8">
            <Link
              className={`flex items-center gap-1 hover:opacity-70 transition-opacity font-body-md text-body-md py-1 font-medium ${isSolid ? 'text-slate-deep' : 'text-linen-white'}`}
              to="/shop"
            >
              Chăn <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </Link>
            <Link
              className={`flex items-center gap-1 hover:opacity-70 transition-opacity font-body-md text-body-md py-1 font-medium ${isSolid ? 'text-slate-deep' : 'text-linen-white'}`}
              to="/shop"
            >
              Ga <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </Link>
            <Link
              className={`flex items-center gap-1 hover:opacity-70 transition-opacity font-body-md text-body-md py-1 font-medium ${isSolid ? 'text-slate-deep' : 'text-linen-white'}`}
              to="/shop"
            >
              Gối <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </Link>
            <Link
              className={`flex items-center gap-1 hover:opacity-70 transition-opacity font-body-md text-body-md py-1 font-medium ${isSolid ? 'text-slate-deep' : 'text-linen-white'}`}
              to="/shop"
            >
              Bộ đồ ngủ <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </Link>
            <Link
              className={`flex items-center gap-1 hover:opacity-70 transition-opacity font-body-md text-body-md py-1 font-medium ${isSolid ? 'text-slate-deep' : 'text-linen-white'}`}
              to="/shop"
            >
              Phụ kiện <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </Link>
            <Link
              className={`hover:opacity-70 transition-opacity font-body-md text-body-md py-1 font-medium ${isSolid ? 'text-slate-deep' : 'text-linen-white'}`}
              to="/blog"
            >
              Hướng dẫn chăm sóc
            </Link>
            <Link
              className={`hover:opacity-70 transition-opacity font-body-md text-body-md py-1 font-medium ${isSolid ? 'text-slate-deep' : 'text-linen-white'}`}
              to="/shop"
            >
              Sale
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center justify-end gap-stack-sm md:gap-stack-md w-[150px] shrink-0">
            <button className={`p-2 hover:opacity-70 transition-opacity hidden md:block ${isSolid ? 'text-slate-deep' : 'text-linen-white'}`}>
              <span className="material-symbols-outlined text-[24px]">account_circle</span>
            </button>
            <Link to="/cart" className={`p-2 hover:opacity-70 transition-opacity flex items-center relative ${isSolid ? 'text-slate-deep' : 'text-linen-white'}`}>
              <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
              {cartCount > 0 && (
                <span className={`absolute top-1 right-1 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border ${isSolid ? 'bg-slate-deep text-linen-white border-linen-white' : 'bg-linen-white text-slate-deep border-slate-deep'}`}>
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className={`md:hidden p-2 ${isSolid ? 'text-slate-deep' : 'text-linen-white'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-[24px]">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-linen-white border-b border-slate-deep/10 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <nav className="flex flex-col p-stack-md gap-stack-sm max-h-[70vh] overflow-y-auto">
          {/* Top Bar Items on Mobile */}
          <div className="flex flex-col gap-2 pb-4 border-b border-slate-deep/10 mb-2 text-on-surface-variant font-body-sm">
             <div className="bg-slate-deep/5 text-slate-deep font-medium text-center py-2 rounded mb-2 text-xs">
               {announcement}
             </div>
             <Link to="/about" className="py-1">Về chúng tôi</Link>
             <Link to="/careers" className="py-1">Careers</Link>
          </div>
          
          {/* Main Links on Mobile */}
          <Link
            className="py-3 font-body-md text-body-md border-b border-slate-deep/5 text-slate-deep font-medium flex justify-between items-center"
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Chăn <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </Link>
          <Link
            className="py-3 font-body-md text-body-md border-b border-slate-deep/5 text-slate-deep font-medium flex justify-between items-center"
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Ga <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </Link>
          <Link
            className="py-3 font-body-md text-body-md border-b border-slate-deep/5 text-slate-deep font-medium flex justify-between items-center"
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Gối <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </Link>
          <Link
            className="py-3 font-body-md text-body-md border-b border-slate-deep/5 text-slate-deep font-medium flex justify-between items-center"
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Bộ đồ ngủ <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </Link>
          <Link
            className="py-3 font-body-md text-body-md border-b border-slate-deep/5 text-slate-deep font-medium flex justify-between items-center"
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Phụ kiện <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </Link>
          <Link
            className="py-3 font-body-md text-body-md border-b border-slate-deep/5 text-slate-deep font-medium flex justify-between items-center"
            to="/blog"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Hướng dẫn chăm sóc <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </Link>
          <Link
            className="py-3 font-body-md text-body-md text-slate-deep font-medium flex justify-between items-center"
            to="/shop"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sale
          </Link>
        </nav>
      </div>
    </header>
  );
}
