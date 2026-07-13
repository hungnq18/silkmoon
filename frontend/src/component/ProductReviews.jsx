import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { reviewsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProductReviews({ productId }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sort, setSort] = useState('newest');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isWriting, setIsWriting] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    reviewsApi.getByProduct(productId)
      .then((data) => setReviews(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (location.hash === '#reviews') {
      window.setTimeout(() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [location.hash, productId]);

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'image') return review.images && review.images.length > 0;
    return review.rating === parseInt(filter);
  }).sort((a, b) => {
    if (sort === 'newest') return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    if (sort === 'oldest') return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date);
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim() || !productId) return;
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newReview = await reviewsApi.create({
        productId,
        rating: newRating,
        title: newReviewText.slice(0, 20) + (newReviewText.length > 20 ? '...' : ''),
        content: newReviewText,
        images: []
      });
      setReviews([newReview, ...reviews]);
      setNewReviewText('');
      setNewRating(5);
      setIsWriting(false);
    } catch {
      setSubmitError('Không thể gửi đánh giá. Phiên đăng nhập có thể đã hết hạn, anh/chị vui lòng đăng nhập lại.');
      setShowLoginModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="mx-auto max-w-container-max px-margin-mobile py-8 md:px-margin-desktop md:py-10">
      <h2 className="mb-6 text-center font-display-md text-3xl font-bold text-slate-deep">
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
            Dựa trên {reviews.length} đánh giá <span className="material-symbols-outlined text-[16px] text-sage-haze align-middle">verified</span>
          </p>
        </div>

        {/* Rating Bars */}
        <div className="w-full max-w-[250px] md:max-w-[300px] space-y-2 shrink-0">
          {[
            { stars: 5, count: reviews.filter(r => r.rating === 5).length, percent: reviews.length ? (reviews.filter(r => r.rating === 5).length / reviews.length) * 100 : 0 },
            { stars: 4, count: reviews.filter(r => r.rating === 4).length, percent: reviews.length ? (reviews.filter(r => r.rating === 4).length / reviews.length) * 100 : 0 },
            { stars: 3, count: reviews.filter(r => r.rating === 3).length, percent: reviews.length ? (reviews.filter(r => r.rating === 3).length / reviews.length) * 100 : 0 },
            { stars: 2, count: reviews.filter(r => r.rating === 2).length, percent: reviews.length ? (reviews.filter(r => r.rating === 2).length / reviews.length) * 100 : 0 },
            { stars: 1, count: reviews.filter(r => r.rating === 1).length, percent: reviews.length ? (reviews.filter(r => r.rating === 1).length / reviews.length) * 100 : 0 },
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
            onClick={() => user ? setIsWriting(!isWriting) : setShowLoginModal(true)}
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
                  <span 
                    key={i} 
                    onClick={() => setNewRating(i + 1)}
                    className="material-symbols-outlined hover:scale-110 transition-transform" 
                    style={{ fontVariationSettings: i < newRating ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
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
                disabled={isSubmitting}
                className="px-6 py-2 rounded bg-sage-haze text-white font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
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
                    {review.user?.fullName || review.name || 'Người dùng ẩn danh'}
                  </div>
                </div>
                <div className="text-slate-400 text-sm">
                  {new Date(review.createdAt || review.date).toLocaleDateString('vi-VN')}
                </div>
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
      {showLoginModal && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-deep/55 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="review-login-title" onMouseDown={(event) => event.target === event.currentTarget && setShowLoginModal(false)}>
        <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl md:p-9">
          <div className="flex items-start justify-between gap-5"><div><span className="material-symbols-outlined text-4xl text-secondary">account_circle</span><h3 id="review-login-title" className="mt-3 text-2xl font-semibold text-slate-deep">Đăng nhập để đánh giá</h3></div><button type="button" onClick={() => setShowLoginModal(false)} className="rounded-full p-2 text-slate-deep/60 hover:bg-bone" aria-label="Đóng"><span className="material-symbols-outlined">close</span></button></div>
          <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{submitError || 'Anh/chị cần đăng nhập để gửi đánh giá sản phẩm. Sau khi đăng nhập, hệ thống sẽ đưa anh/chị quay lại đúng sản phẩm này.'}</p>
          <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setShowLoginModal(false)} className="rounded-md border border-slate-deep/20 px-5 py-3 text-sm font-semibold text-slate-deep">Để sau</button><button type="button" onClick={() => navigate(`/account?redirect=${encodeURIComponent(`${location.pathname}${location.search}#reviews`)}`)} className="rounded-md bg-slate-deep px-5 py-3 text-sm font-semibold text-white">Đi đến đăng nhập</button></div>
        </div>
      </div>}
    </section>
  );
}
