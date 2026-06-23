import React, { useState } from 'react';

const INITIAL_REVIEWS = [
  {
    id: 1,
    name: 'taixexe@',
    date: '04/14/2026',
    rating: 5,
    title: 'Cân nhắc mua',
    content: 'nếu thích cảm giác nằm chắc chắn thì nên cân nhắc',
    images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?auto=format&fit=crop&q=80&w=200']
  },
  {
    id: 2,
    name: 'ngochai.nguyen',
    date: '04/13/2026',
    rating: 5,
    title: 'Chất lượng tuyệt vời',
    content: 'Chất liệu rất xịn, nằm vô cùng mát và mượt mà. Giấc ngủ được cải thiện rõ rệt từ ngày dùng ga lụa này.',
    images: []
  }
];

export default function ProductReviews() {
  const [sort, setSort] = useState('newest');
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [filter, setFilter] = useState('all');
  const [isWriting, setIsWriting] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'image') return review.images && review.images.length > 0;
    return review.rating === parseInt(filter);
  }).sort((a, b) => {
    if (sort === 'newest') return new Date(b.date) - new Date(a.date);
    if (sort === 'oldest') return new Date(a.date) - new Date(b.date);
    if (sort === 'highest') return b.rating - a.rating;
    if (sort === 'lowest') return a.rating - b.rating;
    return 0;
  });

  // Helper to render stars
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={`material-symbols-outlined text-lg ${i < rating ? 'text-yellow-400' : 'text-slate-200'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
        star
      </span>
    ));
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    const newReview = {
      id: Date.now(),
      name: 'Người dùng ẩn danh',
      date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      rating: 5,
      title: 'Đánh giá mới',
      content: newReviewText,
      images: []
    };

    setReviews([newReview, ...reviews]);
    setNewReviewText('');
    setIsWriting(false);
  };

  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16">
      <h2 className="text-3xl font-display-md font-bold text-slate-deep text-center mb-10">
        Đánh giá của Khách hàng
      </h2>

      {/* Summary Board */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-16 pb-12 border-b border-slate-deep/10">
        
        {/* Average Rating */}
        <div className="text-center shrink-0">
          <div className="flex items-center justify-center gap-1 mb-2">
            {renderStars(5)}
            <span className="ml-2 text-lg font-bold text-slate-deep underline decoration-1 underline-offset-4 whitespace-nowrap">
              4.94 trên 5
            </span>
          </div>
          <p className="text-sm text-slate-deep/70 whitespace-nowrap">
            Dựa trên {reviews.length + 16} đánh giá <span className="material-symbols-outlined text-[16px] text-sage-haze align-middle">verified</span>
          </p>
        </div>

        {/* Rating Bars */}
        <div className="w-full max-w-[250px] md:max-w-[300px] space-y-2 shrink-0">
          {[
            { stars: 5, count: reviews.length + 15, percent: 94 },
            { stars: 4, count: 1, percent: 6 },
            { stars: 3, count: 0, percent: 0 },
            { stars: 2, count: 0, percent: 0 },
            { stars: 1, count: 0, percent: 0 },
          ].map((row) => (
            <div key={row.stars} className="flex items-center gap-3 text-sm">
              <div className="flex gap-0.5 text-yellow-400 w-24 justify-end shrink-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: i < row.stars ? "'FILL' 1" : "'FILL' 0" }}>
                    star
                  </span>
                ))}
              </div>
              <div className="flex-1 h-3 bg-slate-100 rounded-sm overflow-hidden">
                <div className="h-full bg-slate-deep rounded-sm" style={{ width: `${row.percent}%` }}></div>
              </div>
              <div className="w-6 text-slate-500 text-right shrink-0">{row.count}</div>
            </div>
          ))}
        </div>

        {/* Write Review Button */}
        <div className="shrink-0">
          <button 
            onClick={() => setIsWriting(!isWriting)}
            className="bg-slate-deep text-white font-medium px-8 py-3 rounded hover:bg-sage-haze transition-colors shadow-sm whitespace-nowrap"
          >
            {isWriting ? 'Hủy đánh giá' : 'Viết đánh giá'}
          </button>
        </div>

      </div>

      {/* Write Review Form */}
      {isWriting && (
        <div className="bg-bone p-6 md:p-8 rounded-xl my-8 border border-slate-deep/5 animate-fade-in-up">
          <h3 className="font-bold text-slate-deep text-xl mb-4">Trải nghiệm của bạn với sản phẩm này thế nào?</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="flex gap-2 mb-4">
              <span className="text-sm font-medium text-slate-deep/70">Đánh giá của bạn:</span>
              <div className="flex text-yellow-400 cursor-pointer">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
            </div>
            <textarea 
              className="w-full p-4 rounded-lg border border-slate-deep/20 focus:outline-none focus:ring-2 focus:ring-sage-haze resize-none mb-4 bg-white" 
              rows="4" 
              placeholder="Chia sẻ cảm nhận của bạn để giúp những người mua sau có cái nhìn tốt hơn..."
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              required
            ></textarea>
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsWriting(false)}
                className="px-6 py-2 rounded text-slate-deep border border-slate-deep/20 hover:bg-slate-deep/5 transition-colors font-medium"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 rounded bg-sage-haze text-white font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                Gửi đánh giá
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: '5', label: '5 Sao' },
              { id: '4', label: '4 Sao' },
              { id: '3', label: '3 Sao' },
              { id: '2', label: '2 Sao' },
              { id: '1', label: '1 Sao' },
              { id: 'image', label: 'Có hình ảnh' },
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${filter === f.id ? 'bg-slate-deep text-white border-slate-deep' : 'bg-white text-slate-deep border-slate-deep/20 hover:border-slate-deep/50'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative flex items-center shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-transparent text-slate-deep font-medium text-sm cursor-pointer border-b border-transparent hover:border-sage-haze hover:text-sage-haze pb-0.5 transition-colors pr-6 outline-none"
            >
              <option value="newest">Gần đây nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest">Đánh giá cao nhất</option>
              <option value="lowest">Đánh giá thấp nhất</option>
            </select>
            <span className="material-symbols-outlined text-slate-deep text-[18px] absolute right-0 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Review Items */}
        <div className="space-y-8">
          {filteredReviews.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Không có đánh giá nào phù hợp với bộ lọc này.</p>
          ) : (
            filteredReviews.map((review) => (
            <div key={review.id} className="pb-8 border-b border-slate-deep/5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex gap-1 mb-2">
                    {renderStars(review.rating)}
                  </div>
                  <div className="flex items-center gap-2 text-sage-haze font-medium text-sm">
                    <span className="material-symbols-outlined text-[18px]">person_outline</span>
                    {review.name}
                  </div>
                </div>
                <div className="text-slate-400 text-sm">{review.date}</div>
              </div>
              
              <h4 className="font-bold text-slate-deep mb-2">{review.title}</h4>
              <p className="text-slate-deep/80 text-sm mb-4 leading-relaxed">{review.content}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="flex gap-3">
                  {review.images.map((img, index) => (
                    <img key={index} src={img} alt="Review" className="w-20 h-20 object-cover rounded border border-slate-200 cursor-pointer hover:opacity-90" />
                  ))}
                </div>
              )}
            </div>
          )))}
        </div>
      </div>
    </section>
  );
}
