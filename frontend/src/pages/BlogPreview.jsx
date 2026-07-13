import { useEffect, useState } from "react";
import BlogLayout from "../component/blog/BlogLayouts";
export default function BlogPreview() {
  const [data, setData] = useState(null);
  useEffect(() => {
    const receive = (event) => {
      if (event.data?.type === "SILKMOON_BLOG_PREVIEW")
        setData(event.data.payload);
    };
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "SILKMOON_PREVIEW_READY" }, "*");
    return () => window.removeEventListener("message", receive);
  }, []);
  if (!data)
    return (
      <div className="min-h-[70vh] grid place-items-center text-slate-deep/50">
        Đang chuẩn bị bản xem trước…
      </div>
    );
  return (
    <main className="pt-28 pb-20 bg-white min-h-screen">
      <BlogLayout post={data.post} category={{ name: data.categoryName }} preview />
    </main>
  );
}
