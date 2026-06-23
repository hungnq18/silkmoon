import { Link } from 'react-router-dom';

const relatedItems = [
  {
    id: 1,
    name: 'Bịt mắt ngủ lụa tơ tằm',
    price: '450.000 VNĐ',
    category: 'Phụ kiện',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNRqXRN7X2viRnZfSXipOa6dS9PGqyYL8qV7bzizbWMhAcOdvuF4LS8ZwBnz-gneSopsf1_PaSii_Ld-OkKNt-0beLKaMp5gKIeZVFTuBCzTKimiDolwxsw7FgZEmQHcWKyztHQESrj9TY0ImZ1M0UeKf81n2EUW69J-CXoXSikaeToZV93QUo69slRQpw0-fdO4E9lV7S0_02BJ30XsjxrA0uYNL5pF_Whbh1z3vRUOFPITHYRk3QeHvjujpr7D2UHWz4i4jdXII',
  },
  {
    id: 2,
    name: 'Nến thơm gỗ đàn hương',
    price: '680.000 VNĐ',
    category: 'Thư giãn',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcGmdgrAiprDPCVN3YhSlASL_S1hCB6GyWpLsQUNrRTzb9tYFZsQFYrmWtdKGBvg4IGpvHgXgYdlJ8NVXOVSuabiZq7sHCElryh0j3PcTZvUclqy-LjboD-u1EHtn2ChKEnOs9LHEUZGc2wsewqZo-gxS8wpIoR6I8eN14q6-Bsqk3ctZTjVniTyjSuoWF928gFNn2QZc89SRV_rMIBtf0XHDlltMOU7mdLtFeebRWXd67poxhOcmq_8TyqqM7bw7LmzYuxxMPOuM',
  },
  {
    id: 3,
    name: 'Dép đi trong nhà bông cao cấp',
    price: '320.000 VNĐ',
    category: 'Đồ dùng',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4GFUPnTx27ZHOb4-q6Z3vClq8UpmbQHofzftKB96nmN8tyjI9X2oNvDwyO_3POq03nBLy7DiajvRSNqhhqcQpHO--fb0tSPVM5z9C3oTKsO5BnPwBF5R_xh8LHR3ltyhJ4yLftBpQAev8gHufzQwYpBsJt6fyizdRbydhsOQc1rObBG56-dmPmBMo4oHUGSajU28noqNW9EWv20NoHjBYiw2bzwgxRqvo0_pm34Fcn0NFEJknde3yQCBt32vGFQzZVtyKoOn-89Q',
  },
  {
    id: 4,
    name: 'Ruột gối lông vũ nhân tạo',
    price: '1.200.000 VNĐ',
    category: 'Pillows',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBacZkAabAQTpFTIVDVcJg_Q4A368OcGUK_AcY7C4CXKCG1cd-NziE4HKeDjEhnHPpehtQ_QT-3YuMI8SFzyfUIG3eqaWX8ANQ3JJPI7SYjFkdfi8K02A0dY9v-TjP-JFeYQB5cC6RuE1FKsVu3O3LD7Sm7CcnbRJY1GGYhWgFCGgrOdnnZwxXSQea4p8gn1KOxI_Z4nkzamKmN2FiGTpPhJt2Sj-dj4wBSv4mf7nP9WLP8heT86y4mqIR-KXJVmi2Bi-B1gdJIQUE',
  },
];

export default function RelatedProducts() {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap bg-bone/30">
      <h2 className="font-display-lg text-display-lg-mobile md:text-headline-md text-slate-deep mb-stack-lg text-center">
        Hoàn thiện không gian của bạn
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {relatedItems.map((item) => (
          <Link
            key={item.id}
            to="/shop"
            className="group cursor-pointer flex flex-col"
          >
            <div className="aspect-[3/4] overflow-hidden bg-bone mb-stack-sm rounded-lg">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={item.image}
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
              {item.price}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
