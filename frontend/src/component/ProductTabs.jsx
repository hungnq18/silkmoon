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

export default function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState('description');

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
            {product?.description ? <RichDescription html={product.description} /> : <>
            <p>
              Khám phá đỉnh cao của sự nghỉ ngơi với bộ sưu tập ga giường lụa Mulberry cao cấp nhất của SILKMOON. Được dệt từ những sợi lụa tơ tằm thượng hạng loại 6A với độ dày 22 momme, sản phẩm mang lại cảm giác mềm mại tuyệt đối và độ bóng sang trọng không thể nhầm lẫn.
            </p>
            <p>
              Lụa Mulberry không chỉ là biểu tượng của sự xa xỉ mà còn sở hữu những đặc tính sinh học tuyệt vời: khả năng điều hòa nhiệt độ tự nhiên giúp bạn mát mẻ vào mùa hè và ấm áp vào mùa đông, cùng khả năng kháng khuẩn tự nhiên và giảm tối đa ma sát có lợi cho tóc và làn da nhạy cảm.
            </p>
            </>}
            
            {/* Tech Specs Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter pt-stack-md text-slate-deep">
              <div className="bg-bone p-stack-lg rounded-lg">
                <h4 className="font-label-caps text-label-caps mb-stack-sm text-slate-deep">Thông số kỹ thuật</h4>
                <ul className="text-sm space-y-2 list-disc pl-4 opacity-95">
                  <li>Chất liệu: 100% Lụa Mulberry 22 Momme</li>
                  <li>Tiêu chuẩn chất lượng: OEKO-TEX Standard 100</li>
                  <li>Kiểu dệt: Satin bóng mượt sang trọng</li>
                  <li>Đường thêu trang trí: Thủ công tỉ mỉ</li>
                </ul>
              </div>
              <div className="bg-bone p-stack-lg rounded-lg">
                <h4 className="font-label-caps text-label-caps mb-stack-sm text-slate-deep">Bộ sản phẩm bao gồm</h4>
                <ul className="text-sm space-y-2 list-disc pl-4 opacity-95">
                  <li>01 Ga bọc nệm cao cấp (fitted sheet)</li>
                  <li>01 Vỏ chăn lụa (duvet cover)</li>
                  <li>02 Vỏ gối tiêu chuẩn (pillow cases)</li>
                  <li>Hộp quà tặng thương hiệu SILKMOON sang trọng</li>
                </ul>
              </div>
            </div>
          </article>
        )}

        {activeTab === 'materials' && (
          <article className="space-y-stack-md animate-fade-in">
            <p>
              Sợi lụa tự nhiên 100% có tính chất vật lý mềm mại và rất nhạy cảm với các hóa chất tẩy rửa mạnh hoặc ma sát cơ học cao. Việc chăm sóc đúng cách sẽ giúp sản phẩm giữ được vẻ bóng mượt và độ bền lên đến hàng chục năm.
            </p>
            <div className="bg-bone p-stack-lg rounded-lg text-slate-deep text-sm space-y-3">
              <h4 className="font-label-caps text-label-caps">Hướng dẫn giặt là &amp; bảo quản</h4>
              <ul className="list-decimal pl-4 space-y-2">
                <li>Khuyến khích giặt bằng tay nhẹ nhàng bằng nước lạnh hoặc giặt máy ở chế độ giặt nhẹ chuyên dụng cho Lụa (Silk/Delicates) trong túi giặt.</li>
                <li>Chỉ sử dụng chất tẩy trung tính, dịu nhẹ như dầu gội đầu hoặc sữa tắm em bé. Tuyệt đối không dùng bột giặt có chất tẩy mạnh hoặc thuốc tẩy.</li>
                <li>Không vắt mạnh hay vặn xoắn sản phẩm. Phơi khô tự nhiên trong bóng râm, tránh ánh nắng mặt trời chiếu trực tiếp.</li>
                <li>Là/ủi ở mặt trái sản phẩm bằng bàn là hơi nước ở chế độ nhiệt dành riêng cho Lụa (nhiệt độ thấp nhất).</li>
              </ul>
            </div>
          </article>
        )}

        {activeTab === 'returns' && (
          <article className="space-y-stack-md animate-fade-in">
            <p>
              Với tôn chỉ mang lại sự hài lòng tuyệt đối, SILKMOON áp dụng chính sách đổi trả hàng linh hoạt và nhanh chóng đối với dòng sản phẩm cao cấp này.
            </p>
            <div className="bg-bone p-stack-lg rounded-lg text-slate-deep text-sm space-y-3">
              <h4 className="font-label-caps text-label-caps">Điều khoản đổi trả</h4>
              <ul className="list-disc pl-4 space-y-2">
                <li>Hỗ trợ đổi mới miễn phí trong vòng 7 ngày kể từ ngày nhận hàng nếu phát hiện lỗi từ nhà sản xuất (lỗi đường chỉ thêu thêu tay, xước vải trước khi dùng, sai quy cách sản phẩm).</li>
                <li>Đối với sản phẩm in/thêu tên cá nhân theo yêu cầu, chúng tôi chỉ hỗ trợ sửa đổi hoặc đổi trả trong trường hợp thêu sai nội dung hoặc sai chính tả so với đơn hàng đã duyệt.</li>
                <li>Sản phẩm đổi trả phải còn nguyên tem mác, hộp quà đi kèm, chưa qua giặt ủi và chưa được đưa vào sử dụng thực tế.</li>
              </ul>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
