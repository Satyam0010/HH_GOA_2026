export type RenderFormat = 'frame' | 'id';

export interface RenderOptions {
  format: RenderFormat;
  photo: HTMLImageElement | null;
  name: string;
  role: string;
}

const GREEN = '#164b38';
const GREEN_DARK = '#0e3528';
const YELLOW = '#f3d93c';
const PINK = '#ee3f75';
const CREAM = '#f8f0d8';
const OCEAN = '#4d9560';
const SAND = '#f7efd9';

function drawPalmTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, flip: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * (flip ? -1 : 1), scale);
  ctx.fillStyle = YELLOW;
  ctx.strokeStyle = GREEN_DARK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(8, -140, 4, -280);
  ctx.lineTo(-4, -280);
  ctx.quadraticCurveTo(0, -140, -8, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#8ac465';
  ctx.strokeStyle = GREEN_DARK;
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.translate(0, -275);
    ctx.rotate((i * Math.PI) / 5 - Math.PI / 3);
    ctx.beginPath();
    ctx.ellipse(-55, 0, 55, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawCottage(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#f5ebc9';
  ctx.strokeStyle = GREEN_DARK;
  ctx.lineWidth = 4;
  ctx.fillRect(0, 0, 170, 110);
  ctx.strokeRect(0, 0, 170, 110);
  ctx.fillStyle = GREEN_DARK;
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(85, -55);
  ctx.lineTo(190, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#62a962';
  ctx.beginPath();
  ctx.moveTo(-14, -5);
  ctx.lineTo(85, -48);
  ctx.lineTo(184, -5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = GREEN;
  ctx.fillRect(20, 47, 35, 63);
  ctx.fillStyle = YELLOW;
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 4;
  ctx.fillRect(113, 70, 35, 35);
  ctx.strokeRect(113, 70, 35, 35);
  ctx.restore();
}

function drawCircleImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cx: number, cy: number, size: number) {
  const min = Math.min(img.width, img.height);
  const sx = (img.width - min) / 2;
  const sy = (img.height - min) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, sx, sy, min, min, cx - size / 2, cy - size / 2, size, size);
  ctx.restore();
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save();
  ctx.fillStyle = '#e8d8ac';
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PINK;
  ctx.font = `bold ${size * 0.35}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HH', cx, cy);
  ctx.restore();
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function renderGraphic(opts: RenderOptions): HTMLCanvasElement {
  const size = 1200;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  if (opts.format === 'frame') drawFrame(ctx, size, opts.photo);
  else drawIdCard(ctx, size, opts.photo, opts.name, opts.role);
  return canvas;
}

function drawFrame(ctx: CanvasRenderingContext2D, size: number, photo: HTMLImageElement | null) {
  ctx.fillStyle = '#26704d';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.18, size * 0.13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = OCEAN;
  ctx.fillRect(0, size * 0.27, size, size * 0.16);

  ctx.fillStyle = SAND;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.43);
  for (let i = 0; i <= 10; i++) {
    const x = (size / 10) * i;
    const y = size * 0.43 + (i % 2 === 0 ? size * 0.03 : -size * 0.01);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(size, size * 0.5);
  ctx.lineTo(0, size * 0.5);
  ctx.closePath();
  ctx.fill();

  drawPalmTree(ctx, size * 0.08, size * 0.5, 0.8, false);
  drawPalmTree(ctx, size * 0.92, size * 0.5, 0.8, true);
  drawCottage(ctx, size * 0.2, size * 0.4, 0.6);
  drawCottage(ctx, size * 0.65, size * 0.4, 0.55);

  const circleSize = size * 0.52;
  const cx = size / 2;
  const cy = size * 0.52;
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(cx, cy, circleSize / 2 + 14, 0, Math.PI * 2);
  ctx.fill();

  if (photo) drawCircleImage(ctx, photo, cx, cy, circleSize);
  else drawPlaceholder(ctx, cx, cy, circleSize);

  ctx.fillStyle = YELLOW;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${size * 0.06}px Georgia, serif`;
  ctx.fillText('HACKER', size / 2, size * 0.82);
  ctx.fillStyle = SAND;
  ctx.font = `bold ${size * 0.048}px Georgia, serif`;
  ctx.fillText('HOUSE', size / 2, size * 0.88);

  ctx.fillStyle = PINK;
  roundedRect(ctx, size * 0.15, size * 0.92, size * 0.7, size * 0.045, 8);
  ctx.fill();
  ctx.fillStyle = YELLOW;
  ctx.font = `bold ${size * 0.022}px 'DM Mono', monospace`;
  ctx.fillText('HH GOA 2026', size / 2, size * 0.942);
}

function drawIdCard(ctx: CanvasRenderingContext2D, size: number, photo: HTMLImageElement | null, name: string, role: string) {
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = PINK;
  ctx.fillRect(0, 0, size, size * 0.17);
  ctx.fillStyle = YELLOW;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${size * 0.06}px Georgia, serif`;
  ctx.fillText('HH', size * 0.08, size * 0.085);
  ctx.textAlign = 'right';
  ctx.font = `bold ${size * 0.028}px 'DM Mono', monospace`;
  ctx.fillText('GOA 2026', size * 0.92, size * 0.085);

  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.24, size * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#29744c';
  ctx.fillRect(0, size * 0.27, size, size * 0.04);

  drawPalmTree(ctx, size * 0.12, size * 0.32, 0.4, false);
  drawPalmTree(ctx, size * 0.88, size * 0.32, 0.4, true);

  const photoSize = size * 0.4;
  const cx = size / 2;
  const cy = size * 0.5;
  ctx.fillStyle = PINK;
  ctx.beginPath();
  ctx.arc(cx, cy, photoSize / 2 + 12, 0, Math.PI * 2);
  ctx.fill();
  if (photo) drawCircleImage(ctx, photo, cx, cy, photoSize);
  else drawPlaceholder(ctx, cx, cy, photoSize);

  ctx.fillStyle = GREEN;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${size * 0.045}px Georgia, serif`;
  ctx.fillText(name || 'YOUR NAME', size / 2, size * 0.74);

  ctx.fillStyle = GREEN;
  roundedRect(ctx, size * 0.25, size * 0.78, size * 0.5, size * 0.04, 6);
  ctx.fill();
  ctx.fillStyle = GREEN;
  ctx.font = `bold ${size * 0.018}px 'DM Mono', monospace`;
  ctx.fillText((role || 'FULL STACK DEVELOPER').toUpperCase(), size / 2, size * 0.8);

  ctx.fillStyle = GREEN;
  ctx.fillRect(0, size * 0.87, size, size * 0.13);
  ctx.fillStyle = CREAM;
  ctx.textAlign = 'left';
  ctx.font = `bold ${size * 0.02}px 'DM Mono', monospace`;
  ctx.fillText('BUILD · SHIP · REPEAT', size * 0.08, size * 0.935);
  ctx.fillStyle = YELLOW;
  ctx.textAlign = 'right';
  ctx.fillText('#FRAMEINGOA', size * 0.92, size * 0.935);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = src;
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not generate image'));
    }, 'image/png');
  });
}

export async function convertHeic(file: File): Promise<string> {
  const heic2any = (await import('heic2any')).default;
  const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 }) as Blob;
  return URL.createObjectURL(converted);
}
