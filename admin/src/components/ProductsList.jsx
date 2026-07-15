import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { adminApi } from "../services/api";
import Pagination from "./Pagination";
import ListSearch, { ListFilter, useListFilter, useListSearch } from "./ListSearch";
const currency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getSizeMeasurements = (size = {}) => {
  if (Array.isArray(size.measurements)) return size.measurements;
  return [['width', 'Rộng'], ['length', 'Dài'], ['height', 'Dày/Cao']]
    .filter(([key]) => size[key] !== undefined && size[key] !== null && size[key] !== '')
    .map(([key, label]) => ({ id: key, label, value: size[key], unit: size.unit || 'cm' }));
};
const copySizeOption = (size, existing = {}) => ({
  id: size.id,
  label: size.label,
  price: existing.price ?? size.price ?? '',
  originalPrice: existing.originalPrice ?? size.originalPrice ?? '',
  width: Array.isArray(size.measurements) ? '' : size.width ?? '',
  length: Array.isArray(size.measurements) ? '' : size.length ?? '',
  height: Array.isArray(size.measurements) ? '' : size.height ?? '',
  unit: size.unit || 'cm',
  measurements: getSizeMeasurements(size).map((item) => ({ ...item })),
});
const formatSizeMeasurements = (size) => getSizeMeasurements(size)
  .filter((item) => item.value !== '' && item.value !== undefined && item.value !== null)
  .map((item) => `${item.label}: ${item.value}${item.unit || ''}`)
  .join(' · ');

