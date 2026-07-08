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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-8">
            {/* Value 1 */}
            <div className="bg-linen-white p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-sage-haze/10 rounded-full flex items-center justify-center mx-auto mb-6 text-sage-haze">
                <span className="material-symbols-outlined text-[32px]">shield</span>
              </div>
              <h3 className="font-display-sm text-display-sm mb-3">Trách nhiệm</h3>
              <p className="font-body-sm text-slate-deep/70">
                Silkmoon coi trọng trách nhiệm trong công việc, sự chú trọng đến từng chi tiết trong mỗi sản phẩm và tính chuyên nghiệp đối với khách hàng, đồng nghiệp và các mục tiêu chung của công ty.
              </p>
            </div>
            {/* Value 2 */}
            <div className="bg-linen-white p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-sage-haze/10 rounded-full flex items-center justify-center mx-auto mb-6 text-sage-haze">
                <span className="material-symbols-outlined text-[32px]">lightbulb</span>
              </div>
              <h3 className="font-display-sm text-display-sm mb-3">Đổi mới</h3>
              <p className="font-body-sm text-slate-deep/70">
                Silkmoon áp dụng các công nghệ hiện đại như chatbot AI và thực tế ảo để nâng cao trải nghiệm mua sắm trực tuyến. Công ty liên tục tìm kiếm các giải pháp mới để mang lại sự tiện lợi hơn, cá nhân hóa hơn và kết nối khách hàng mạnh mẽ hơn.
              </p>
            </div>
            {/* Value 3 */}
            <div className="bg-linen-white p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-sage-haze/10 rounded-full flex items-center justify-center mx-auto mb-6 text-sage-haze">
                <span className="material-symbols-outlined text-[32px]">handshake</span>
              </div>
              <h3 className="font-display-sm text-display-sm mb-3">Hợp tác</h3>
              <p className="font-body-sm text-slate-deep/70">
                Silkmoon xây dựng một môi trường làm việc cởi mở, tôn trọng và hỗ trợ, nơi các thành viên trong nhóm hợp tác và cùng nhau phát triển hướng tới các mục tiêu kinh doanh chung.
              </p>
            </div>
            {/* Value 4 */}
            <div className="bg-linen-white p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-sage-haze/10 rounded-full flex items-center justify-center mx-auto mb-6 text-sage-haze">
                <span className="material-symbols-outlined text-[32px]">visibility</span>
              </div>
              <h3 className="font-display-sm text-display-sm mb-3">Minh bạch</h3>
              <p className="font-body-sm text-slate-deep/70">
                Silkmoon thúc đẩy sự trung thực, cởi mở và giao tiếp rõ ràng trong tất cả các hoạt động kinh doanh. Công ty coi trọng tính minh bạch trong việc ra quyết định, làm việc nhóm và các mối quan hệ với đối tác và khách hàng, tạo dựng lòng tin và sự phát triển bền vững lâu dài.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
