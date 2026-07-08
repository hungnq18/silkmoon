import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = ['Bạn có biết', 'Sản phẩm Silkmoon', 'Mẹo hay', 'Không gian sống'];

const FEATURED_POST = {
  id: 1,
  title: 'Hướng Dẫn Unboxing Nệm Hybrid Silkmoon Từ A Đến Z',
  desc: 'Để bạn không còn bối rối khi vừa nhận nệm Hybrid Silkmoon và chưa biết bắt đầu từ đâu, bài viết này sẽ hướng dẫn chi tiết từng bước unboxing...',
  date: 'Thg 06 13, 2026',
  author: 'Brand Silkmoon',
  img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=1200'
};

const SUB_POSTS = [
  {
    id: 2,
    title: 'Nệm 20 Triệu Không Đắt, Nệm 3 Triệu Mới Đắt? Sự Thật Về Nệm Tốt',
    img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 3,
    title: 'Dù Nóng Vẫn Ôm Gối Đắp Chăn Ngủ? Giải Đáp Về "Áp Lực Chạm Sâu"',
    img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 4,
    title: 'Nệm Silkmoon Nest Hay Original? Hướng Dẫn Chọn Chính Xác Trong 45 Giây',
    img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=600'
  }
];

const POPULAR_MAIN = {
  id: 5,
  title: 'Hướng Dẫn Unboxing Nệm Hybrid Silkmoon Từ A Đến Z',
  desc: 'Để bạn không còn bối rối khi vừa nhận nệm Hybrid Silkmoon và chưa biết bắt đầu từ đâu, bài viết này sẽ hướng dẫn chi tiết từng bước unboxing...',
  img: 'https://images.unsplash.com/photo-1520699049698-acd2fce18736?auto=format&fit=crop&q=80&w=800'
};

