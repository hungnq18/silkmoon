import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { arApi } from '../../services/api';
import { FABRICS } from './arUtils';
import ARSidebar from './ARSidebar';
import QRCode from 'react-qr-code';

// ── Mode: 'ai' = AI-generated image (AR Try on), 'ar' = Realtime WebXR
const MODES = { AI: 'ai', AR: 'ar' };

export default function ARRoomPreview({ isOpen, onClose, productColor, productImage }) {
  const [roomImg, setRoomImg]               = useState(null);
  const [roomImgSrc, setRoomImgSrc]         = useState(null); // original base64 for AI
  const [activeFabricId, setActiveFabricId] = useState(productColor || 'champagne');
  const [opacity, setOpacity]               = useState(1.0); // Changed to 1.0 to fully hide the bed
  const [mode, setMode]                     = useState(MODES.AI);
  const [aiImage, setAiImage]               = useState(null);
  const [isGenerating, setIsGenerating]     = useState(false);
  const [aiError, setAiError]               = useState(null);
  const [retryCountdown, setRetryCountdown] = useState(null);

  // ── Load image file ──────────────────────────────────────
  const loadImage = (file) => {
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      setRoomImgSrc(src);
      const img = new Image();
      img.onload = () => {
        setRoomImg(img);
        runGenerate(src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };


  // ── AI mode: generate image ──────────────────────────────
  const runGenerate = async (overrideSrc) => {
    const srcToUse = overrideSrc || roomImgSrc;
    if (!srcToUse) return;
    setIsGenerating(true);
    setAiError(null);
    setAiImage(null);
    try {
      const fabric = FABRICS.find(f => f.id === activeFabricId) || FABRICS[0];

      // 1. Upload base image to Cloudinary via backend
      const uploadRes = await arApi.uploadImage({ image: srcToUse });
      if (!uploadRes.success || !uploadRes.url) {
        throw new Error('Upload failed');
      }
      const roomImageUrl = uploadRes.url;

      // 2. Call Gemini Image Generation with Cloudinary URL
      const response = await arApi.generatePreview({
        imageUrl: roomImageUrl,
        color: fabric.hex,
        fabricName: fabric.label,
      });

      if (response.success && response.image) {
        setAiImage(response.image);
      } else {
        throw new Error('No image in response');
      }
    } catch (e) {
      // Check if it's a quota error (HTTP 429)
      const isQuota = e.message?.includes('quota') || e.message?.includes('429') ||
                      e.message?.includes('Too Many Requests');
      if (isQuota) {
        // Start countdown auto-retry
        setAiError('quota_exceeded');
        let remaining = 60;
        setRetryCountdown(remaining);
        const timer = setInterval(() => {
          remaining -= 1;
          setRetryCountdown(remaining);
          if (remaining <= 0) {
            clearInterval(timer);
            setRetryCountdown(null);
            setAiError(null);
            runGenerate(); // auto-retry
          }
        }, 1000);
      } else {
        console.error('[AR] Generate failed:', e);
        setAiError('Không thể tạo ảnh. Kiểm tra lại API Token hoặc log server.');
      }
    } finally {
      setIsGenerating(false);
    }
  };


  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setAiImage(null);
      setAiError(null);
      loadImage(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  const fabric = FABRICS.find(f => f.id === activeFabricId) || FABRICS[0];

  return (
    <div className="fixed inset-0 z-[200] flex flex-col animate-fade-in bg-linen-white">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-6 md:px-margin-desktop py-4 border-b border-slate-deep/10 bg-linen-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-slate-deep text-xl">view_in_ar</span>
          <div>
            <p className="font-label-caps text-label-caps text-slate-deep uppercase tracking-widest leading-tight">
              AR Room Preview
            </p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              Đặt ảnh sản phẩm lụa vào không gian phòng ngủ thật của bạn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode toggle */}
          <div className="hidden sm:flex items-center border border-slate-deep/15 overflow-hidden">
              <button
                onClick={() => { setMode(MODES.AI); if (!aiImage) runGenerate(); }}
                className={`px-3 py-1.5 text-[11px] font-label-caps uppercase tracking-wider transition-colors ${
                  mode === MODES.AI
                    ? 'bg-slate-deep text-linen-white'
                    : 'text-on-surface-variant hover:bg-bone'
                }`}
              >
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                  AR Try On
                </span>
              </button>
              <button
                onClick={() => setMode(MODES.AR)}
                className={`px-3 py-1.5 text-[11px] font-label-caps uppercase tracking-wider transition-colors ${
                  mode === MODES.AR
                    ? 'bg-slate-deep text-linen-white'
                    : 'text-on-surface-variant hover:bg-bone'
                }`}
              >
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">view_in_ar</span>
                  Realtime AR (V3)
                </span>
              </button>
            </div>
          {isGenerating && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-label-caps text-slate-deep uppercase tracking-wider">
              <div className="w-3 h-3 border-2 border-slate-deep border-t-transparent rounded-full animate-spin flex-shrink-0" />
              Đang đồng bộ môi trường AR...
            </div>
          )}

          {aiImage && mode === MODES.AI && !isGenerating && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              AR Try On hoàn tất
            </div>
          )}

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-slate-deep/20 flex items-center justify-center hover:bg-slate-deep hover:text-linen-white transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── AI mode: show generated image or upload prompt ── */}
        {mode === MODES.AI ? (
          roomImg ? (
            <div className="flex-1 flex items-center justify-center p-6 md:p-8 bg-bone/50 overflow-hidden">
            <div className="relative inline-block rounded shadow-xl overflow-hidden" style={{ maxHeight: 'calc(100vh - 140px)' }}>
              {/* Always show room image as base */}
              <img
                src={roomImgSrc}
                alt="Room"
                className="block select-none pointer-events-none"
                style={{ maxHeight: 'calc(100vh - 140px)', maxWidth: '100%', width: 'auto', display: aiImage ? 'none' : 'block' }}
              />

              {/* AI-generated overlay */}
              {aiImage && (
                <img
                  src={aiImage}
                  alt="AI Preview"
                  className="block select-none pointer-events-none"
                  style={{ maxHeight: 'calc(100vh - 140px)', maxWidth: '100%', width: 'auto', display: 'block' }}
                />
              )}

              {/* Generating spinner */}
              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-linen-white/85 backdrop-blur-sm">
                  <div className="w-10 h-10 border-2 border-slate-deep border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="font-label-caps text-label-caps text-slate-deep uppercase tracking-widest">Đang khởi tạo AR Try On</p>
                  <p className="text-sm text-on-surface-variant mt-1 text-center px-4">
                    1. Đang quét không gian và phân tích phối cảnh... <br/>
                    2. Đang trải thử lụa {fabric.label} lên giường... <br/>
                    <span className="text-[11px] opacity-70">(Quá trình diễn ra hoàn toàn tự động)</span>
                  </p>
                </div>
              )}

              {/* Error / quota countdown */}
              {aiError && !isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-linen-white/92 backdrop-blur-sm">
                  {aiError === 'quota_exceeded' ? (
                    <>
                      <span className="material-symbols-outlined text-3xl text-amber-500 mb-3">hourglass_top</span>
                      <p className="font-label-caps text-label-caps text-slate-deep uppercase tracking-widest">Máy chủ AR đang bận</p>
                      <p className="text-sm text-on-surface-variant mt-1 mb-4">Quota tạm thời đạt giới hạn</p>
                      {retryCountdown !== null && (
                        <>
                          <div className="w-32 h-1 bg-slate-deep/10 rounded-full overflow-hidden mb-2">
                            <div
                              className="h-full bg-slate-deep transition-all duration-1000"
                              style={{ width: `${((60 - retryCountdown) / 60) * 100}%` }}
                            />
                          </div>
                          <p className="font-mono text-2xl font-bold text-slate-deep">{retryCountdown}s</p>
                          <p className="text-[11px] text-on-surface-variant mt-1">Tự động thử lại sau {retryCountdown} giây</p>
                        </>
                      )}
                      <button
                        onClick={() => { setRetryCountdown(null); setAiError(null); runGenerate(); }}
                        className="mt-4 px-4 py-2 bg-slate-deep text-linen-white text-[11px] font-label-caps uppercase tracking-wider hover:bg-slate-deep/80 transition-colors"
                      >
                        Thử ngay
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-3xl text-red-400 mb-3">error_outline</span>
                      <p className="text-sm text-on-surface-variant">{aiError}</p>
                      <button
                        onClick={runGenerate}
                        className="mt-4 px-4 py-2 bg-slate-deep text-linen-white text-[11px] font-label-caps uppercase tracking-wider hover:bg-slate-deep/80 transition-colors"
                      >
                        Thử lại
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 md:p-8 bg-bone/50">
              <div onClick={() => document.getElementById('roomUploadInput')?.click()} className="group cursor-pointer w-full max-w-2xl">
                <div className="aspect-[16/10] border-2 border-dashed border-slate-deep/20 flex flex-col items-center justify-center gap-4 hover:border-slate-deep/50 hover:bg-linen-white/60 transition-all duration-300 rounded">
                  <div className="w-14 h-14 border border-slate-deep/15 flex items-center justify-center group-hover:border-slate-deep/30 transition-colors">
                    <span className="material-symbols-outlined text-3xl text-slate-deep/40 group-hover:text-slate-deep/70 transition-colors">add_photo_alternate</span>
                  </div>
                  <div className="text-center">
                    <p className="font-label-caps text-label-caps text-slate-deep uppercase tracking-widest">Tải ảnh phòng ngủ lên</p>
                    <p className="text-sm text-on-surface-variant mt-1">Hệ thống AR sẽ phân tích không gian và trải lụa chân thực</p>
                  </div>
                  <span className="text-[11px] font-label-caps uppercase tracking-wider text-on-surface-variant/60 border border-slate-deep/10 px-3 py-1">JPG · PNG · WEBP</span>
                </div>
              </div>
            </div>
          )
        ) : mode === MODES.AR ? (() => {
          /* ── AR mode: QR Code to standalone service ── */
          const arBaseUrl = import.meta.env.VITE_AR_SERVICE_URL || `http://${window.location.hostname}:5174`;
          const arLink = `${arBaseUrl}/ar/${activeFabricId}?img=${encodeURIComponent(productImage)}`;

          return (
          <div className="flex-1 flex items-center justify-center bg-black/5 p-6 text-center overflow-y-auto">
            <div className="bg-linen-white/95 p-8 rounded-xl shadow-2xl flex flex-col items-center max-w-sm border border-slate-deep/10">
              <div className="w-16 h-16 bg-slate-deep rounded-full flex items-center justify-center mb-4 flex-shrink-0">
                <span className="material-symbols-outlined text-linen-white text-3xl">qr_code_scanner</span>
              </div>
              <h2 className="font-label-caps text-lg text-slate-deep uppercase tracking-widest mb-2">Realtime AR (V3)</h2>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                Công nghệ AR quét không gian 3D hoạt động tốt nhất trên thiết bị di động. Vui lòng sử dụng điện thoại để quét mã QR và trải nghiệm.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-inner border border-slate-deep/5 mb-6">
                <QRCode value={arLink} size={160} />
              </div>
              
              <a 
                href={arLink}
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full py-3 bg-slate-deep text-linen-white font-label-caps text-[11px] uppercase tracking-wider rounded sm:hidden block mb-3"
              >
                Mở AR trên thiết bị này
              </a>

              <p className="text-[11px] font-label-caps uppercase tracking-wider text-slate-deep/60">
                Hỗ trợ iOS 14+ & Android 10+
              </p>
            </div>
          </div>
          );
        })() : null}

        <ARSidebar
          activeFabricId={activeFabricId}
          setActiveFabricId={(id) => {
            setActiveFabricId(id);
            // If in AI mode, regenerate with new color
            if (mode === MODES.AI && roomImg) {
              setAiImage(null);
              setTimeout(() => runGenerate(), 50);
            }
          }}
          opacity={opacity}
          setOpacity={setOpacity}
          hasImage={!!roomImg}
          onReanalyze={() => {
            runGenerate();
          }}
          onNewImage={() => { 
            document.getElementById('roomUploadInput')?.click();
          }}
          mode={mode}
        />
      </div>

      {/* Hidden global file input for uploads from anywhere (Sidebar or Dropzone) */}
      <input id="roomUploadInput" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}

ARRoomPreview.propTypes = {
  isOpen:       PropTypes.bool.isRequired,
  onClose:      PropTypes.func.isRequired,
  productColor: PropTypes.string,
  productImage: PropTypes.string,
};
