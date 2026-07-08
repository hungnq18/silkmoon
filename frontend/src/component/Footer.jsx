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
        <div className="mb-10">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <img 
              src={logoImg} 
              alt="SILKMOON Logo" 
              className="h-16 md:h-20 w-auto object-contain brightness-0 invert" 
            />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Cột 1: Thông tin công ty & Liên hệ */}
          <div className="space-y-8">
            
            <div className="space-y-4">
              <h3 className="font-bold text-lg">CÔNG TY TNHH SILKMOON</h3>
              <p className="font-body-md text-linen-white/80">Mã số thuế: 0314604108</p>
              <p className="font-body-md text-linen-white/80 leading-relaxed">
                Phố Duy Tân, phường Cầu Giấy, thành phố Hà Nội
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg uppercase tracking-wide">Thời gian làm việc</h3>
              <p className="font-body-md text-linen-white/80">
                8h30 - 21h (Hàng ngày)
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg uppercase tracking-wide">Hotline</h3>
              <p className="font-display-sm text-xl font-bold tracking-wide">
                086.777.0989<br/>035.365.6383
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-deep hover:opacity-80 transition-opacity">
                <span className="font-bold text-sm">f</span>
              </a>
              <a href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-deep hover:opacity-80 transition-opacity">
                <span className="font-bold text-[10px]">Zalo</span>
              </a>
              <a href="#" className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-deep hover:opacity-80 transition-opacity" title="Instagram">
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              </a>
            </div>
          </div>

          {/* Cột 2: Sản phẩm */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Sản phẩm</h3>
            <ul className="space-y-4 font-body-md text-linen-white/80">
              <li><Link to="/shop" className="hover:text-white transition-colors">Bộ chăn ga</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Vỏ chăn</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Vỏ gối</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Bộ đồ ngủ</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">Phụ kiện</Link></li>
            </ul>
          </div>

          {/* Cột 3: Chính sách */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Chính sách</h3>
            <ul className="space-y-4 font-body-md text-linen-white/80">
              <li><Link to="/policy" className="hover:text-white transition-colors">3 đêm ngủ thử</Link></li>
              <li><Link to="/policy" className="hover:text-white transition-colors">Đổi trả sản phẩm</Link></li>
              <li><Link to="/policy" className="hover:text-white transition-colors">Vận chuyển</Link></li>
              <li><Link to="/policy" className="hover:text-white transition-colors">Bảo hành</Link></li>
              <li><Link to="/policy" className="hover:text-white transition-colors">Thanh toán</Link></li>
              <li><Link to="/policy" className="hover:text-white transition-colors">Trả góp 0%</Link></li>
              <li><Link to="/policy" className="hover:text-white transition-colors">Bảo mật thông tin</Link></li>
              <li><Link to="/policy" className="hover:text-white transition-colors">Chính sách đặt cọc</Link></li>
            </ul>
          </div>

          {/* Cột 4: Về chúng tôi & Đăng ký */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h3 className="font-bold text-lg">Về chúng tôi</h3>
              <ul className="space-y-4 font-body-md text-linen-white/80">
                <li><Link to="/about" className="hover:text-white transition-colors">Chuyện của SILKMOON</Link></li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <h3 className="font-bold text-lg uppercase tracking-wide leading-snug">Nhận thông tin ưu đãi<br/>từ SILKMOON</h3>
              {isSubmitted ? (
                <div className="bg-linen-white/10 p-3 rounded text-sm border border-linen-white/20 animate-fade-in">
                  Cảm ơn bạn đã đăng ký!
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col bg-white rounded overflow-hidden w-full">
                  <input 
                    type="email" 
                    placeholder="Nhập email" 
                    className="w-full px-4 py-3 text-slate-deep focus:outline-none font-body-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="w-full bg-[#BCE2FF] text-slate-deep px-6 py-3 font-bold text-sm hover:bg-[#A3D6FF] transition-colors">
                    Gửi thông tin
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
