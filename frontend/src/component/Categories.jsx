import { Link } from 'react-router-dom';

export default function Categories() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
      <div className="flex justify-between items-end mb-stack-lg">
        <h2 className="font-headline-md text-headline-sm md:text-headline-md text-slate-deep">
          Danh Mục Nổi Bật
        </h2>
        <Link
          className="font-label-caps text-label-caps text-slate-deep border-b border-slate-deep pb-1 hover:opacity-85 transition-opacity"
          to="/shop"
        >
          XEM TẤT CẢ
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter h-auto md:h-[700px]">
        {/* Bed Sheets */}
        <Link
          to="/shop"
          className="md:col-span-8 relative overflow-hidden rounded-xl bg-bone group block h-[350px] md:h-auto"
        >
          <img
            alt="Ga giường"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDi68zqwIVtcVZ9xD7d69hOdwmxPOd9F-qjyv64Qs8OaR5v2NEmeJ3KlmfQVRBiEn5mYfrzSBhPlXlWbCVLEWyFYndHW9Vd0l8LZE1oOy7wvBAv7u8A8U5GMRa_E5ge9RBIYonFsgXtFuVYLS84ytjRrfY7vUwj4R5wllGGcle5MSdrOZNIAXTPxdfeV6NZCB5eEx7Gf9rkLYWRZmHC1Vw39Eyno7Ah-gHx2dgET1FvFhUJmoP7y2ELlfns40xjvdh-tklHUH_Pf8Y"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/50 to-transparent"></div>
          <div className="absolute bottom-stack-lg left-stack-lg text-linen-white">
            <h3 className="font-headline-sm text-headline-sm mb-2">Ga Giường</h3>
            <p className="font-body-md opacity-90">Êm ái từ cái chạm đầu tiên</p>
          </div>
        </Link>

        {/* Pillowcases */}
        <Link
          to="/shop"
          className="md:col-span-4 relative overflow-hidden rounded-xl bg-bone group block h-[250px] md:h-auto"
        >
          <img
            alt="Vỏ gối"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGTC7hToMtDZJJIiLTwC-XhTakzhpN03VH61HzaCZRV8Ob4RmRu5-mbRCpSX2FnqacZH7R0SNG4Sx8zZYj7jHC_j8ovC3vsTTCDx2FNS4Lh2cOHYEsQKa8fAcxZ7P36eeVmg0K6PQWdGVmXlAZ3CoA19rWu_qOJGKrRAWJrjdU7FN87d3BvSVtiH6KkZUv_b8OXAifptf1u_m35-Xfo1hi0m0mxNcuMO8kuoR51mtGDDsUzLsdbGvNq2bIMtYO_9Ih0vDV85ibUlU"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/50 to-transparent"></div>
          <div className="absolute bottom-stack-lg left-stack-lg text-linen-white">
            <h3 className="font-headline-sm text-headline-sm mb-2">Vỏ Gối</h3>
            <p className="font-body-md opacity-90">Nâng niu làn da & mái tóc</p>
          </div>
        </Link>

        {/* Blanket/Duvet */}
        <Link
          to="/shop"
          className="md:col-span-6 relative overflow-hidden rounded-xl bg-bone group block h-[200px] md:h-auto"
        >
          <img
            alt="Vỏ chăn"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJbhsTCwF4xH7z1WLMrs5fPQu5V4ZbldfAuJIgsFgzDHlmSxs5dQeKRUQVt3VZCB9U8spht-Jbzg44VON0lkHD7kWAJogxqL13ZX8Qevx50d7U9in2bKbZcKiG1U6pOGKYCIh11lZgF6HMeCeRHe3xeIy6M38G9cuKv1w8ZCdUBOjrqyhDNy_Xgo4l1lnaa31iwwjHvwCyIavTvcTdohgfmrFw0vDOJio96HieIuSK-jqXpZojQQyisDWzYKy9N4afpwQLh4IgREY"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/50 to-transparent"></div>
          <div className="absolute bottom-stack-lg left-stack-lg text-linen-white max-w-sm">
            <h3 className="font-headline-sm text-headline-sm mb-2">Vỏ Chăn</h3>
            <p className="font-body-md opacity-90">
              Ôm trọn từng giấc êm
            </p>
          </div>
        </Link>

        {/* Sleepwear */}
        <Link
          to="/shop"
          className="md:col-span-6 relative overflow-hidden rounded-xl bg-bone group block h-[200px] md:h-auto"
        >
          <img
            alt="Đồ ngủ"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-9vCtOEhZSSVUnVCp_QcJsw1QVKcajQqAak1kCppQWN4vJQyabIVs1eaRPn7wlyp81-NdfBJONHyOrIHIWVHAvHVCzPKkv7F-ybmJdueIIPnBeFFPB0gyVNT8vaCA44j_5YnSdkf1Ql2JLtww9HJa9_rplcdByntqvuiNcODKYT6qxHqMMSqiLN-_QszLwCb4mazPwmEOLej58npNchvkdXWErBWdgkflbHm99vq1eu9EyPtWufwpZ8ygZwsrrfDCbDnEzlh2fxM"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/50 to-transparent"></div>
          <div className="absolute bottom-stack-lg left-stack-lg text-linen-white max-w-sm">
            <h3 className="font-headline-sm text-headline-sm mb-2">Đồ Ngủ & Loungewear</h3>
            <p className="font-body-md opacity-90">
              Tự do trong từng chuyển động, nhẹ nhàng trong từng hơi thở.
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
