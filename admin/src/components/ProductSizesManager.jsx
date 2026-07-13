import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../services/api';

const defaults = [
  { id: 's', label: 'S', group: 'Đồ mặc', isActive: true },
  { id: 'm', label: 'M', group: 'Đồ mặc', isActive: true },
  { id: 'l', label: 'L', group: 'Đồ mặc', isActive: true },
  { id: 'xl', label: 'XL', group: 'Đồ mặc', isActive: true },
  { id: 'queen', label: 'Queen', group: 'Chăn ga', width: 160, length: 200, height: 20, unit: 'cm', isActive: true },
  { id: 'king', label: 'King', group: 'Chăn ga', width: 180, length: 200, height: 20, unit: 'cm', isActive: true },
  { id: 'super-king', label: 'Super King', group: 'Chăn ga', width: 220, length: 200, height: 20, unit: 'cm', isActive: true },
];

const slugify = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function ProductSizesManager() {
  const [sizes, setSizes] = useState(defaults);
  const [form, setForm] = useState({ label: '', group: '', width: '', length: '', height: '' });
  const [saving, setSaving] = useState(false);
  const groups = useMemo(() => [...new Set(sizes.map((item) => item.group).filter(Boolean))], [sizes]);

  useEffect(() => {
    adminApi.getSettings().then((rows) => {
      const value = rows.find((row) => row.key === 'product_sizes')?.value;
      if (Array.isArray(value) && value.length) setSizes(value);
    });
  }, []);

  const add = (event) => {
    event.preventDefault();
    const label = form.label.trim();
    if (!label) return;
    let id = slugify(label) || `size-${Date.now()}`;
    if (sizes.some((item) => item.id === id)) id = `${id}-${Date.now()}`;
    setSizes((items) => [...items, { id, label, group: form.group.trim() || 'Khác', width: form.width === '' ? undefined : Number(form.width), length: form.length === '' ? undefined : Number(form.length), height: form.height === '' ? undefined : Number(form.height), unit: 'cm', isActive: true }]);
    setForm({ label: '', group: form.group, width: '', length: '', height: '' });
  };

  const update = (id, key, value) => setSizes((items) => items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const save = async () => {
    setSaving(true);
    await adminApi.saveSetting('product_sizes', { value: sizes, description: 'Danh mục kích thước sản phẩm' });
    setSaving(false);
  };

  return <div className="panel size-manager">
    <div className="panel-header"><div><h2>Phân loại size sản phẩm</h2><p>Tạo nhóm size dùng chung và chọn size phù hợp trong từng sản phẩm.</p></div><button className="primary-button" disabled={saving} onClick={save}>{saving ? 'Đang lưu…' : 'Lưu danh mục size'}</button></div>
    <form className="size-create-row" onSubmit={add}>
      <label className="modal-field"><span>Tên hiển thị</span><input value={form.label} placeholder="Ví dụ: Queen (160x200)" onChange={(event) => setForm({ ...form, label: event.target.value })} /></label>
      <label className="modal-field"><span>Nhóm size</span><input list="size-groups" value={form.group} placeholder="Ví dụ: Chăn ga" onChange={(event) => setForm({ ...form, group: event.target.value })} /><datalist id="size-groups">{groups.map((group) => <option key={group} value={group} />)}</datalist></label>
      <label className="modal-field"><span>Rộng (cm)</span><input type="number" min="0" value={form.width} onChange={(event) => setForm({ ...form, width: event.target.value })} /></label>
      <label className="modal-field"><span>Dài (cm)</span><input type="number" min="0" value={form.length} onChange={(event) => setForm({ ...form, length: event.target.value })} /></label>
      <label className="modal-field"><span>Dày/Cao (cm)</span><input type="number" min="0" value={form.height} onChange={(event) => setForm({ ...form, height: event.target.value })} /></label>
      <button className="secondary-button" type="submit"><span className="material-symbols-outlined">add</span>Thêm size</button>
    </form>
    <div className="table-wrap"><table className="data-table"><thead><tr><th>TÊN SIZE</th><th>NHÓM</th><th>RỘNG</th><th>DÀI</th><th>DÀY/CAO</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead><tbody>{sizes.map((item) => <tr key={item.id}><td><input className="table-inline-input" value={item.label} onChange={(event) => update(item.id, 'label', event.target.value)} /></td><td><input className="table-inline-input" value={item.group || ''} onChange={(event) => update(item.id, 'group', event.target.value)} /></td>{['width','length','height'].map((key) => <td key={key}><input className="table-inline-input size-number-input" type="number" min="0" value={item[key] ?? ''} onChange={(event) => update(item.id, key, event.target.value === '' ? '' : Number(event.target.value))} /></td>)}<td><label className="compact-toggle"><input type="checkbox" checked={item.isActive !== false} onChange={(event) => update(item.id, 'isActive', event.target.checked)} /><span className="toggle-ui" /></label></td><td><button className="action-button danger" onClick={() => setSizes((items) => items.filter((size) => size.id !== item.id))}>Xóa</button></td></tr>)}</tbody></table></div>
  </div>;
}
