import { useState, useEffect } from "react";
import { adminApi } from "../services/api";
import Pagination from "./Pagination";
import ListSearch, { ListFilter, useListFilter, useListSearch } from "./ListSearch";
const currency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
const labels = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao hàng",
  delivered: "Đã giao hàng",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};
const paymentLabels = { cod: "Thanh toán khi nhận hàng", payos: "Thanh toán PayOS" };
const paymentStatusLabels = { pending: "Chờ thanh toán", paid: "Đã thanh toán", failed: "Thanh toán thất bại" };

const PAGE_SIZE = 15;

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [customization, setCustomization] = useState("all");
  const { query, setQuery, filteredItems: searchedOrders } = useListSearch(orders);
  const { filter, setFilter, filteredItems: filteredOrders } = useListFilter(searchedOrders, (item) => item.orderStatus);

  useEffect(() => {
    fetchOrders(page);
  }, [page, customization]);

  const fetchOrders = (p = page) => {
    adminApi
      .getOrders({ page: p, limit: PAGE_SIZE, customization })
      .then((data) => {
        setOrders(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(console.error);
  };

  const changeCustomization = (value) => {
    setCustomization(value);
    setPage(1);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminApi.updateOrderStatus(id, newStatus);
      fetchOrders(page);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Danh sách đơn hàng</h2>
          <p>{total} đơn hàng trong hệ thống{totalPages > 1 ? ` — trang ${page}/${totalPages}` : ""}</p>
        </div>
        <div className="list-controls"><ListSearch value={query} onChange={setQuery} placeholder="Tìm đơn hàng…" /><ListFilter value={filter} onChange={setFilter} options={Object.entries(labels).map(([value,label]) => ({value,label}))} /><select className="list-filter customization-filter" value={customization} onChange={(event) => changeCustomization(event.target.value)}><option value="all">Tất cả loại đơn</option><option value="embroidery">Đơn may tên riêng</option><option value="customSize">Đơn kích thước riêng</option></select></div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>MÃ ĐƠN</th>
              <th>KHÁCH HÀNG</th>
              <th>TỔNG TIỀN</th>
              <th>THANH TOÁN</th>
              <th>LOẠI ĐƠN</th>
              <th>TRẠNG THÁI</th>
              <th>CHI TIẾT</th><th>CẬP NHẬT</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td className="cell-primary">#{order.orderNumber}</td>
                <td>{order.fullName}</td>
                <td>{currency(order.total)}</td>
                <td>
                  <div className="payment-state">
                    <span className={`status ${order.paymentStatus === "paid" ? "completed" : order.paymentStatus === "failed" ? "cancelled" : ""}`}>
                      {paymentStatusLabels[order.paymentStatus] || "Chờ thanh toán"}
                    </span>
                    <small>{paymentLabels[order.paymentMethod] || order.paymentMethod}</small>
                  </div>
                </td>
                <td><div className="order-customization-tags">{(order.hasEmbroidery || order.items?.some((item) => item.embroidery)) && <span className="order-customization-tag embroidery">May tên</span>}{(order.hasCustomSize || order.items?.some((item) => item.isCustomSize)) && <span className="order-customization-tag custom-size">Size riêng</span>}{!(order.hasEmbroidery || order.hasCustomSize || order.items?.some((item) => item.embroidery || item.isCustomSize)) && <span>—</span>}</div></td>
                <td>
                  <span className={`status ${order.orderStatus}`}>
                    {labels[order.orderStatus] || order.orderStatus}
                  </span>
                </td>
                <td><button className="action-button order-detail-button" onClick={() => setSelectedOrder(order)}><span className="material-symbols-outlined">visibility</span>Xem</button></td>
                <td>
                  <select
                    className="table-select"
                    value={order.orderStatus}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                  >
                    {Object.entries(labels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      {selectedOrder && <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setSelectedOrder(null)}><div className="order-modal"><div className="modal-header"><div><span className="login-eyebrow">ĐƠN HÀNG</span><h2>#{selectedOrder.orderNumber}</h2></div><button className="icon-button" onClick={() => setSelectedOrder(null)}><span className="material-symbols-outlined">close</span></button></div>
        <div className="order-detail-grid"><section><h3>Thông tin khách hàng</h3><dl><div><dt>Họ và tên</dt><dd>{selectedOrder.fullName}</dd></div><div><dt>Điện thoại</dt><dd>{selectedOrder.phone}</dd></div><div><dt>Email</dt><dd>{selectedOrder.email || '—'}</dd></div><div><dt>Địa chỉ</dt><dd>{selectedOrder.address}, {selectedOrder.city}</dd></div>{selectedOrder.note && <div><dt>Ghi chú</dt><dd>{selectedOrder.note}</dd></div>}</dl></section><section><h3>Thanh toán & trạng thái</h3><dl><div><dt>Phương thức</dt><dd>{paymentLabels[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}</dd></div><div><dt>Thanh toán</dt><dd>{paymentStatusLabels[selectedOrder.paymentStatus] || selectedOrder.paymentStatus}</dd></div><div><dt>Trạng thái đơn</dt><dd><span className={`status ${selectedOrder.orderStatus}`}>{labels[selectedOrder.orderStatus] || selectedOrder.orderStatus}</span></dd></div><div><dt>Ngày tạo</dt><dd>{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : '—'}</dd></div></dl></section></div>
        <div className="order-products"><h3>Sản phẩm trong đơn</h3>{(selectedOrder.items || []).map((item,index)=><article key={`${item.productId}-${index}`}><img src={item.image} alt={item.name}/><div><strong>{item.name}</strong><span>{item.spec}</span>{item.embroidery && <span className="order-item-customization">May tên: “{item.embroidery}”</span>}{item.isCustomSize && <span className="order-item-customization">Kích thước riêng: {(item.customMeasurements || []).length ? item.customMeasurements.map((measurement) => `${measurement.label}: ${measurement.value}${measurement.unit || ''}`).join(' · ') : `${[item.customSize?.width, item.customSize?.length, item.customSize?.height].filter((value) => value !== undefined && value !== null && value !== 0).join(' × ')} cm`}</span>}</div><span>x{item.quantity}</span><b>{currency(item.price * item.quantity)}</b></article>)}</div>
        <div className="order-totals"><div><span>Tạm tính</span><strong>{currency(selectedOrder.subtotal)}</strong></div><div><span>Giảm giá {selectedOrder.promoCode ? `(${selectedOrder.promoCode})` : ''}</span><strong>-{currency(selectedOrder.discountAmount)}</strong></div><div className="grand-total"><span>Tổng thanh toán</span><strong>{currency(selectedOrder.total)}</strong></div></div>
        <div className="modal-actions"><select className="table-select" value={selectedOrder.orderStatus} onChange={async event => { const status=event.target.value; await handleStatusChange(selectedOrder._id,status); setSelectedOrder(current=>({...current,orderStatus:status})); }}>{Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><button className="primary-button" onClick={() => setSelectedOrder(null)}>Đóng</button></div>
      </div></div>}
    </div>
  );
}
