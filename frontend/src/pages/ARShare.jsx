import { Link, useSearchParams } from 'react-router-dom';

export default function ARShare() {
  const [params] = useSearchParams();
  const image = params.get('image') || '';
  const fabric = params.get('fabric') || 'Silkmoon';
  const isAllowedImage = image.startsWith('https://res.cloudinary.com/');

  return (
    <main className="min-h-screen bg-bone px-margin-mobile pb-section-gap pt-28 md:px-margin-desktop md:pt-36">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-deep/10 bg-linen-white shadow-xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-deep/10 p-5 md:p-7"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-sage-haze">SILKMOON AR VISUALIZATION</p><h1 className="mt-2 text-2xl font-medium text-slate-deep">Không gian với màu {fabric}</h1></div><Link to="/shop" className="rounded-full bg-slate-deep px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white">Khám phá sản phẩm</Link></header>
        {isAllowedImage ? <img src={image} alt={`Ảnh AR Silkmoon màu ${fabric}`} className="block max-h-[72vh] w-full bg-bone object-contain" /> : <div className="grid min-h-[420px] place-items-center p-8 text-center text-on-surface-variant">Link ảnh không hợp lệ hoặc đã hết hạn.</div>}
      </section>
    </main>
  );
}