const POPULAR_LIST = [
  {
    id: 6,
    title: 'Nệm 20 Triệu Không Đắt, Nệm 3 Triệu Mới Đắt? Sự Thật Về Nệm Tốt',
    desc: 'Để bạn không còn băn khoăn giữa một chiếc nệm giá vài triệu và một chiếc nệm có mức đầu...',
    img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 7,
    title: 'Dù Nóng Vẫn Ôm Gối Đắp Chăn Ngủ? Giải Đáp Về "Áp Lực Chạm Sâu"',
    desc: 'Để bạn không còn thắc mắc vì sao mình vẫn thích đắp chăn hay ôm gối ngay cả trong những...',
    img: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 8,
    title: 'Nệm Silkmoon Nest Hay Original? Hướng Dẫn Chọn Chính Xác Trong 45 Giây (2026)',
    desc: 'Để bạn không mất thời gian phân vân, bài viết này tổng hợp minh bạch cấu trúc, cảm giác nằm,...',
    img: 'https://images.unsplash.com/photo-1615876234886-fd1a88c44db7?auto=format&fit=crop&q=80&w=400'
  }
];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  return (
    <div className="pt-32 pb-20 bg-white min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        
        {/* Breadcrumb */}
        <div className="text-sm font-body-sm text-slate-deep/70 mb-4 flex items-center gap-2">
          <Link to="/" className="hover:text-sage-haze transition-colors">Trang chủ</Link>
          <span>›</span>
          <span className="font-semibold text-slate-deep">Cẩm nang</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-display-md font-bold text-[#1E293B] mb-8">
          Cẩm nang
        </h1>

        {/* Categories / Filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          {CATEGORIES.map((cat, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat 
                  ? 'bg-[#FDF2EC] text-slate-deep shadow-sm' 
                  : 'bg-[#F8F9FB] text-slate-deep hover:bg-sage-haze/10'
              }`}
              style={activeCategory === cat ? { backgroundColor: '#FBE8E0' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- HERO SECTION --- */}
        <div className="mb-16">
          {/* Main Featured Post */}
          <Link to={`/blog/${FEATURED_POST.id}`} className="flex flex-col md:flex-row bg-[#EAF2F8] rounded-2xl overflow-hidden mb-6 cursor-pointer group">
            <div className="w-full md:w-[65%] h-64 md:h-[450px] relative overflow-hidden">
              <img 
                src={FEATURED_POST.img} 
                alt={FEATURED_POST.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="w-full md:w-[35%] p-8 flex flex-col justify-center">
              <h2 className="text-xl md:text-2xl font-bold text-slate-deep mb-4 leading-snug group-hover:text-sage-haze transition-colors">
                {FEATURED_POST.title}
              </h2>
              <p className="text-slate-deep/80 text-sm md:text-base leading-relaxed mb-6">
                {FEATURED_POST.desc}
              </p>
              <div className="text-xs text-slate-deep/60 mt-auto font-medium">
                {FEATURED_POST.date} <span className="mx-2">•</span> {FEATURED_POST.author}
              </div>
            </div>
          </Link>

          {/* Sub Posts (3 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUB_POSTS.map(post => (
              <Link to={`/blog/${post.id}`} key={post.id} className="flex flex-col cursor-pointer group">
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 relative bg-bone">
                  <img 
                    src={post.img} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-bold text-slate-deep leading-snug group-hover:text-sage-haze transition-colors">
                  {post.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>

        {/* --- POPULAR SECTION --- */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-deep mb-8">
            Bài viết được quan tâm nhiều nhất
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left: Large Vertical Card */}
            <Link to={`/blog/${POPULAR_MAIN.id}`} className="flex flex-col cursor-pointer group">
              <div className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden mb-5 bg-bone">
                <img 
                  src={POPULAR_MAIN.img} 
                  alt={POPULAR_MAIN.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-deep mb-3 leading-snug group-hover:text-sage-haze transition-colors">
                {POPULAR_MAIN.title}
              </h3>
              <p className="text-slate-deep/70 text-sm leading-relaxed">
                {POPULAR_MAIN.desc}
              </p>
            </Link>

            {/* Right: List of Horizontal Cards */}
            <div className="flex flex-col justify-between gap-6 lg:gap-0">
              {POPULAR_LIST.map((post, index) => (
                <Link to={`/blog/${post.id}`} key={post.id} className="flex flex-col sm:flex-row gap-5 cursor-pointer group pb-6 lg:pb-0 border-b border-slate-deep/5 lg:border-none last:border-none">
                  <div className="w-full sm:w-[220px] aspect-[16/10] sm:aspect-[4/3] flex-shrink-0 rounded-2xl overflow-hidden bg-bone">
                    <img 
                      src={post.img} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <h4 className="font-bold text-slate-deep leading-snug mb-2 group-hover:text-sage-haze transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-slate-deep/70 text-sm leading-relaxed line-clamp-2 md:line-clamp-3">
                      {post.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </div>

        {/* --- VIDEOS SECTION --- */}
        <div className="mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Title Card */}
            <div className="bg-[#A7E4CD] rounded-2xl p-8 flex flex-col items-center justify-center text-center aspect-square md:aspect-auto min-h-[250px] sm:min-h-[300px]">
              <h2 className="text-3xl font-bold text-slate-deep mb-4">Videos</h2>
              <button className="px-5 py-1.5 rounded-full border border-slate-deep text-slate-deep text-sm font-medium hover:bg-slate-deep hover:text-white transition-colors">
                Xem toàn bộ
              </button>
            </div>

            {/* Video Cards */}
            {[
              { id: 1, img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=600' },
              { id: 2, img: 'https://images.unsplash.com/photo-1512151604085-79d5012e6988?auto=format&fit=crop&q=80&w=600' },
              { id: 3, img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600' }
            ].map(video => (
              <div key={video.id} className="relative rounded-2xl overflow-hidden group cursor-pointer aspect-square md:aspect-auto min-h-[250px] sm:min-h-[300px] bg-bone">
                <img 
                  src={video.img} 
                  alt="Video thumbnail"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-6xl opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-md font-light">
                    play_circle
                  </span>
                </div>
              </div>
            ))}
            
          </div>
        </div>

      </div>
    </div>
  );
}
