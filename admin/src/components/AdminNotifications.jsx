import { useEffect, useRef, useState } from 'react';
import { adminApi } from '../services/api';

const STORAGE_KEY = 'silkmoon_admin_notifications';
const CHECKED_KEY = 'silkmoon_admin_notifications_checked_at';
const readStored = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
};

export default function AdminNotifications({ onNavigate }) {
  const [items, setItems] = useState(readStored);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const rootRef = useRef(null);
  const pollingRef = useRef(false);

  const persist = (nextItems) => {
    setItems(nextItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  };

  useEffect(() => {
    const poll = async () => {
      if (pollingRef.current) return;
      pollingRef.current = true;
      const checkedAt = Number(localStorage.getItem(CHECKED_KEY) || 0);
      const nextCheckedAt = Date.now();
      try {
        const [orders, subscriptions] = await Promise.all([
          adminApi.getOrders({ page: 1, limit: 20 }),
          adminApi.getNewsletterSubscriptions({ page: 1, limit: 20 }),
        ]);
        const events = [
          ...(orders.items || []).map((order) => ({
            id: `order-${order._id}`,
            type: 'order',
            title: 'Có đơn hàng mới',
            message: `#${order.orderNumber} · ${order.fullName} · ${Number(order.total || 0).toLocaleString('vi-VN')}đ`,
            createdAt: order.createdAt,
            target: 'orders',
          })),
          ...(subscriptions.items || []).map((subscription) => ({
            id: `newsletter-${subscription._id}`,
            type: 'newsletter',
            title: 'Có đăng ký nhận ưu đãi mới',
            message: subscription.contact,
            createdAt: subscription.createdAt,
            target: 'newsletter',
          })),
        ].filter((event) => new Date(event.createdAt).getTime() > checkedAt);

        if (checkedAt && events.length) {
          setItems((current) => {
            const known = new Set(current.map((item) => item.id));
            const incoming = events.filter((event) => !known.has(event.id)).map((event) => ({ ...event, read: false }));
            if (!incoming.length) return current;
            const next = [...incoming, ...current].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 40);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            setToast(incoming[0]);
            return next;
          });
        }
        localStorage.setItem(CHECKED_KEY, String(nextCheckedAt));
      } catch (error) {
        console.error('Không thể tải thông báo admin', error);
      } finally {
        pollingRef.current = false;
      }
    };

    poll();
    const interval = window.setInterval(poll, 15000);
    const refresh = () => { if (!document.hidden) poll(); };
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', refresh); };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const close = (event) => { if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const unread = items.filter((item) => !item.read).length;
  const openNotification = (notification) => {
    persist(items.map((item) => item.id === notification.id ? { ...item, read: true } : item));
    setOpen(false);
    onNavigate(notification.target);
  };

  return <div className="admin-notification-root" ref={rootRef}>
    <button className={`icon-button notification-button ${open ? 'active' : ''}`} aria-label={`Thông báo${unread ? `, ${unread} chưa đọc` : ''}`} onClick={() => setOpen((value) => !value)}>
      <span className="material-symbols-outlined">notifications</span>
      {unread > 0 && <b>{unread > 99 ? '99+' : unread}</b>}
    </button>
    {open && <div className="notification-popover">
      <header><div><strong>Thông báo</strong><span>{unread ? `${unread} thông báo chưa đọc` : 'Không có thông báo mới'}</span></div>{unread > 0 && <button onClick={() => persist(items.map((item) => ({ ...item, read: true })))}>Đánh dấu đã đọc</button>}</header>
      <div className="notification-list">
        {items.length ? items.map((item) => <button className={item.read ? '' : 'unread'} key={item.id} onClick={() => openNotification(item)}>
          <span className={`notification-icon ${item.type}`}><span className="material-symbols-outlined">{item.type === 'order' ? 'receipt_long' : 'mark_email_unread'}</span></span>
          <span><strong>{item.title}</strong><small>{item.message}</small><time>{new Date(item.createdAt).toLocaleString('vi-VN')}</time></span>
        </button>) : <div className="notification-empty"><span className="material-symbols-outlined">notifications_none</span><p>Chưa có thông báo.</p></div>}
      </div>
    </div>}
    {toast && <button className="admin-notification-toast" onClick={() => openNotification(toast)}><span className={`notification-icon ${toast.type}`}><span className="material-symbols-outlined">{toast.type === 'order' ? 'receipt_long' : 'mark_email_unread'}</span></span><span><strong>{toast.title}</strong><small>{toast.message}</small></span><span className="material-symbols-outlined">arrow_forward</span></button>}
  </div>;
}
