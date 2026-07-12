import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './component/Header';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart';
import Footer from './component/Footer';
import Chatbot from './component/Chatbot';
import Policy from './pages/Policy';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import BlogPreview from './pages/BlogPreview';
import Showroom from './pages/Showroom';
import ARShare from './pages/ARShare';
import Account from './pages/Account';
import './App.css';
import { analyticsApi } from './services/api';

// Scroll to top on route change for seamless page switching
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    analyticsApi.track({ type: 'page_view', path: pathname });
  }, [pathname]);

  return null;
}

function AppContent() {
  return (
    <div className="min-h-screen bg-linen-white text-slate-deep relative flex flex-col antialiased">
      <ScrollToTop />
      
      {/* Global Header */}
      <Header />

      {/* Main Pages Switcher */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/blog-preview" element={<BlogPreview />} />
          <Route path="/showroom" element={<Showroom />} />
          <Route path="/ar-share" element={<ARShare />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </div>

      {/* Global Footer */}
      <Footer />

      {/* Global AI Chatbot */}
      <Chatbot />
    </div>
  );
}

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
