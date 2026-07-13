import { createContext, useContext, useState, useEffect } from 'react';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart on mount or user change
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        // Load from backend
        try {
          const userCart = await cartApi.getCart();
          setCart(userCart || []);
        } catch (error) {
          console.error('Failed to load cart from API', error);
        }
      } else {
        // Load from localStorage
        const localCart = localStorage.getItem('guest_cart');
        if (localCart) {
          try {
            setCart(JSON.parse(localCart));
          } catch (e) {
            setCart([]);
          }
        } else {
          setCart([]);
        }
      }
      setLoading(false);
    };

    loadCart();
  }, [user]);

  // Helper to persist cart
  const saveCart = async (newCart) => {
    setCart(newCart);
    if (user) {
      try {
        await cartApi.updateCart(newCart);
      } catch (error) {
        console.error('Failed to update cart on API', error);
      }
    } else {
      localStorage.setItem('guest_cart', JSON.stringify(newCart));
    }
  };

  const addToCart = (productId, quantity = 1, options = {}) => {
    const newCart = [...cart];
    const signature = JSON.stringify({ sizeId: options.sizeId || '', customSize: options.customSize || null, embroidery: options.embroidery || '' });
    const existingIndex = newCart.findIndex(item => item.productId === productId && JSON.stringify({ sizeId: item.sizeId || '', customSize: item.customSize || null, embroidery: item.embroidery || '' }) === signature);
    
    if (existingIndex >= 0) {
      newCart[existingIndex] = { ...newCart[existingIndex], ...options, quantity: newCart[existingIndex].quantity + quantity };
    } else {
      newCart.push({ cartItemId: `${productId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, productId, quantity, ...options });
    }
    
    saveCart(newCart);
  };

  const updateQuantity = (identifier, quantity) => {
    if (quantity <= 0) {
      removeFromCart(identifier);
      return;
    }
    const newCart = cart.map(item => 
      (item.cartItemId || item.productId) === identifier ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const removeFromCart = (identifier) => {
    const newCart = cart.filter(item => (item.cartItemId || item.productId) !== identifier);
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
