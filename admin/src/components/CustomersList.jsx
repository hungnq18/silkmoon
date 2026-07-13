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
  const [selectedUser, setSelectedUser] = useState(null);
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

  const toggleUserActive = async (user) => {
    const isActive = user.isActive === false;
    try {
      const updated = await adminApi.updateUser(user._id, { isActive });
      setUsers((current) => current.map((item) => item._id === user._id ? { ...item, ...updated } : item));
      setSelectedUser((current) => current?._id === user._id ? { ...current, ...updated } : current);
    } catch (err) {
      setError(err.message || 'Không thể cập nhật trạng thái tài khoản');
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
              <th>HỌ VÀ TÊN</th><th>EMAIL</th><th>ĐIỆN THOẠI</th><th>VAI TRÒ</th><th>TRẠNG THÁI</th><th>NGÀY THAM GIA</th><th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td className="cell-primary">{user.fullName || 'Chưa cập nhật'}</td>
                <td className="cell-muted">{user.email}</td>
                <td>{user.phone || '—'}</td>
                <td><span className="status">{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</span></td>
                <td><span className={`status ${user.isActive === false ? 'cancelled' : 'completed'}`}>{user.isActive === false ? 'Đã khóa' : 'Đang hoạt động'}</span></td>
                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                <td><div className="customer-row-actions"><button className="action-button" onClick={() => setSelectedUser(user)}>Xem</button><button className={`action-button ${user.isActive === false ? '' : 'danger'}`} onClick={() => toggleUserActive(user)}>{user.isActive === false ? 'Mở khóa' : 'Khóa tài khoản'}</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      {selectedUser && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setSelectedUser(null)}><div className="order-modal customer-detail-modal"><div className="modal-header"><div><span className="login-eyebrow">CHI TIẾT KHÁCH HÀNG</span><h2>{selectedUser.fullName || 'Chưa cập nhật tên'}</h2></div><button className="icon-button" onClick={() => setSelectedUser(null)}><span className="material-symbols-outlined">close</span></button></div><div className="customer-detail-head">{selectedUser.avatarUrl ? <img src={selectedUser.avatarUrl} alt=""/> : <div>{(selectedUser.fullName || selectedUser.email || 'SM').split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase()}</div>}<section><strong>{selectedUser.email}</strong><span>{selectedUser.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</span><span className={`status ${selectedUser.isActive === false ? 'cancelled' : 'completed'}`}>{selectedUser.isActive === false ? 'Đã khóa' : 'Đang hoạt động'}</span></section></div><div className="order-detail-grid"><section><h3>Thông tin liên hệ</h3><dl><div><dt>Họ và tên</dt><dd>{selectedUser.fullName || '—'}</dd></div><div><dt>Email</dt><dd>{selectedUser.email}</dd></div><div><dt>Điện thoại</dt><dd>{selectedUser.phone || '—'}</dd></div><div><dt>Địa chỉ</dt><dd>{selectedUser.address || 'Chưa cập nhật'}</dd></div></dl></section><section><h3>Thông tin tài khoản</h3><dl><div><dt>Xác minh email</dt><dd>{selectedUser.emailVerified === false ? 'Chưa xác minh' : 'Đã xác minh'}</dd></div><div><dt>Ngày tham gia</dt><dd>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString('vi-VN') : '—'}</dd></div><div><dt>Cập nhật gần nhất</dt><dd>{selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString('vi-VN') : '—'}</dd></div><div><dt>Sản phẩm trong giỏ</dt><dd>{(selectedUser.cart || []).reduce((total, item) => total + (Number(item.quantity) || 0), 0)}</dd></div></dl></section></div><div className="modal-actions"><button className={selectedUser.isActive === false ? 'primary-button' : 'secondary-button danger-button'} onClick={() => toggleUserActive(selectedUser)}>{selectedUser.isActive === false ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}</button><button className="secondary-button" onClick={() => setSelectedUser(null)}>Đóng</button></div></div></div>}
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
