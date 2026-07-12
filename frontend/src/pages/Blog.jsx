import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { blogApi, settingsApi } from "../services/api";

export default function Blog() {
  const location = useLocation();
  const [posts, setPosts] = useState([]),
    [categories, setCategories] = useState([]),
    [videos, setVideos] = useState([]),
    [active, setActive] = useState("all");
  useEffect(() => {
    blogApi.getPosts().then(setPosts);
    blogApi.getCategories().then((items) => {
      setCategories(items);
      if (new URLSearchParams(location.search).get("type") === "care") {
        const careCategory = items.find((category) => category.slug === "huong-dan-cham-soc");
        if (careCategory) setActive(careCategory._id);
      }
    });
    settingsApi
      .get("website_content")
      .then((setting) =>
        setVideos(
          (setting?.value?.blogVideos || []).filter(
            (video) => video.isActive !== false,
          ),
        ),
      )
      .catch(() => setVideos([]));
  }, [location.search]);
  const visible = useMemo(() => {
    const items = Array.isArray(posts) ? posts : [];
    return active === "all"
      ? items
      : items.filter((post) => post.categoryId === active);
  }, [posts, active]);
  const featured =
    visible.find((post) => post.layout === "featured") || visible[0];
  const subPosts = visible
    .filter((post) => post._id !== featured?._id)
    .slice(0, 3);
  const popularMain =
    visible.find((post) => post.layout === "editorial") || visible[1];
  const popularList = visible
    .filter(
      (post) => post._id !== featured?._id && post._id !== popularMain?._id,
    )
    .slice(0, 3);
  return (
    <main className="pt-32 pb-20 bg-white min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-sm text-slate-deep/70 mb-4">
          <Link to="/">Trang chủ</Link>
          <span className="mx-2">›</span>
          <strong>Cẩm nang</strong>
        </div>
        <h1 className="mb-5 text-3xl font-bold text-slate-deep md:text-4xl">
          Cẩm nang
        </h1>
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            className={`old-blog-chip ${active === "all" ? "active" : ""}`}
            onClick={() => setActive("all")}
          >
            Tất cả
          </button>
          {categories
            .filter((c) => c.isActive !== false)
            .map((category) => (
              <button
                key={category._id}
                className={`old-blog-chip ${active === category._id ? "active" : ""}`}
                onClick={() => setActive(category._id)}
              >
                {category.name}
              </button>
            ))}
        </div>
        {featured && (
          <section className="mb-8">
            <Link
              to={`/blog/${featured.slug}`}
              className="flex flex-col md:flex-row bg-[#EAF2F8] rounded-2xl overflow-hidden mb-6 group"
            >
              <div className="w-full md:w-[65%] h-64 md:h-[450px] overflow-hidden">
                <img
                  src={featured.featuredImage}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="w-full md:w-[35%] p-8 flex flex-col justify-center">
                <h2 className="text-xl md:text-2xl font-bold text-slate-deep mb-4 leading-snug">
                  {featured.title}
                </h2>
                <p className="text-slate-deep/80 leading-relaxed mb-6">
                  {featured.excerpt}
                </p>
                <div className="text-xs text-slate-deep/60 mt-auto">
                  {featured.author} ·{" "}
                  {new Date(
                    featured.publishedAt || featured.createdAt,
                  ).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subPosts.map((post) => (
                <Link
                  to={`/blog/${post.slug}`}
                  key={post._id}
                  className="group"
                >
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-bone">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-bold text-slate-deep leading-snug">
                    {post.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
        {popularMain && (
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-deep mb-8">
              Bài viết được quan tâm nhiều nhất
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Link to={`/blog/${popularMain.slug}`} className="group">
                <div className="h-[300px] md:h-[400px] rounded-2xl overflow-hidden mb-5">
                  <img
                    src={popularMain.featuredImage}
                    alt={popularMain.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-deep mb-3">
                  {popularMain.title}
                </h3>
                <p className="text-slate-deep/70 text-sm leading-relaxed">
                  {popularMain.excerpt}
                </p>
              </Link>
              <div className="flex flex-col justify-between gap-6">
                {popularList.map((post) => (
                  <Link
                    to={`/blog/${post.slug}`}
                    key={post._id}
                    className="flex flex-col sm:flex-row gap-5 group"
                  >
                    <div className="w-full sm:w-[220px] aspect-[4/3] shrink-0 rounded-2xl overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-slate-deep mb-2">
                        {post.title}
                      </h4>
                      <p className="text-slate-deep/70 text-sm line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
        {videos.length > 0 && (
          <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-[#A7E4CD] rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
              <h2 className="text-3xl font-bold text-slate-deep mb-4">
                Videos
              </h2>
              <span className="px-5 py-1.5 rounded-full border border-slate-deep text-sm">
                Xem toàn bộ
              </span>
            </div>
            {videos.slice(0, 3).map((video) => (
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                key={video.id}
                className="relative rounded-2xl overflow-hidden min-h-[300px] group"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title || "Video"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-6xl">
                    play_circle
                  </span>
                  {video.title && (
                    <span className="absolute bottom-5 left-5 right-5 text-white font-bold drop-shadow">
                      {video.title}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
