import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import ListSearch, { ListFilter, useListFilter, useListSearch } from './ListSearch';
import Pagination from './Pagination';

const currency = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
const statusLabel = { pending: 'Chờ xác nhận', processing: 'Đang xử lý', completed: 'Hoàn thành', cancelled: 'Đã hủy' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const { query, setQuery, filteredItems: searchedOrders } = useListSearch(stats?.recentOrders || []);
  const { filter, setFilter, filteredItems: recentOrders } = useListFilter(searchedOrders, (item) => item.orderStatus);
  const pageSize = 5;

  useEffect(() => {
    adminApi.getDashboardStats()
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) return <div className="panel loading-state">Đang tải dữ liệu…</div>;

  return (
    <>
      <div className="dashboard-grid">
        {[['Doanh thu', currency(stats.totalRevenue), 'payments'], ['Khách hàng hoạt động', stats.activeUsersCount, 'group'], ['Đơn hàng mới', stats.newOrdersCount, 'orders']].map(([label, value, icon]) => (
          <div className="stat-card panel" key={label}><div className="stat-header"><span>{label}</span><span className="stat-icon"><span className="material-symbols-outlined">{icon}</span></span></div><div className="stat-value">{value}</div></div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header"><div><h2>Đơn hàng gần đây</h2><p>Những đơn hàng mới nhất tại cửa hàng.</p></div><div className="list-controls"><ListSearch value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Tìm đơn hàng…" /><ListFilter value={filter} onChange={(value) => { setFilter(value); setPage(1); }} options={Object.entries(statusLabel).map(([value,label]) => ({value,label}))} /></div></div>
        <div className="table-wrap"><table className="data-table">
          <thead>
            <tr>
              <th>MÃ ĐƠN</th><th>TRẠNG THÁI</th><th>TỔNG TIỀN</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.slice((page - 1) * pageSize, page * pageSize).map(order => (
              <tr key={order._id}>
                <td className="cell-primary">#{order.orderNumber}</td>
                <td><span className={`status ${order.orderStatus}`}>{statusLabel[order.orderStatus] || order.orderStatus}</span></td>
                <td>{currency(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <Pagination page={page} totalPages={Math.max(1, Math.ceil(recentOrders.length / pageSize))} onPageChange={setPage} />
      </div>
    </>
  );
}
