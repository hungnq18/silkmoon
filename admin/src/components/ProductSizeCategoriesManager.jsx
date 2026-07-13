import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../services/api';
import Pagination from './Pagination';

const PAGE_SIZE = 5;
const slugify = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const legacyMeasurements = (size) => [
  ['width', 'Rộng'],
  ['length', 'Dài'],
  ['height', 'Dày/Cao'],
].filter(([key]) => size[key] !== undefined && size[key] !== null && size[key] !== '').map(([key, label]) => ({ id: key, label, value: size[key], unit: size.unit || 'cm' }));
const normalizeSize = (size) => ({ ...size, measurements: Array.isArray(size.measurements) ? size.measurements : legacyMeasurements(size) });
const normalizeCategories = (value) => {
  if (!Array.isArray(value)) return [];
  if (value.every((item) => Array.isArray(item.sizes))) return value.map((category) => ({ ...category, sizes: category.sizes.map(normalizeSize) }));
  const groups = new Map();
  value.forEach((item) => {
    const name = item.group || 'Khác';
    if (!groups.has(name)) groups.set(name, { id: slugify(name) || `category-${Date.now()}`, name, isActive: true, sizes: [] });
    groups.get(name).sizes.push(normalizeSize({ ...item, group: undefined }));
  });
  return [...groups.values()];
};

const DimensionInputs = ({ size, onChange }) => {
  const measurements = size.measurements || [];
  const update = (index, key, value) => onChange('measurements', measurements.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  return <div className="size-dimension-editor">
    {measurements.map((measurement, index) => <div className="size-dimension-row" key={measurement.id || index}>
      <label><span>Tên thông số</span><input className="table-inline-input" value={measurement.label || ''} placeholder="VD: Đường kính" onChange={(event) => update(index, 'label', event.target.value)} /></label>
      <label><span>Giá trị</span><input className="table-inline-input size-number-input" type="number" min="0" value={measurement.value ?? ''} placeholder="0" onChange={(event) => update(index, 'value', event.target.value === '' ? '' : Number(event.target.value))} /></label>
      <label><span>Đơn vị</span><input className="table-inline-input size-unit-input" value={measurement.unit || 'cm'} placeholder="cm" onChange={(event) => update(index, 'unit', event.target.value)} /></label>
      <button type="button" className="size-measurement-delete" title="Xóa thông số" onClick={() => onChange('measurements', measurements.filter((_, itemIndex) => itemIndex !== index))}><span className="material-symbols-outlined">close</span></button>
    </div>)}
    <button type="button" className="size-measurement-add" onClick={() => onChange('measurements', [...measurements, { id: `measurement-${Date.now()}`, label: '', value: '', unit: 'cm' }])}><span className="material-symbols-outlined">add</span>Thêm thông số</button>
  </div>;
};

export default function ProductSizeCategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  useEffect(() => { adminApi.getSettings().then((rows) => setCategories(normalizeCategories(rows.find((row) => row.key === 'product_sizes')?.value))); }, []);
  const visible = useMemo(() => { const keyword = query.trim().toLowerCase(); return categories.filter((category) => !keyword || category.name.toLowerCase().includes(keyword) || category.sizes.some((size) => size.label.toLowerCase().includes(keyword))); }, [categories, query]);
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [query]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const updateCategory = (id, key, value) => setCategories((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const updateSize = (categoryId, sizeId, key, value) => setCategories((items) => items.map((item) => item.id === categoryId ? { ...item, sizes: item.sizes.map((size) => size.id === sizeId ? { ...size, [key]: value } : size) } : item));
  const addCategory = () => setCategories((items) => [{ id: `category-${Date.now()}`, name: 'Danh mục size mới', isActive: true, sizes: [] }, ...items]);
  const addSize = (categoryId) => setCategories((items) => items.map((item) => item.id === categoryId ? { ...item, sizes: [...item.sizes, { id: `size-${Date.now()}`, label: 'Size mới', measurements: [{ id: `measurement-${Date.now()}`, label: 'Rộng', value: '', unit: 'cm' }], isActive: true }] } : item));
  const save = async () => { setSaving(true); await adminApi.saveSetting('product_sizes', { value: categories, description: 'Danh mục kích thước; mỗi danh mục chứa các size riêng' }); setSaving(false); };

  return <div className="panel size-manager nested-size-manager">
    <div className="panel-header"><div><h2>Danh mục size sản phẩm</h2><p>{categories.length} danh mục · {categories.reduce((total, category) => total + category.sizes.length, 0)} size</p></div><div className="size-header-actions"><button className="secondary-button" onClick={addCategory}><span className="material-symbols-outlined">create_new_folder</span>Thêm danh mục</button><button className="primary-button" disabled={saving} onClick={save}>{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div></div>
    <div className="size-list-toolbar"><label className="size-category-search"><span className="material-symbols-outlined">search</span><input value={query} placeholder="Tìm danh mục hoặc tên size…" onChange={(event) => setQuery(event.target.value)} />{query && <button type="button" onClick={() => setQuery('')} aria-label="Xóa nội dung tìm kiếm"><span className="material-symbols-outlined">close</span></button>}</label><span>Trang {page}/{totalPages}</span></div>
    <div className="size-category-list">{pageItems.map((category) => <section className="size-category-card" key={category.id}>
      <header><div className="size-category-title"><span className="material-symbols-outlined">folder_open</span><div><input value={category.name} onChange={(event) => updateCategory(category.id, 'name', event.target.value)} /><small>{category.productCategory || 'Danh mục tùy chỉnh'} · {category.sizes.length} size</small></div></div><div className="size-category-actions"><label className="compact-toggle"><input type="checkbox" checked={category.isActive !== false} onChange={(event) => updateCategory(category.id, 'isActive', event.target.checked)} /><span className="toggle-ui" /></label><button className="secondary-button" onClick={() => addSize(category.id)}><span className="material-symbols-outlined">add</span>Thêm size</button><button className="action-button danger" onClick={() => setCategories((items) => items.filter((item) => item.id !== category.id))}>Xóa danh mục</button></div></header>
      {category.sizes.length ? <div className="table-wrap"><table className="data-table nested-size-table"><thead><tr><th>TÊN SIZE</th><th>THÔNG SỐ KÍCH THƯỚC</th><th>HIỂN THỊ</th><th></th></tr></thead><tbody>{category.sizes.map((size) => <tr key={size.id}><td><input className="table-inline-input size-name-input" value={size.label} onChange={(event) => updateSize(category.id, size.id, 'label', event.target.value)} /></td><td><DimensionInputs size={size} onChange={(key, value) => updateSize(category.id, size.id, key, value)} /></td><td><label className="compact-toggle"><input type="checkbox" checked={size.isActive !== false} onChange={(event) => updateSize(category.id, size.id, 'isActive', event.target.checked)} /><span className="toggle-ui" /></label></td><td><button className="icon-button size-delete-button" onClick={() => setCategories((items) => items.map((item) => item.id === category.id ? { ...item, sizes: item.sizes.filter((entry) => entry.id !== size.id) } : item))}><span className="material-symbols-outlined">delete</span></button></td></tr>)}</tbody></table></div> : <div className="size-empty-state"><span className="material-symbols-outlined">straighten</span><p>Danh mục này chưa có size.</p><button onClick={() => addSize(category.id)}>Thêm size đầu tiên</button></div>}
    </section>)}{!pageItems.length && <div className="empty-state"><span className="material-symbols-outlined">search_off</span><h3>Không tìm thấy danh mục size</h3></div>}</div>
    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
  </div>;
}
