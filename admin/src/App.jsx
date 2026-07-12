import { useEffect, useState } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import OrdersList from './components/OrdersList';
import ProductsList from './components/ProductsList';
import CustomersList from './components/CustomersList';
import CategoriesList from './components/CategoriesList';
import { BlogCategoriesAdmin, BlogCommentsAdmin, BlogPostsAdmin, ProductReviewsAdmin } from './components/BlogAdmin';
import { BlogCategoriesManager, BlogPostsManager, BlogVideosManager } from './components/BlogManagement';
import { AnalyticsManager, ARStudioManager, BannerManager, ChatbotManager, FinanceManager, FooterManager, MarketingManager, PromotionsManager, ReviewsManager, StoryManager } from './components/SiteOperations';
import silkmoonLogo from '../../frontend/src/assets/xanh_ngang.png';

const navGroups = [
  { label: 'TỔNG QUAN', items: [{ id: 'dashboard', label: 'Tổng quan', icon: 'space_dashboard' }] },
  { label: 'SẢN PHẨM', items: [{ id: 'products', label: 'Quản lý sản phẩm', icon: 'bed' }, { id: 'categories', label: 'Danh mục sản phẩm', icon: 'category' }, { id: 'productReviews', label: 'Đánh giá sản phẩm', icon: 'reviews' }, { id: 'promotions', label: 'Mã giảm giá', icon: 'sell' }] },
  { label: 'BLOG', items: [{ id: 'blogPosts', label: 'Quản lý blog', icon: 'article' }, { id: 'blogVideos', label: 'Video blog', icon: 'video_library' }, { id: 'blogCategories', label: 'Danh mục blog', icon: 'topic' }, { id: 'blogComments', label: 'Bình luận blog', icon: 'comment' }] },
  { label: 'NỘI DUNG WEBSITE', items: [{ id: 'bannerContent', label: 'Quản lý banner', icon: 'panorama' }, { id: 'marketingContent', label: 'Tiêu đề marketing', icon: 'campaign' }, { id: 'storyContent', label: 'Câu chuyện của chúng tôi', icon: 'auto_stories' }, { id: 'footerContent', label: 'Quản lý chân trang', icon: 'vertical_align_bottom' }, { id: 'chatbotContent', label: 'Quản lý chatbot', icon: 'smart_toy' }, { id: 'arStudio', label: 'AR Studio', icon: 'view_in_ar' }] },
  { label: 'BÁO CÁO', items: [{ id: 'analytics', label: 'Google Analytics', icon: 'monitoring' }, { id: 'finance', label: 'Doanh thu & lợi nhuận', icon: 'payments' }] },
  { label: 'VẬN HÀNH', items: [{ id: 'orders', label: 'Đơn hàng', icon: 'receipt_long' }, { id: 'customers', label: 'Khách hàng', icon: 'group' }] },
];

const pageMeta = {
  dashboard: ['Tổng quan cửa hàng', 'Theo dõi hoạt động kinh doanh của Silkmoon.'],
  products: ['Quản lý sản phẩm', 'Cập nhật danh mục và sản phẩm đang kinh doanh.'],
  categories: ['Quản lý danh mục', 'Tổ chức sản phẩm theo từng danh mục của cửa hàng.'],
  productReviews: ['Đánh giá sản phẩm', 'Kiểm duyệt đánh giá từ khách hàng.'],
  promotions: ['Mã giảm giá', 'Quản lý chương trình ưu đãi.'],
  bannerContent: ['Quản lý banner', 'Chỉnh sửa hero và lời kêu gọi hành động trên trang chủ.'],
  marketingContent: ['Tiêu đề marketing', 'Chỉnh sửa thông điệp và thanh thông báo.'],
  footerContent: ['Quản lý chân trang', 'Chỉnh sửa thông tin thương hiệu và liên hệ.'],
  storyContent: ['Câu chuyện của chúng tôi', 'Chỉnh sửa nội dung và hình ảnh trang Về chúng tôi.'],
  chatbotContent: ['Quản lý chatbot', 'Nội dung tư vấn và theo dõi token AI.'],
  arStudio: ['AR Studio', 'Cấu hình trải nghiệm AR và theo dõi chi phí AI.'],
  analytics: ['Google Analytics', 'Theo dõi lưu lượng và hành vi người dùng.'],
  finance: ['Doanh thu & lợi nhuận', 'Theo dõi hiệu quả tài chính cửa hàng.'],
  blogPosts: ['Quản lý blog', 'Tạo và xuất bản nội dung Silkmoon.'],
  blogVideos: ['Video blog', 'Quản lý video hiển thị trên trang Cẩm nang.'],
  blogCategories: ['Danh mục blog', 'Tổ chức các chủ đề bài viết.'],
  blogComments: ['Bình luận blog', 'Kiểm duyệt thảo luận trên bài viết.'],
  orders: ['Quản lý đơn hàng', 'Theo dõi và cập nhật trạng thái giao hàng.'],
  customers: ['Khách hàng', 'Thông tin khách hàng đã đăng ký tại Silkmoon.'],
};

