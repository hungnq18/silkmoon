// ── Constants ───────────────────────────────────────────────
export const HANDLE_R = 14;

export const FABRICS = [
  { id: 'champagne', label: 'Champagne Silk', hex: '#C9A882', shimmer: '#EDD9C0' },
  { id: 'white',     label: 'White Silk',     hex: '#EDEAE4', shimmer: '#FFFFFF' },
  { id: 'sage',      label: 'Sage Silk',      hex: '#4A7068', shimmer: '#7AB0A0' },
  { id: 'slate',     label: 'Slate Silk',     hex: '#2D3E3B', shimmer: '#4A6060' },
  { id: 'blush',     label: 'Blush Silk',     hex: '#DCA090', shimmer: '#F2C4B8' },
  { id: 'navy',      label: 'Navy Silk',      hex: '#1B2A4A', shimmer: '#2D4068' },
];

// ── Default 8 points — reasonable estimate for a typical bedroom photo.
// User can drag to adjust after AI detection.
export function defaultPoints(w, h) {
  return {
    tfl: { x: w * 0.30, y: h * 0.38 }, // headboard left
    tfr: { x: w * 0.72, y: h * 0.36 }, // headboard right
    tbl: { x: w * 0.20, y: h * 0.62 }, // foot-left edge of flat surface
    tbr: { x: w * 0.78, y: h * 0.60 }, // foot-right edge of flat surface
    bbl: { x: w * 0.19, y: h * 0.71 }, // mid drape left
    bbr: { x: w * 0.79, y: h * 0.69 }, // mid drape right
    bfl: { x: w * 0.18, y: h * 0.78 }, // full drape front-left
    bfr: { x: w * 0.80, y: h * 0.76 }, // full drape front-right
  };
}

// ── Canvas pointer helper ────────────────────────────────────
export function getCanvasPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const src = e.touches ? e.touches[0] : e;
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top) * scaleY,
  };
}

// ── Colorize real velvet texture offscreen ─────────────────────────
export function colorizeTexture(baseImage, hex, shimmer) {
  const c = document.createElement('canvas');
  c.width = baseImage.width;
  c.height = baseImage.height;
  const ctx = c.getContext('2d');

  // 1. Draw base white velvet photo
  ctx.drawImage(baseImage, 0, 0);

  // 2. Multiply with target color to preserve real shadows/highlights
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, c.width, c.height);

  // 3. Add soft shimmer/sheen
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = shimmer;
  ctx.fillRect(0, 0, c.width, c.height);

  return c;
}

// ── Strip-based perspective warp ─────────────────────────────
export function perspectiveWarp(ctx, tex, quad, alpha) {
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
    const a  = (rx0 - lx0) / iw;
    const b  = (ry0 - ly0) / iw;
    const cv = (lx1 - lx0) / stripH;
    const d  = (ly1 - ly0) / stripH;
    const e  = lx0 - cv * sy0;
    const f  = ly0 - d * sy0;

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

// ── Draw a drag handle circle ────────────────────────────────
export function drawHandle(ctx, pt, active) {
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
