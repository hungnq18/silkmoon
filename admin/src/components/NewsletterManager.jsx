import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import Pagination from './Pagination';
import ListSearch, { ListFilter } from './ListSearch';

const PAGE_SIZE = 20;

export default function NewsletterManager() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [campaign, setCampaign] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const load = useCallback(() => {
    adminApi.getNewsletterSubscriptions({ page, limit: PAGE_SIZE, search, status, type }).then((data) => {
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    }).catch((error) => setNotice(error.message));
  }, [page, search, status, type]);

  useEffect(() => { load(); }, [load]);
  const eligibleItems = items.filter((item) => item.type === 'email' && item.status === 'active');
  const allPageSelected = eligibleItems.length > 0 && eligibleItems.every((item) => selectedIds.includes(item._id));
  const toggleRecipient = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const togglePageRecipients = () => setSelectedIds((current) => allPageSelected ? current.filter((id) => !eligibleItems.some((item) => item._id === id)) : [...new Set([...current, ...eligibleItems.map((item) => item._id)])]);

  const sendCampaign = async (event) => {
    event.preventDefault();
    setSending(true);
    setNotice('');
    try {
      if (!selectedIds.length) throw new Error('Vui lòng chọn ít nhất một email đang hoạt động để gửi.');
      const result = await adminApi.sendNewsletterCampaign({ ...campaign, recipientIds: selectedIds });
      setNotice(`Đã gửi thành công tới ${result.sent} email.`);
      setCampaign({ subject: '', message: '' });
      setSelectedIds([]);
      load();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSending(false);
    }
  };

  return <div className="content-settings">
    <section className="panel content-section">
      <div className="panel-header"><div><h2>Gửi email ưu đãi</h2><p>Chọn người nhận trong danh sách bên dưới; chỉ email đang hoạt động mới có thể gửi.</p></div></div>
      <form onSubmit={sendCampaign} className="content-fields">
        <label className="modal-field"><span>Tiêu đề email</span><input required maxLength="180" value={campaign.subject} onChange={(event) => setCampaign({ ...campaign, subject: event.target.value })} /></label>
        <label className="modal-field"><span>Nội dung</span><textarea required rows="5" maxLength="10000" value={campaign.message} onChange={(event) => setCampaign({ ...campaign, message: event.target.value })} /></label>
        <div className="newsletter-send-row"><button disabled={sending || !selectedIds.length} className="primary-button">{sending ? 'Đang gửi…' : `Gửi tới ${selectedIds.length} email`}</button><span>{selectedIds.length ? `Đã chọn ${selectedIds.length} người nhận` : 'Chưa chọn email nhận ưu đãi'}</span></div>
      </form>
      {notice && <p className="newsletter-notice">{notice}</p>}
    </section>
    <section className="panel">
      <div className="panel-header"><div><h2>Đăng ký nhận ưu đãi</h2><p>{total} thông tin đã đăng ký từ Footer.</p></div><div className="list-controls"><ListSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Tìm email hoặc số điện thoại…"/><ListFilter value={status} onChange={(value) => { setStatus(value); setPage(1); }} options={[{ value: 'active', label: 'Đang nhận' }, { value: 'unsubscribed', label: 'Đã hủy' }]}/><ListFilter value={type} onChange={(value) => { setType(value); setPage(1); }} label="Loại liên hệ" options={[{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Số điện thoại' }]}/></div></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th className="newsletter-check-cell"><input type="checkbox" checked={allPageSelected} disabled={!eligibleItems.length} onChange={togglePageRecipients} aria-label="Chọn tất cả email hoạt động trên trang" /></th><th>LIÊN HỆ</th><th>LOẠI</th><th>TRẠNG THÁI</th><th>NGÀY ĐĂNG KÝ</th><th>EMAIL GẦN NHẤT</th><th>THAO TÁC</th></tr></thead><tbody>{items.map((item) => { const canSend = item.type === 'email' && item.status === 'active'; return <tr key={item._id} className={selectedIds.includes(item._id) ? 'newsletter-row-selected' : ''}><td className="newsletter-check-cell">{canSend ? <input type="checkbox" checked={selectedIds.includes(item._id)} onChange={() => toggleRecipient(item._id)} aria-label={`Chọn ${item.contact}`} /> : <span>—</span>}</td><td className="cell-primary">{item.contact}</td><td>{item.type === 'email' ? 'Email' : 'Số điện thoại'}</td><td><span className={`status ${item.status === 'active' ? 'completed' : 'cancelled'}`}>{item.status === 'active' ? 'Đang nhận' : 'Đã hủy'}</span></td><td>{new Date(item.createdAt).toLocaleString('vi-VN')}</td><td>{item.lastEmailSentAt ? new Date(item.lastEmailSentAt).toLocaleString('vi-VN') : '—'}</td><td><div className="newsletter-actions"><button className="action-button" onClick={async () => { await adminApi.updateNewsletterStatus(item._id, item.status === 'active' ? 'unsubscribed' : 'active'); setSelectedIds((current) => current.filter((id) => id !== item._id)); load(); }}>{item.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}</button><button className="action-button danger" title="Xóa" onClick={async () => { await adminApi.deleteNewsletterSubscription(item._id); setSelectedIds((current) => current.filter((id) => id !== item._id)); load(); }}><span className="material-symbols-outlined">delete</span></button></div></td></tr>; })}</tbody></table></div>
      {!items.length && <div className="empty-state"><span className="material-symbols-outlined">mark_email_unread</span><p>Chưa có đăng ký phù hợp.</p></div>}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage}/>
    </section>
  </div>;
}
