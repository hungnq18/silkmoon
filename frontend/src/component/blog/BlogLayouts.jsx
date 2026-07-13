import { createElement, useMemo, useRef, useState } from "react";
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
      if (tag === "br" || tag === "img") return createElement(tag, props);
      return createElement(tag, props, children);
    };
    return [...doc.body.childNodes].map((n, i) => walk(n, `article-${i}`));
  }, [html]);
  return <div className="blog-article-content">{nodes}</div>;
}
function DocumentArticle({ html }) {
  const safeHtml = useMemo(() => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("script, iframe, object, embed, form, input, button").forEach((node) => node.remove());
    doc.querySelectorAll("*").forEach((node) => {
      [...node.attributes].forEach((attribute) => {
        if (attribute.name.toLowerCase().startsWith("on")) node.removeAttribute(attribute.name);
      });
      if (node.hasAttribute("href") && /^javascript:/i.test(node.getAttribute("href") || "")) node.removeAttribute("href");
      if (node.tagName === "IMG" && !/^https:\/\//i.test(node.getAttribute("src") || "")) node.remove();
    });
    return doc.body.innerHTML;
  }, [html]);
  return <div className="blog-article-content blog-document-content" dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}
function DocumentFrame({ html, title }) {
  const frameRef = useRef(null);
  const [height, setHeight] = useState(640);
  const safeHtml = useMemo(() => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("script, iframe, object, embed, form, input, button").forEach((node) => node.remove());
    doc.querySelectorAll("*").forEach((node) => {
      [...node.attributes].forEach((attribute) => {
        if (attribute.name.toLowerCase().startsWith("on")) node.removeAttribute(attribute.name);
      });
      if (node.hasAttribute("href") && /^javascript:/i.test(node.getAttribute("href") || "")) node.removeAttribute("href");
      if (node.tagName === "IMG" && !/^https:\/\//i.test(node.getAttribute("src") || "")) node.remove();
    });
    return doc.body.innerHTML;
  }, [html]);
  const srcDoc = useMemo(() => `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    *{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#1c2c58}body{padding:36px 42px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65}p{margin:0 0 12px}h1{font-size:38px;line-height:1.2;margin:0 0 20px}h2{font-size:28px;line-height:1.3;margin:30px 0 12px}h3{font-size:21px;margin:22px 0 10px}img{display:inline-block;max-width:100%;height:auto;object-fit:contain;vertical-align:middle}.word-document-import{position:relative;width:100%;margin:0 auto}.word-document-import:after{content:'';display:table;clear:both}img.word-image-inline{width:auto;max-width:55%;margin:4px 8px}img.word-image-wrap-left{float:left;width:min(46%,360px);margin:6px 18px 12px 0}img.word-image-wrap-right{float:right;width:min(46%,360px);margin:6px 0 12px 18px}img.word-image-break{display:block;clear:both;width:100%;margin:20px auto}img.word-image-behind{position:absolute;left:32px;top:64px;z-index:0;width:45%;opacity:.4}img.word-image-front{position:absolute;left:32px;top:64px;z-index:10;width:45%;filter:drop-shadow(0 5px 10px rgba(15,34,63,.2))}.word-document-import>*:not(img){position:relative;z-index:1}table{width:100%;border-collapse:collapse;margin:20px 0}td,th{border:1px solid rgba(28,44,88,.2);padding:10px;vertical-align:top}ul,ol{padding-left:24px}blockquote{margin:18px 0;padding:12px 16px;border-left:4px solid #1c2c58;background:#f3f6f8}@media(max-width:640px){body{padding:20px 16px;font-size:15px}img.word-image-wrap-left,img.word-image-wrap-right{float:none;display:block;width:100%;margin:16px auto}}
  </style></head><body>${safeHtml}</body></html>`, [safeHtml]);
  const resize = () => {
    const documentNode = frameRef.current?.contentDocument;
    if (documentNode) setHeight(Math.max(320, documentNode.documentElement.scrollHeight + 2));
  };
  return <iframe ref={frameRef} className="blog-document-frame" title={title} srcDoc={srcDoc} sandbox="allow-same-origin" style={{ height }} onLoad={() => { resize(); frameRef.current?.contentDocument?.querySelectorAll("img").forEach((image) => image.addEventListener("load", resize, { once: true })); }} />;
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
      <DocumentArticle html={post.content} />
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
      <DocumentArticle html={post.content} />
    </article>
  );
}
export function EditorialLayout({ post, category }) {
  return (
    <article className="blog-layout editorial">
      <Header post={post} category={category} />
      <Cover post={post} />
      <DocumentArticle html={post.content} />
    </article>
  );
}
export function GuideLayout({ post, category }) {
  return (
    <article className="blog-layout guide">
      <Header post={post} category={category} />
      <Cover post={post} />
      <div className="guide-label">HƯỚNG DẪN TỪNG BƯỚC</div>
      <DocumentArticle html={post.content} />
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
      <DocumentArticle html={post.content} />
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
      <DocumentArticle html={post.content} />
    </article>
  );
}
export function SilkmoonProductLayout({ post, category, preview = false }) {
  return (
    <article className="blog-layout silkmoon-product" aria-label={`${category?.name || "Silkmoon"}: ${post.title}`}>
      <div className="silkmoon-product-document silkmoon-document-exact">{preview ? <DocumentArticle html={post.content} /> : <DocumentFrame html={post.content} title={post.title} />}</div>
    </article>
  );
}
export default function BlogLayout({ post, category, preview = false }) {
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
  return <Component post={post} category={category} preview={preview} />;
}
