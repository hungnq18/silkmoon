import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { settingsApi } from '../services/api';

const socialIcons = {
  facebook: <path d="M13.5 8H16l.5-3h-3V3.5c0-.87.29-1.5 1.53-1.5H16.6V.14C16.33.1 15.4 0 14.5 0 12.62 0 11 1.15 11 3.27V5H8v3h3v8h2.5V8Z" />,
  tiktok: <path d="M13.45 0h-2.71v10.86a2.3 2.3 0 1 1-1.98-2.28V5.84a5.02 5.02 0 1 0 4.69 5V5.28A6.2 6.2 0 0 0 17 6.42V3.7A3.56 3.56 0 0 1 13.45 0Z" />,
  shopee: <path d="M14.7 4.12A4.7 4.7 0 0 0 10 0a4.7 4.7 0 0 0-4.7 4.12H2.25L1 16h18L17.75 4.12H14.7ZM10 1.7a3 3 0 0 1 2.98 2.42H7.02A3 3 0 0 1 10 1.7Zm.2 11.6c-2.03 0-3.38-.98-3.38-2.53h2.02c.05.63.52.98 1.34.98.7 0 1.12-.25 1.12-.68 0-.4-.35-.6-1.56-.87-1.9-.42-2.7-1.08-2.7-2.28 0-1.43 1.18-2.36 3-2.36 1.88 0 3.08.94 3.12 2.45h-1.95c-.05-.57-.48-.9-1.18-.9-.65 0-1.04.25-1.04.65 0 .43.43.64 1.67.92 1.84.42 2.62 1.06 2.62 2.24 0 1.48-1.2 2.38-3.08 2.38Z" />,
};

function SocialLink({ href, label, icon, iconUrl }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-deep hover:opacity-80 transition-opacity overflow-hidden">{iconUrl ? <img src={iconUrl} alt="" className="w-full h-full object-contain p-1.5" /> : <svg viewBox="0 0 20 16" aria-hidden="true" className="w-4 h-4 fill-current">{socialIcons[icon]}</svg>}</a>;
}

function parseFooterLinks(value) {
  return (value || '').split('\n').map((line) => {
    const [label, path] = line.split('|').map((part) => part.trim());
    return { label, path };
  }).filter((item) => item.label && item.path);
}

function FooterLink({ item }) {
  const className = "hover:text-white transition-colors";
  return /^https?:\/\//.test(item.path)
    ? <a href={item.path} target="_blank" rel="noopener noreferrer" className={className}>{item.label}</a>
    : <Link to={item.path} className={className}>{item.label}</Link>;
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [content, setContent] = useState(null);
  useEffect(() => { settingsApi.get('website_content').then(setting => setContent(setting?.value?.footer || null)).catch(() => setContent(null)); }, []);

  if (!content) return null;

  const productLinks = parseFooterLinks(content.productLinks);
  const policyLinks = parseFooterLinks(content.policyLinks);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-deep text-linen-white py-12 md:py-16">
      <div className="px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
        <div className="mb-10">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <img 
              src={content.logoUrl} 
              alt="SILKMOON Logo" 
              className="h-16 md:h-20 w-auto object-contain brightness-0 invert" 
            />
          </Link>
          {content.description && <p className="mt-3 max-w-sm text-sm text-linen-white/70">{content.description}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 items-start">
          
          {/* Cột 1: Thông tin công ty & Liên hệ */}
          <div className="space-y-8">
            
            <div className="space-y-4">
              <h3 className="font-bold text-lg">{content.companyName}</h3>
              <p className="font-body-md text-linen-white/80">Mã số thuế: {content.taxCode}</p>
              <p className="font-body-md text-linen-white/80 leading-relaxed">
                {content.address}
              </p>
              {content.email && <p className="font-body-md text-linen-white/80">{content.email}</p>}
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg uppercase tracking-wide">Thời gian làm việc</h3>
              <p className="font-body-md text-linen-white/80">
                {content.workingHours}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg uppercase tracking-wide">Hotline</h3>
              <p className="font-display-sm text-xl font-bold tracking-wide">
                {content.phone}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <SocialLink href={content.facebookUrl || 'https://www.facebook.com/'} label="Facebook" icon="facebook" iconUrl={content.facebookIconUrl} />
              <SocialLink href={content.tiktokUrl || 'https://www.tiktok.com/'} label="TikTok" icon="tiktok" iconUrl={content.tiktokIconUrl} />
              <SocialLink href={content.shopeeUrl || 'https://shopee.vn/'} label="Shopee" icon="shopee" iconUrl={content.shopeeIconUrl} />
            </div>
          </div>

          {/* Cột 2: Sản phẩm */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Sản phẩm</h3>
            <ul className="space-y-4 font-body-md text-linen-white/80">
              {productLinks.map((item, index) => <li key={`${item.path}-${index}`}><FooterLink item={item} /></li>)}
            </ul>
          </div>

          {/* Cột 3: Chính sách */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Chính sách</h3>
            <ul className="space-y-4 font-body-md text-linen-white/80">
              {policyLinks.map((item, index) => <li key={`${item.path}-${index}`}><FooterLink item={item} /></li>)}
            </ul>
          </div>

          {/* Cột 4: Về chúng tôi & Đăng ký */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h3 className="font-bold text-lg">Về chúng tôi</h3>
              <ul className="space-y-4 font-body-md text-linen-white/80">
                <li><Link to="/about" className="hover:text-white transition-colors">Chuyện của SILKMOON</Link></li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <h3 className="font-bold text-lg uppercase tracking-wide leading-snug">{content.newsletterTitle}</h3>
              {isSubmitted ? (
                <div className="bg-linen-white/10 p-3 rounded text-sm border border-linen-white/20 animate-fade-in">
                  Cảm ơn bạn đã đăng ký!
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col bg-white rounded overflow-hidden w-full">
                  <input 
                    type="email" 
                    placeholder="Nhập email" 
                    className="w-full px-4 py-3 text-slate-deep focus:outline-none font-body-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="w-full bg-[#BCE2FF] text-slate-deep px-6 py-3 font-bold text-sm hover:bg-[#A3D6FF] transition-colors">
                    Gửi thông tin
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 text-xs text-white/50">{content.copyright}</div>
      </div>
    </footer>
  );
}
