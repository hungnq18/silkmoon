import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="w-full bg-linen-white text-slate-deep">
      {/* 1. Hero Banner */}
      <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1920&q=80" 
            alt="Nghệ thuật của sự nghỉ ngơi" 
            className="w-full h-full object-cover"
          />
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-slate-deep/40"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto mt-20 md:mt-0">
          <h1 className="font-display-lg text-display-lg-mobile md:text-[56px] leading-tight text-linen-white mb-6">
            Nghệ Thuật Của Sự Nghỉ Ngơi
          </h1>
          <p className="font-body-lg text-body-lg-mobile md:text-body-lg text-linen-white/90">
            Khám phá hành trình SILKMOON mang đến trải nghiệm giấc ngủ hoàn mỹ từ những chất liệu tự nhiên thuần khiết nhất.
          </p>
        </div>
      </section>

      {/* 2. Sứ Mệnh (Our Mission) */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          {/* Image Left */}
          <div className="order-1 md:order-1 rounded-2xl overflow-hidden relative shadow-md">
            <img 
              src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80" 
              alt="Hơn cả một giấc ngủ ngon" 
              className="w-full h-full object-cover aspect-square md:aspect-[4/5]"
            />
          </div>
          
          {/* Content Right */}
          <div className="order-2 md:order-2">
            <span className="text-secondary font-bold text-sm tracking-widest uppercase mb-4 block">Về chúng tôi</span>
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-8 text-slate-deep font-light leading-tight">
              Hơn Cả Một<br/>Giấc Ngủ Ngon
            </h2>
            <div className="font-body-lg text-slate-deep/80 space-y-6 leading-relaxed mb-10">
              <p>
                Tại silkMoon, chúng tôi tin rằng ngôi nhà là thánh đường của sự bình yên. Mỗi sản phẩm được ra đời từ niềm đam mê với chất liệu bền vững và thiết kế tối giản, giúp bạn tách biệt khỏi sự ồn ào của thế giới bên ngoài.
              </p>
              <p>
                Chúng tôi chọn lọc những sợi cotton tốt nhất và quy trình sản xuất thân thiện với môi trường để đảm bảo rằng mỗi đêm của bạn đều là một hành trình nghỉ ngơi đích thực.
              </p>
            </div>
            <Link to="/about" className="inline-flex items-center gap-2 text-slate-deep font-medium uppercase tracking-wide hover:opacity-70 transition-opacity border-b border-transparent hover:border-slate-deep pb-1">
              Câu chuyện thương hiệu <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Giá Trị Cốt Lõi (Core Values) */}
      <section className="py-section-gap bg-bone px-margin-mobile md:px-margin-desktop w-full">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display-md text-display-md-mobile md:text-display-md text-slate-deep">Giá Trị Cốt Lõi</h2>
            <p className="mt-4 font-body-md text-slate-deep/70 max-w-2xl mx-auto">
              Những tiêu chí không bao giờ thay đổi trong suốt quá trình phát triển sản phẩm của SILKMOON.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Value 1 */}
            <div className="bg-linen-white p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-sage-haze/10 rounded-full flex items-center justify-center mx-auto mb-6 text-sage-haze">
                <span className="material-symbols-outlined text-[32px]">eco</span>
              </div>
              <h3 className="font-display-sm text-display-sm mb-3">100% Tự Nhiên</h3>
              <p className="font-body-sm text-slate-deep/70">
                Lựa chọn khắt khe các nguồn sợi tự nhiên, thân thiện với làn da và an toàn cho sức khỏe trong dài hạn.
              </p>
            </div>
            {/* Value 2 */}
            <div className="bg-linen-white p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-sage-haze/10 rounded-full flex items-center justify-center mx-auto mb-6 text-sage-haze">
                <span className="material-symbols-outlined text-[32px]">bed</span>
              </div>
              <h3 className="font-display-sm text-display-sm mb-3">Trải Nghiệm Tối Đa</h3>
              <p className="font-body-sm text-slate-deep/70">
                Tập trung vào cảm giác êm ái, thoáng mát, hỗ trợ nâng đỡ cơ thể tuyệt đối để mỗi phút giây ngả lưng đều là tận hưởng.
              </p>
            </div>
            {/* Value 3 */}
            <div className="bg-linen-white p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-sage-haze/10 rounded-full flex items-center justify-center mx-auto mb-6 text-sage-haze">
                <span className="material-symbols-outlined text-[32px]">local_shipping</span>
              </div>
              <h3 className="font-display-sm text-display-sm mb-3">Minh Bạch & Tận Tâm</h3>
              <p className="font-body-sm text-slate-deep/70">
                Chính sách dùng thử tại nhà, miễn phí vận chuyển và bảo hành dài hạn vì chúng tôi tin tưởng vào sản phẩm của mình.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Hành Trình (Timeline) */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
        <h2 className="font-display-md text-display-md-mobile md:text-display-md text-slate-deep text-center mb-16">Hành Trình Của Chúng Tôi</h2>
        
        <div className="relative border-l border-slate-deep/10 ml-4 md:mx-auto md:w-fit md:border-l-0">
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-slate-deep/10 -translate-x-1/2"></div>
          
          <div className="space-y-12">
            {/* Year 1 */}
            <div className="relative pl-8 md:pl-0 flex flex-col md:flex-row items-center w-full group">
              <div className="absolute left-[-5px] top-2 md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full bg-sage-haze border-4 border-linen-white shadow-sm z-10 transition-transform group-hover:scale-150"></div>
              <div className="md:w-1/2 md:pr-16 text-left md:text-right w-full">
                <span className="text-sage-haze font-bold text-lg mb-1 block">Năm 2023</span>
                <h3 className="font-display-sm text-display-sm mb-2">Ý Tưởng Bắt Đầu</h3>
                <p className="font-body-sm text-slate-deep/70">Từ khao khát tìm kiếm một bộ chăn ga thực sự làm từ thiên nhiên, không pha nilon với mức giá hợp lý, SILKMOON được nhen nhóm hình thành.</p>
              </div>
              <div className="md:w-1/2 md:pl-16 hidden md:block"></div>
            </div>

            {/* Year 2 */}
            <div className="relative pl-8 md:pl-0 flex flex-col md:flex-row items-center w-full group">
              <div className="absolute left-[-5px] top-2 md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full bg-sage-haze border-4 border-linen-white shadow-sm z-10 transition-transform group-hover:scale-150"></div>
              <div className="md:w-1/2 md:pr-16 hidden md:block"></div>
              <div className="md:w-1/2 md:pl-16 text-left w-full">
                <span className="text-sage-haze font-bold text-lg mb-1 block">Năm 2024</span>
                <h3 className="font-display-sm text-display-sm mb-2">Ra Mắt Sản Phẩm Đầu Tiên</h3>
                <p className="font-body-sm text-slate-deep/70">Mất hơn 1 năm nghiên cứu chất liệu vải dệt từ sợi sồi và sợi bạch đàn, bộ sưu tập chăn ga làm mát đầu tiên chính thức tới tay khách hàng.</p>
              </div>
            </div>

            {/* Year 3: 2025 */}
            <div className="relative pl-8 md:pl-0 flex flex-col md:flex-row items-center w-full group">
              <div className="absolute left-[-5px] top-2 md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full bg-sage-haze border-4 border-linen-white shadow-sm z-10 transition-transform group-hover:scale-150"></div>
              <div className="md:w-1/2 md:pr-16 text-left md:text-right w-full">
                <span className="text-sage-haze font-bold text-lg mb-1 block">Năm 2025</span>
                <h3 className="font-display-sm text-display-sm mb-2">Mở Rộng & Phát Triển</h3>
                <p className="font-body-sm text-slate-deep/70">Tiếp tục cải tiến các dòng gối hỗ trợ đốt sống cổ và đệm cao cấp, trở thành người bạn đồng hành trong hàng vạn phòng ngủ của gia đình Việt.</p>
              </div>
              <div className="md:w-1/2 md:pl-16 hidden md:block"></div>
            </div>

            {/* Year 4: 2026 */}
            <div className="relative pl-8 md:pl-0 flex flex-col md:flex-row items-center w-full group">
              <div className="absolute left-[-5px] top-2 md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full bg-sage-haze border-4 border-linen-white shadow-sm z-10 transition-transform group-hover:scale-150"></div>
              <div className="md:w-1/2 md:pr-16 hidden md:block"></div>
              <div className="md:w-1/2 md:pl-16 text-left w-full">
                <span className="text-sage-haze font-bold text-lg mb-1 block">Năm 2026</span>
                <h3 className="font-display-sm text-display-sm mb-2">Nâng Tầm Giấc Ngủ</h3>
                <p className="font-body-sm text-slate-deep/70">Ra mắt bộ sưu tập cao cấp ứng dụng công nghệ làm mát tiên tiến nhất, khẳng định vị thế thương hiệu chăm sóc giấc ngủ hàng đầu Việt Nam.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
