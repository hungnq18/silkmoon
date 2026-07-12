import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173';
export default function BlogPostPreview({post,categoryName,onClose}){
  const frameRef=useRef(null);
  const send=()=>frameRef.current?.contentWindow?.postMessage({type:'SILKMOON_BLOG_PREVIEW',payload:{post,categoryName}},new URL(STOREFRONT_URL).origin);
  useEffect(()=>{const ready=event=>{if(event.origin===new URL(STOREFRONT_URL).origin&&event.data?.type==='SILKMOON_PREVIEW_READY')send()};window.addEventListener('message',ready);send();return()=>window.removeEventListener('message',ready)},[post,categoryName]);
  return createPortal(<div className="modal-backdrop preview-backdrop"><div className="website-preview" data-device="desktop"><header className="preview-top"><div><span>XEM TRƯỚC TRÊN WEBSITE</span><small>Dùng chính component và CSS của frontend</small></div><div className="preview-devices"><button type="button" onClick={event=>event.currentTarget.closest('.website-preview').dataset.device='mobile'}><span className="material-symbols-outlined">smartphone</span></button><button type="button" onClick={event=>event.currentTarget.closest('.website-preview').dataset.device='desktop'}><span className="material-symbols-outlined">desktop_windows</span></button><button type="button" className="icon-button" onClick={onClose}><span className="material-symbols-outlined">close</span></button></div></header><div className="preview-frame-wrap"><iframe ref={frameRef} src={`${STOREFRONT_URL}/blog-preview`} title="Xem trước bài viết" onLoad={send}/></div></div></div>,document.body);
}
