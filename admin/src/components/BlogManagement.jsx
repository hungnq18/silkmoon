import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import { RichTextEditor } from "./ProductsList";
import BlogPostPreview from "./BlogPostPreview";
import Pagination from "./Pagination";
import ListSearch, { ListFilter, useListFilter, useListSearch } from "./ListSearch";
const slugify = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const PAGE_SIZE_POSTS = 10;
const PAGE_SIZE_CATS = 15;

export function BlogPostsManager() {
  const [posts, setPosts] = useState([]),
    [total, setTotal] = useState(0),
    [totalPages, setTotalPages] = useState(1),
    [categories, setCategories] = useState([]),
    [form, setForm] = useState(null),
    [preview, setPreview] = useState(false),
    [uploading, setUploading] = useState(false),
    [page, setPage] = useState(1);
  const { query, setQuery, filteredItems: searchedPosts } = useListSearch(posts);
  const { filter, setFilter, filteredItems: filteredPosts } = useListFilter(searchedPosts, (item) => item.status);

  useEffect(() => {
    load(page);
  }, [page]);

  useEffect(() => {
    adminApi.getBlogCategories().then(setCategories);
  }, []);

  const load = (p = page) =>
    adminApi.getBlogPosts({ page: p, limit: PAGE_SIZE_POSTS }).then((data) => {
      setPosts(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    });

  const save = async (e) => {
    e.preventDefault();
    const data = { ...form, slug: form.slug || slugify(form.title) };
    if (form._id) await adminApi.updateBlogPost(form._id, data);
    else await adminApi.createBlogPost(data);
    setForm(null);
    load(page);
  };
  const uploadCover = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) return alert("Ảnh phải nhỏ hơn 8 MB.");
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => { try { const featuredImage = await adminApi.uploadProductImage(reader.result); setForm(current => ({ ...current, featuredImage })); } catch (error) { alert(error.message); } finally { setUploading(false); } };
    reader.readAsDataURL(file);
  };
  const uploadGallery = async (files) => {
    const selected = [...files].filter(file => file.type.startsWith("image/") && file.size <= 8 * 1024 * 1024);
    if (!selected.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(selected.map(file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = reject; reader.onload = async () => { try { resolve(await adminApi.uploadProductImage(reader.result)); } catch (error) { reject(error); } }; reader.readAsDataURL(file); })));
      setForm(current => ({ ...current, galleryImages: [...(current.galleryImages || []), ...urls] }));
    } catch (error) { alert(error.message); } finally { setUploading(false); }
  };
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Quản lý bài viết</h2>
          <p>{total} bài viết{totalPages > 1 ? ` — trang ${page}/${totalPages}` : ""}</p>
        </div>
        <div className="list-controls"><ListSearch value={query} onChange={setQuery} placeholder="Tìm bài viết…" /><ListFilter value={filter} onChange={setFilter} options={[{value:"published",label:"Đã đăng"},{value:"draft",label:"Bản nháp"}]} /></div>
        <button
          className="primary-button"
          onClick={() =>
            setForm({
              title: "",
              slug: "",
              excerpt: "",
              content: "",
              categoryId: "",
              status: "draft",
              layout: "standard",
            })
          }
        >
          <span className="material-symbols-outlined">add</span>Thêm bài viết
        </button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>TIÊU ĐỀ</th>
              <th>DANH MỤC</th>
              <th>LAYOUT</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post) => (
              <tr key={post._id}>
                <td className="cell-primary">{post.title}</td>
                <td>
                  {categories.find((c) => c._id === post.categoryId)?.name ||
                    "—"}
                </td>
                <td><span className="category-type">{{ standard: "Tiêu chuẩn", featured: "Nổi bật", editorial: "Tạp chí", guide: "Hướng dẫn", split: "Chia đôi ảnh", gallery: "Thư viện ảnh" }[post.layout || "standard"]}</span></td>
                <td>
                  <span
                    className={`status ${post.status === "published" ? "completed" : ""}`}
                  >
                    {post.status === "published" ? "Đã đăng" : "Bản nháp"}
                  </span>
                </td>
                <td>
                  <button
                    className="action-button"
                    onClick={() => setForm({ ...post, layout: post.layout || "standard" })}
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    className="action-button danger"
                    onClick={() =>
                      confirm("Xóa bài viết?") &&
                      adminApi.deleteBlogPost(post._id).then(() => load(page))
                    }
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      {form && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setForm(null)}
        >
          <form className="product-modal" onSubmit={save}>
            <div className="modal-header">
              <div>
                <span className="login-eyebrow">BLOG</span>
                <h2>{form._id ? "Chỉnh sửa bài viết" : "Thêm bài viết"}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setForm(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-form-grid">
              <label className="modal-field full">
                <span>Tiêu đề</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </label>
              <label className="modal-field">
                <span>Danh mục blog</span>
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="modal-field">
                <span>Layout bài viết</span>
                <select value={form.layout || "standard"} onChange={(e) => setForm({ ...form, layout: e.target.value })}>
                  <option value="standard">Tiêu chuẩn — một cột</option>
                  <option value="featured">Nổi bật — ảnh bìa lớn</option>
                  <option value="editorial">Tạp chí — editorial</option>
                  <option value="guide">Hướng dẫn — từng bước</option>
                  <option value="split">Chia đôi — ảnh và nội dung</option>
                  <option value="gallery">Thư viện — nhiều ảnh</option>
                </select>
              </label>
              {form.layout !== "standard" && <div className="blog-cover-field full"><div><strong>Ảnh bìa theo layout</strong><span>JPG, PNG hoặc WebP, tối đa 8 MB.</span></div>{form.featuredImage && <img src={form.featuredImage} alt="Ảnh bìa"/>}<label className="image-upload-button">{uploading ? "Đang tải…" : form.featuredImage ? "Thay ảnh bìa" : "Tải ảnh bìa"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(e)=>{uploadCover(e.target.files[0]);e.target.value=""}}/></label></div>}
              {form.layout === "gallery" && <div className="blog-cover-field full"><div><strong>Thư viện ảnh</strong><span>Chọn nhiều ảnh để hiển thị dạng gallery.</span></div><label className="image-upload-button">Thêm nhiều ảnh<input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(e)=>{uploadGallery(e.target.files);e.target.value=""}}/></label><div className="blog-gallery-admin">{(form.galleryImages||[]).map((image,index)=><div key={`${image}-${index}`}><img src={image} alt={`Gallery ${index+1}`}/><button type="button" onClick={()=>setForm(current=>({...current,galleryImages:current.galleryImages.filter((_,i)=>i!==index)}))}>×</button></div>)}</div></div>}
              <label className="modal-field">
                <span>Trạng thái</span>
                
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="draft">Bản nháp</option>
                  <option value="published">Đăng bài</option>
                </select>
              </label>
              <label className="modal-field full">
                <span>Mô tả ngắn</span>
                <textarea
                  rows="3"
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm({ ...form, excerpt: e.target.value })
                  }
                  required
                />
              </label>
              <div className="modal-field full">
                <span>Nội dung bài viết</span>
                <RichTextEditor
                  value={form.content}
                  onChange={(content) =>
                    setForm((current) => ({ ...current, content }))
                  }
                />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setPreview(true)}><span className="material-symbols-outlined">visibility</span>Xem trước</button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setForm(null)}
              >
                Hủy
              </button>
              <button className="primary-button">Lưu bài viết</button>
            </div>
          </form>
        </div>
      )}
      {preview && form && <BlogPostPreview post={form} categoryName={categories.find(c => c._id === form.categoryId)?.name} onClose={() => setPreview(false)} />}
    </div>
  );
}

