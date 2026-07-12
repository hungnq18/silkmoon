import { createElement, useMemo } from "react";
const allowed = new Set([
  "p",
  "h2",
  "h3",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "br",
  "a",
  "div",
  "center",
  "img",
]);
function SafeArticle({ html }) {
  const nodes = useMemo(() => {
    if (!html) return null;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const walk = (n, k) => {
      if (n.nodeType === Node.TEXT_NODE) return n.textContent;
      if (n.nodeType !== Node.ELEMENT_NODE) return null;
      const tag = n.tagName.toLowerCase(),
        children = [...n.childNodes].map((c, i) => walk(c, `${k}-${i}`));
      if (!allowed.has(tag)) return children;
      const props = { key: k };
      if (tag === "a") {
        const href = n.getAttribute("href") || "";
        if (!href.startsWith("https://")) return children;
        Object.assign(props, {
          href,
          target: "_blank",
          rel: "noopener noreferrer",
        });
      }
      if (tag === "img") {
        const src = n.getAttribute("src") || "";
        if (!src.startsWith("https://")) return null;
        Object.assign(props, {
          src,
          alt: n.getAttribute("alt") || "Hình ảnh bài viết Silkmoon",
          loading: "lazy",
        });
      }
      return createElement(tag, props, children);
    };
    return [...doc.body.childNodes].map((n, i) => walk(n, `article-${i}`));
  }, [html]);
  return <div className="blog-article-content">{nodes}</div>;
}
function Header({ post, category }) {
  return (
    <header className="blog-detail-header">
      <span>{category?.name || "Cẩm nang"}</span>
      <h1>{post.title}</h1>
      <p>{post.excerpt}</p>
      <small>
        {post.author} ·{" "}
        {new Date(post.publishedAt || post.createdAt).toLocaleDateString(
          "vi-VN",
        )}
      </small>
    </header>
  );
}
const Cover = ({ post }) =>
  post.featuredImage ? (
    <img
      className="blog-detail-cover"
      src={post.featuredImage}
      alt={post.title}
    />
  ) : null;
export function StandardLayout({ post, category }) {
  return (
    <article className="blog-layout standard">
      <Header post={post} category={category} />
      <Cover post={post} />
      <SafeArticle html={post.content} />
    </article>
  );
}
export function FeaturedLayout({ post, category }) {
  return (
    <article className="blog-layout featured">
      <div className="featured-hero">
        <Cover post={post} />
        <Header post={post} category={category} />
      </div>
      <SafeArticle html={post.content} />
    </article>
  );
}
export function EditorialLayout({ post, category }) {
  return (
    <article className="blog-layout editorial">
      <Header post={post} category={category} />
      <Cover post={post} />
      <SafeArticle html={post.content} />
    </article>
  );
}
export function GuideLayout({ post, category }) {
  return (
    <article className="blog-layout guide">
      <Header post={post} category={category} />
      <Cover post={post} />
      <div className="guide-label">HƯỚNG DẪN TỪNG BƯỚC</div>
      <SafeArticle html={post.content} />
    </article>
  );
}
export function SplitLayout({ post, category }) {
  return (
    <article className="blog-layout split">
      <div className="split-hero">
        <Cover post={post} />
        <Header post={post} category={category} />
      </div>
      <SafeArticle html={post.content} />
    </article>
  );
}
export function GalleryLayout({ post, category }) {
  const images = [post.featuredImage, ...(post.galleryImages || [])].filter(
    Boolean,
  );
  return (
    <article className="blog-layout gallery">
      <Header post={post} category={category} />
      <div className="blog-image-gallery">
        {images.map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            alt={`${post.title} ${index + 1}`}
          />
        ))}
      </div>
      <SafeArticle html={post.content} />
    </article>
  );
}
export function SilkmoonProductLayout({ post, category }) {
  return (
    <article className="blog-layout silkmoon-product">
      <Header post={post} category={category} />
      <Cover post={post} />
      <div className="silkmoon-product-document">
        <SafeArticle html={post.content} />
      </div>
    </article>
  );
}
export default function BlogLayout({ post, category }) {
  const layouts = {
    standard: StandardLayout,
    featured: FeaturedLayout,
    editorial: EditorialLayout,
    guide: GuideLayout,
    split: SplitLayout,
    gallery: GalleryLayout,
    "silkmoon-product": SilkmoonProductLayout,
  };
  const Component = layouts[post.layout] || StandardLayout;
  return <Component post={post} category={category} />;
}
