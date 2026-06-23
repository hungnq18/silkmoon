import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { arApi } from '../services/api';

// ── Fabric Options ──────────────────────────────────────────
const FABRICS = [
  { id: 'champagne', label: 'Champagne Silk', hex: '#C9A882', shimmer: '#EDD9C0' },
  { id: 'white', label: 'White Silk', hex: '#EDEAE4', shimmer: '#FFFFFF' },
  { id: 'sage', label: 'Sage Silk', hex: '#4A7068', shimmer: '#7AB0A0' },
  { id: 'slate', label: 'Slate Silk', hex: '#2D3E3B', shimmer: '#4A6060' },
  { id: 'blush', label: 'Blush Silk', hex: '#DCA090', shimmer: '#F2C4B8' },
  { id: 'navy', label: 'Navy Silk', hex: '#1B2A4A', shimmer: '#2D4068' },
];

const HANDLE_R = 14; // px

// ── Generate silk-like texture on offscreen canvas ──────────
function createSilkTexture(hex, shimmer) {
  const sz = 512;
  const c = document.createElement('canvas');
  c.width = sz; c.height = sz;
  const ctx = c.getContext('2d');

  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, sz, sz);

  for (let i = -sz; i < sz * 2; i += 18) {
    const g = ctx.createLinearGradient(i, 0, i + 9, sz);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.4, shimmer + '40');
    g.addColorStop(0.5, shimmer + '70');
    g.addColorStop(0.6, shimmer + '40');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(i, 0, 9, sz);
  }

  for (let y = 0; y < sz; y += 3) {
    ctx.fillStyle = 'rgba(0,0,0,0.045)';
    ctx.fillRect(0, y, sz, 1);
  }
  for (let x = 0; x < sz; x += 3) {
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    ctx.fillRect(x, 0, 1, sz);
  }
  return c;
}

// ── Core: strip-based perspective warp ─────────────────────
function perspectiveWarp(ctx, tex, quad, alpha) {
  const { tl, tr, br, bl } = quad;
  const iw = tex.width, ih = tex.height;
  const N = 250;

  ctx.save();
  ctx.globalAlpha = alpha;

  for (let i = 0; i < N; i++) {
    const t0 = i / N, t1 = (i + 1) / N;

    const lx0 = tl.x + (bl.x - tl.x) * t0, ly0 = tl.y + (bl.y - tl.y) * t0;
    const rx0 = tr.x + (br.x - tr.x) * t0, ry0 = tr.y + (br.y - tr.y) * t0;
    const lx1 = tl.x + (bl.x - tl.x) * t1, ly1 = tl.y + (bl.y - tl.y) * t1;
    const rx1 = tr.x + (br.x - tr.x) * t1, ry1 = tr.y + (br.y - tr.y) * t1;

    const sy0 = t0 * ih;
    const stripH = ih / N;

    const a = (rx0 - lx0) / iw;
    const b = (ry0 - ly0) / iw;
    const cv = (lx1 - lx0) / stripH;
    const d = (ly1 - ly0) / stripH;
    const e = lx0 - cv * sy0;
    const f = ly0 - d * sy0;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(lx0, ly0); ctx.lineTo(rx0, ry0);
    ctx.lineTo(rx1, ry1); ctx.lineTo(lx1, ly1);
    ctx.closePath();
    ctx.clip();
    ctx.setTransform(a, b, cv, d, e, f);
    ctx.drawImage(tex, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

// ── Draw a single drag handle on canvas ────────────────────
function drawHandle(ctx, pt, active) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, HANDLE_R, 0, Math.PI * 2);
  ctx.fillStyle = active ? '#1C2C58' : 'rgba(28,44,88,0.85)';
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  const s = 4;
  ctx.beginPath();
  ctx.moveTo(pt.x - s, pt.y); ctx.lineTo(pt.x + s, pt.y);
  ctx.moveTo(pt.x, pt.y - s); ctx.lineTo(pt.x, pt.y + s);
  ctx.stroke();
  ctx.restore();
}

function getCanvasPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const src = e.touches ? e.touches[0] : e;
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top) * scaleY,
  };
}

