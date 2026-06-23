import React from 'react';

export default function Policy() {
  return (
    <div className="pt-24 pb-section-gap px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto min-h-[60vh]">
      <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-slate-deep mb-stack-lg">Chính Sách</h1>
      <div className="bg-bone p-8 rounded-md border border-slate-deep/5">
        <p className="font-body-md text-slate-deep/80 leading-relaxed">
          Nội dung chính sách đang được cập nhật. Bạn có thể tìm thấy các thông tin về:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 font-body-md text-slate-deep/80">
          <li>7 đêm ngủ thử</li>
          <li>Đổi trả sản phẩm</li>
          <li>Vận chuyển</li>
          <li>Bảo hành</li>
          <li>Bảo mật thông tin</li>
        </ul>
      </div>
    </div>
  );
}
