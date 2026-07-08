import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminApi.getDashboardStats()
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) return <p>Loading stats...</p>;

  return (
    <>
      <div className="dashboard-grid">
        <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-header">
            <span>Total Revenue</span>
          </div>
          <div className="stat-value">
            ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="stat-header">
            <span>Active Users</span>
          </div>
          <div className="stat-value">{stats.activeUsersCount}</div>
        </div>

        <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="stat-header">
            <span>New Orders</span>
          </div>
          <div className="stat-value">{stats.newOrdersCount}</div>
        </div>
      </div>

      <div className="chart-section glass-panel animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h3>Recent Orders</h3>
        <table style={{ width: '100%', textAlign: 'left', marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.map(order => (
              <tr key={order._id}>
                <td>{order.orderNumber}</td>
                <td>{order.orderStatus}</td>
                <td>${order.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
