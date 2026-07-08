import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

export default function ProductsList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    adminApi.getProducts().then(setProducts).catch(console.error);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await adminApi.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h2>Products</h2>
      <button style={{ marginBottom: '1rem', padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px' }}>
        Add New Product
      </button>
      <table style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>${product.price.toLocaleString()}</td>
              <td>
                <button style={{ marginRight: '8px' }}>Edit</button>
                <button style={{ color: 'red' }} onClick={() => handleDelete(product._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
