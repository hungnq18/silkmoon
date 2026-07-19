import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoriesApi } from '../services/api';

const getCardClass = (index, total) => {
  const rowIndex = Math.floor(index / 2);
  const isFirstCardInRow = index % 2 === 0;
  const isLastCardWithoutPair = index === total - 1 && total % 2 === 1;

  if (isLastCardWithoutPair) {
    return 'h-[350px] md:col-span-12';
  }

  if (rowIndex % 2 === 0) {
    return isFirstCardInRow
      ? 'h-[350px] md:col-span-8'
      : 'h-[350px] md:col-span-4';
  }

  return isFirstCardInRow
    ? 'h-[350px] md:col-span-5'
    : 'h-[350px] md:col-span-7';
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    categoriesApi.getAll().then((items) => setCategories(items.filter((item) => item.isActive !== false && item.isFeatured && item.coverImage))).catch(() => setCategories([]));
  }, []);

  if (!categories.length) return null;

  return (
    <section className="w-full max-w-container-max mx-auto px-margin-mobile pb-6 pt-section-gap md:px-margin-desktop md:pb-10">
      <div className="flex justify-between items-end mb-stack-lg">
        <h2 className="font-headline-md text-headline-sm md:text-headline-md text-slate-deep">Danh Mục Nổi Bật</h2>
        <Link className="font-label-caps text-label-caps text-slate-deep border-b border-slate-deep pb-1 hover:opacity-85 transition-opacity" to="/shop">XEM TẤT CẢ</Link>
      </div>
      <div className="grid h-auto grid-cols-1 gap-gutter md:grid-cols-12">
        {categories.map((category, index) => (
          <Link key={category._id} to={`/shop?category=${encodeURIComponent(category.name)}`} className={`${getCardClass(index, categories.length)} relative overflow-hidden rounded-xl bg-bone group block`}>
            <img alt={category.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={category.coverImage} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/55 to-transparent" />
            <div className="absolute bottom-stack-lg left-stack-lg right-stack-lg text-linen-white">
              <h3 className="type-card-title font-headline-sm text-headline-sm mb-2">{category.name}</h3>
              {category.description && <p className="type-card-body font-body-md opacity-90">{category.description}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
