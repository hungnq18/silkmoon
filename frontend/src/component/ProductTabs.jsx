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
  <div className="rounded-lg border border-dashed border-slate-deep/15 bg-bone/35 px-6 py-10 text-center text-sm text-slate-deep/55">
    Nội dung đang được cập nhật từ trang quản trị.
  </div>
);

export default function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState('description');
  const technicalSpecs = (product?.technicalSpecs || '').split('\n').map((item) => item.trim()).filter(Boolean);
  const packageIncludes = (product?.packageIncludes || '').split('\n').map((item) => item.trim()).filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto space-y-stack-lg select-none">
      {/* Tabs Header Navigation */}
      <div className="flex flex-wrap md:flex-nowrap border-b border-slate-deep/10 gap-4 md:gap-stack-lg">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 md:pb-stack-sm border-b-2 font-label-caps text-xs md:text-label-caps whitespace-nowrap md:whitespace-nowrap transition-all duration-300 ${
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
      <div className="text-slate-deep/80 leading-relaxed font-body-lg text-body-md md:text-body-lg min-h-[150px]">
        {activeTab === 'description' && (
          <article className="space-y-stack-md animate-fade-in">
            {product?.description ? <RichDescription html={product.description} /> : <EmptyTab />}
            
            {/* Tech Specs Bento Grid */}
            {(technicalSpecs.length > 0 || packageIncludes.length > 0) && <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter pt-stack-md text-slate-deep">
              {technicalSpecs.length > 0 && <div className="bg-bone p-stack-lg rounded-lg">
                <h4 className="font-label-caps text-label-caps mb-stack-sm text-slate-deep">Thông số kỹ thuật</h4>
                <ul className="text-sm space-y-2 list-disc pl-4 opacity-95">
                  {technicalSpecs.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                </ul>
              </div>}
              {packageIncludes.length > 0 && <div className="bg-bone p-stack-lg rounded-lg">
                <h4 className="font-label-caps text-label-caps mb-stack-sm text-slate-deep">Bộ sản phẩm bao gồm</h4>
                <ul className="text-sm space-y-2 list-disc pl-4 opacity-95">
                  {packageIncludes.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                </ul>
              </div>}
            </div>}
          </article>
        )}

        {activeTab === 'materials' && (
          <article className="space-y-stack-md animate-fade-in">
            {product?.materialCare ? <RichDescription html={product.materialCare} /> : <EmptyTab />}
          </article>
        )}

        {activeTab === 'returns' && (
          <article className="space-y-stack-md animate-fade-in">
            {product?.returnPolicy ? <RichDescription html={product.returnPolicy} /> : <EmptyTab />}
          </article>
        )}
      </div>
    </div>
  );
}
