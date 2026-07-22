import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import Pagination from "./Pagination";
import ListSearch, { ListFilter, useListFilter, useListSearch } from "./ListSearch";

const categoryIconOptions = ["category", "bed", "layers", "bedroom_parent", "checkroom", "sell", "local_offer", "apps", "king_bed", "chair", "curtains"];
const emptyForm = { name: "", slug: "", description: "", icon: "category", iconUrl: "", isActive: true, isFeatured: false, coverImage: "", sortOrder: 0 };
const makeSlug = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const PAGE_SIZE = 15;

export default function CategoriesList() {
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  useEffect(() => {
    load(page);
  }, [page]);
  const { query, setQuery, filteredItems: searchedItems } = useListSearch(categories);
  const { filter, setFilter, filteredItems } = useListFilter(searchedItems, (item) => item.isFeatured ? "featured" : "normal");

  const load = (p = page) =>
    adminApi
      .getCategories({ page: p, limit: PAGE_SIZE })
      .then((data) => {
        setCategories(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch((err) => alert(err.message));

  const submit = async (event) => {
    event.preventDefault();
    if (form.isFeatured && !form.coverImage) {
      alert("Danh mục nổi bật phải có ảnh bìa.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        categoryType: "product",
        name: form.name.trim(),
        slug: form.slug || makeSlug(form.name),
        description: form.description.trim(),
        icon: form.icon?.trim() || "category",
        iconUrl: form.iconUrl?.trim() || "",
        isActive: form.isActive,
        isFeatured: Boolean(form.isFeatured),
        coverImage: form.isFeatured ? (form.coverImage || "") : "",
        sortOrder: Number(form.sortOrder || 0),
      };
      if (form._id) await adminApi.updateCategory(form._id, payload);
      else await adminApi.createCategory(payload);
      setForm(null);
      load();
    } catch (err) {
      if (err.status !== 401) alert(Array.isArray(err.message) ? err.message.join("\n") : err.message);
    } finally {
      setSaving(false);
    }
  };
  const uploadCover = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const coverImage = await adminApi.uploadProductImage(image);
      setForm((current) => ({ ...current, coverImage }));
    } catch (err) {
      alert(err.message || "Không thể tải ảnh bìa.");
    } finally {
      setUploading(false);
    }
  };
  const uploadIcon = async (file) => {
    if (!file) return;
    setUploadingIcon(true);
    try {
      const image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const iconUrl = await adminApi.uploadProductImage(image);
      setForm((current) => ({ ...current, iconUrl }));
    } catch (err) {
      alert(err.message || "Không thể tải ảnh icon.");
    } finally {
      setUploadingIcon(false);
    }
  };
  const remove = async (category) => {
    if (
      !confirm(
        `Xóa danh mục “${category.name}”? Hãy chuyển sản phẩm sang danh mục khác trước khi xóa.`,
      )
    )
      return;
    try {
      await adminApi.deleteCategory(category._id);
      load(page);
    } catch (err) {
      if (err.status !== 401) alert(err.message);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Danh mục sản phẩm</h2>
          <p>{total} danh mục trong cửa hàng{totalPages > 1 ? ` — trang ${page}/${totalPages}` : ""}</p>
        </div>
        <div className="list-controls"><ListSearch value={query} onChange={setQuery} placeholder="Tìm danh mục…" /><ListFilter value={filter} onChange={setFilter} options={[{ value: "featured", label: "Nổi bật" }, { value: "normal", label: "Thông thường" }]} /></div>
        <button
          className="primary-button"
          onClick={() => setForm({ ...emptyForm })}
        >
          <span className="material-symbols-outlined">add</span>Thêm danh mục
        </button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>TÊN DANH MỤC</th>
              <th>LOẠI DANH MỤC</th>
              <th>ĐƯỜNG DẪN</th>
              <th>MÔ TẢ</th>
              <th>THỨ TỰ</th>
              <th>TRẠNG THÁI</th>
              <th>NỔI BẬT</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((category) => (
              <tr key={category._id}>
                <td className="cell-primary"><span className="category-name-with-icon">{category.iconUrl ? <img src={category.iconUrl} alt="" /> : <span className="material-symbols-outlined">{category.icon || "category"}</span>}{category.name}</span></td>
                <td>
                  <span className="category-type">Danh mục sản phẩm</span>
                </td>
                <td className="cell-muted">/{category.slug}</td>
                <td>{category.description || "—"}</td>
                <td>{category.sortOrder || 0}</td>
                <td>
                  <span
                    className={`status ${category.isActive !== false ? "completed" : "cancelled"}`}
                  >
                    {category.isActive !== false ? "Đang hiển thị" : "Đang ẩn"}
                  </span>
                </td>
                <td>{category.isFeatured ? <span className="status completed">Nổi bật</span> : "—"}</td>
                <td>
                  <button
                    className="action-button"
                    onClick={() => setForm({ ...category })}
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    className="action-button danger"
                    onClick={() => remove(category)}
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
      {!categories.length && (
        <div className="empty-state">
          <span className="material-symbols-outlined">category</span>Chưa có
          danh mục nào.
        </div>
      )}
      {form && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setForm(null)
          }
        >
          <form className="category-modal" onSubmit={submit}>
            <div className="modal-header">
              <div>
                <span className="login-eyebrow">DANH MỤC</span>
                <h2>{form._id ? "Chỉnh sửa danh mục" : "Thêm danh mục"}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setForm(null)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="category-form">
              <label className="modal-field">
                <span>Loại danh mục</span>
                <input value="Danh mục sản phẩm" disabled />
              </label>
              <label className="modal-field">
                <span>Tên danh mục</span>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                      ...(!form._id ? { slug: makeSlug(e.target.value) } : {}),
                    })
                  }
                  required
                />
              </label>
              <label className="modal-field">
                <span>Đường dẫn</span>
                <input
                  value={form.slug}
                  onChange={(e) =>
                    setForm({ ...form, slug: makeSlug(e.target.value) })
                  }
                  required
                />
              </label>
              <label className="modal-field">
                <span>Icon danh mục</span>
                <div className="category-icon-field">
                  <span className="material-symbols-outlined">{form.icon || "category"}</span>
                  <input
                    list="category-icon-options"
                    value={form.icon || ""}
                    placeholder="Ví dụ: bed, layers, sell"
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  />
                  <datalist id="category-icon-options">
                    {categoryIconOptions.map((icon) => <option key={icon} value={icon} />)}
                  </datalist>
                </div>
              </label>
              <div className="category-icon-upload">
                <span>Ảnh icon riêng</span>
                <div className="category-icon-preview">
                  {form.iconUrl ? <img src={form.iconUrl} alt="Icon danh mục" /> : <span className="material-symbols-outlined">{form.icon || "category"}</span>}
                </div>
                <div className="category-icon-actions">
                  <label className={`image-upload-button ${uploadingIcon ? "disabled" : ""}`}>
                    <span className="material-symbols-outlined">upload</span>
                    {uploadingIcon ? "Đang tải…" : "Upload ảnh icon"}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" disabled={uploadingIcon} onChange={(event) => { uploadIcon(event.target.files[0]); event.target.value = ""; }} />
                  </label>
                  {form.iconUrl && <button type="button" className="secondary-button danger-button" onClick={() => setForm({ ...form, iconUrl: "" })}>Xóa ảnh</button>}
                </div>
                <input value={form.iconUrl || ""} placeholder="Hoặc nhập URL ảnh icon" onChange={(event) => setForm({ ...form, iconUrl: event.target.value })} />
                <small>Ảnh upload sẽ được ưu tiên; nếu để trống, website dùng Material Symbol phía trên.</small>
              </div>
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
              <label className="modal-field">
                <span>Thứ tự hiển thị (Số nhỏ xếp trước)</span>
                <input
                  type="number"
                  value={form.sortOrder ?? 0}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: Number(e.target.value) })
                  }
                />
              </label>
              <div className="category-toggle-row">
                <label className="category-active">
                  <input
                    type="checkbox"
                    checked={form.isActive !== false}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                  />
                  <span className="toggle-ui" />
                  <span>Hiển thị</span>
                </label>
                <label className="category-active">
                  <input type="checkbox" checked={Boolean(form.isFeatured)} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                  <span className="toggle-ui" />
                  <span>Nổi bật</span>
                </label>
              </div>
              {form.isFeatured && <div className="category-cover-editor">
                <span>Ảnh bìa danh mục nổi bật</span>
                {form.coverImage ? <img src={form.coverImage} alt={form.name || "Ảnh bìa danh mục"} /> : <div className="image-empty"><span className="material-symbols-outlined">image</span>Chưa có ảnh bìa</div>}
                <div><label className={`image-upload-button ${uploading ? "disabled" : ""}`}><span className="material-symbols-outlined">upload</span>{uploading ? "Đang tải…" : "Upload ảnh bìa"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => { uploadCover(event.target.files[0]); event.target.value = ""; }} /></label><input value={form.coverImage || ""} placeholder="Hoặc nhập URL ảnh" onChange={(event) => setForm({ ...form, coverImage: event.target.value })} /></div>
              </div>}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setForm(null)}
              >
                Hủy
              </button>
              <button className="primary-button" disabled={saving}>
                {saving ? "Đang lưu…" : "Lưu danh mục"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