export function BlogCategoriesManager() {
  const [items, setItems] = useState([]),
    [form, setForm] = useState(null),
    [page, setPage] = useState(1);
  const load = () => adminApi.getBlogCategories().then((data) => { setItems(data); setPage(1); });
  useEffect(() => {
    load();
  }, []);
  const { query, setQuery, filteredItems: searchedItems } = useListSearch(items);
  const { filter, setFilter, filteredItems } = useListFilter(searchedItems, (item) => item.isActive !== false ? "active" : "inactive");

  const totalPagesCats = Math.ceil(filteredItems.length / PAGE_SIZE_CATS);
  const save = async (e) => {
    e.preventDefault();
    const data = { ...form, slug: form.slug || slugify(form.name) };
    if (form._id) await adminApi.updateBlogCategory(form._id, data);
    else await adminApi.createBlogCategory(data);
    setForm(null);
    load();
  };
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Danh mục blog</h2>
          <p>Quản lý chủ đề bài viết</p>
        </div>
        <div className="list-controls"><ListSearch value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Tìm danh mục blog…" /><ListFilter value={filter} onChange={(value) => { setFilter(value); setPage(1); }} options={[{value:"active",label:"Đang hiển thị"},{value:"inactive",label:"Đang ẩn"}]} /></div>
        <button
          className="primary-button"
          onClick={() =>
            setForm({ name: "", slug: "", description: "", isActive: true })
          }
        >
          Thêm danh mục
        </button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>TÊN</th>
              <th>LOẠI</th>
              <th>SLUG</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.slice((page - 1) * PAGE_SIZE_CATS, page * PAGE_SIZE_CATS).map((x) => (
              <tr key={x._id}>
                <td className="cell-primary">{x.name}</td>
                <td>
                  <span className="category-type">Danh mục blog</span>
                </td>
                <td>/{x.slug}</td>
                <td>
                  <button
                    className="action-button"
                    onClick={() => setForm({ ...x })}
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    className="action-button danger"
                    onClick={() =>
                      confirm("Xóa danh mục?") &&
                      adminApi.deleteBlogCategory(x._id).then(load)
                    }
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPagesCats} onPageChange={setPage} />
      {form && (
        <div className="modal-backdrop">
          <form className="category-modal" onSubmit={save}>
            <div className="modal-header">
              <h2>{form._id ? "Chỉnh sửa" : "Thêm"} danh mục blog</h2>
              <button
                type="button"
                className="icon-button"
                onClick={() => setForm(null)}
              >
                ×
              </button>
            </div>
            <div className="category-form">
              <label className="modal-field">
                <span>Tên danh mục</span>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: form._id ? form.slug : slugify(e.target.value),
                    })
                  }
                  required
                />
              </label>
              <label className="modal-field">
                <span>Slug</span>
                <input
                  value={form.slug}
                  onChange={(e) =>
                    setForm({ ...form, slug: slugify(e.target.value) })
                  }
                  required
                />
              </label>
              <label className="modal-field">
                <span>Mô tả</span>
                <textarea
                  rows="4"
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="modal-actions">
              <button className="primary-button">Lưu danh mục</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function BlogVideosManager() {
  const [websiteContent, setWebsiteContent] = useState({}),
    [videos, setVideos] = useState([]),
    [saving, setSaving] = useState(false),
    [uploadingIndex, setUploadingIndex] = useState(null),
    [page, setPage] = useState(1);
  const { query, setQuery, filteredItems: searchedVideos } = useListSearch(videos);
  const { filter, setFilter, filteredItems: filteredVideos } = useListFilter(searchedVideos, (item) => item.isActive !== false ? "active" : "inactive");

  useEffect(() => {
    adminApi.getSettings().then((rows) => {
      const value = rows.find((row) => row.key === "website_content")?.value || {};
      setWebsiteContent(value);
      setVideos(Array.isArray(value.blogVideos) ? value.blogVideos : []);
    });
  }, []);

  const update = (index, patch) => setVideos((current) => current.map((video, itemIndex) => itemIndex === index ? { ...video, ...patch } : video));
  const uploadThumbnail = async (index, file) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      update(index, { thumbnail: await adminApi.uploadProductImage(image) });
    } finally {
      setUploadingIndex(null);
    }
  };
  const save = async () => {
    setSaving(true);
    try {
      const value = { ...websiteContent, blogVideos: videos };
      await adminApi.saveSetting("website_content", { value, description: "Nội dung website Silkmoon" });
      setWebsiteContent(value);
    } finally {
      setSaving(false);
    }
  };

  return <div className="panel blog-video-manager">
    <div className="panel-header"><div><h2>Video blog</h2><p>Quản lý khối video hiển thị cuối trang Cẩm nang.</p></div><div className="list-controls"><ListSearch value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Tìm video…" /><ListFilter value={filter} onChange={(value) => { setFilter(value); setPage(1); }} options={[{value:"active",label:"Đang hiển thị"},{value:"inactive",label:"Đang ẩn"}]} /></div><button className="primary-button" onClick={() => setVideos((current) => [...current, { id: `video-${Date.now()}`, title: "", thumbnail: "", videoUrl: "", isActive: true }])}><span className="material-symbols-outlined">add</span>Thêm video</button></div>
    <div className="blog-video-grid">{filteredVideos.slice((page - 1) * 6, page * 6).map((video, visibleIndex) => { const index = videos.indexOf(video); return <article className="blog-video-card" key={video.id || index}>
      <div className="blog-video-cover">{video.thumbnail ? <img src={video.thumbnail} alt={video.title || "Video"} /> : <span className="material-symbols-outlined">video_library</span>}<span className="material-symbols-outlined play">play_circle</span></div>
      <label className="modal-field"><span>Tiêu đề</span><input value={video.title || ""} onChange={(event) => update(index, { title: event.target.value })} /></label>
      <label className="modal-field"><span>URL video (YouTube, TikTok hoặc MP4)</span><input value={video.videoUrl || ""} onChange={(event) => update(index, { videoUrl: event.target.value })} /></label>
      <label className="modal-field"><span>URL ảnh bìa</span><input value={video.thumbnail || ""} onChange={(event) => update(index, { thumbnail: event.target.value })} /></label>
      <div className="blog-video-actions"><label className={`image-upload-button ${uploadingIndex === index ? "disabled" : ""}`}><span className="material-symbols-outlined">upload</span>{uploadingIndex === index ? "Đang tải…" : "Upload ảnh bìa"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingIndex !== null} onChange={(event) => { uploadThumbnail(index, event.target.files[0]); event.target.value = ""; }} /></label><label className="category-active"><input type="checkbox" checked={video.isActive !== false} onChange={(event) => update(index, { isActive: event.target.checked })} /><span className="toggle-ui" />Hiển thị</label><button className="action-button danger" type="button" onClick={() => setVideos((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Xóa</button></div>
    </article>; })}</div>
    <Pagination page={page} totalPages={Math.max(1, Math.ceil(filteredVideos.length / 6))} onPageChange={setPage} />
    {!videos.length && <div className="empty-state"><span className="material-symbols-outlined">video_library</span>Chưa có video.</div>}
    <div className="section-save"><button className="primary-button" onClick={save} disabled={saving}>{saving ? "Đang lưu…" : "Lưu danh sách video"}</button></div>
  </div>;
}
