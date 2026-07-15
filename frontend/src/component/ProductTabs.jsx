import { createElement, useMemo, useState } from 'react';

const allowedTags = new Set(['p', 'h2', 'h3', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'br', 'a', 'div', 'center']);
function RichDescription({ html }) {
  const content = useMemo(() => {
    if (!html || typeof DOMParser === 'undefined') return html || '';
    const documentNode = new DOMParser().parseFromString(html, 'text/html');
    const convert = (node, key) => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent;
      if (node.nodeType !== Node.ELEMENT_NODE) return null;
      const tag = node.tagName.toLowerCase();
      const children = Array.from(node.childNodes).map((child, index) => convert(child, `${key}-${index}`));
      if (!allowedTags.has(tag)) return children;
      const props = { key };
      if (tag === 'a') {
        const href = node.getAttribute('href') || '';
        if (href.startsWith('https://')) Object.assign(props, { href, target: '_blank', rel: 'noopener noreferrer' });
        else return children;
      }
      if (tag === 'br') return createElement(tag, props);
      return createElement(tag, props, children);
    };
    return Array.from(documentNode.body.childNodes).map((node, index) => convert(node, `rich-${index}`));
  }, [html]);
  return <div className="product-rich-description">{content}</div>;
}

const tabs = [
  { id: 'description', label: 'MÔ TẢ CHI TIẾT' },
  { id: 'materials', label: 'CHẤT LIỆU & BẢO QUẢN' },
  { id: 'returns', label: 'CHÍNH SÁCH ĐỔI TRẢ' },
];

const EmptyTab = () => (
  <div className="flex min-h-[460px] w-full items-center justify-center rounded-lg border border-dashed border-slate-deep/15 bg-bone/35 px-6 py-10 text-center text-inherit md:min-h-[520px] text-slate-deep/55">
    Nội dung đang được cập nhật từ trang quản trị.
  </div>
);

export default function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState('description');
  const technicalSpecs = (product?.technicalSpecs || '').split('\n').map((item) => item.trim()).filter(Boolean);
  const packageIncludes = (product?.packageIncludes || '').split('\n').map((item) => item.trim()).filter(Boolean);

  return (
    <div className="w-full space-y-stack-lg select-none">
      {/* Tabs Header Navigation */}
      <div className="grid grid-cols-3 border-b border-slate-deep/10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-1 pb-3 md:pb-4 border-b-2 font-label-caps text-sm md:text-base whitespace-normal transition-all duration-300 ${
                isActive
                  ? 'border-slate-deep text-slate-deep font-semibold'
                  : 'border-transparent text-on-surface-variant opacity-60 hover:opacity-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <div className="min-h-[460px] w-full text-[17px] leading-relaxed text-slate-deep/80 md:min-h-[520px] md:text-xl md:leading-relaxed font-body-lg">
        {activeTab === 'description' && (
          <article className="min-h-[460px] w-full space-y-stack-md animate-fade-in md:min-h-[520px]">
            {product?.description ? <RichDescription html={product.description} /> : <EmptyTab />}
            
            {/* Tech Specs Bento Grid */}
            {(technicalSpecs.length > 0 || packageIncludes.length > 0) && <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter pt-stack-md text-slate-deep">
              {technicalSpecs.length > 0 && <div className="bg-bone p-stack-lg rounded-lg">
                <h4 className="font-label-caps text-sm md:text-base mb-stack-sm text-slate-deep">Thông số kỹ thuật</h4>
                <ul className="text-base md:text-lg space-y-2 list-disc pl-4 opacity-95">
                  {technicalSpecs.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                </ul>
              </div>}
              {packageIncludes.length > 0 && <div className="bg-bone p-stack-lg rounded-lg">
                <h4 className="font-label-caps text-sm md:text-base mb-stack-sm text-slate-deep">Bộ sản phẩm bao gồm</h4>
                <ul className="text-base md:text-lg space-y-2 list-disc pl-4 opacity-95">
                  {packageIncludes.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                </ul>
              </div>}
            </div>}
          </article>
        )}

        {activeTab === 'materials' && (
          <article className="min-h-[460px] w-full animate-fade-in md:min-h-[520px]">
            {product?.materialCare ? <RichDescription html={product.materialCare} /> : <EmptyTab />}
          </article>
        )}

        {activeTab === 'returns' && (
          <article className="min-h-[460px] w-full animate-fade-in md:min-h-[520px]">
            {product?.returnPolicy ? <RichDescription html={product.returnPolicy} /> : <EmptyTab />}
          </article>
        )}
      </div>
    </div>
  );
}
