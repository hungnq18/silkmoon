import { useEffect, useRef, useState } from 'react';
import { subscribeToToasts } from '../services/toast';

const toastMeta = {
  success: { icon: 'check_circle', title: 'Thành công' },
  error: { icon: 'error', title: 'Thất bại' },
  warning: { icon: 'warning', title: 'Cảnh báo' },
  info: { icon: 'info', title: 'Thông báo' },
};

export default function ToastViewport() {
  const [items, setItems] = useState([]);
  const timers = useRef(new Map());

  const dismiss = (id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  };

  useEffect(() => {
    const unsubscribe = subscribeToToasts((item) => {
      setItems((current) => [...current.slice(-3), item]);
      timers.current.set(item.id, window.setTimeout(() => dismiss(item.id), item.duration));
    });
    const activeTimers = timers.current;
    return () => {
      unsubscribe();
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {items.map((item) => {
        const meta = toastMeta[item.type] || toastMeta.info;
        return (
          <div className={`action-toast ${item.type}`} role={item.type === 'error' ? 'alert' : 'status'} key={item.id}>
            <span className="material-symbols-outlined toast-icon">{meta.icon}</span>
            <div><strong>{item.title || meta.title}</strong><p>{item.message}</p></div>
            <button type="button" onClick={() => dismiss(item.id)} aria-label="Đóng thông báo"><span className="material-symbols-outlined">close</span></button>
            <span className="toast-progress" style={{ animationDuration: `${item.duration}ms` }} />
          </div>
        );
      })}
    </div>
  );
}
