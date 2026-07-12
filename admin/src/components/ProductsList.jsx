import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { adminApi } from "../services/api";
import Pagination from "./Pagination";
import ListSearch, { ListFilter, useListFilter, useListSearch } from "./ListSearch";
const currency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

export function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const historyRef = useRef([value || ""]);
  const historyIndexRef = useRef(0);
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
      historyRef.current = [value || ""];
      historyIndexRef.current = 0;
    }
  }, [value]);
  const commit = (html) => {
    if (html !== historyRef.current[historyIndexRef.current]) {
      historyRef.current = historyRef.current.slice(
        0,
        historyIndexRef.current + 1,
      );
      historyRef.current.push(html);
      historyIndexRef.current = historyRef.current.length - 1;
    }
    onChange(html);
  };
  const travelHistory = (direction) => {
    const next = historyIndexRef.current + direction;
    if (next < 0 || next >= historyRef.current.length) return;
    historyIndexRef.current = next;
    const html = historyRef.current[next];
    editorRef.current.innerHTML = html;
    onChange(html);
    editorRef.current.focus();
  };
  const rememberSelection = () => {
    const selection = window.getSelection();
    if (
      selection?.rangeCount &&
      editorRef.current?.contains(selection.anchorNode)
    )
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  };
  const command = (name, commandValue = null) => {
    if (name === "undo") return travelHistory(-1);
    if (name === "redo") return travelHistory(1);
    editorRef.current?.focus();
    if (savedRangeRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const tags = { bold: "strong", italic: "em", underline: "u" };
    if (range && !range.collapsed && tags[name]) {
      const element = document.createElement(tags[name]);
      element.appendChild(range.extractContents());
      range.insertNode(element);
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (range && !range.collapsed && name === "formatBlock") {
      const element = document.createElement(
        (commandValue || "p").toLowerCase(),
      );
      element.appendChild(range.extractContents());
      range.insertNode(element);
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (
      range &&
      !range.collapsed &&
      (name === "insertUnorderedList" || name === "insertOrderedList")
    ) {
      const list = document.createElement(
        name === "insertOrderedList" ? "ol" : "ul",
      );
      const lines = range.toString().split(/\n+/).filter(Boolean);
      lines.forEach((line) => {
        const item = document.createElement("li");
        item.textContent = line;
        list.appendChild(item);
      });
      range.deleteContents();
      range.insertNode(list);
      range.selectNodeContents(list);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (range && !range.collapsed && name === "justifyCenter") {
      const center = document.createElement("center");
      center.appendChild(range.extractContents());
      range.insertNode(center);
      range.selectNodeContents(center);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (name === "justifyLeft" && range) {
      const center = range.startContainer.parentElement?.closest("center");
      if (center) center.replaceWith(...center.childNodes);
    } else {
      document.execCommand(name, false, commandValue);
    }
    commit(editorRef.current?.innerHTML || "");
    rememberSelection();
  };
  const addLink = () => {
    const url = prompt("Nhập liên kết bắt đầu bằng https://");
    if (url?.startsWith("https://")) command("createLink", url);
  };
  const tools = [
    ["formatBlock", "P", "Đoạn văn", "format_paragraph"],
    ["formatBlock", "H2", "Tiêu đề", "title"],
    ["bold", null, "In đậm", "format_bold"],
    ["italic", null, "In nghiêng", "format_italic"],
    ["underline", null, "Gạch chân", "format_underlined"],
    ["insertUnorderedList", null, "Danh sách", "format_list_bulleted"],
    ["insertOrderedList", null, "Đánh số", "format_list_numbered"],
    ["justifyLeft", null, "Căn trái", "format_align_left"],
    ["justifyCenter", null, "Căn giữa", "format_align_center"],
  ];
  return (
    <div className="rich-editor">
      <div className="rich-toolbar">
        {tools.map(([name, commandValue, title, icon]) => (
          <button
            key={`${name}-${commandValue}`}
            type="button"
            title={title}
            onMouseDown={(event) => {
              event.preventDefault();
              command(name, commandValue);
            }}
          >
            <span className="material-symbols-outlined">{icon}</span>
          </button>
        ))}
        <button
          type="button"
          title="Thêm liên kết"
          onMouseDown={(event) => {
            event.preventDefault();
            addLink();
          }}
        >
          <span className="material-symbols-outlined">link</span>
        </button>
        <button
          type="button"
          title="Xóa định dạng"
          onMouseDown={(event) => {
            event.preventDefault();
            command("removeFormat");
          }}
        >
          <span className="material-symbols-outlined">format_clear</span>
        </button>
        <span className="toolbar-spacer" />
        <button
          type="button"
          title="Hoàn tác"
          onMouseDown={(event) => {
            event.preventDefault();
            command("undo");
          }}
        >
          <span className="material-symbols-outlined">undo</span>
        </button>
        <button
          type="button"
          title="Làm lại"
          onMouseDown={(event) => {
            event.preventDefault();
            command("redo");
          }}
        >
          <span className="material-symbols-outlined">redo</span>
        </button>
      </div>
      <div
        ref={editorRef}
        className="rich-content"
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Nhập mô tả chi tiết sản phẩm…"
        onInput={(event) => {
          rememberSelection();
          commit(event.currentTarget.innerHTML);
        }}
        onMouseUp={rememberSelection}
        onKeyUp={rememberSelection}
        onBlur={rememberSelection}
      />
    </div>
  );
}

const PAGE_SIZE = 20;

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const excelInputRef = useRef(null);
  const { query, setQuery, filteredItems: searchedProducts } = useListSearch(products);
  const { filter, setFilter, filteredItems: filteredProducts } = useListFilter(searchedProducts, (item) => item.category);

  useEffect(() => {
    adminApi
      .getCategories()
      .then((data) =>
        setCategories((data.items || data).filter((c) => c.isActive !== false)),
      )
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const fetchProducts = (p = page) => {
    adminApi
      .getProducts({ page: p, limit: PAGE_SIZE })
      .then((data) => {
        setProducts(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(console.error);
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Bạn chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.",
      )
    )
      return;
    try {
      await adminApi.deleteProduct(id);
      fetchProducts(page);
    } catch (err) {
      alert(err.message || "Không thể xóa sản phẩm.");
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        sku: editingProduct.sku?.trim().toUpperCase() || undefined,
        name: editingProduct.name.trim(),
        category: editingProduct.category.trim(),
        material: editingProduct.material.trim(),
        description: editingProduct.description.trim(),
        price: Number(editingProduct.price),
        costPrice: Number(editingProduct.costPrice || 0),
        stock: Number(editingProduct.stock),
        isBestSeller: Boolean(editingProduct.isBestSeller),
        allowEmbroidery: Boolean(editingProduct.allowEmbroidery),
        embroideryPrice: editingProduct.allowEmbroidery
          ? Number(editingProduct.embroideryPrice || 0)
          : 0,
        embroideryMaxLength: Number(editingProduct.embroideryMaxLength || 12),
        allowCustomSize: Boolean(editingProduct.allowCustomSize),
        customSizePrice: editingProduct.allowCustomSize
          ? Number(editingProduct.customSizePrice || 0)
          : 0,
        images: editingProduct.images || [],
        colors: (editingProduct.colors || []).map((color) => ({
          id: color.id,
          label: color.label.trim(),
          hex: color.hex,
          images: color.images || [],
        })),
      };
      const updated = editingProduct._id
        ? await adminApi.updateProduct(editingProduct._id, payload)
        : await adminApi.createProduct(payload);
      fetchProducts(page);
      setEditingProduct(null);
    } catch (err) {
      alert(err.message || "Không thể cập nhật sản phẩm.");
    } finally {
      setSaving(false);
    }
  };

  const downloadTemplate = () => {
    const rows = [{ sku: "SM-001", name: "Bộ chăn ga mẫu", category: "Chăn Ga", material: "Tencel", description: "Mô tả sản phẩm", price: 2500000, costPrice: 1400000, stock: 20, images: "https://example.com/anh-1.jpg,https://example.com/anh-2.jpg", isBestSeller: true }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "San pham");
    XLSX.writeFile(workbook, "mau-import-san-pham.xlsx");
  };

  const importExcel = async (file) => {
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer());
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (!rows.length) throw new Error("File Excel không có dữ liệu.");
      const result = await adminApi.importProducts(rows);
      const detail = result.errors?.length ? `\n${result.errors.slice(0, 5).map((item) => `Dòng ${item.row}: ${item.message}`).join("\n")}` : "";
      alert(`Đã tạo ${result.created}, cập nhật ${result.updated}, lỗi ${result.errors?.length || 0}.${detail}`);
      fetchProducts(1);
      setPage(1);
    } catch (err) {
      alert(err.message || "Không thể nhập file Excel.");
    } finally {
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  };

  const toggleBestSeller = async (product) => {
    await adminApi.updateProduct(product._id, { isBestSeller: !product.isBestSeller });
    fetchProducts(page);
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Không thể đọc tệp ảnh."));
      reader.readAsDataURL(file);
    });

  const uploadFiles = async (files, replaceIndex = null) => {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!imageFiles.length) return;
    if (imageFiles.some((file) => file.size > 8 * 1024 * 1024)) {
      alert("Mỗi ảnh phải có dung lượng nhỏ hơn 8 MB.");
      return;
    }
    setUploadingImages(true);
    try {
      const urls = await Promise.all(
        imageFiles.map(async (file) =>
          adminApi.uploadProductImage(await fileToDataUrl(file)),
        ),
      );
      setEditingProduct((current) => {
        const images = [...(current.images || [])];
        if (replaceIndex !== null) images.splice(replaceIndex, 1, urls[0]);
        else images.push(...urls);
        return { ...current, images };
      });
    } catch (err) {
      alert(err.message || "Không thể tải ảnh lên.");
    } finally {
      setUploadingImages(false);
    }
  };

  const moveImage = (index, direction) =>
    setEditingProduct((current) => {
      const images = [...(current.images || [])];
      const target = index + direction;
      if (target < 0 || target >= images.length) return current;
      [images[index], images[target]] = [images[target], images[index]];
      return { ...current, images };
    });

  const removeImage = (index) =>
    setEditingProduct((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));

  const addColor = () =>
    setEditingProduct((current) => ({
      ...current,
      colors: [...(current.colors || []), { id: `color-${Date.now()}`, label: "", hex: "#D9D9D9", images: [] }],
    }));

  const updateColor = (index, patch) =>
    setEditingProduct((current) => ({
      ...current,
      colors: (current.colors || []).map((color, colorIndex) => colorIndex === index ? { ...color, ...patch } : color),
    }));

  const removeColor = (index) =>
    setEditingProduct((current) => ({
      ...current,
      colors: (current.colors || []).filter((_, colorIndex) => colorIndex !== index),
    }));

  const uploadColorFiles = async (colorIndex, files) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length) return;
    if (imageFiles.some((file) => file.size > 8 * 1024 * 1024)) {
      alert("Mỗi ảnh phải có dung lượng nhỏ hơn 8 MB.");
      return;
    }
    setUploadingImages(true);
    try {
      const urls = await Promise.all(imageFiles.map(async (file) => adminApi.uploadProductImage(await fileToDataUrl(file))));
      setEditingProduct((current) => ({
        ...current,
        colors: (current.colors || []).map((color, index) => index === colorIndex ? { ...color, images: [...(color.images || []), ...urls] } : color),
      }));
    } catch (err) {
      alert(err.message || "Không thể tải ảnh màu sản phẩm lên.");
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Danh mục sản phẩm</h2>
          <p>
            {total} sản phẩm đang được quản lý
            {totalPages > 1 ? ` — trang ${page}/${totalPages}` : ""}
          </p>
        </div>
        <div className="list-controls"><ListSearch value={query} onChange={setQuery} placeholder="Tìm sản phẩm…" /><ListFilter value={filter} onChange={setFilter} label="Lọc danh mục" options={categories.map((category) => ({ value: category.name, label: category.name }))} /></div>
        <div className="product-header-actions">
          <button className="secondary-button" onClick={downloadTemplate}><span className="material-symbols-outlined">download</span>File mẫu</button>
          <button className="secondary-button" onClick={() => excelInputRef.current?.click()}><span className="material-symbols-outlined">upload_file</span>Nhập Excel</button>
          <input ref={excelInputRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={(event) => importExcel(event.target.files[0])} />
        <button
          className="primary-button"
          onClick={() =>
            setEditingProduct({
              name: "",
              sku: "",
              category: "",
              material: "",
              description: "",
              price: "",
              stock: 0,
              isBestSeller: false,
              images: [],
              colors: [],
              allowEmbroidery: false,
              embroideryPrice: 0,
              embroideryMaxLength: 12,
              allowCustomSize: false,
              customSizePrice: 0,
            })
          }
        >
          <span className="material-symbols-outlined">add</span>Thêm sản phẩm
        </button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>TÊN SẢN PHẨM</th>
              <th>DANH MỤC</th>
              <th>GIÁ BÁN</th>
              <th>BÁN CHẠY</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id}>
                <td className="cell-primary">{product.name}</td>
                <td>
                  <span className="status">{product.category}</span>
                </td>
                <td>{currency(product.price)}</td>
                <td><label className="compact-toggle" title="Đánh dấu sản phẩm bán chạy"><input type="checkbox" checked={Boolean(product.isBestSeller)} onChange={() => toggleBestSeller(product)} /><span className="toggle-ui" /></label></td>
                <td>
                  <button
                    className="action-button"
                    onClick={() =>
                      setEditingProduct({
                        ...product,
                        allowEmbroidery:
                          product.allowEmbroidery ??
                          product.category === "Đồ Ngủ",
                        embroideryMaxLength: product.embroideryMaxLength ?? 12,
                        allowCustomSize: product.allowCustomSize ?? true,
                        customSizePrice: product.customSizePrice ?? 0,
                      })
                    }
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    className="action-button danger"
                    onClick={() => handleDelete(product._id)}
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
      {editingProduct && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setEditingProduct(null)
          }
        >
          <form className="product-modal" onSubmit={handleEditSubmit}>
            <div className="modal-header">
              <div>
                <span className="login-eyebrow">SẢN PHẨM</span>
                <h2>
                  {editingProduct._id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setEditingProduct(null)}
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-form-grid">
              <label className="modal-field">
                <span>SKU</span>
                <input value={editingProduct.sku || ""} onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value.toUpperCase() })} placeholder="SM-001" />
              </label>
              <label className="modal-field full">
                <span>Tên sản phẩm</span>
                <input
                  value={editingProduct.name || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <label className="modal-field">
                <span>Danh mục</span>
                <select
                  value={editingProduct.category || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: e.target.value,
                    })
                  }
                  required
                >
                  <option value="" disabled>
                    Chọn danh mục
                  </option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                  {editingProduct.category &&
                    !categories.some(
                      (category) => category.name === editingProduct.category,
                    ) && (
                      <option value={editingProduct.category}>
                        {editingProduct.category} (danh mục cũ)
                      </option>
                    )}
                </select>
              </label>
              <label className="modal-field">
                <span>Chất liệu</span>
                <input
                  value={editingProduct.material || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      material: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <label className="modal-field">
                <span>Giá bán (VNĐ)</span>
                <input
                  type="number"
                  min="0"
                  value={editingProduct.price ?? ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <label className="modal-field">
                <span>Giá vốn (VNĐ)</span>
                <input
                  type="number"
                  min="0"
                  value={editingProduct.costPrice ?? 0}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      costPrice: e.target.value,
                    })
                  }
                />
              </label>
              <label className="modal-field">
                <span>Tồn kho</span>
                <input
                  type="number"
                  min="0"
                  value={editingProduct.stock ?? ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stock: e.target.value,
                    })
                  }
                  required
                />
              </label>
              <div className="image-manager full">
                <div className="image-manager-head">
                  <div>
                    <strong>Hình ảnh sản phẩm</strong>
                    <span>
                      Ảnh đầu tiên được dùng làm ảnh đại diện. Có thể chọn nhiều
                      ảnh cùng lúc.
                    </span>
                  </div>
                  <label
                    className={`image-upload-button ${uploadingImages ? "disabled" : ""}`}
                  >
                    <span className="material-symbols-outlined">
                      add_photo_alternate
                    </span>
                    {uploadingImages ? "Đang tải…" : "Thêm nhiều ảnh"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={uploadingImages}
                      onChange={(e) => {
                        uploadFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                {(editingProduct.images || []).length ? (
                  <div className="image-grid">
                    {editingProduct.images.map((image, index) => (
                      <article className="image-item" key={`${image}-${index}`}>
                        <div className="image-preview">
                          <img src={image} alt={`Ảnh sản phẩm ${index + 1}`} />
                          {index === 0 && (
                            <span className="cover-badge">ẢNH ĐẠI DIỆN</span>
                          )}
                        </div>
                        <div className="image-actions">
                          <button
                            type="button"
                            onClick={() => moveImage(index, -1)}
                            disabled={index === 0}
                            title="Chuyển sang trái"
                          >
                            <span className="material-symbols-outlined">
                              arrow_back
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(index, 1)}
                            disabled={
                              index === editingProduct.images.length - 1
                            }
                            title="Chuyển sang phải"
                          >
                            <span className="material-symbols-outlined">
                              arrow_forward
                            </span>
                          </button>
                          <label title="Thay ảnh">
                            <span className="material-symbols-outlined">
                              edit
                            </span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              disabled={uploadingImages}
                              onChange={(e) => {
                                uploadFiles(e.target.files, index);
                                e.target.value = "";
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            className="delete-image"
                            onClick={() => removeImage(index)}
                            title="Xóa ảnh"
                          >
                            <span className="material-symbols-outlined">
                              delete
                            </span>
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="image-empty">
                    <span className="material-symbols-outlined">image</span>Chưa
                    có ảnh sản phẩm
                  </div>
                )}
              </div>
              <div className="color-variants full">
                <div className="image-manager-head">
                  <div><strong>Màu sắc và ảnh theo màu</strong><span>Mỗi màu có tên, mã màu và bộ ảnh riêng hiển thị khi khách chọn màu.</span></div>
                  <button type="button" className="image-upload-button" onClick={addColor}><span className="material-symbols-outlined">palette</span>Thêm màu</button>
                </div>
                {(editingProduct.colors || []).length ? (
                  <div className="color-variant-list">
                    {editingProduct.colors.map((color, colorIndex) => (
                      <article className="color-variant" key={color.id || colorIndex}>
                        <div className="color-variant-fields">
                          <label><span>Tên màu</span><input value={color.label || ""} placeholder="Ví dụ: Champagne" onChange={(event) => updateColor(colorIndex, { label: event.target.value })} required /></label>
                          <label className="color-picker-field"><span>Màu hiển thị</span><div><input type="color" value={color.hex || "#D9D9D9"} onChange={(event) => updateColor(colorIndex, { hex: event.target.value })} /><code>{color.hex || "#D9D9D9"}</code></div></label>
                          <label className={`image-upload-button ${uploadingImages ? "disabled" : ""}`}><span className="material-symbols-outlined">add_photo_alternate</span>Upload ảnh<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploadingImages} onChange={(event) => { uploadColorFiles(colorIndex, event.target.files); event.target.value = ""; }} /></label>
                          <button type="button" className="remove-color-button" onClick={() => removeColor(colorIndex)}><span className="material-symbols-outlined">delete</span></button>
                        </div>
                        {(color.images || []).length > 0 && <div className="color-image-list">{color.images.map((image, imageIndex) => <div key={`${image}-${imageIndex}`}><img src={image} alt={`${color.label || "Màu"} ${imageIndex + 1}`} /><button type="button" onClick={() => updateColor(colorIndex, { images: color.images.filter((_, index) => index !== imageIndex) })}>×</button></div>)}</div>}
                      </article>
                    ))}
                  </div>
                ) : <div className="image-empty"><span className="material-symbols-outlined">palette</span>Chưa có màu sản phẩm</div>}
              </div>
              <div className="modal-field full">
                <span>Mô tả sản phẩm</span>
                <RichTextEditor
                  value={editingProduct.description || ""}
                  onChange={(description) =>
                    setEditingProduct((current) => ({
                      ...current,
                      description,
                    }))
                  }
                />
              </div>
              <div className="option-card full">
                <label className="option-toggle">
                  <input type="checkbox" checked={Boolean(editingProduct.isBestSeller)} onChange={(e) => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })} />
                  <span className="toggle-ui" />
                  <span><strong>Sản phẩm bán chạy</strong><small>Hiển thị sản phẩm trong khu vực bán chạy trên website.</small></span>
                </label>
              </div>
              <div className="option-card full">
                <label className="option-toggle">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.allowEmbroidery)}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        allowEmbroidery: e.target.checked,
                      })
                    }
                  />
                  <span className="toggle-ui" />
                  <span>
                    <strong>Cho phép may tên riêng</strong>
                    <small>
                      Khách hàng có thể nhập tên hoặc nội dung cần may.
                    </small>
                  </span>
                </label>
                {editingProduct.allowEmbroidery && (
                  <div className="option-fields">
                    <label className="modal-field">
                      <span>Phụ thu may tên (VNĐ)</span>
                      <input
                        type="number"
                        min="0"
                        value={editingProduct.embroideryPrice ?? 0}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            embroideryPrice: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label className="modal-field">
                      <span>Số ký tự tối đa</span>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={editingProduct.embroideryMaxLength ?? 12}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            embroideryMaxLength: e.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className="option-card full">
                <label className="option-toggle">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.allowCustomSize)}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        allowCustomSize: e.target.checked,
                      })
                    }
                  />
                  <span className="toggle-ui" />
                  <span>
                    <strong>Cho phép may size riêng</strong>
                    <small>
                      Khách hàng có thể nhập kích thước theo yêu cầu.
                    </small>
                  </span>
                </label>
                {editingProduct.allowCustomSize && (
                  <div className="option-fields one">
                    <label className="modal-field">
                      <span>Phụ thu size riêng (VNĐ)</span>
                      <input
                        type="number"
                        min="0"
                        value={editingProduct.customSizePrice ?? 0}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            customSizePrice: e.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setEditingProduct(null)}
              >
                Hủy
              </button>
              <button
                className="primary-button"
                type="submit"
                disabled={saving || uploadingImages}
              >
                {saving
                  ? "Đang lưu…"
                  : editingProduct._id
                    ? "Lưu thay đổi"
                    : "Tạo sản phẩm"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
