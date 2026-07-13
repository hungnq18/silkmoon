import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { newsletterApi, settingsApi } from '../services/api';

const socialIcons = {
  facebook: <path d="M13.5 8H16l.5-3h-3V3.5c0-.87.29-1.5 1.53-1.5H16.6V.14C16.33.1 15.4 0 14.5 0 12.62 0 11 1.15 11 3.27V5H8v3h3v8h2.5V8Z" />,
  instagram: <path d="M10 1.5c2.77 0 3.1.01 4.2.06 2.82.13 4.14 1.47 4.27 4.27.05 1.1.06 1.43.06 4.2s-.01 3.1-.06 4.2c-.13 2.8-1.45 4.14-4.27 4.27-1.1.05-1.43.06-4.2.06s-3.1-.01-4.2-.06c-2.83-.13-4.14-1.47-4.27-4.27-.05-1.1-.06-1.43-.06-4.2s.01-3.1.06-4.2C1.66 3.02 2.98 1.68 5.8 1.56 6.9 1.51 7.23 1.5 10 1.5Zm0 3.94a4.59 4.59 0 1 0 0 9.18 4.59 4.59 0 0 0 0-9.18Zm5.1-1.27a1.07 1.07 0 1 0 0 2.14 1.07 1.07 0 0 0 0-2.14ZM10 7.05a2.98 2.98 0 1 1 0 5.96 2.98 2.98 0 0 1 0-5.96Z" />,
  tiktok: <path d="M13.45 0h-2.71v10.86a2.3 2.3 0 1 1-1.98-2.28V5.84a5.02 5.02 0 1 0 4.69 5V5.28A6.2 6.2 0 0 0 17 6.42V3.7A3.56 3.56 0 0 1 13.45 0Z" />,
  shopee: <path d="M14.7 4.12A4.7 4.7 0 0 0 10 0a4.7 4.7 0 0 0-4.7 4.12H2.25L1 16h18L17.75 4.12H14.7ZM10 1.7a3 3 0 0 1 2.98 2.42H7.02A3 3 0 0 1 10 1.7Zm.2 11.6c-2.03 0-3.38-.98-3.38-2.53h2.02c.05.63.52.98 1.34.98.7 0 1.12-.25 1.12-.68 0-.4-.35-.6-1.56-.87-1.9-.42-2.7-1.08-2.7-2.28 0-1.43 1.18-2.36 3-2.36 1.88 0 3.08.94 3.12 2.45h-1.95c-.05-.57-.48-.9-1.18-.9-.65 0-1.04.25-1.04.65 0 .43.43.64 1.67.92 1.84.42 2.62 1.06 2.62 2.24 0 1.48-1.2 2.38-3.08 2.38Z" />,
};

function SocialLink({ href, label, icon, iconUrl }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-deep hover:opacity-80 transition-opacity overflow-hidden">{iconUrl ? <img src={iconUrl} alt="" className="w-full h-full object-contain p-1.5" /> : <svg viewBox="0 0 20 16" aria-hidden="true" className="w-4 h-4 fill-current">{socialIcons[icon]}</svg>}</a>;
}

