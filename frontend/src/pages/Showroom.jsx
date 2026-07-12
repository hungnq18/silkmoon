import React, { useState } from 'react';
import bookingImg from '../assets/showroom-booking.png';

const SHOWROOMS = [
  {
    id: 1,
    name: 'Showroom Nguyễn Cơ Thạch',
    address: 'Toà B2 Sarimi, 72 Nguyễn Cơ Thạch, Phường An Khánh, TP. Hồ Chí Minh',
    hotline: '1900 636 321',
    hours: '09:00 - 21:00 (Thứ 2 - CN)',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    name: 'Showroom Hai Bà Trưng',
    address: '283A Hai Bà Trưng, Phường Tân Định, TP. Hồ Chí Minh',
    hotline: '086 777 0969',
    hours: '09:00 - 21:00 (Thứ 2 - CN)',
    img: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 3,
    name: 'Showroom Cầu Giấy',
    address: '228 Cầu Giấy, Phường Quan Hoa, TP. Hà Nội',
    hotline: '1900 636 321',
    hours: '09:00 - 21:00 (Thứ 2 - CN)',
    img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800'
  }
];

const PERKS = [
  {
    icon: 'bed',
    title: 'Nằm thử thoải mái',
    desc: 'Không gian yên tĩnh, riêng tư để bạn có thể nằm thử nệm lâu nhất có thể.'
  },
  {
    icon: 'psychology',
    title: 'Tư vấn chuyên sâu 1-1',
    desc: 'Đội ngũ chuyên gia luôn sẵn sàng giải đáp mọi thắc mắc về sức khỏe giấc ngủ của bạn.'
  },
  {
    icon: 'redeem',
    title: 'Quà tặng độc quyền',
    desc: 'Nhận ngay những phần quà và ưu đãi đặc biệt chỉ dành riêng cho khách hàng trải nghiệm tại Showroom.'
  },
  {
    icon: 'coffee',
    title: 'Thư giãn với Trà/Cà phê',
    desc: 'Tận hưởng không gian sang trọng cùng đồ uống miễn phí trong lúc trải nghiệm.'
  }
];

