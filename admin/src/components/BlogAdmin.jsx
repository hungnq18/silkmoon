import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import Pagination from "./Pagination";
import ListSearch, { ListFilter, useListFilter, useListSearch } from "./ListSearch";
const toItems = (data) => (Array.isArray(data) ? data : data?.items || []);
const slugify = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function ProductReviewsAdmin() {
  const [items, setItems] = useState([]);
  const load = () => adminApi.getReviews().then((data) => setItems(toItems(data)));
  useEffect(() => {
    load();
  }, []);
  return (
    <AdminTable
      title="Đánh giá sản phẩm"
      subtitle={`${items.length} đánh giá`}
      headers={[
        "NGƯỜI ĐÁNH GIÁ",
        "SỐ SAO",
        "NỘI DUNG",
        "TRẠNG THÁI",
        "THAO TÁC",
      ]}
      rows={items.map((x) => [
        x.authorName,
        `${x.rating}/5`,
        x.comment,
        <span className={`status ${x.isVerified ? "completed" : ""}`}>
          {x.isVerified ? "Đã duyệt" : "Chờ duyệt"}
        </span>,
        <>
          <button
            className="action-button"
            onClick={() =>
              adminApi
                .updateReview(x._id, { isVerified: !x.isVerified })
                .then(load)
            }
          >
            {x.isVerified ? "Bỏ duyệt" : "Duyệt"}
          </button>
          <Delete onClick={() => adminApi.deleteReview(x._id).then(load)} />
        </>,
      ])}
      filterIndex={3}
      filterOptions={[{value:"Đã duyệt",label:"Đã duyệt"},{value:"Chờ duyệt",label:"Chờ duyệt"}]}
    />
  );
}
export function BlogCommentsAdmin() {
  const [items, setItems] = useState([]);
  const load = () =>
    adminApi.getBlogComments().then((data) => setItems(toItems(data)));
  useEffect(() => {
    load();
  }, []);
  return (
    <AdminTable
      title="Bình luận blog"
      subtitle={`${items.length} bình luận`}
      headers={["NGƯỜI GỬI", "NỘI DUNG", "TRẠNG THÁI", "THAO TÁC"]}
      rows={items.map((x) => [
        x.authorName,
        x.content,
        <span
          className={`status ${x.status === "approved" ? "completed" : ""}`}
        >
          {x.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
        </span>,
        <>
          <button
            className="action-button"
            onClick={() =>
              adminApi
                .updateBlogComment(x._id, {
                  status: x.status === "approved" ? "pending" : "approved",
                })
                .then(load)
            }
          >
            {x.status === "approved" ? "Bỏ duyệt" : "Duyệt"}
          </button>
          <Delete
            onClick={() => adminApi.deleteBlogComment(x._id).then(load)}
          />
        </>,
      ])}
      filterIndex={2}
      filterOptions={[{value:"Đã duyệt",label:"Đã duyệt"},{value:"Chờ duyệt",label:"Chờ duyệt"}]}
    />
  );
}
export function BlogCategoriesAdmin() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const load = () => adminApi.getBlogCategories().then(setItems);
  useEffect(() => {
    load();
  }, []);
  const add = () => {
    if (name.trim())
      adminApi
        .createBlogCategory({
          name: name.trim(),
          slug: slugify(name),
          isActive: true,
        })
        .then(() => {
          setName("");
          load();
        });
  };
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Danh mục blog</h2>
          <p>Collection riêng dành cho bài viết</p>
        </div>
        <div className="quick-add">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên danh mục"
          />
          <button className="primary-button" onClick={add}>
            Thêm
          </button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>TÊN DANH MỤC</th>
              <th>LOẠI</th>
              <th>SLUG</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x._id}>
                <td className="cell-primary">{x.name}</td>
                <td>
                  <span className="category-type">Danh mục blog</span>
                </td>
                <td>/{x.slug}</td>
                <td>
                  <Delete
                    onClick={() =>
                      adminApi.deleteBlogCategory(x._id).then(load)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export function BlogPostsAdmin() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const load = () =>
    adminApi.getBlogPosts().then((data) => setItems(toItems(data)));
  useEffect(() => {
    load();
    adminApi.getBlogCategories().then(setCategories);
  }, []);
  const save = (e) => {
    e.preventDefault();
    const data = { ...form, slug: form.slug || slugify(form.title) };
    (form._id
      ? adminApi.updateBlogPost(form._id, data)
      : adminApi.createBlogPost(data)
    ).then(() => {
      setForm(null);
      load();
    });
  };
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Quản lý bài viết</h2>
          <p>{items.length} bài viết</p>
        </div>
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
            })
          }
        >
          Thêm bài viết
        </button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>TIÊU ĐỀ</th>
              <th>DANH MỤC</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x._id}>
                <td className="cell-primary">{x.title}</td>
                <td>
                  {categories.find((c) => c._id === x.categoryId)?.name || "—"}
                </td>
                <td>
                  <span
                    className={`status ${x.status === "published" ? "completed" : ""}`}
                  >
                    {x.status === "published" ? "Đã đăng" : "Bản nháp"}
                  </span>
                </td>
                <td>
                  <button
                    className="action-button"
                    onClick={() => setForm({ ...x })}
                  >
                    Chỉnh sửa
                  </button>
                  <Delete
                    onClick={() => adminApi.deleteBlogPost(x._id).then(load)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {form && (
        <div className="modal-backdrop">
          <form className="category-modal" onSubmit={save}>
            <div className="modal-header">
              <h2>{form._id ? "Chỉnh sửa" : "Thêm"} bài viết</h2>
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
                <span>Mô tả ngắn</span>
                <textarea
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm({ ...form, excerpt: e.target.value })
                  }
                  required
                />
              </label>
              <label className="modal-field">
                <span>Nội dung</span>
                <textarea
                  rows="8"
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  required
                />
              </label>
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
            </div>
            <div className="modal-actions">
              <button className="primary-button">Lưu bài viết</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
function Delete({ onClick }) {
  return (
    <button
      className="action-button danger"
      onClick={() => confirm("Bạn chắc chắn muốn xóa?") && onClick()}
    >
      Xóa
    </button>
  );
}
const cellText = (value) => {
  if (value == null || typeof value === "boolean") return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(cellText).join(" ");
  return cellText(value.props?.children);
};
function AdminTable({ title, subtitle, headers, rows, filterIndex = 0, filterOptions = [] }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { query, setQuery, filteredItems: searchedItems } = useListSearch(rows);
  const { filter, setFilter, filteredItems } = useListFilter(searchedItems, (row) => cellText(row[filterIndex]));
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="list-controls"><ListSearch value={query} onChange={(value) => { setQuery(value); setPage(1); }} />{filterOptions.length > 0 && <ListFilter value={filter} onChange={(value) => { setFilter(value); setPage(1); }} options={filterOptions} />}</div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.slice((page - 1) * pageSize, page * pageSize).map((r, i) => (
              <tr key={i}>
                {r.map((v, j) => (
                  <td key={j}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={Math.max(1, Math.ceil(filteredItems.length / pageSize))} onPageChange={setPage} />
    </div>
  );
}
