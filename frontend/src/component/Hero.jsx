import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import slide3Img from '../assets/carousel-slide3.png';

const SLIDES = [
  {
    id: 1,
    label: 'BỘ SƯU TẬP MÙA THU 2026',
    title: 'Nghệ Thuật Của <br/> <span class="italic">Sự Nghỉ Ngơi</span>',
    desc: 'Khám phá dòng sản phẩm cao cấp được dệt từ sợi tự nhiên, mang lại cảm giác mềm mại tuyệt đối cho giấc ngủ trọn vẹn.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxtxRn3QC_FTuXtFRrdbvmLmb6XXYWuXTubbItMBXeR4aGvNWtyQ8hQTieqOi8Q6dVJ5nAy6AoLjy09HGz5OGCS9tcq3hZPzGbIbKlaoFQM9kli2pt5OSQTNaN52qc0n1whis0vS65IjizWLWHUX385McQq2lX9pX95pVki_kI-cVFf6KsX8n70eCfyVAm07Wl29nRoxf_5havoHlsT45pvGtwlfRvllqM-5f0GdoX0wRoEaAObFElOZvqdzcmCnm9X1EYEERV8W4',
    btnPrimary: 'MUA NGAY',
    btnSecondary: 'TÌM HIỂU THÊM'
  },
  {
    id: 2,
    label: 'TRẢI NGHIỆM GIẤC NGỦ HOÀN HẢO',
    title: 'Nệm Cao Su <br/> <span class="italic">Silkmoon Hybrid</span>',
    desc: 'Sự kết hợp hoàn hảo giữa lò xo túi độc lập và cao su thiên nhiên 100%, nâng đỡ trọn vẹn từng đường cong cơ thể.',
    img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=2000',
    btnPrimary: 'XEM CHI TIẾT',
    btnSecondary: 'ĐẶT LỊCH TRẢI NGHIỆM'
  },
  {
    id: 3,
    label: 'CHẤT LIỆU CAO CẤP TỪ THIÊN NHIÊN',
    title: 'Mềm Mại <br/> <span class="italic">& Thoáng Mát</span>',
    desc: 'Chất liệu Tencel cao cấp siêu mát mẻ, kháng khuẩn tự nhiên, bảo vệ làn da của bạn mỗi đêm.',
    img: slide3Img,
    btnPrimary: 'KHÁM PHÁ NGAY',
    btnSecondary: 'XEM SHOWROOM'
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[650px] md:h-[921px] w-full flex items-center overflow-hidden bg-bone">
      
      {/* Slides Container */}
      {SLIDES.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            alt={slide.label}
            className="w-full h-full object-cover transform scale-105 transition-transform duration-[10000ms] ease-out"
            style={{ transform: index === currentSlide ? 'scale(1)' : 'scale(1.05)' }}
            src={slide.img}
          />
          <div className="absolute inset-0 bg-slate-deep/30"></div>
          
          {/* Content */}
          <div className="absolute inset-0 z-10 px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto flex items-center">
            <div className={`max-w-2xl space-y-stack-lg transition-all duration-1000 delay-300 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <span className="font-label-caps text-label-caps text-white uppercase tracking-widest block opacity-90">
                {slide.label}
              </span>
              <h1 
                className="font-display-lg text-display-lg-mobile md:text-[64px] text-white leading-tight"
                dangerouslySetInnerHTML={{ __html: slide.title }}
              />
              <p className="font-body-lg text-body-md md:text-body-lg text-white/90 max-w-lg">
                {slide.desc}
              </p>
              <div className="flex flex-col sm:flex-row gap-stack-md pt-stack-md w-full sm:w-auto">
                <Link
                  to="/shop"
                  className="px-8 py-4 bg-slate-deep text-linen-white font-button text-button rounded-lg hover:opacity-90 transition-all active:scale-95 text-center block sm:inline-block"
                >
                  {slide.btnPrimary}
                </Link>
                <Link 
                  to="/showroom"
                  className="px-8 py-4 border border-linen-white text-linen-white font-button text-button rounded-lg hover:bg-linen-white hover:text-slate-deep transition-all active:scale-95 text-center block sm:inline-block"
                >
                  {slide.btnSecondary}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-500 ${
              index === currentSlide ? 'w-10 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
