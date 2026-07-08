import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import OrdersList from './components/OrdersList';
import ProductsList from './components/ProductsList';
import CustomersList from './components/CustomersList';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  useEffect(() => {
    if (localStorage.getItem('admin_token')) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <Dashboard />;
      case 'orders': return <OrdersList />;
      case 'products': return <ProductsList />;
      case 'customers': return <CustomersList />;
      default: return <div className="glass-panel" style={{ padding: '2rem' }}>Component coming soon...</div>;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar glass-panel animate-fade-in" style={{ animationDelay: '0s' }}>
        <div className="brand">
          <div className="brand-icon"></div>
          <span>Silkmoon Admin</span>
        </div>
        
        <ul className="nav-links">
          {['Dashboard', 'Products', 'Orders', 'Customers', 'Analytics', 'Settings'].map((item) => (
            <li 
              key={item}
              className={`nav-item ${activeMenu === item.toLowerCase() ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.toLowerCase())}
            >
              {item}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Welcome back, Admin</h1>
            <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your store today.</p>
          </div>
          <div className="user-profile">
            <div className="avatar"></div>
            <span style={{ fontWeight: 500 }}>Admin User</span>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}

export default App;
