import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../services/api';
import { getProductListPrice } from '../utils/productPrice';

export default function RelatedProducts({ productId }) {
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    
    productsApi.getRelated(productId)
      .then((data) => setRelatedItems(data.slice(0, 4) || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading || relatedItems.length === 0) return null;

  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap bg-bone/30">
      <h2 className="font-display-lg text-display-lg-mobile md:text-headline-md text-slate-deep mb-stack-lg text-center">
        Hoàn thiện không gian của bạn
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {relatedItems.map((item) => (
          <Link
            key={item._id || item.id}
            to={`/product/${item._id || item.id}`}
            className="group cursor-pointer flex flex-col"
          >
            <div className="aspect-[3/4] overflow-hidden bg-bone mb-stack-sm rounded-lg">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={item.images?.[0] || item.image}
                alt={item.name}
              />
            </div>
            <p className="font-label-caps text-[10px] tracking-widest uppercase opacity-60 text-slate-deep mt-1">
              {item.category}
            </p>
            <h3 className="font-body-md text-slate-deep font-semibold group-hover:text-secondary transition-colors mt-0.5">
              {item.name}
            </h3>
            <p className="font-body-md text-on-surface-variant mt-0.5">
              {getProductListPrice(item).toLocaleString('vi-VN')} VNĐ
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
