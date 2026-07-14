import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { blogApi } from '../services/api';

export default function BlogPosts() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    Promise.all([blogApi.getPosts(), blogApi.getCategories()])
      .then(([postItems, categoryItems]) => {
        setPosts(Array.isArray(postItems) ? postItems : []);
        setCategories(Array.isArray(categoryItems) ? categoryItems : []);
      })
      .catch((error) => {
        console.error('Không thể tải bài viết trang chủ', error);
        setPosts([]);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.isActive !== false && posts.some((post) => post.categoryId === category._id)),
    [categories, posts],
  );
  const filteredBlogs = activeCategory === 'all'
    ? posts
    : posts.filter((post) => post.categoryId === activeCategory);

  const selectCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setScrollProgress(0);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    setScrollProgress(maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0);
  };

  return (
    <section className="w-full bg-white px-margin-mobile py-8 md:px-margin-desktop md:py-10">
      <div className="max-w-container-max mx-auto">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display-md text-display-md-mobile md:text-display-md text-slate-deep font-bold">
            Blog posts
          </h2>
          <Link to="/blog" className="text-body-md text-slate-deep underline hover:text-sage-haze font-medium transition-colors">
            Xem tất cả
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => selectCategory('all')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeCategory === 'all'
                ? 'bg-sage-haze text-linen-white'
                : 'bg-bone text-slate-deep hover:bg-sage-haze/80 hover:text-linen-white'
            }`}
          >
            Tất cả
          </button>
          {visibleCategories.map((category) => (
            <button
              key={category._id}
              onClick={() => selectCategory(category._id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === category._id
                  ? 'bg-sage-haze text-linen-white'
                  : 'bg-bone text-slate-deep hover:bg-sage-haze/80 hover:text-linen-white'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-10 text-slate-deep/60">Đang tải bài viết…</p>
        ) : filteredBlogs.length > 0 ? (
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 no-scrollbar cursor-pointer"
          >
            {filteredBlogs.map((post) => (
              <Link to={`/blog/${post.slug}`} key={post._id || post.slug} className="flex-none w-[85vw] sm:w-[350px] snap-center md:snap-start flex flex-col group h-auto">
                <div className="w-full h-56 rounded-2xl overflow-hidden mb-4 relative flex-shrink-0 bg-bone">
                  {post.featuredImage && (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="flex-grow flex flex-col p-4 bg-[#F8F9FB] rounded-2xl group-hover:bg-bone transition-colors duration-300">
                  <h3 className="type-card-title text-body-lg text-slate-deep font-bold leading-tight mb-3 line-clamp-3">
                    {post.title}
                  </h3>
                  <p className="type-card-body text-body-md text-slate-deep/70 line-clamp-3 mt-auto">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-deep/60 py-10">Chưa có bài viết nào trong danh mục này.</p>
        )}

        <div className="w-full h-1 bg-bone mt-6 relative rounded-full overflow-hidden hidden md:block">
          <div
            className="absolute top-0 h-full bg-slate-deep rounded-full transition-all duration-300 ease-out"
            style={{ left: `${scrollProgress * 0.75}%`, width: '25%' }}
          />
        </div>
      </div>
    </section>
  );
}
