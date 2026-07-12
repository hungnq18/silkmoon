import { Link } from 'react-router-dom';
const CardImage = ({ post }) => <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />;
export function BlogCard({ post }) {
  const styles = {
    featured: 'md:col-span-2 md:row-span-2', editorial: 'md:col-span-2', guide: '', standard: '',
  };
  return <Link to={`/blog/${post.slug}`} className={`group block ${styles[post.layout] || ''}`}><article className="h-full bg-bone rounded-xl overflow-hidden">
    <div className={`${post.layout === 'featured' ? 'aspect-[16/9]' : post.layout === 'editorial' ? 'aspect-[21/9]' : 'aspect-[4/3]'} overflow-hidden`}><CardImage post={post}/></div>
    <div className="p-5"><span className="text-[10px] tracking-widest uppercase text-secondary font-semibold">{post.layout === 'guide' ? 'Hướng dẫn' : post.layout === 'editorial' ? 'Chuyên đề' : 'Cẩm nang'}</span><h2 className={`${post.layout === 'featured' ? 'text-2xl' : 'text-lg'} mt-2 font-semibold text-slate-deep leading-snug`}>{post.title}</h2><p className="mt-2 text-sm text-slate-deep/65 line-clamp-2">{post.excerpt}</p></div>
  </article></Link>;
}
