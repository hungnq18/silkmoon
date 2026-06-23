import { Link } from 'react-router-dom';
import logoImg from '../assets/logoweb.silkmoon.png';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-deep text-linen-white py-12 md:py-16">
      <div className="px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-24">
          
          {/* Cột 1: Thông tin công ty */}
          <div className="space-y-8">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <img 
                src={logoImg} 
                alt="SILKMOON Logo" 
                className="h-10 md:h-12 w-auto object-contain brightness-0 invert" 
              />
            </Link>
            
            <div className="space-y-4">
              <h3 className="font-bold text-lg">CÔNG TY TNHH SILKMOON</h3>
              <p className="font-body-md text-linen-white/80">Mã số thuế: 0314604108</p>
              <p className="font-body-md text-linen-white/80 leading-relaxed max-w-sm">
                39 Đinh Công Tráng, Phường Tân Định, Thành phố Hồ Chí Minh, Việt Nam
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg uppercase tracking-wide">Hệ thống Showroom silkMoon</h3>
              <ul className="space-y-3 font-body-md text-linen-white/80 leading-relaxed max-w-md">
                <li><strong>Showroom 1:</strong> Toà B2 Sarimi, 72 Nguyễn Cơ Thạch, phường An Khánh, TP. Hồ Chí Minh</li>
                <li><strong>Showroom 2:</strong> 283A Hai Bà Trưng, phường Xuân Hòa, TP. Hồ Chí Minh</li>
                <li><strong>Showroom 3:</strong> 228 Cầu Giấy, Phường Quan Hoa, Hà Nội</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg uppercase tracking-wide">Thời gian hoạt động</h3>
              <p className="font-body-md text-linen-white/80">
                09:00 - 21:00, Thứ 2 - Chủ nhật
              </p>
            </div>
          </div>

          {/* Cột 2: Hotline, Newsletter & Links */}
          <div className="space-y-12">
            
            {/* Phần trên: Hotline & Newsletter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Hotline */}
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-4xl mt-1">phone_in_talk</span>
                <div>
                  <p className="font-body-sm text-linen-white/80 mb-1">Hotline</p>
                  <p className="font-display-sm text-xl lg:text-2xl font-bold tracking-wide leading-tight">
                    1900.636.321 -<br className="hidden md:block lg:hidden"/> 086.777.0969
                  </p>
                </div>
              </div>

              {/* Newsletter */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg uppercase tracking-wide">Nhận thông tin ưu đãi từ silkMoon</h3>
                {isSubmitted ? (
                  <div className="bg-linen-white/10 p-3 rounded text-sm border border-linen-white/20 animate-fade-in">
                    Cảm ơn bạn đã đăng ký!
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row bg-white rounded overflow-hidden w-full">
                    <input 
                      type="email" 
                      placeholder="Nhập email" 
                      className="flex-1 px-4 py-2.5 text-slate-deep focus:outline-none font-body-sm min-w-0"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button type="submit" className="shrink-0 bg-[#BCE2FF] text-slate-deep px-6 py-2.5 font-medium text-sm hover:bg-[#A3D6FF] transition-colors whitespace-nowrap">
                      Gửi thông tin
                    </button>
                  </form>
                )}
                
                {/* Social Icons */}
                <div className="flex items-center gap-3 pt-2">
                  <a href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-deep hover:opacity-80 transition-opacity">
                    <span className="font-bold text-sm">f</span>
                  </a>
                  <a href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-deep hover:opacity-80 transition-opacity">
                    <span className="font-bold text-[10px]">Zalo</span>
                  </a>
                  <a href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-deep hover:opacity-80 transition-opacity">
                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  </a>
                  <a href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-deep hover:opacity-80 transition-opacity">
                    <span className="font-bold text-[16px]">♪</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Phần dưới: Links (3 Cột) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-4">
              {/* Sản phẩm */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Sản phẩm</h3>
                <ul className="space-y-3 font-body-md text-linen-white/80">
                  <li><Link to="/shop" className="hover:text-white transition-colors">Nệm</Link></li>
                  <li><Link to="/shop" className="hover:text-white transition-colors">Topper</Link></li>
                  <li><Link to="/shop" className="hover:text-white transition-colors">Gối</Link></li>
                  <li><Link to="/shop" className="hover:text-white transition-colors">4The</Link></li>
                  <li><Link to="/shop" className="hover:text-white transition-colors">Ga trải giường</Link></li>
                  <li><Link to="/shop" className="hover:text-white transition-colors">Chăn</Link></li>
                  <li><Link to="/shop" className="hover:text-white transition-colors">Phụ kiện</Link></li>
                  <li><Link to="/shop" className="hover:text-white transition-colors">Dành cho bé</Link></li>
                </ul>
              </div>

              {/* Chính sách */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Chính sách</h3>
                <ul className="space-y-3 font-body-md text-linen-white/80">
                  <li><Link to="/policy" className="hover:text-white transition-colors">100 đêm ngủ thử</Link></li>
                  <li><Link to="/policy" className="hover:text-white transition-colors">Đổi trả sản phẩm</Link></li>
                  <li><Link to="/policy" className="hover:text-white transition-colors">Vận chuyển</Link></li>
                  <li><Link to="/policy" className="hover:text-white transition-colors">Bảo hành</Link></li>
                  <li><Link to="/policy" className="hover:text-white transition-colors">Thanh toán</Link></li>
                  <li><Link to="/policy" className="hover:text-white transition-colors">Trả góp 0%</Link></li>
                  <li><Link to="/policy" className="hover:text-white transition-colors">Bảo mật thông tin</Link></li>
                  <li><Link to="/policy" className="hover:text-white transition-colors">Chính sách đặt cọc</Link></li>
                </ul>
              </div>

              {/* Về chúng tôi */}
              <div className="space-y-4 col-span-2 md:col-span-1">
                <h3 className="font-bold text-lg">Về chúng tôi</h3>
                <ul className="space-y-3 font-body-md text-linen-white/80 grid grid-cols-2 md:grid-cols-1 gap-x-4">
                  <li><Link to="/about" className="hover:text-white transition-colors">Chuyện của silkMoon</Link></li>
                  <li><Link to="/about" className="hover:text-white transition-colors">Trách nhiệm cộng đồng</Link></li>
                  <li><Link to="/about" className="hover:text-white transition-colors">Chứng nhận</Link></li>
                  <li><Link to="/about" className="hover:text-white transition-colors">FAQs</Link></li>
                  <li><Link to="/about" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link to="/about" className="hover:text-white transition-colors">Việc làm</Link></li>
                  <li><Link to="/about" className="hover:text-white transition-colors">Báo chí</Link></li>
                  <li><Link to="/about" className="hover:text-white transition-colors">Đánh giá</Link></li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
