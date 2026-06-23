import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const MOCK_ARTICLE = {
  id: 1,
  title: 'Hướng Dẫn Unboxing Nệm Hybrid Silkmoon Từ A Đến Z',
  category: 'Sản phẩm',
  date: 'Thg 06 13, 2026',
  author: 'Brand Silkmoon',
  readTime: '5 phút đọc',
  heroImg: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=2000',
  content: `
    <p class="lead">Chào mừng bạn đã trở thành một phần của cộng đồng những người trân trọng giấc ngủ ngon cùng Silkmoon! Cầm trên tay chiếc hộp nệm Hybrid Silkmoon, chắc hẳn bạn đang rất háo hức muốn trải nghiệm ngay. Bài viết này sẽ hướng dẫn bạn từng bước một để mở hộp và thiết lập chiếc nệm mới của mình một cách hoàn hảo nhất.</p>
    
    <h2>1. Chuẩn bị trước khi mở hộp</h2>
    <p>Trước khi bắt đầu, hãy đảm bảo bạn đã đưa chiếc hộp vào đúng căn phòng bạn muốn đặt nệm. Hộp nệm Silkmoon được thiết kế thông minh để tối ưu hóa việc di chuyển, nhưng sau khi mở nệm, kích thước của nó sẽ khôi phục lại nguyên bản, khiến việc di chuyển giữa các phòng trở nên khó khăn hơn.</p>
    <img src="https://images.unsplash.com/photo-1520699049698-acd2fce18736?auto=format&fit=crop&q=80&w=1200" alt="Hộp nệm" />
    <p>Dọn sẵn một bề mặt phẳng, lý tưởng nhất là khung giường của bạn (giường nan bệt hoặc giường phản phẳng). Không dùng dao rọc giấy quá dài hoặc kéo có mũi nhọn dài để tránh làm rách lớp vải áo nệm bên trong.</p>

    <h2>2. Bắt đầu quá trình "Unboxing"</h2>
    <p>Quá trình bung nệm thường mang lại cảm giác rất "thỏa mãn". Bạn hãy làm theo các bước sau:</p>
    <ul>
      <li><strong>Mở hộp carton:</strong> Dùng kéo cắt cẩn thận lớp băng dính bên ngoài. Bên trong, bạn sẽ thấy chiếc nệm được cuộn tròn và hút chân không siêu gọn.</li>
      <li><strong>Kéo nệm ra ngoài:</strong> Đặt hộp nằm ngang, sau đó nắm nhẹ lớp nilon bên ngoài và từ từ kéo cuộn nệm ra đặt lên khung giường.</li>
      <li><strong>Cắt lớp nilon bảo vệ:</strong> Silkmoon cung cấp sẵn một công cụ cắt an toàn (nằm bên trong hộp). Dùng công cụ này để cắt dọc theo lớp nilon bọc ngoài cùng. Tuyệt đối không dùng dao rọc giấy!</li>
    </ul>

    <blockquote>
      "Lưu ý: Ngay khi lớp nilon bên trong bị chọc thủng, không khí sẽ ùa vào và nệm bắt đầu phồng lên. Đây là lúc thú vị nhất!"
    </blockquote>

    <h2>3. Chờ nệm bung nở hoàn toàn</h2>
    <p>Nệm Hybrid của Silkmoon với hệ thống lò xo túi độc lập kết hợp cao su thiên nhiên sẽ cần thời gian để "thở" và lấy lại form dáng chuẩn xác 100%. Thông thường, nệm sẽ bung lên 80% trong vòng 10 phút đầu tiên, nhưng để đạt độ cứng và kích thước hoàn hảo, bạn nên chờ từ 24 đến 72 giờ.</p>
    <img src="https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=1200" alt="Nệm bung nở" />

    <h2>4. Xử lý mùi (Nếu có)</h2>
    <p>Sản phẩm nệm mới khi vừa tháo lớp hút chân không có thể mang theo một chút "mùi nệm mới". Đây là mùi hoàn toàn bình thường từ các vật liệu mới và không gây hại. Để mùi này bay đi nhanh chóng, bạn nên mở cửa sổ cho phòng thông thoáng, bật quạt gió hướng ra ngoài.</p>
    <p>Sau khi chờ đủ thời gian, hãy bọc lên chiếc nệm một bộ ga giường lụa Tencel thật êm ái. Chúc bạn có những đêm ngon giấc tuyệt vời nhất cùng Silkmoon!</p>
  `
};

const RELATED_POSTS = [
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

export default function BlogDetail() {
  const { id } = useParams();
  // In a real app, you'd fetch the article using the ID. Here we use MOCK_ARTICLE.
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="bg-linen-white min-h-screen pt-24 md:pt-32 pb-16">
      <article className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop">
        
        {/* Header */}
        <header className="mb-10 text-center animate-fade-in-up">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-sage-haze/20 text-sage-haze font-semibold text-xs rounded-full uppercase tracking-widest">
              {MOCK_ARTICLE.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display-md font-bold text-slate-deep leading-tight mb-6">
            {MOCK_ARTICLE.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-deep/70 font-medium">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">person</span> {MOCK_ARTICLE.author}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span> {MOCK_ARTICLE.date}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">schedule</span> {MOCK_ARTICLE.readTime}
            </span>
          </div>
        </header>

        {/* Hero Image */}
        <div className="rounded-2xl overflow-hidden mb-12 shadow-lg animate-fade-in aspect-video md:aspect-[21/9]">
          <img src={MOCK_ARTICLE.heroImg} alt={MOCK_ARTICLE.title} className="w-full h-full object-cover" />
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg md:prose-xl prose-slate max-w-3xl mx-auto prose-img:rounded-xl prose-img:shadow-md prose-headings:font-display-md prose-headings:text-slate-deep prose-a:text-sage-haze hover:prose-a:text-sage-haze/80 prose-blockquote:border-l-sage-haze prose-blockquote:bg-sage-haze/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:font-medium prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: MOCK_ARTICLE.content }}
        />

        {/* Share & Tags */}
        <div className="max-w-3xl mx-auto mt-16 pt-8 border-t border-slate-deep/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <span className="text-slate-deep/70 font-medium text-sm mr-2 mt-1">Tags:</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded text-sm text-slate-deep hover:border-sage-haze cursor-pointer transition-colors">Nệm Cao Su</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded text-sm text-slate-deep hover:border-sage-haze cursor-pointer transition-colors">Kinh Nghiệm</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-deep/70 font-medium text-sm">Chia sẻ:</span>
            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-deep hover:bg-slate-50 transition-colors">
              <span className="font-bold">f</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-deep hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">link</span>
            </button>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-24">
        <h3 className="text-2xl font-display-md font-bold text-slate-deep mb-8 border-l-4 border-sage-haze pl-4">
          Bài viết liên quan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RELATED_POSTS.map(post => (
            <Link to={`/blog/${post.id}`} key={post.id} className="group block">
              <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4">
                <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <h4 className="font-bold text-slate-deep group-hover:text-sage-haze transition-colors line-clamp-2 leading-snug">
                {post.title}
              </h4>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
