import { useCallback, useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import Pagination from './Pagination';
import ListSearch, { ListFilter, useListFilter, useListSearch } from './ListSearch';

const PAGE_SIZE = 20;

export default function CustomersList() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { query, setQuery, filteredItems: searchedUsers } = useListSearch(users);
  const { filter, setFilter, filteredItems: filteredUsers } = useListFilter(searchedUsers, (item) => item.role);

  const fetchUsers = useCallback(() => adminApi
      .getUsers({ page, limit: PAGE_SIZE })
      .then((data) => {
        setUsers(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(console.error), [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.createUser(form);
      setForm(null);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Không thể tạo tài khoản');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Danh sách khách hàng</h2>
          <p>{total} tài khoản trong hệ thống{totalPages > 1 ? ` — trang ${page}/${totalPages}` : ""}</p>
        </div>
        <div className="list-controls"><ListSearch value={query} onChange={setQuery} placeholder="Tìm khách hàng…" /><ListFilter value={filter} onChange={setFilter} options={[{value:'user',label:'Khách hàng'},{value:'admin',label:'Quản trị viên'}]} /><button className="primary-button" onClick={() => { setError(''); setForm({ fullName: '', email: '', phone: '', password: '', role: 'user' }); }}><span className="material-symbols-outlined">person_add</span>Thêm tài khoản</button></div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>HỌ VÀ TÊN</th><th>EMAIL</th><th>VAI TRÒ</th><th>NGÀY THAM GIA</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td className="cell-primary">{user.fullName || 'Chưa cập nhật'}</td>
                <td className="cell-muted">{user.email}</td>
                <td><span className="status">{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</span></td>
                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      {form && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setForm(null)}>
        <form className="category-modal" onSubmit={createUser}>
          <div className="modal-header"><div><span className="login-eyebrow">TÀI KHOẢN MỚI</span><h2>Tạo tài khoản</h2></div><button type="button" className="icon-button" onClick={() => setForm(null)}><span className="material-symbols-outlined">close</span></button></div>
          <div className="modal-form-grid">
            <label className="modal-field full"><span>Họ và tên</span><input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label>
            <label className="modal-field"><span>Email</span><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label className="modal-field"><span>Số điện thoại</span><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
            <label className="modal-field"><span>Mật khẩu</span><input required minLength="6" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
            <label className="modal-field"><span>Vai trò</span><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="user">Khách hàng</option><option value="admin">Quản trị viên</option></select></label>
            {error && <p className="login-error modal-field full" role="alert">{error}</p>}
          </div>
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setForm(null)}>Hủy</button><button className="primary-button" disabled={saving}>{saving ? 'Đang tạo…' : 'Tạo tài khoản'}</button></div>
        </form>
      </div>}
    </div>
  );
}
