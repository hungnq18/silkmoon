import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    adminApi.getOrders().then(setOrders).catch(console.error);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminApi.updateOrderStatus(id, newStatus);
      fetchOrders();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2>Orders</h2>
      <table style={{ width: '100%', textAlign: 'left', marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order.orderNumber}</td>
              <td>{order.fullName}</td>
              <td>${order.total.toLocaleString()}</td>
              <td>{order.orderStatus}</td>
              <td>
                <select 
                  value={order.orderStatus} 
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
