import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const BLOG_DATA = [
  {
    id: 1,
    title: 'Hướng dẫn cách chọn chăn ga gối lụa tốt cho sức khỏe và nằm thoải mái',
    desc: 'Sở hữu một bộ chăn ga lụa chất lượng, êm ái sẽ giúp tăng thêm sự thoải mái và cải thiện giấc ngủ một cách rõ rệt...',
    img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800',
    category: 'Mẹo hay',
  },
  {
    id: 2,
    title: 'So sánh chất liệu Silk và Bamboo - Đánh giá chi tiết',
    desc: 'Bạn đang phân vân giữa hai dòng chất liệu tơ tằm và sợi tre, chúng có gì khác biệt, ưu nhược điểm ra sao?',
    img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800',
    category: 'Sản phẩm SILKMOON',
  },
  {
    id: 3,
    title: 'Tại sao màu trung tính giúp bạn ngủ ngon và sâu giấc hơn?',
    desc: 'Màu sắc phòng ngủ có ảnh hưởng trực tiếp đến tâm trạng và hệ thần kinh. Khám phá bí mật đằng sau những tông màu dịu nhẹ...',
    img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800',
    category: 'Bạn có biết',
  },
  {
    id: 4,
    title: 'Bật mí 5 tư thế ngủ chống lão hóa và bảo vệ cột sống',
    desc: 'Có được một giấc ngủ ngon là niềm ao ước của nhiều chị em hiện nay. Cùng xem ngay các tư thế giúp da dẻ luôn căng mịn...',
    img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    category: 'Mẹo hay',
  },
  {
    id: 5,
    title: 'Vệ sinh và bảo quản đồ ngủ lụa tơ tằm đúng chuẩn chuyên gia',
    desc: 'Lụa tơ tằm là chất liệu cao cấp cần được chăm sóc đặc biệt. Hãy cùng tìm hiểu cách giặt giũ và bảo quản để lụa luôn óng ả...',
    img: 'https://images.unsplash.com/photo-1520699049698-acd2fce18736?auto=format&fit=crop&q=80&w=800',
    category: 'Sản phẩm SILKMOON',
  },
  {
    id: 6,
    title: 'Nhiệt độ phòng ngủ bao nhiêu là lý tưởng nhất?',
    desc: 'Nhiều người lầm tưởng rằng phòng ngủ càng lạnh càng tốt, nhưng thực tế nhiệt độ tối ưu lại phụ thuộc vào nhiều yếu tố...',
    img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    category: 'Bạn có biết',
  },
];

const CATEGORIES = ['Bạn có biết', 'Sản phẩm SILKMOON', 'Mẹo hay'];

export default function BlogPosts() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const filteredBlogs = activeCategory === 'Tất cả' 
    ? BLOG_DATA 
    : BLOG_DATA.filter(blog => blog.category === activeCategory);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  return (
    <section className="w-full bg-white px-margin-mobile py-8 md:px-margin-desktop md:py-10">
      <div className="max-w-container-max mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display-md text-display-md-mobile md:text-display-md text-slate-deep font-bold">
            Blog posts
          </h2>
          <Link to="#" className="text-body-md text-slate-deep underline hover:text-sage-haze font-medium transition-colors">
            Xem tất cả
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button 
            onClick={() => setActiveCategory('Tất cả')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeCategory === 'Tất cả' 
                ? 'bg-sage-haze text-linen-white' 
                : 'bg-bone text-slate-deep hover:bg-sage-haze/80 hover:text-linen-white'
            }`}
          >
            Tất cả
          </button>
          {CATEGORIES.map((cat, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat 
                  ? 'bg-sage-haze text-linen-white' 
                  : 'bg-bone text-slate-deep hover:bg-sage-haze/80 hover:text-linen-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards Grid (Horizontal Scroll) */}
        {filteredBlogs.length > 0 ? (
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 no-scrollbar cursor-pointer"
          >
            {filteredBlogs.map((blog) => (
              <Link to={`/blog/${blog.id}`} key={blog.id} className="flex-none w-[85vw] sm:w-[350px] snap-center md:snap-start flex flex-col group h-auto">
                {/* Image */}
                <div className="w-full h-56 rounded-2xl overflow-hidden mb-4 relative flex-shrink-0">
                  <img 
                    src={blog.img} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* Content */}
                <div className="flex-grow flex flex-col p-4 bg-[#F8F9FB] rounded-2xl group-hover:bg-bone transition-colors duration-300">
                  <h3 className="text-body-lg text-slate-deep font-bold leading-tight mb-3 line-clamp-3">
                    {blog.title}
                  </h3>
                  <p className="text-body-md text-slate-deep/70 line-clamp-3 mt-auto">
                    {blog.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-deep/60 py-10">Chưa có bài viết nào trong danh mục này.</p>
        )}

        {/* Dynamic Progress Bar indicator */}
        <div className="w-full h-1 bg-bone mt-6 relative rounded-full overflow-hidden hidden md:block">
          <div 
            className="absolute top-0 h-full bg-slate-deep rounded-full transition-all duration-300 ease-out"
            style={{ 
              left: `${scrollProgress * 0.75}%`, 
              width: '25%' 
            }}
          ></div>
        </div>
      </div>
    </section>
  );
}