const EditableSizeMeasurements = ({ size, onChange }) => {
  const measurements = getSizeMeasurements(size);
  const update = (index, key, value) => onChange(measurements.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  return <div className="product-dynamic-measurements">
    {!measurements.length && <p>Size này chưa có thông số kích thước.</p>}
    {measurements.map((measurement, index) => <div key={measurement.id || index}>
      <label><span>Tên thông số</span><input value={measurement.label || ''} placeholder="Đường kính" onChange={(event) => update(index, 'label', event.target.value)} /></label>
      <label><span>Giá trị</span><input type="text" value={measurement.value ?? ''} placeholder="VD: 40-45" onChange={(event) => update(index, 'value', event.target.value)} /></label>
      <label><span>Đơn vị</span><input value={measurement.unit || 'cm'} placeholder="cm" onChange={(event) => update(index, 'unit', event.target.value)} /></label>
      <button type="button" title="Xóa thông số" onClick={() => onChange(measurements.filter((_, itemIndex) => itemIndex !== index))}><span className="material-symbols-outlined">close</span></button>
    </div>)}
    <button type="button" className="product-add-measurement" onClick={() => onChange([...measurements, { id: `measurement-${Date.now()}`, label: '', value: '', unit: 'cm' }])}><span className="material-symbols-outlined">add</span>Thêm thông số</button>
  </div>;
};

export function RichTextEditor({ value, onChange, wordMode = false, placeholder = "Nhập nội dung…" }) {
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  const savedRangeRef = useRef(null);
  const historyRef = useRef([value || ""]);
  const historyIndexRef = useRef(0);
  const [selectedImage, setSelectedImage] = useState(null);
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
  const insertTable = () => {
    const rows = Math.min(10, Math.max(1, Number(prompt("Số hàng", "2")) || 2));
    const columns = Math.min(6, Math.max(1, Number(prompt("Số cột", "2")) || 2));
    const cells = Array.from({ length: rows }, () => `<tr>${Array.from({ length: columns }, () => '<td>&nbsp;</td>').join('')}</tr>`).join('');
    command("insertHTML", `<table><tbody>${cells}</tbody></table><p><br></p>`);
  };
  const uploadInlineImage = async (file) => {
    if (!file || !file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) return alert("Ảnh phải nhỏ hơn 8 MB.");
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    try {
      const url = await adminApi.uploadProductImage(dataUrl);
      command("insertImage", url);
    } catch (error) {
      alert(error.message || "Không thể tải ảnh.");
    }
  };
  const uploadWordDoc = async (file) => {
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: [
            "p[style-name='Title'] => h1:fresh",
            "p[style-name='Subtitle'] => p.word-subtitle:fresh",
            "p[style-name='Heading 1'] => h2:fresh",
            "p[style-name='Heading 2'] => h3:fresh",
            "p[style-name='Quote'] => blockquote:fresh",
          ],
          convertImage: mammoth.images.imgElement(async (image) => {
            const base64 = await image.read("base64");
            const dataUrl = `data:${image.contentType || "image/png"};base64,${base64}`;
            try {
              const src = await adminApi.uploadProductImage(dataUrl);
              return { src };
            } catch (error) {
              console.error("Không thể upload ảnh trong Word", error);
              return { src: dataUrl };
            }
          }),
        },
      );
      const importedDocument = new DOMParser().parseFromString(`<div class="word-document-import">${result.value}</div>`, "text/html");
      const importedRoot = importedDocument.querySelector(".word-document-import");
      const importedImages = [...importedRoot.querySelectorAll("img")];
      importedImages.forEach((image, index) => {
        const parent = image.parentElement;
        const siblingImages = parent ? [...parent.querySelectorAll(":scope > img")] : [];
        const hasTextInSameBlock = Boolean(parent?.textContent?.trim());
        const layout = siblingImages.length > 1
          ? "inline"
          : hasTextInSameBlock
            ? (index % 2 === 0 ? "wrap-left" : "wrap-right")
            : "break";
        image.className = `word-image word-image-${layout}`;
        image.dataset.layout = layout;
        if (parent?.tagName === "P" && !hasTextInSameBlock && parent.children.length === 1) {
          parent.replaceWith(image);
        }
      });
      const importedHtml = `${importedRoot.outerHTML}<p><br></p>`;
      if (!editorRef.current) throw new Error("Trình soạn thảo chưa sẵn sàng");
      editorRef.current.innerHTML = importedHtml;
      commit(importedHtml);
      setSelectedImage(null);
      editorRef.current.focus();
      if (result.messages?.length) console.info("Word import:", result.messages);
    } catch (error) {
      alert("Không thể đọc tệp Word: " + error.message);
    }
  };
  const applyImageLayout = (layout) => {
    if (!selectedImage || !editorRef.current?.contains(selectedImage)) return;
    selectedImage.className = `word-image word-image-${layout}`;
    selectedImage.dataset.layout = layout;
    commit(editorRef.current.innerHTML);
  };
  const selectEditorImage = (target) => {
    const image = target?.closest?.("img") || null;
    if (image && editorRef.current?.contains(image)) {
      setSelectedImage(image);
    } else {
      setSelectedImage(null);
    }
  };
  const imageLayouts = [
    ["inline", "Trong dòng", "view_agenda"],
    ["wrap-left", "Bao quanh trái", "wrap_text"],
    ["wrap-right", "Bao quanh phải", "wrap_text"],
    ["break", "Ngắt văn bản", "format_text_wrap"],
    ["behind", "Phía sau văn bản", "flip_to_back"],
    ["front", "Phía trước văn bản", "flip_to_front"],
  ];
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
        {wordMode && <>
          <select aria-label="Kiểu đoạn" defaultValue="P" onChange={(event) => command("formatBlock", event.target.value)}><option value="P">Đoạn văn</option><option value="H1">Tiêu đề 1</option><option value="H2">Tiêu đề 2</option><option value="H3">Tiêu đề 3</option><option value="BLOCKQUOTE">Trích dẫn</option></select>
          <select aria-label="Phông chữ" defaultValue="Arial" onChange={(event) => command("fontName", event.target.value)}><option>Arial</option><option>Manrope</option><option>Georgia</option><option>Times New Roman</option><option>Verdana</option></select>
          <select aria-label="Cỡ chữ" defaultValue="3" onChange={(event) => command("fontSize", event.target.value)}><option value="2">12</option><option value="3">14</option><option value="4">18</option><option value="5">24</option><option value="6">32</option><option value="7">48</option></select>
          <label className="rich-color-tool" title="Màu chữ"><span className="material-symbols-outlined">format_color_text</span><input type="color" defaultValue="#1c2c58" onChange={(event) => command("foreColor", event.target.value)} /></label>
        </>}
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
        {wordMode && <>
          <button type="button" title="Căn phải" onMouseDown={(event) => { event.preventDefault(); command("justifyRight"); }}><span className="material-symbols-outlined">format_align_right</span></button>
          <button type="button" title="Căn đều" onMouseDown={(event) => { event.preventDefault(); command("justifyFull"); }}><span className="material-symbols-outlined">format_align_justify</span></button>
          <button type="button" title="Chèn ảnh" onMouseDown={(event) => { event.preventDefault(); rememberSelection(); imageInputRef.current?.click(); }}><span className="material-symbols-outlined">image</span></button>
          <button type="button" title="Chèn bảng" onMouseDown={(event) => { event.preventDefault(); insertTable(); }}><span className="material-symbols-outlined">table</span></button>
          <button type="button" title="Đường phân cách" onMouseDown={(event) => { event.preventDefault(); command("insertHorizontalRule"); }}><span className="material-symbols-outlined">horizontal_rule</span></button>
          <button type="button" title="Tải tệp Word" onMouseDown={(event) => { event.preventDefault(); rememberSelection(); docInputRef.current?.click(); }}><span className="material-symbols-outlined">upload_file</span></button>
          <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => { uploadInlineImage(event.target.files[0]); event.target.value = ""; }} />
          <input ref={docInputRef} type="file" accept=".docx" hidden onChange={(event) => { uploadWordDoc(event.target.files[0]); event.target.value = ""; }} />
        </>}
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
      {wordMode && selectedImage && <div className="image-layout-toolbar">
        <strong>Bố trí ảnh</strong>
        {imageLayouts.map(([layout, label, icon]) => <button key={layout} type="button" className={selectedImage.dataset.layout === layout ? "active" : ""} onMouseDown={(event) => { event.preventDefault(); applyImageLayout(layout); }}><span className="material-symbols-outlined">{icon}</span>{label}</button>)}
        <button type="button" className="image-layout-close" onMouseDown={(event) => { event.preventDefault(); setSelectedImage(null); }} aria-label="Đóng">×</button>
      </div>}
      <div
        ref={editorRef}
        className="rich-content"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(event) => {
          rememberSelection();
          commit(event.currentTarget.innerHTML);
        }}
        onMouseUp={rememberSelection}
        onMouseDownCapture={(event) => selectEditorImage(event.target)}
        onClick={(event) => selectEditorImage(event.target)}
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
  const [sizeOptions, setSizeOptions] = useState([]);
  const sizeCategories = [...new Map(sizeOptions.map((item) => [item.sizeCategoryId || item.group || 'other', { id: item.sizeCategoryId || item.group || 'other', name: item.group || 'Khác' }])).values()];
  const inferredSizeCategory = editingProduct?.sizeCategoryId || sizeOptions.find((option) => (editingProduct?.sizes || []).some((size) => size.id === option.id))?.sizeCategoryId || '';
  const activeSizeOptions = sizeOptions.filter((item) => item.sizeCategoryId === inferredSizeCategory);
  const [page, setPage] = useState(1);
  const excelInputRef = useRef(null);
  const productModalRef = useRef(null);
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
    adminApi.getSettings().then((rows) => {
      const sizes = rows.find((row) => row.key === 'product_sizes')?.value;
      if (!Array.isArray(sizes)) return setSizeOptions([]);
      setSizeOptions(sizes.some((item) => Array.isArray(item.sizes))
        ? sizes.filter((category) => category.isActive !== false).flatMap((category) => (category.sizes || []).filter((size) => size.isActive !== false).map((size) => ({ ...size, group: category.name, sizeCategoryId: category.id })))
        : sizes.filter((item) => item.isActive !== false));
    }).catch(console.error);
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
        materialCare: (editingProduct.materialCare || "").trim(),
        returnPolicy: (editingProduct.returnPolicy || "").trim(),
        technicalSpecs: (editingProduct.technicalSpecs || "").trim(),
        packageIncludes: (editingProduct.packageIncludes || "").trim(),
        price: Number(editingProduct.price),
        originalPrice: editingProduct.originalPrice ? Number(editingProduct.originalPrice) : undefined,
        costPrice: Number(editingProduct.costPrice || 0),
        stock: Number(editingProduct.stock),
        isBestSeller: Boolean(editingProduct.isBestSeller),
        showArButton: editingProduct.showArButton !== false,
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
        sizes: (editingProduct.sizes || []).map((item) => ({
          id: item.id,
          label: item.label?.trim() || sizeOptions.find((size) => size.id === item.id)?.label || 'Size',
          price: item.price === '' || item.price == null ? undefined : Number(item.price),
          originalPrice: item.originalPrice === '' || item.originalPrice == null ? undefined : Number(item.originalPrice),
          width: Array.isArray(item.measurements) || item.width === '' || item.width == null ? undefined : Number(item.width),
          length: Array.isArray(item.measurements) || item.length === '' || item.length == null ? undefined : Number(item.length),
          height: Array.isArray(item.measurements) || item.height === '' || item.height == null ? undefined : Number(item.height),
          unit: item.unit || 'cm',
          measurements: getSizeMeasurements(item).filter((measurement) => measurement.label?.trim()).map((measurement) => ({
            id: measurement.id || `measurement-${Date.now()}`,
            label: measurement.label.trim(),
            value: measurement.value === '' || measurement.value == null ? undefined : measurement.value,
            unit: measurement.unit?.trim() || 'cm',
          })),
        })),
        colors: (editingProduct.colors || []).map((color) => ({
          id: color.id,
          label: color.label.trim(),
          hex: color.hex,
          images: color.images || [],
        })),
      };
      if (editingProduct._id) await adminApi.updateProduct(editingProduct._id, payload);
      else await adminApi.createProduct(payload);
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

  const toggleArButton = async (product) => {
    await adminApi.updateProduct(product._id, { showArButton: product.showArButton === false });
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
      const results = await Promise.allSettled(
        imageFiles.map(async (file) =>
          adminApi.uploadProductImage(await fileToDataUrl(file)),
        ),
      );
      const urls = results.filter((result) => result.status === "fulfilled").map((result) => result.value);
      if (urls.length) {
        setEditingProduct((current) => {
          const images = [...(current.images || [])];
          if (replaceIndex !== null) images.splice(replaceIndex, 1, urls[0]);
          else images.push(...urls);
          return { ...current, images };
        });
      }
      const failedUploads = results.filter((result) => result.status === "rejected");
      if (failedUploads.length) alert(`${failedUploads.length}/${results.length} ảnh chưa tải được. ${failedUploads[0].reason?.message || "Vui lòng thử lại."}`);
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
      const results = await Promise.allSettled(imageFiles.map(async (file) => adminApi.uploadProductImage(await fileToDataUrl(file))));
      const urls = results.filter((result) => result.status === "fulfilled").map((result) => result.value);
      if (urls.length) {
        setEditingProduct((current) => ({
          ...current,
          colors: (current.colors || []).map((color, index) => index === colorIndex ? { ...color, images: [...(color.images || []), ...urls] } : color),
        }));
      }
      const failedUploads = results.filter((result) => result.status === "rejected");
      if (failedUploads.length) alert(`${failedUploads.length}/${results.length} ảnh màu chưa tải được. ${failedUploads[0].reason?.message || "Vui lòng thử lại."}`);
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
                materialCare: "",
                returnPolicy: "",
                technicalSpecs: "",
                packageIncludes: "",
                price: "",
                stock: 0,
                isBestSeller: false,
                showArButton: true,
                images: [],
                colors: [],
                sizes: [],
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
              <th>NÚT AR</th>
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
                <td><label className="compact-toggle" title="Hiển thị nút Thử trong phòng"><input type="checkbox" checked={product.showArButton !== false} onChange={() => toggleArButton(product)} /><span className="toggle-ui" /></label></td>
                <td>
                  <button
                    className="action-button"
                    onClick={() =>
                      setEditingProduct({
                        ...product,
                        showArButton: product.showArButton !== false,
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
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && productModalRef.current) {
              productModalRef.current.dataset.backdropClick = 'true';
            }
          }}
          onMouseUp={(event) => {
            if (event.target === event.currentTarget && productModalRef.current?.dataset.backdropClick === 'true') {
              setEditingProduct(null);
            }
            if (productModalRef.current) {
              productModalRef.current.dataset.backdropClick = 'false';
            }
          }}
        >
          <form
            ref={productModalRef}
            className="product-modal"
            onSubmit={handleEditSubmit}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
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
              <div className="modal-field full">
                <span>Danh mục size áp dụng</span>
                <div className="compact-size-selector">
                  <select value={inferredSizeCategory} onChange={(event) => setEditingProduct((current) => ({ ...current, sizeCategoryId: event.target.value }))}><option value="">Chọn danh mục size</option>{sizeCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
                  {inferredSizeCategory && <button type="button" className="secondary-button" onClick={() => setEditingProduct((current) => ({ ...current, sizes: [...(current.sizes || []).filter((item) => item.id.startsWith('custom-')), ...activeSizeOptions.map((size) => copySizeOption(size, (current.sizes || []).find((item) => item.id === size.id)))] }))}>Áp dụng tất cả</button>}
                  {!!(editingProduct.sizes || []).length && <button type="button" className="compact-clear-sizes" onClick={() => setEditingProduct((current) => ({ ...current, sizes: [] }))}>Bỏ chọn</button>}
                </div>
                {inferredSizeCategory ? <><span>Chọn size trong danh mục</span><div className="product-size-picker compact-product-size-picker">
                  {activeSizeOptions.map((size) => {
                    const checked = (editingProduct.sizes || []).some((item) => item.id === size.id);
                    return <label key={size.id} className={checked ? 'selected' : ''}><input type="checkbox" checked={checked} onChange={(event) => setEditingProduct((current) => ({ ...current, sizes: event.target.checked ? [...(current.sizes || []).filter((item) => item.id !== size.id), copySizeOption(size)] : (current.sizes || []).filter((item) => item.id !== size.id) }))} /><span>{size.label}</span><small>{[formatSizeMeasurements(size), size.price !== '' && size.price != null ? currency(size.price) : ''].filter(Boolean).join(' · ')}</small></label>;
                  })}
                </div></> : <p className="compact-size-hint">Chọn một danh mục để hiển thị các size bên trong.</p>}
                <details className="product-size-detail-editor" defaultOpen={!inferredSizeCategory}>
                  <summary><strong>Kích thước đang chọn ({(editingProduct.sizes || []).length})</strong><small>Chỉnh số đo riêng hoặc thêm size mới</small><span className="material-symbols-outlined">expand_more</span></summary>
                  <div className="product-size-detail-body">
                  {(editingProduct.sizes || []).map((size, index) => <div className="product-size-detail-row" key={size.id}>
                    <div className="product-size-card-header">
                      <label><span>Tên size</span><input value={size.label || ''} placeholder="Queen" onChange={(event) => setEditingProduct((current) => ({ ...current, sizes: current.sizes.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) }))} /></label>
                      <label><span>Giá gốc (VNĐ)</span><input type="number" min="0" value={size.originalPrice ?? ''} placeholder="Để trống nếu không sale" onChange={(event) => setEditingProduct((current) => ({ ...current, sizes: current.sizes.map((item, itemIndex) => itemIndex === index ? { ...item, originalPrice: event.target.value } : item) }))} /></label>
                      <label><span>Giá sale (VNĐ)</span><input type="number" min="0" value={size.price ?? ''} placeholder={`Mặc định: ${currency(editingProduct.price)}`} onChange={(event) => setEditingProduct((current) => ({ ...current, sizes: current.sizes.map((item, itemIndex) => itemIndex === index ? { ...item, price: event.target.value } : item) }))} /></label>
                      <button type="button" title="Xóa size khỏi sản phẩm" onClick={() => setEditingProduct((current) => ({ ...current, sizes: current.sizes.filter((_, itemIndex) => itemIndex !== index) }))}><span className="material-symbols-outlined">delete</span></button>
                    </div>
                    <EditableSizeMeasurements size={size} onChange={(measurements) => setEditingProduct((current) => ({ ...current, sizes: current.sizes.map((item, itemIndex) => itemIndex === index ? { ...item, width: '', length: '', height: '', measurements } : item) }))} />
                  </div>)}
                  <button type="button" className="secondary-button product-add-own-size" onClick={() => setEditingProduct((current) => ({ ...current, sizes: [...(current.sizes || []), { id: `custom-${Date.now()}`, label: '', price: '', originalPrice: '', measurements: [], unit: 'cm' }] }))}><span className="material-symbols-outlined">add</span>Thêm size riêng cho sản phẩm</button>
                  </div>
                </details>
              </div>
              <label className="modal-field">
                <span>Giá bán mặc định (VNĐ)</span>
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
                <span>Giá gốc trước giảm (VNĐ)</span>
                <input
                  type="number"
                  min="0"
                  value={editingProduct.originalPrice ?? ""}
                  placeholder="Để trống nếu không Sale"
                  onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value })}
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
              <div className="modal-field full">
                <span>Thông số kỹ thuật (mỗi dòng một thông số)</span>
                <textarea rows="5" value={editingProduct.technicalSpecs || ""} placeholder={'Chất liệu: 100% Lụa Mulberry 22 Momme\nTiêu chuẩn: OEKO-TEX Standard 100'} onChange={(e) => setEditingProduct({ ...editingProduct, technicalSpecs: e.target.value })} />
              </div>
              <div className="modal-field full">
                <span>Bộ sản phẩm bao gồm (mỗi dòng một mục)</span>
                <textarea rows="5" value={editingProduct.packageIncludes || ""} placeholder={'01 Ga bọc nệm\n01 Vỏ chăn\n02 Vỏ gối'} onChange={(e) => setEditingProduct({ ...editingProduct, packageIncludes: e.target.value })} />
              </div>
              <div className="modal-field full">
                <span>Chất liệu &amp; bảo quản</span>
                <RichTextEditor value={editingProduct.materialCare || ""} onChange={(materialCare) => setEditingProduct((current) => ({ ...current, materialCare }))} />
              </div>
              <div className="modal-field full">
                <span>Chính sách đổi trả của sản phẩm</span>
                <RichTextEditor value={editingProduct.returnPolicy || ""} onChange={(returnPolicy) => setEditingProduct((current) => ({ ...current, returnPolicy }))} />
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
                  <input type="checkbox" checked={editingProduct.showArButton !== false} onChange={(e) => setEditingProduct({ ...editingProduct, showArButton: e.target.checked })} />
                  <span className="toggle-ui" />
                  <span><strong>Hiển thị nút “Thử trong phòng”</strong><small>Chỉ bật nút trải nghiệm AR cho riêng sản phẩm này.</small></span>
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
                    onChange={(e) => {
                      const scrollTop = productModalRef.current?.scrollTop || 0;
                      setEditingProduct({
                        ...editingProduct,
                        allowCustomSize: e.target.checked,
                      });
                      requestAnimationFrame(() => {
                        if (productModalRef.current) productModalRef.current.scrollTop = scrollTop;
                      });
                    }}
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
