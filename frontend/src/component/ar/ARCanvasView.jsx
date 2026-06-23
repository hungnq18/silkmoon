import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FABRICS, HANDLE_R, colorizeTexture, perspectiveWarp, drawHandle, getCanvasPos } from './arUtils';



import velvetTextureUrl from '../../assets/velvet.png';

// ── Validate & fix points so the surfaces make geometric sense ──
// Auto-sorts the 8 points into top/bottom and left/right based on their actual coordinates.
function validatePoints(pts) {
  if (!pts) return pts;

  // Group top surface points (tfl, tfr, tbl, tbr)
  let topSurface = [pts.tfl, pts.tfr, pts.tbl, pts.tbr];
  // Sort by Y to separate headboard (top 2) from foot (bottom 2)
  topSurface.sort((a, b) => a.y - b.y);
  let headboard = [topSurface[0], topSurface[1]];
  let foot = [topSurface[2], topSurface[3]];

  // Sort by X to get left/right
  headboard.sort((a, b) => a.x - b.x);
  foot.sort((a, b) => a.x - b.x);

  const tfl = headboard[0];
  const tfr = headboard[1];
  const tbl = foot[0];
  const tbr = foot[1];

  // Group bottom surface (floor) points (bfl, bfr, bbl, bbr)
  let bottomSurface = [pts.bfl, pts.bfr, pts.bbl, pts.bbr];
  bottomSurface.sort((a, b) => a.y - b.y);
  let floorHeadboard = [bottomSurface[0], bottomSurface[1]];
  let floorFoot = [bottomSurface[2], bottomSurface[3]];

  floorHeadboard.sort((a, b) => a.x - b.x);
  floorFoot.sort((a, b) => a.x - b.x);

  const bbl = floorHeadboard[0];
  const bbr = floorHeadboard[1];
  const bfl = floorFoot[0];
  const bfr = floorFoot[1];

  return { tfl, tfr, tbl, tbr, bbl, bbr, bfl, bfr };
}

