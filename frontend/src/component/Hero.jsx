import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { settingsApi } from '../services/api';

const typographyDefaults = {
  desktop: { fontFamily: 'Manrope', labelSize: 12, titleSize: 64, descSize: 18 },
  tablet: { fontFamily: 'Manrope', labelSize: 11, titleSize: 52, descSize: 17 },
  mobile: { fontFamily: 'Manrope', labelSize: 10, titleSize: 38, descSize: 15 },
};

function typographyStyle(slide) {
  const desktop = { ...typographyDefaults.desktop, ...(slide.typography?.desktop || {}) };
  const tablet = { ...typographyDefaults.tablet, ...(slide.typography?.tablet || {}) };
  const mobile = { ...typographyDefaults.mobile, ...(slide.typography?.mobile || {}) };
  return {
    '--hero-font-desktop': `'${desktop.fontFamily}', sans-serif`, '--hero-label-desktop': `${desktop.labelSize}px`, '--hero-title-desktop': `${desktop.titleSize}px`, '--hero-desc-desktop': `${desktop.descSize}px`,
    '--hero-font-tablet': `'${tablet.fontFamily}', sans-serif`, '--hero-label-tablet': `${tablet.labelSize}px`, '--hero-title-tablet': `${tablet.titleSize}px`, '--hero-desc-tablet': `${tablet.descSize}px`,
    '--hero-font-mobile': `'${mobile.fontFamily}', sans-serif`, '--hero-label-mobile': `${mobile.labelSize}px`, '--hero-title-mobile': `${mobile.titleSize}px`, '--hero-desc-mobile': `${mobile.descSize}px`,
  };
}

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    const loadSlides = () => settingsApi.get('website_content').then((setting) => {
      const configuredSlides = setting?.value?.hero?.slides;
      setSlides(Array.isArray(configuredSlides) ? configuredSlides : []);
    }).catch(() => {});
    loadSlides();
    window.addEventListener('focus', loadSlides);
    const timer = window.setInterval(loadSlides, 5000);
    return () => { window.removeEventListener('focus', loadSlides); window.clearInterval(timer); };
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const visibleSlideIndex = slides.length > 0 ? currentSlide % slides.length : 0;

  return (
    <section className="relative h-[650px] md:h-[921px] w-full flex items-center overflow-hidden bg-bone">

      {/* Slides Container */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          style={typographyStyle(slide)}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${index === visibleSlideIndex ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
        >
          <img
            alt={slide.label}
            className="w-full h-full object-cover transform scale-105 transition-transform duration-[20000ms] ease-out"
            style={{ transform: index === visibleSlideIndex ? 'scale(1)' : 'scale(1.05)' }}
            src={slide.img}
          />
          <div className="absolute inset-0 bg-slate-deep/30"></div>

          {/* Content */}
          <div className="absolute inset-0 z-10 px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto flex items-center">
            <div className={`hero-slide-copy max-w-2xl space-y-stack-lg transition-all duration-1000 delay-300 ${index === visibleSlideIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <span className="hero-slide-label text-white uppercase tracking-widest block opacity-90">
                {slide.label}
              </span>
              <h1
                className="hero-slide-title text-white leading-tight"
                dangerouslySetInnerHTML={{ __html: slide.title }}
              />
              <p className="hero-slide-description text-white/90 max-w-lg">
                {slide.desc}
              </p>
              <div className="flex flex-col sm:flex-row gap-stack-md pt-stack-md w-full sm:w-auto">
                <Link
                  to={slide.btnPrimaryLink}
                  className="px-8 py-4 bg-slate-deep text-linen-white font-button text-button rounded-lg hover:opacity-90 transition-all active:scale-95 text-center block sm:inline-block"
                >
                  {slide.btnPrimary}
                </Link>
                <Link
                  to={slide.btnSecondaryLink}
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
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-500 ${index === visibleSlideIndex ? 'w-10 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
