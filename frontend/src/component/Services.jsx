export default function Services() {
  const services = [
    {
      icon: "bedtime",
      title: "3 đêm ngủ thử",
      text: "Trải nghiệm sản phẩm ngay tại nhà với cam kết đổi trả linh hoạt."
    },
    {
      icon: "local_shipping",
      title: "Miễn phí vận chuyển",
      subtitle: "(từ 500.000VNĐ)",
      text: "Chỉ cần chọn sản phẩm bạn yêu thích, việc giao hàng tận nơi để SILKMOON lo."
    },
    {
      icon: "currency_exchange",
      title: "Thanh toán linh hoạt",
      text: "Hỗ trợ đa dạng phương thức thanh toán để việc chăm sóc giấc ngủ trở nên thật đơn giản."
    }
  ];

  return (
    <section className="py-16 px-margin-mobile md:px-margin-desktop bg-white w-full">
      <div className="max-w-container-max mx-auto">
        <h2 className="font-display-md text-display-md-mobile md:text-display-md text-slate-deep mb-8 md:mb-10 font-bold text-center md:text-left">
          An tâm hơn với dịch vụ vượt trội
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div key={index} className="bg-[#F4F9FF] p-6 rounded-xl flex flex-col items-start transition-all duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer group">
              <span className="material-symbols-outlined text-[48px] text-slate-deep mb-6" style={{ fontVariationSettings: "'wght' 200" }}>
                {service.icon}
              </span>
              <h3 className="font-bold text-slate-deep text-[18px] mb-1">{service.title}</h3>
              {service.subtitle && <p className="text-sm text-slate-deep/70 mb-3">{service.subtitle}</p>}
              {!service.subtitle && <div className="mb-3"></div>}
              <p className="font-body-md text-slate-deep/80 leading-relaxed">
                {service.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
