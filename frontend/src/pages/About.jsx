import { useEffect, useState } from 'react';
import { settingsApi } from '../services/api';

export default function About() {
  const [content, setContent] = useState(null);
  useEffect(() => { settingsApi.get('website_content').then((setting) => setContent(setting?.value?.about || null)).catch(() => setContent(null)); }, []);
  if (!content) return null;
  return (
    <div className="w-full bg-linen-white text-slate-deep">
      {/* 1. Hero Banner */}
      <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={content.heroImageUrl}
            alt={content.heroTitle}
            className="w-full h-full object-cover"
          />
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-slate-deep/40"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto mt-20 md:mt-0">
          <h1 className="type-page-title font-display-lg text-display-lg-mobile md:text-[56px] leading-tight text-linen-white mb-6">
            {content.heroTitle}
          </h1>
          <p className="type-intro font-body-lg text-body-lg-mobile md:text-body-lg text-linen-white/90">
            {content.heroSubtitle}
          </p>
        </div>
      </section>

      {/* 2. Sứ Mệnh (Our Mission) */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          {/* Image Left */}
          <div className="order-1 md:order-1 rounded-2xl overflow-hidden relative shadow-md">
            <img 
              src={content.missionImageUrl}
              alt={content.missionTitle}
              className="w-full h-full object-cover aspect-square md:aspect-[4/5]"
            />
          </div>
          
          {/* Content Right */}
          <div className="order-2 md:order-2">
            <span className="type-eyebrow text-secondary font-bold text-sm tracking-widest uppercase mb-4 block">{content.missionEyebrow}</span>
            <h2 className="mb-5 font-display-lg text-display-lg-mobile font-light leading-tight text-slate-deep md:text-display-lg">
              {content.missionTitle}
            </h2>
            <div className="mb-6 space-y-4 font-body-lg leading-relaxed text-slate-deep/80">
              <p>{content.missionBody1}</p>
              <p>{content.missionBody2}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Giá Trị Cốt Lõi (Core Values) */}
      <section className="py-section-gap bg-bone px-margin-mobile md:px-margin-desktop w-full">
        <div className="max-w-container-max mx-auto">
          <div className="mb-8 text-center">
            <h2 className="font-display-md text-display-md-mobile md:text-display-md text-slate-deep">{content.valuesTitle}</h2>
            <p className="mt-4 font-body-md text-slate-deep/70 max-w-2xl mx-auto">
              {content.valuesSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-8">
            {/* Value 1 */}
            <div className="bg-linen-white p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-sage-haze/10 rounded-full flex items-center justify-center mx-auto mb-6 text-sage-haze">
                <span className="material-symbols-outlined text-[32px]">shield</span>
              </div>
              <h3 className="font-display-sm text-display-sm mb-3">Trách nhiệm</h3>
              <p className="type-card-body font-body-sm text-slate-deep/70">
                {content.responsibilityText}
              </p>
            </div>
            {/* Value 2 */}
            <div className="bg-linen-white p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-sage-haze/10 rounded-full flex items-center justify-center mx-auto mb-6 text-sage-haze">
                <span className="material-symbols-outlined text-[32px]">lightbulb</span>
              </div>
              <h3 className="font-display-sm text-display-sm mb-3">Đổi mới</h3>
              <p className="type-card-body font-body-sm text-slate-deep/70">
                {content.innovationText}
              </p>
            </div>
            {/* Value 3 */}
            <div className="bg-linen-white p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-sage-haze/10 rounded-full flex items-center justify-center mx-auto mb-6 text-sage-haze">
                <span className="material-symbols-outlined text-[32px]">handshake</span>
              </div>
              <h3 className="font-display-sm text-display-sm mb-3">Hợp tác</h3>
              <p className="type-card-body font-body-sm text-slate-deep/70">
                {content.collaborationText}
              </p>
            </div>
            {/* Value 4 */}
            <div className="bg-linen-white p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-sage-haze/10 rounded-full flex items-center justify-center mx-auto mb-6 text-sage-haze">
                <span className="material-symbols-outlined text-[32px]">visibility</span>
              </div>
              <h3 className="font-display-sm text-display-sm mb-3">Minh bạch</h3>
              <p className="type-card-body font-body-sm text-slate-deep/70">
                {content.transparencyText}
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