export default function ARCanvasView({
  roomImg, points, setPoints, isDetecting, productColor, opacity, onFileChange,
}) {
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const activePtRef = useRef(null);
  const texCacheRef = useRef({});
  const [baseTextureImg, setBaseTextureImg] = useState(null);

  // ── Load real velvet texture on mount ──
  useEffect(() => {
    const img = new Image();
    img.src = velvetTextureUrl;
    img.onload = () => {
      console.log("[AR] Loaded velvet texture successfully");
      setBaseTextureImg(img);
    };
    img.onerror = (e) => console.error("[AR] Failed to load velvet texture", e);
  }, []);

  // ── Main draw effect ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !roomImg || !points || !baseTextureImg) return;

    const colorKey = productColor || 'champagne';
    if (!texCacheRef.current[colorKey]) {
      const fabric = FABRICS.find(f => f.id === colorKey) || FABRICS[0];
      texCacheRef.current[colorKey] = colorizeTexture(baseTextureImg, fabric.hex, fabric.shimmer);
    }
    const tex = texCacheRef.current[colorKey];

    // Validate point geometry before rendering
    const pts = validatePoints(points);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ── 0. FLOOR SHADOW (Ambient Occlusion) ──
    if (pts.bfl && pts.bfr && pts.bbl && pts.bbr) {
      ctx.save();
      ctx.filter = 'blur(15px)';
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath();
      ctx.moveTo(pts.bbl.x - 15, pts.bbl.y);
      ctx.lineTo(pts.bfl.x - 15, pts.bfl.y + 15);
      ctx.lineTo(pts.bfr.x + 15, pts.bfr.y + 15);
      ctx.lineTo(pts.bbr.x + 15, pts.bbr.y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // ── 1. TOP SURFACE (main bed sheet) ──────────────────
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts.tfl.x, pts.tfl.y);
    ctx.lineTo(pts.tfr.x, pts.tfr.y);
    ctx.lineTo(pts.tbr.x, pts.tbr.y);
    ctx.lineTo(pts.tbl.x, pts.tbl.y);
    ctx.closePath();
    ctx.clip();
    perspectiveWarp(ctx, tex, { tl: pts.tfl, tr: pts.tfr, bl: pts.tbl, br: pts.tbr }, opacity);

    // 3D Lighting: Top surface shadow gradient
    const gradT = ctx.createLinearGradient(0, Math.min(pts.tfl.y, pts.tfr.y), 0, Math.max(pts.tbl.y, pts.tbr.y));
    gradT.addColorStop(0, 'rgba(0,0,0,0.15)'); // Near headboard (darker)
    gradT.addColorStop(0.5, 'rgba(255,255,255,0.03)'); // Middle highlight
    gradT.addColorStop(1, 'rgba(0,0,0,0.05)'); // Near foot
    ctx.fillStyle = gradT;
    ctx.fillRect(-5000, -5000, 10000, 10000);
    ctx.restore();

    // ── 2. FRONT FACE (draping at foot of bed) ──
    if (pts.bfl && pts.bfr) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts.tbl.x, pts.tbl.y);
      ctx.lineTo(pts.tbr.x, pts.tbr.y);
      ctx.lineTo(pts.bfr.x, pts.bfr.y);
      ctx.lineTo(pts.bfl.x, pts.bfl.y);
      ctx.closePath();
      ctx.clip();
      perspectiveWarp(ctx, tex, { tl: pts.tbl, tr: pts.tbr, bl: pts.bfl, br: pts.bfr }, opacity);

      // 3D Lighting: Front face ambient occlusion
      const gradF = ctx.createLinearGradient(0, Math.min(pts.tbl.y, pts.tbr.y), 0, Math.max(pts.bfl.y, pts.bfr.y));
      gradF.addColorStop(0, 'rgba(0,0,0,0.05)'); // Top edge (catches light)
      gradF.addColorStop(0.7, 'rgba(0,0,0,0.3)'); // Middle
      gradF.addColorStop(1, 'rgba(0,0,0,0.65)'); // Bottom edge (floor shadow)
      ctx.fillStyle = gradF;
      ctx.fillRect(-5000, -5000, 10000, 10000);
      ctx.restore();
    }

    // ── 3. LEFT SIDE FACE ──
    if (pts.bbl && pts.bfl) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts.tfl.x, pts.tfl.y);
      ctx.lineTo(pts.tbl.x, pts.tbl.y);
      ctx.lineTo(pts.bfl.x, pts.bfl.y);
      ctx.lineTo(pts.bbl.x, pts.bbl.y);
      ctx.closePath();
      ctx.clip();
      perspectiveWarp(ctx, tex, { tl: pts.tfl, tr: pts.tbl, bl: pts.bbl, br: pts.bfl }, opacity);

      // 3D Lighting: Left face ambient occlusion
      const gradL = ctx.createLinearGradient(0, Math.min(pts.tfl.y, pts.tbl.y), 0, Math.max(pts.bbl.y, pts.bfl.y));
      gradL.addColorStop(0, 'rgba(0,0,0,0.2)');
      gradL.addColorStop(1, 'rgba(0,0,0,0.7)');
      ctx.fillStyle = gradL;
      ctx.fillRect(-5000, -5000, 10000, 10000);
      ctx.restore();
    }

    // ── 4. RIGHT SIDE FACE ──
    if (pts.bbr && pts.bfr) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts.tfr.x, pts.tfr.y);
      ctx.lineTo(pts.tbr.x, pts.tbr.y);
      ctx.lineTo(pts.bfr.x, pts.bfr.y);
      ctx.lineTo(pts.bbr.x, pts.bbr.y);
      ctx.closePath();
      ctx.clip();
      perspectiveWarp(ctx, tex, { tl: pts.tfr, tr: pts.tbr, bl: pts.bbr, br: pts.bfr }, opacity);

      // 3D Lighting: Right face ambient occlusion
      const gradR = ctx.createLinearGradient(0, Math.min(pts.tfr.y, pts.tbr.y), 0, Math.max(pts.bbr.y, pts.bfr.y));
      gradR.addColorStop(0, 'rgba(0,0,0,0.2)');
      gradR.addColorStop(1, 'rgba(0,0,0,0.7)');
      ctx.fillStyle = gradR;
      ctx.fillRect(-5000, -5000, 10000, 10000);
      ctx.restore();
    }

    // ── 5. Wireframe outline (dashed) ─────────────────────
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.2;
    // Top surface outline
    ctx.beginPath();
    ctx.moveTo(pts.tfl.x, pts.tfl.y);
    ctx.lineTo(pts.tfr.x, pts.tfr.y);
    ctx.lineTo(pts.tbr.x, pts.tbr.y);
    ctx.lineTo(pts.tbl.x, pts.tbl.y);
    ctx.closePath();
    ctx.stroke();

    // Draping/vertical/bottom edges
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    // Vertical edges
    if (pts.bbl) { ctx.moveTo(pts.tfl.x, pts.tfl.y); ctx.lineTo(pts.bbl.x, pts.bbl.y); }
    if (pts.bbr) { ctx.moveTo(pts.tfr.x, pts.tfr.y); ctx.lineTo(pts.bbr.x, pts.bbr.y); }
    if (pts.bfl) { ctx.moveTo(pts.tbl.x, pts.tbl.y); ctx.lineTo(pts.bfl.x, pts.bfl.y); }
    if (pts.bfr) { ctx.moveTo(pts.tbr.x, pts.tbr.y); ctx.lineTo(pts.bfr.x, pts.bfr.y); }
    // Bottom boundary edges
    if (pts.bbl && pts.bfl) { ctx.moveTo(pts.bbl.x, pts.bbl.y); ctx.lineTo(pts.bfl.x, pts.bfl.y); }
    if (pts.bfl && pts.bfr) { ctx.moveTo(pts.bfl.x, pts.bfl.y); ctx.lineTo(pts.bfr.x, pts.bfr.y); }
    if (pts.bfr && pts.bbr) { ctx.moveTo(pts.bfr.x, pts.bfr.y); ctx.lineTo(pts.bbr.x, pts.bbr.y); }
    ctx.stroke();
    ctx.restore();

    // ── 6. Drag handles on all 8 points ──────────────────
    Object.keys(pts).forEach(k =>
      drawHandle(ctx, pts[k], activePtRef.current === k)
    );
  }, [roomImg, points, productColor, opacity, baseTextureImg]);

  // ── Pointer handlers ─────────────────────────────────────
  const handleDown = (e) => {
    if (!points) return;
    const pos = getCanvasPos(e, canvasRef.current);
    for (const k of Object.keys(points)) {
      if (Math.hypot(pos.x - points[k].x, pos.y - points[k].y) < HANDLE_R * 2.2) {
        activePtRef.current = k;
        canvasRef.current.style.cursor = 'grabbing';
        break;
      }
    }
  };
  const handleMove = (e) => {
    if (activePtRef.current && points) {
      setPoints(prev => ({ ...prev, [activePtRef.current]: getCanvasPos(e, canvasRef.current) }));
    }
  };
  const handleUp = () => {
    activePtRef.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
  };

  // ── Upload dropzone ──────────────────────────────────────
  if (!roomImg) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 bg-bone/50">
        <div onClick={() => fileRef.current?.click()} className="group cursor-pointer w-full max-w-2xl">
          <div className="aspect-[16/10] border-2 border-dashed border-slate-deep/20 flex flex-col items-center justify-center gap-4 hover:border-slate-deep/50 hover:bg-linen-white/60 transition-all duration-300 rounded">
            <div className="w-14 h-14 border border-slate-deep/15 flex items-center justify-center group-hover:border-slate-deep/30 transition-colors">
              <span className="material-symbols-outlined text-3xl text-slate-deep/40 group-hover:text-slate-deep/70 transition-colors">add_photo_alternate</span>
            </div>
            <div className="text-center">
              <p className="font-label-caps text-label-caps text-slate-deep uppercase tracking-widest">Tải ảnh phòng ngủ lên</p>
              <p className="text-sm text-on-surface-variant mt-1">AI xác định vị trí tấm ga · phủ màu lụa lên mặt giường</p>
            </div>
            <span className="text-[11px] font-label-caps uppercase tracking-wider text-on-surface-variant/60 border border-slate-deep/10 px-3 py-1">JPG · PNG · WEBP</span>
          </div>
        </div>
        <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={onFileChange} />
      </div>
    );
  }

  // ── Canvas view ───────────────────────────────────────────
  return (
    <div className="flex-1 flex items-center justify-center p-6 md:p-8 bg-bone/50 overflow-hidden">
      <div className="relative inline-block rounded shadow-xl overflow-hidden" style={{ maxHeight: 'calc(100vh - 140px)' }}>

        <img
          src={roomImg.src} alt="Room"
          className="block select-none pointer-events-none"
          style={{ maxHeight: 'calc(100vh - 140px)', maxWidth: '100%', width: 'auto' }}
        />

        {isDetecting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-linen-white/80 backdrop-blur-sm">
            <div className="w-10 h-10 border-2 border-slate-deep border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-label-caps text-label-caps text-slate-deep uppercase tracking-widest">Gemini AI đang phân tích</p>
            <p className="text-sm text-on-surface-variant mt-1">Bỏ qua gối chăn · xác định mặt phẳng ga...</p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={roomImg.width}
          height={roomImg.height}
          className="absolute inset-0 w-full h-full block touch-none z-10"
          style={{ cursor: 'crosshair' }}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerLeave={handleUp}
        />

        {points && !isDetecting && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-linen-white/90 border border-slate-deep/10 shadow-sm" style={{ whiteSpace: 'nowrap' }}>
            <span className="material-symbols-outlined text-[13px] text-slate-deep">drag_pan</span>
            <span className="text-[11px] font-label-caps text-slate-deep uppercase tracking-wider">Kéo điểm neo để tinh chỉnh · 8 góc</span>
          </div>
        )}
      </div>

      <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={onFileChange} />
    </div>
  );
}

ARCanvasView.propTypes = {
  roomImg: PropTypes.object,
  points: PropTypes.object,
  setPoints: PropTypes.func.isRequired,
  isDetecting: PropTypes.bool.isRequired,
  productColor: PropTypes.string,
  opacity: PropTypes.number.isRequired,
  onFileChange: PropTypes.func.isRequired,
};