function Brand() {
  return (
    <div className="brand-mark" aria-label="Silkmoon">
      <img className="brand-logo" src={silkmoonLogo} alt="Silkmoon - Premium Bedding & Sleepwear" />
      <span className="admin-badge">ADMIN PORTAL</span>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('admin_token')));
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({ 'TỔNG QUAN': true, 'SẢN PHẨM': true, BLOG: false, 'VẬN HÀNH': false });

  useEffect(() => {
    setMobileOpen(false);
  }, [activeMenu]);

  if (!isAuthenticated) return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;

  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  const content = {
    dashboard: <Dashboard />,
    products: <ProductsList />,
    categories: <CategoriesList />,
    productReviews: <ReviewsManager />,
    promotions: <PromotionsManager />,
    bannerContent: <BannerManager />,
    marketingContent: <MarketingManager />,
    footerContent: <FooterManager />,
    storyContent: <StoryManager />,
    chatbotContent: <ChatbotManager />,
    arStudio: <ARStudioManager />,
    analytics: <AnalyticsManager />,
    finance: <FinanceManager />,
    blogPosts: <BlogPostsManager />,
    blogVideos: <BlogVideosManager />,
    blogCategories: <BlogCategoriesManager />,
    blogComments: <BlogCommentsAdmin />,
    orders: <OrdersList />,
    customers: <CustomersList />,
  }[activeMenu];

  return (
    <div className="admin-layout">
      <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="sidebar-top"><Brand /><button className="icon-button close-menu" onClick={() => setMobileOpen(false)} aria-label="Đóng menu"><span className="material-symbols-outlined">close</span></button></div>
        <nav className="nav-links">
          {navGroups.map(group => <div className={`nav-group ${openGroups[group.label] ? 'open' : ''}`} key={group.label}><button className="nav-group-toggle" onClick={() => setOpenGroups(current => ({ ...current, [group.label]: !current[group.label] }))}><span>{group.label}</span><span className="material-symbols-outlined">expand_more</span></button><div className="nav-group-items">{group.items.map(item => (
            <button key={item.id} className={`nav-item ${activeMenu === item.id ? 'active' : ''}`} onClick={() => setActiveMenu(item.id)}>
              <span className="material-symbols-outlined">{item.icon}</span><span>{item.label}</span>
            </button>
          ))}</div></div>)}
        </nav>
        <div className="sidebar-footer">
          <a href="/" className="store-link"><span className="material-symbols-outlined">storefront</span>Xem trang bán hàng<span className="material-symbols-outlined arrow">arrow_outward</span></a>
          <button className="logout-button" onClick={logout}><span className="material-symbols-outlined">logout</span>Đăng xuất</button>
        </div>
      </aside>
      {mobileOpen && <button className="sidebar-overlay" onClick={() => setMobileOpen(false)} aria-label="Đóng menu" />}

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMobileOpen(true)} aria-label="Mở menu"><span className="material-symbols-outlined">menu</span></button>
          <div className="page-heading"><p className="eyebrow">SILKMOON ADMIN</p><h1>{pageMeta[activeMenu][0]}</h1><p>{pageMeta[activeMenu][1]}</p></div>
          <div className="header-actions">
            <button className="icon-button" aria-label="Thông báo"><span className="material-symbols-outlined">notifications</span><i /></button>
            <div className="user-profile"><div className="avatar">SM</div><div><strong>Quản trị viên</strong><span>Administrator</span></div></div>
          </div>
        </header>
        <section className="content-area">{content}</section>
      </main>
    </div>
  );
}

export default App;
