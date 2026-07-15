import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { settingsApi } from '../services/api';

export default function BrandStory() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    settingsApi.get('website_content')
      .then((setting) => setContent(setting?.value?.about || null))
      .catch(() => setContent(null));
  }, []);

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg md:gap-gutter items-center">
        {/* Story Image Container */}
        <div className="relative order-2 md:order-1">
          <img
            alt={content?.missionTitle || "silkMoon Brand Story"}
            className="w-full aspect-square object-cover rounded-xl"
            src={content?.missionImageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAzizf6hwZHLWNwSYnzNt6gm-E_GiSNLLO2luxFTupe5ikD3OqSYN1k0gC02kEaleFe0m6DG8NcIdFcFqqhTyEgsdQxLcCSEDMqzZyMAnD8DCV2qi_eacWTbHkvmrUU06PyabtBhzzIF1ILhuTcD7jUOfE6mo6EatiCRIhUmbnz7PgXPAFQMLlF3iMmo1OMqjuNoM06gBQC5dgc5zIUqBFjs-UvgkRuWIXZWO7QzLb3ScdGZk7Sjxv2VFTvto5CQ7Tj8YST1FY3Zxk"}
          />
          <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-sand-silk/20 rounded-full blur-3xl -z-10"></div>
        </div>

        {/* Story Text Container */}
        <div className="space-y-stack-lg order-1 md:order-2 md:pl-8">
          <span className="font-label-caps text-label-caps text-sage-haze tracking-widest block uppercase">
            {content?.missionEyebrow || "VỀ CHÚNG TÔI"}
          </span>
          <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-slate-deep leading-tight whitespace-pre-line">
            {content?.missionTitle || "Hơn Cả Một \nGiấc Ngủ Ngon"}
          </h2>
          <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant">
            {content?.missionBody1 || "Tại SILKMOON, chúng tôi tin rằng ngôi nhà là không gian của sự bình yên. Mỗi sản phẩm được ra đời từ niềm đam mê với chất liệu bền vững và thiết kế tối giản, giúp bạn tách biệt khỏi sự ồn ào của thế giới bên ngoài."}
          </p>
          <p className="font-body-lg text-body-md md:text-body-lg text-on-surface-variant">
            {content?.missionBody2 || "Chúng tôi chọn lọc những chất liệu từ tự nhiên và thân thiện với môi trường để đảm bảo rằng mỗi đêm của bạn đều là một hành trình nghỉ ngơi đích thực."}
          </p>
          <div className="pt-stack-md">
            <Link
              className="inline-flex items-center gap-2 group font-button text-button text-slate-deep hover:text-secondary transition-colors"
              to="/about"
            >
              CÂU CHUYỆN THƯƠNG HIỆU
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1 text-[18px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