export default function Showroom() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    showroom: '1',
    date: '',
    time: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', phone: '', showroom: '1', date: '', time: '' });
    }, 4000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-linen-white min-h-screen">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[75vh] min-h-[500px] md:min-h-[600px] flex items-center justify-center overflow-hidden rounded-b-3xl md:rounded-b-none mx-2 md:mx-0">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=2000" 
            alt="Showroom Silkmoon"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-deep/40"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
          <span className="block text-white/80 uppercase tracking-widest text-sm font-semibold mb-4 animate-fade-in-up">
            Hệ Thống Cửa Hàng
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display-md font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Trải Nghiệm Không Gian Giấc Ngủ Hoàn Hảo
          </h1>
          <p className="text-lg text-white/90 mb-10 font-body-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Đến với Silkmoon để trực tiếp cảm nhận độ êm ái của từng sợi tơ tằm và tìm ra chân ái cho giấc ngủ của riêng bạn.
          </p>
          <a href="#booking" className="inline-block bg-white text-slate-deep px-8 py-3.5 rounded-full font-bold hover:bg-sage-haze hover:text-white transition-colors animate-fade-in-up shadow-lg" style={{ animationDelay: '0.3s' }}>
            Đặt lịch trải nghiệm
          </a>
        </div>
      </section>

      {/* --- SHOWROOM LOCATIONS --- */}
      <section className="px-margin-mobile py-8 md:px-margin-desktop md:py-10">
        <div className="max-w-container-max mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-display-md font-bold text-slate-deep mb-4">
              Khám Phá Showroom Của Chúng Tôi
            </h2>
            <p className="text-slate-deep/70 max-w-2xl mx-auto text-lg">
              Silkmoon hiện đã có mặt tại TP. Hồ Chí Minh và Hà Nội. Hãy chọn địa điểm gần bạn nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SHOWROOMS.map(sr => (
              <div key={sr.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-deep/5 group">
                <div className="h-64 overflow-hidden relative">
                  <img src={sr.img} alt={sr.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-slate-deep mb-4">{sr.name}</h3>
                  <div className="space-y-3 mb-8">
                    <p className="flex items-start gap-3 text-slate-deep/80 text-sm">
                      <span className="material-symbols-outlined text-[20px] text-sage-haze shrink-0 mt-0.5">location_on</span>
                      {sr.address}
                    </p>
                    <p className="flex items-center gap-3 text-slate-deep/80 text-sm">
                      <span className="material-symbols-outlined text-[20px] text-sage-haze shrink-0">phone</span>
                      {sr.hotline}
                    </p>
                    <p className="flex items-center gap-3 text-slate-deep/80 text-sm">
                      <span className="material-symbols-outlined text-[20px] text-sage-haze shrink-0">schedule</span>
                      {sr.hours}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-slate-deep text-white py-2.5 rounded hover:bg-slate-800 transition-colors font-medium text-sm">
                      Chỉ đường
                    </button>
                    <button className="flex-1 border border-slate-deep text-slate-deep py-2.5 rounded hover:bg-slate-50 transition-colors font-medium text-sm">
                      Gọi ngay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PERKS SECTION --- */}
      <section className="bg-slate-deep py-10 text-white">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center lg:text-left">
            {PERKS.map((perk, idx) => (
              <div key={idx} className="flex flex-col items-center lg:items-start">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">{perk.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{perk.title}</h3>
                <p className="text-white/70 leading-relaxed text-sm">
                  {perk.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BOOKING SECTION --- */}
      <section id="booking" className="relative px-margin-mobile py-8 md:px-margin-desktop md:py-10">
        <div className="absolute inset-0 bg-bone/30 z-0"></div>
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden relative z-10 flex flex-col md:flex-row">
          
          {/* Form Side */}
          <div className="w-full md:w-3/5 p-8 md:p-12">
            <h2 className="text-3xl font-display-md font-bold text-slate-deep mb-2">Đặt Lịch Hẹn</h2>
            <p className="text-slate-deep/70 mb-8 text-sm">Điền thông tin bên dưới để chuyên gia của chúng tôi có thể đón tiếp bạn một cách chu đáo nhất.</p>
            
            {isSubmitted ? (
              <div className="bg-[#EAF2F8] border border-[#BCE2FF] text-[#1E3A8A] px-6 py-8 rounded-xl text-center animate-fade-in">
                <span className="material-symbols-outlined text-5xl mb-3">check_circle</span>
                <h3 className="text-xl font-bold mb-2">Đặt lịch thành công!</h3>
                <p className="text-sm">Silkmoon sẽ liên hệ lại với bạn trong thời gian sớm nhất để xác nhận cuộc hẹn.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-deep mb-1.5">Họ và tên</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Nhập họ tên của bạn" className="w-full px-4 py-3 rounded-lg border border-slate-deep/20 focus:outline-none focus:ring-2 focus:ring-sage-haze focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-deep mb-1.5">Số điện thoại</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Nhập số điện thoại" className="w-full px-4 py-3 rounded-lg border border-slate-deep/20 focus:outline-none focus:ring-2 focus:ring-sage-haze focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-deep mb-1.5">Chọn Showroom</label>
                  <select name="showroom" value={formData.showroom} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-slate-deep/20 focus:outline-none focus:ring-2 focus:ring-sage-haze focus:border-transparent transition-all bg-white">
                    {SHOWROOMS.map(sr => (
                      <option key={sr.id} value={sr.id}>{sr.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-deep mb-1.5">Ngày dự kiến</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-slate-deep/20 focus:outline-none focus:ring-2 focus:ring-sage-haze focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-deep mb-1.5">Khung giờ</label>
                    <input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-slate-deep/20 focus:outline-none focus:ring-2 focus:ring-sage-haze focus:border-transparent transition-all" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-slate-deep text-white py-3.5 rounded-lg font-bold hover:bg-sage-haze transition-colors mt-2 shadow-md">
                  Xác Nhận Đặt Lịch
                </button>
              </form>
            )}
          </div>
          
          {/* Image Side */}
          <div className="w-full md:w-2/5 hidden md:block bg-slate-deep relative">
            <img 
              src={bookingImg} 
              alt="Silkmoon Experience"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/90 via-transparent to-transparent flex items-end p-8">
              <div className="text-white">
                <span className="material-symbols-outlined text-4xl mb-2 text-sage-haze">format_quote</span>
                <p className="font-body-lg italic text-lg leading-relaxed">
                  "Giấc ngủ là sự đầu tư tốt nhất cho sức khỏe. Hãy để chúng tôi giúp bạn tìm ra chân ái."
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </section>

    </div>
  );
}