// Default 8 points mapping to Cuboid
function defaultPoints(w, h) {
  return {
    tfl: { x: w * 0.25, y: h * 0.5 },
    tfr: { x: w * 0.75, y: h * 0.5 },
    tbl: { x: w * 0.35, y: h * 0.3 },
    tbr: { x: w * 0.65, y: h * 0.3 },
    bfl: { x: w * 0.25, y: h * 0.8 },
    bfr: { x: w * 0.75, y: h * 0.8 },
    bbl: { x: w * 0.35, y: h * 0.6 },
    bbr: { x: w * 0.65, y: h * 0.6 },
  };
}

export default function ARRoomPreview({ isOpen, onClose, productColor }) {
  const [roomImg, setRoomImg] = useState(null);
  const [points, setPoints] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [activeFabricId, setActiveFabricId] = useState(productColor || 'champagne');
  const [opacity, setOpacity] = useState(0.85);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const activePtRef = useRef(null);
  const texCacheRef = useRef({});

  const loadImage = useCallback((file) => {
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => setRoomImg(img);
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const detectBedCorners = async (img, canvasW, canvasH) => {
    try {
      const tempCanvas = document.createElement('canvas');
      const MAX_DIM = 800;
      let w = img.width, h = img.height;
      if (w > h && w > MAX_DIM) { h = Math.round((h * MAX_DIM) / w); w = MAX_DIM; }
      else if (h > MAX_DIM) { w = Math.round((w * MAX_DIM) / h); h = MAX_DIM; }
      tempCanvas.width = w; tempCanvas.height = h;
      const ctx = tempCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const base64Image = tempCanvas.toDataURL('image/jpeg', 0.8);

      const response = await arApi.detectBed({ image: base64Image });
      if (response.success && response.corners) {
        const c = response.corners;
        return {
          tbl: { x: c.tbl.x * canvasW, y: c.tbl.y * canvasH },
          tbr: { x: c.tbr.x * canvasW, y: c.tbr.y * canvasH },
          tfr: { x: c.tfr.x * canvasW, y: c.tfr.y * canvasH },
          bfr: { x: c.bfr.x * canvasW, y: c.bfr.y * canvasH },
          bbr: { x: c.bbr.x * canvasW, y: c.bbr.y * canvasH },
          bbl: { x: c.bbl.x * canvasW, y: c.bbl.y * canvasH },
          bfl: { x: c.bfl.x * canvasW, y: c.bfl.y * canvasH },
          tfl: { x: c.tfl.x * canvasW, y: c.tfl.y * canvasH },
        };
      }
    } catch (e) {
      console.warn('AI Detection failed', e);
    }
    return defaultPoints(canvasW, canvasH);
  };

  useEffect(() => {
    if (roomImg && containerRef.current && !points && !isDetecting) {
      setIsDetecting(true);
      detectBedCorners(roomImg, roomImg.width, roomImg.height).then(pts => {
        setPoints(pts);
        setIsDetecting(false);
      });
    }
  }, [roomImg, points, isDetecting]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !roomImg || !points) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const activeFabric = FABRICS.find(f => f.id === activeFabricId) || FABRICS[0];
    if (!texCacheRef.current[activeFabricId]) {
      texCacheRef.current[activeFabricId] = createSilkTexture(activeFabric.hex, activeFabric.shimmer);
    }
    const tex = texCacheRef.current[activeFabricId];

    // Clipping mask (8-point polygon around the bed)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points.tbl.x, points.tbl.y);
    ctx.lineTo(points.tbr.x, points.tbr.y);
    ctx.lineTo(points.tfr.x, points.tfr.y);
    ctx.lineTo(points.bfr.x, points.bfr.y);
    ctx.lineTo(points.bbr.x, points.bbr.y);
    ctx.lineTo(points.bbl.x, points.bbl.y);
    ctx.lineTo(points.bfl.x, points.bfl.y);
    ctx.lineTo(points.tfl.x, points.tfl.y);
    ctx.closePath();
    ctx.clip();

    // Perspective warp for 3D depth
    const warpQuad = { tl: points.tbl, tr: points.tbr, bl: points.bfl, br: points.bfr };
    perspectiveWarp(ctx, tex, warpQuad, opacity);
    ctx.restore();

    // Wireframe outline
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(points.tbl.x, points.tbl.y);
    ctx.lineTo(points.tbr.x, points.tbr.y);
    ctx.lineTo(points.tfr.x, points.tfr.y);
    ctx.lineTo(points.bfr.x, points.bfr.y);
    ctx.lineTo(points.bbr.x, points.bbr.y);
    ctx.lineTo(points.bbl.x, points.bbl.y);
    ctx.lineTo(points.bfl.x, points.bfl.y);
    ctx.lineTo(points.tfl.x, points.tfl.y);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(points.tfl.x, points.tfl.y); ctx.lineTo(points.bfl.x, points.bfl.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(points.tfr.x, points.tfr.y); ctx.lineTo(points.bfr.x, points.bfr.y); ctx.stroke();
    ctx.restore();

    // Drag handles
    Object.keys(points).forEach(k => drawHandle(ctx, points[k], activePtRef.current === k));
  }, [roomImg, points, activeFabricId, opacity]);

  const handlePointerDown = (e) => {
    if (!points) return;
    const pos = getCanvasPos(e, canvasRef.current);
    for (const k of Object.keys(points)) {
      const pt = points[k];
      if (Math.hypot(pos.x - pt.x, pos.y - pt.y) < HANDLE_R * 2) {
        activePtRef.current = k;
        canvasRef.current.style.cursor = 'grabbing';
        break;
      }
    }
  };

  const handlePointerMove = (e) => {
    if (activePtRef.current && points) {
      const pos = getCanvasPos(e, canvasRef.current);
      setPoints(prev => ({ ...prev, [activePtRef.current]: pos }));
    }
  };

  const handlePointerUp = () => {
    activePtRef.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
  };

  if (!isOpen) return null;

  const activeFabric = FABRICS.find(f => f.id === activeFabricId) || FABRICS[0];

  return (
    <div className="fixed inset-0 z-[200] flex flex-col animate-fade-in bg-linen-white">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-6 md:px-margin-desktop py-4 border-b border-slate-deep/10 bg-linen-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-slate-deep text-xl">view_in_ar</span>
          <div>
            <p className="font-label-caps text-label-caps text-slate-deep uppercase tracking-widest leading-tight">AI Room Preview</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Thử lụa SILKMOON trong không gian của bạn</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {points && !isDetecting && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              8 điểm neo sẵn sàng
            </div>
          )}
          {isDetecting && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-label-caps text-slate-deep uppercase tracking-wider">
              <div className="w-3 h-3 border-2 border-slate-deep border-t-transparent rounded-full animate-spin flex-shrink-0" />
              Đang phân tích...
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

        {/* LEFT: Canvas area */}
        <div
          className="flex-1 flex items-center justify-center p-6 md:p-8 bg-bone/50 overflow-hidden"
          ref={containerRef}
        >
          {!roomImg ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer w-full max-w-2xl"
            >
              <div className="aspect-[16/10] border-2 border-dashed border-slate-deep/20 flex flex-col items-center justify-center gap-4 hover:border-slate-deep/50 hover:bg-linen-white/60 transition-all duration-300 rounded">
                <div className="w-14 h-14 border border-slate-deep/15 flex items-center justify-center group-hover:border-slate-deep/30 transition-colors">
                  <span className="material-symbols-outlined text-3xl text-slate-deep/40 group-hover:text-slate-deep/70 transition-colors">add_photo_alternate</span>
                </div>
                <div className="text-center">
                  <p className="font-label-caps text-label-caps text-slate-deep uppercase tracking-widest">Tải ảnh phòng ngủ lên</p>
                  <p className="text-sm text-on-surface-variant mt-1">AI sẽ phân tích và phủ lụa lên giường tự động</p>
                </div>
                <span className="text-[11px] font-label-caps uppercase tracking-wider text-on-surface-variant/60 border border-slate-deep/10 px-3 py-1">JPG · PNG · WEBP</span>
              </div>
            </div>
          ) : (
            <div className="relative inline-block rounded shadow-xl overflow-hidden" style={{ maxHeight: 'calc(100vh - 140px)' }}>
              <img
                src={roomImg.src}
                alt="Room"
                className="block select-none pointer-events-none"
                style={{ maxHeight: 'calc(100vh - 140px)', maxWidth: '100%', width: 'auto' }}
              />

              {isDetecting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-linen-white/80 backdrop-blur-sm">
                  <div className="w-10 h-10 border-2 border-slate-deep border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="font-label-caps text-label-caps text-slate-deep uppercase tracking-widest">Gemini AI đang phân tích</p>
                  <p className="text-sm text-on-surface-variant mt-1">Nhận diện mặt phẳng giường (8 điểm)...</p>
                </div>
              )}

              <canvas
                ref={canvasRef}
                width={roomImg.width}
                height={roomImg.height}
                className="absolute inset-0 w-full h-full block touch-none z-10"
                style={{ cursor: 'crosshair' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />

              {points && !isDetecting && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-linen-white/90 border border-slate-deep/10 shadow-sm" style={{ whiteSpace: 'nowrap' }}>
                  <span className="material-symbols-outlined text-[13px] text-slate-deep">drag_pan</span>
                  <span className="text-[11px] font-label-caps text-slate-deep uppercase tracking-wider">Kéo điểm neo để tinh chỉnh</span>
                </div>
              )}
            </div>
          )}

          <input
            type="file" accept="image/*" className="hidden" ref={fileInputRef}
            onChange={e => { if (e.target.files[0]) { setPoints(null); loadImage(e.target.files[0]); } }}
          />
        </div>

        {/* RIGHT: Control sidebar */}
        <div className="w-72 flex-shrink-0 flex flex-col bg-linen-white border-l border-slate-deep/10 overflow-y-auto">

          {/* Active fabric */}
          <div className="px-6 pt-6 pb-5 border-b border-slate-deep/10">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Đang xem trước</span>
            <div className="flex items-center gap-3 mt-3">
              <div
                className="w-10 h-10 rounded-full ring-2 ring-offset-2 ring-slate-deep flex-shrink-0"
                style={{ backgroundColor: activeFabric.hex }}
              />
              <p className="font-semibold text-slate-deep text-sm">{activeFabric.label}</p>
            </div>
          </div>

          {/* Fabric swatches */}
          <div className="px-6 py-5 border-b border-slate-deep/10">
            <span className="font-label-caps text-label-caps text-slate-deep uppercase tracking-widest">Chọn màu lụa</span>
            <div className="grid grid-cols-6 gap-2.5 mt-4">
              {FABRICS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFabricId(f.id)}
                  title={f.label}
                  className={`w-full aspect-square rounded-full ring-2 ring-offset-2 transition-all duration-150 ${
                    activeFabricId === f.id ? 'ring-slate-deep scale-105' : 'ring-transparent hover:ring-slate-deep/30'
                  }`}
                  style={{
                    backgroundColor: f.hex,
                    border: f.id === 'white' ? '1px solid rgba(28,44,88,0.15)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Opacity slider */}
          <div className="px-6 py-5 border-b border-slate-deep/10">
            <div className="flex items-center justify-between mb-4">
              <span className="font-label-caps text-label-caps text-slate-deep uppercase tracking-widest">Độ che phủ</span>
              <span className="font-mono text-xs text-on-surface-variant">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.01" value={opacity}
              onChange={e => setOpacity(parseFloat(e.target.value))}
              className="w-full appearance-none cursor-pointer accent-slate-deep"
              style={{ height: '1px', background: `linear-gradient(to right, #1C2C58 ${opacity*100}%, rgba(28,44,88,0.2) ${opacity*100}%)` }}
            />
            <div className="flex justify-between text-[10px] text-on-surface-variant/50 mt-1.5 font-label-caps uppercase tracking-wider">
              <span>Mờ</span><span>Đặc</span>
            </div>
          </div>

          {/* Tips */}
          <div className="px-6 py-5 flex-1">
            <div className="bg-bone/60 border-l-2 border-slate-deep/30 px-4 py-3 space-y-1.5">
              <p className="font-label-caps text-label-caps text-slate-deep uppercase tracking-widest">Mẹo sử dụng</p>
              <p className="text-sm text-on-surface-variant leading-relaxed">Kéo các điểm neo để vùng lụa phủ khớp sát viền giường. Dùng thanh opacity để điều chỉnh mức độ che phủ.</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-6 pb-6 pt-4 border-t border-slate-deep/10 space-y-2.5 flex-shrink-0">
            {roomImg && (
              <button
                onClick={() => setPoints(null)}
                className="w-full py-3 px-4 border border-slate-deep/20 text-slate-deep font-button text-button uppercase tracking-wider hover:border-slate-deep hover:bg-slate-deep/5 transition-all duration-200 flex items-center justify-center gap-2 rounded"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                Phân tích lại AI
              </button>
            )}
            <button
              onClick={() => { setRoomImg(null); setPoints(null); }}
              className="w-full py-3 px-4 bg-slate-deep text-linen-white font-button text-button uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 rounded"
            >
              <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
              {roomImg ? 'Tải ảnh khác' : 'Tải ảnh lên'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ARRoomPreview.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  productColor: PropTypes.string,
};
