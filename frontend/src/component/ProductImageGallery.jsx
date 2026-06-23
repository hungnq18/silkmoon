import { useState } from 'react';

const galleryImages = [
  {
    id: 0,
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5ydK7aCRv1y7RaejNp-Ax9LhpHaU2vtWRIcHOLxn6NokUmgyNpUGiKbwdQUytnjtQ7J0VYu2NXIlPUQTgHYAXUL5y5FRuCIXviBggAYwt5KVFlbT-YVCRjexHDUBbtJ82Va8ihcrt7FTkOFmWD7d4gr1heMUmADKb-HeuP7dOGkmFc4bXpNJ4i6KVJNHhgrHUtwTIvqvwWyJf7w_1HVjpdYKXXro_zPX8NGlwuiDpcDLQ9NvBPZltOjPScmzTabt7iaCO-bhqSb4',
    alt: 'Main Mulberry Silk Bedding Champagne',
    type: 'image',
  },
  {
    id: 1,
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7BFKWk1o5mRKRclEZVyBUPmtjoLOKAYzUY_vTg9r_DzTzEB4UeTrWapZ649raqux7U_cFhj-BF4KG_ZgLoQuJA5aeqsXFkdSrPYko2xbScizKkfbRmcNAx1REZ76G6PAgwJiZW3Mp5b2ATQt3MhrFCHulAOt_HKIU1eP3A2vbBDdTtQqVC1GO-HzFYZi2UffsjjjqFU3Z142_XsJBFM85o6ZF33EhSFeczCVDKhfxxqYKYvLel8OyUocomhRmSCX-nPWG7It_-3c',
    alt: 'Mulberry Silk feel close-up',
    type: 'image',
  },
  {
    id: 2,
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJbhsTCwF4xH7z1WLMrs5fPQu5V4ZbldfAuJIgsFgzDHlmSxs5dQeKRUQVt3VZCB9U8spht-Jbzg44VON0lkHD7kWAJogxqL13ZX8Qevx50d7U9in2bKbZcKiG1U6pOGKYCIh11lZgF6HMeCeRHe3xeIy6M38G9cuKv1w8ZCdUBOjrqyhDNy_Xgo4l1lnaa31iwwjHvwCyIavTvcTdohgfmrFw0vDOJio96HieIuSK-jqXpZojQQyisDWzYKy9N4afpwQLh4IgREY',
    alt: 'Embroidered pillow on silk sheet',
    type: 'image',
  },
  {
    id: 3,
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtWZJilwSrc_Is9EkP9JdFVBxxuqjLgpckuQFSASTM5mNXWMqEXlGs1KMMqkSOq5em8p_355ZrL8FHRjMlIqDrtSQlOA9YLKu1eWpf6EOxLI-rqdekiQYAMBAOcNonH_9B4qbtbj0GrSSIoJEbX608r1R1vnvk09LrqnU8vXoVvtfv7zigX_brn3yJNhhEzziWN5f0Q84chep01IQFivPfZhok_CdYydMc6qjMi_VrR9Q8WxEsx1rwsBUQc8DN-d3lT1CpKUZoFgw',
    alt: 'Silk sheets flowing atmospheric preview',
    type: 'video',
  },
];

export default function ProductImageGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

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
          src={galleryImages[activeIndex].src}
          alt={galleryImages[activeIndex].alt}
        />
      </div>

      {/* Thumbnails Row */}
      <div className="grid grid-cols-4 gap-stack-md">
        {galleryImages.map((img) => {
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
                alt={img.alt}
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
                src={galleryImages[3].src}
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
