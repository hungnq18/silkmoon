import { useState, useEffect } from 'react';

export default function ProductImageGallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Map API images to gallery items
  const galleryItems = images.length > 0 
    ? images.map((src, i) => ({ id: i, src, type: 'image' }))
    : [
        {
          id: 0,
          src: 'https://placehold.co/600x800/E5D5C5/334641?text=No+Image',
          alt: 'No Image',
          type: 'image'
        }
      ];

  // Reset active index if images change
  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const handleThumbnailClick = (img) => {
    if (img.type === 'video') {
      setIsVideoOpen(true);
    } else {
      setActiveIndex(img.id);
    }
  };

  return (
    <div className="space-y-stack-md select-none">
      {/* Main Image Viewer */}
      <div className="aspect-[4/5] w-full overflow-hidden bg-bone rounded-lg relative">
        <img
          className="w-full h-full object-cover"
          src={galleryItems[activeIndex]?.src || galleryItems[0].src}
          alt={`Hình ảnh sản phẩm ${activeIndex + 1}`}
        />
      </div>

      {/* Thumbnails Row */}
      <div className="grid grid-cols-4 gap-stack-md">
        {galleryItems.map((img) => {
          const isActive = img.type === 'image' && activeIndex === img.id;
          return (
            <div
              key={img.id}
              onClick={() => handleThumbnailClick(img)}
              className={`aspect-square bg-bone overflow-hidden rounded-lg cursor-pointer relative group ${
                isActive ? 'ring-1 ring-slate-deep ring-offset-2' : 'hover:opacity-90'
              }`}
            >
              {img.type === 'video' && (
                <div className="absolute inset-0 bg-slate-deep/20 flex items-center justify-center text-white z-10 transition-colors group-hover:bg-slate-deep/30">
                  <span className="material-symbols-outlined text-3xl md:text-4xl animate-pulse">
                    play_circle
                  </span>
                </div>
              )}
              <img
                className="w-full h-full object-cover"
                src={img.src}
                alt={img.alt || `Thumbnail ${img.id + 1}`}
              />
            </div>
          );
        })}
      </div>

      {/* Simulated Video Modal Overlay */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-deep/60 backdrop-blur-sm"
            onClick={() => setIsVideoOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-4xl aspect-video bg-linen-white rounded-xl overflow-hidden shadow-2xl z-10 border border-slate-deep/5 flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 text-slate-deep hover:bg-bone p-2 rounded-full z-20 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Mock Video Playing Frame */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-bone text-slate-deep p-6">
              <img
                className="absolute inset-0 w-full h-full object-cover opacity-30 select-none pointer-events-none"
                src={galleryItems[0]?.src}
                alt="Video Still"
              />
              <span className="material-symbols-outlined text-[64px] mb-4 text-sage-haze animate-spin">
                sync
              </span>
              <h3 className="font-headline-sm text-headline-sm text-center mb-2 z-10">
                Đang phát video cảm quan chất liệu...
              </h3>
              <p className="font-body-md text-on-surface-variant text-center max-w-md z-10">
                (Mô phỏng trải nghiệm lụa Mulberry chảy bồng bềnh dưới ánh sáng tự nhiên)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