function SocialLinks({ content }) {
  return <div className="flex flex-wrap items-center gap-3">{content.facebookUrl && <SocialLink href={content.facebookUrl} label="Facebook" icon="facebook" iconUrl={content.facebookIconUrl} />}{content.instagramUrl && <SocialLink href={content.instagramUrl} label="Instagram" icon="instagram" iconUrl={content.instagramIconUrl} />}{content.tiktokUrl && <SocialLink href={content.tiktokUrl} label="TikTok" icon="tiktok" iconUrl={content.tiktokIconUrl} />}{content.shopeeUrl && <SocialLink href={content.shopeeUrl} label="Shopee" icon="shopee" iconUrl={content.shopeeIconUrl} />}</div>;
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

function FooterLinkGroup({ title, items, open, onToggle }) {
  if (!items.length) return null;
  return <section>
    <button type="button" onClick={onToggle} className="flex w-full items-center justify-between border-b border-white/15 py-4 text-left font-bold md:pointer-events-none md:border-0 md:py-0 md:text-lg"><span>{title}</span><span className={`material-symbols-outlined text-xl transition-transform md:hidden ${open ? 'rotate-180' : ''}`}>expand_more</span></button>
    <ul className={`${open ? 'grid' : 'hidden'} gap-4 overflow-hidden pt-4 font-body-md text-linen-white/80 md:grid md:pt-6`}>{items.map((item,index)=><li key={`${item.path}-${index}`}><FooterLink item={item}/></li>)}</ul>
  </section>;
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [content, setContent] = useState(null);
  const [openSections, setOpenSections] = useState({ products: false, policies: false, about: false });
  useEffect(() => {
    const loadFooter = () => settingsApi.get('website_content').then((setting) => setContent(setting?.value?.footer || null)).catch(() => null);
    loadFooter();
    window.addEventListener('focus', loadFooter);
    const timer = window.setInterval(loadFooter, 5000);
    return () => { window.removeEventListener('focus', loadFooter); window.clearInterval(timer); };
  }, []);

  if (!content) return null;

  const productLinks = parseFooterLinks(content.productLinks);
  const policyLinks = parseFooterLinks(content.policyLinks);
  const aboutLinks = parseFooterLinks(content.aboutLinks);
  const hasCompanyInfo = Boolean(content.companyName || content.taxCode || content.address || content.email || content.workingHours || content.phone);
  const hasSocials = Boolean(content.facebookUrl || content.instagramUrl || content.tiktokUrl || content.shopeeUrl);
  const hasBrand = Boolean(content.logoUrl || content.description);
  const hasNewsletter = Boolean(content.newsletterTitle);
  const toggleSection = (key) => setOpenSections((current) => ({ ...current, [key]: !current[key] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setSubmitMessage('');
    try {
      const result = await newsletterApi.subscribe(email.trim());
      setIsSubmitted(true);
      setSubmitMessage(result.message || 'Đăng ký nhận ưu đãi thành công.');
      setEmail('');
    } catch (error) {
      setSubmitMessage(error.message || 'Không thể đăng ký lúc này. Anh/chị vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-slate-deep py-7 text-linen-white md:py-9">
      <div className="px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto">
        {(hasBrand || hasNewsletter) && <div className={`grid grid-cols-1 gap-8 ${hasBrand && hasNewsletter ? 'lg:grid-cols-[minmax(240px,1fr)_minmax(480px,1.5fr)]' : ''} lg:items-center`}><div>{content.logoUrl && <Link to="/" className="inline-block hover:opacity-90"><img src={content.logoUrl} alt="SILKMOON Logo" className="h-16 w-auto object-contain brightness-0 invert md:h-20"/></Link>}{content.description && <p className="mt-3 max-w-sm text-sm text-white/65">{content.description}</p>}</div>{hasNewsletter && <div><h2 className="text-lg font-semibold uppercase tracking-wide">{content.newsletterTitle}</h2><p className="mt-2 text-sm text-white/65">Nhận câu chuyện giấc ngủ và ưu đãi mới nhất từ Silkmoon.</p>{isSubmitted ? <div className="mt-4 rounded bg-white/10 px-5 py-3 text-sm">{submitMessage}</div> : <><form onSubmit={handleSubmit} className="mt-4 flex w-full overflow-hidden rounded-md bg-white"><input type="text" placeholder="Nhập email hoặc số điện thoại" className="min-w-0 flex-1 px-4 py-3 text-slate-deep outline-none" value={email} onChange={(e)=>setEmail(e.target.value)} required/><button disabled={isSubmitting} className="shrink-0 bg-[#BCE2FF] px-6 py-3 text-sm font-bold text-slate-deep disabled:opacity-60">{isSubmitting ? 'Đang gửi…' : 'Gửi thông tin'}</button></form>{submitMessage && <p className="mt-2 text-sm text-red-200">{submitMessage}</p>}</>}</div>}</div>}
        
        {(hasCompanyInfo || productLinks.length || policyLinks.length || aboutLinks.length || hasSocials) && <div className={`footer-dynamic-grid grid items-start gap-x-12 gap-y-4 ${hasBrand || hasNewsletter ? 'mt-7' : ''}`}>
          
          {/* Cột 1: Thông tin công ty & Liên hệ */}
          {hasCompanyInfo && <div className="space-y-8 pb-4">
            
            <div className="space-y-4">
              {content.companyName && <h3 className="font-bold text-lg">{content.companyName}</h3>}
              {content.taxCode && <p className="font-body-md text-linen-white/80">Mã số thuế: {content.taxCode}</p>}
              {content.address && <p className="font-body-md text-linen-white/80 leading-relaxed">{content.address}</p>}
              {content.email && <p className="font-body-md text-linen-white/80">{content.email}</p>}
            </div>

            {content.workingHours && <div className="space-y-4">
              <h3 className="font-bold text-lg uppercase tracking-wide">Thời gian làm việc</h3>
              <p className="font-body-md text-linen-white/80">
                {content.workingHours}
              </p>
            </div>}

            {content.phone && <div className="min-w-0"><h3 className="mb-3 font-bold uppercase tracking-wide">Hotline</h3><div className="flex flex-nowrap items-center gap-5 text-sm font-bold tracking-wide">{content.phone.split(/[·,\n]+/).map((phone) => phone.trim()).filter(Boolean).map((phone) => <span className="whitespace-nowrap" key={phone}>{phone}</span>)}</div></div>}
          </div>}

          {/* Cột 2: Sản phẩm */}
          <FooterLinkGroup title="Sản phẩm" items={productLinks} open={openSections.products} onToggle={() => toggleSection('products')} />

          {/* Cột 3: Chính sách */}
          <FooterLinkGroup title="Chính sách" items={policyLinks} open={openSections.policies} onToggle={() => toggleSection('policies')} />

          {/* Cột 4: Về chúng tôi & mạng xã hội */}
          {(aboutLinks.length > 0 || hasSocials) && <div>
            <FooterLinkGroup title="Về chúng tôi" items={aboutLinks} open={openSections.about} onToggle={() => toggleSection('about')} />
            {hasSocials && <div className="mt-6 md:mt-8"><SocialLinks content={content} /></div>}
          </div>}
        </div>}
        {content.copyright && <div className="mt-8"><span className="text-xs text-white/50">{content.copyright}</span></div>}
      </div>
    </footer>
  );
}
