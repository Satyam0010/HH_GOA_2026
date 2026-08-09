import goaProfileOverlay from '../assets/goa-profile-overlay.png';

export type RenderFormat = 'frame' | 'id';

export interface RenderOptions {
  format: RenderFormat;
  photo: HTMLImageElement | null;
  name: string;
  role: string;
}

const SIZE = 1200;
// The transparent portrait opening in goa-profile-overlay.png is a centred 60% circle.
const PROFILE_FRAME_PHOTO_SIZE = SIZE * 0.6;
const GREEN = '#164b38';
const GREEN_DARK = '#0e3528';
const YELLOW = '#f3d93c';
const PINK = '#ee3f75';
const CREAM = '#f8f0d8';

let overlayPromise: Promise<HTMLImageElement> | undefined;

export async function renderGraphic({ format, photo, name, role }: RenderOptions): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not create canvas context');

  if (format === 'frame') await drawProfileFrame(ctx, photo);
  else drawBuilderId(ctx, photo, name, role);

  return canvas;
}

/** Draws the Goa beach artwork with the uploaded photo cropped to its round opening. */
async function drawProfileFrame(ctx: CanvasRenderingContext2D, photo: HTMLImageElement | null) {
  ctx.fillStyle = GREEN_DARK;
  ctx.fillRect(0, 0, SIZE, SIZE);

  if (photo) drawCircleImage(ctx, photo, SIZE / 2, SIZE / 2, PROFILE_FRAME_PHOTO_SIZE);

  // The illustration's transparent centre reveals the cropped portrait beneath it.
  const overlay = await getProfileOverlay();
  ctx.drawImage(overlay, 0, 0, overlay.width, overlay.height, 0, 0, SIZE, SIZE);
}

function getProfileOverlay() {
  overlayPromise ??= loadImage(goaProfileOverlay);
  return overlayPromise;
}

function drawBuilderId(ctx: CanvasRenderingContext2D, photo: HTMLImageElement | null, name: string, role: string) {
  // A printed Goa identity card: warm cream paper, forest-green ink, and sunny accents.
  ctx.fillStyle = '#1b2d24';
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = CREAM;
  roundedRect(ctx, 28, 26, SIZE - 56, SIZE - 52, 38);
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = YELLOW;
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = GREEN;
  roundedRect(ctx, 44, 42, SIZE - 88, SIZE - 84, 27);
  ctx.stroke();

  ctx.fillStyle = GREEN;
  roundedRect(ctx, 355, 68, 490, 46, 23);
  ctx.fill();
  ctx.fillStyle = PINK;
  roundedRect(ctx, 488, 24, 224, 142, 16);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = YELLOW;
  roundedRect(ctx, 498, 34, 204, 122, 12);
  ctx.stroke();
  setText(ctx, `bold 31px Georgia, serif`, YELLOW);
  ctx.fillText('HH', 600, 73);
  setText(ctx, `bold 24px monospace`, YELLOW);
  ctx.fillText('GOA', 600, 107);
  ctx.fillText('2026', 600, 135);
  drawPostcardStamp(ctx, 85, 70);
  drawRoundSeal(ctx, 907, 98);

  setText(ctx, `bold 69px Georgia, serif`, GREEN_DARK);
  ctx.fillText('HACKER', 365, 226);
  setText(ctx, `bold 67px Georgia, serif`, GREEN_DARK);
  ctx.fillText('HOUSE', 804, 226);
  setText(ctx, `bold 46px Georgia, serif`, PINK);
  ctx.fillText('GOA', 600, 227);
  drawSparkle(ctx, 125, 265, PINK);
  drawSparkle(ctx, 1070, 270, YELLOW);

  drawBadgeRays(ctx, 600, 455, 212);
  drawPhotoBadge(ctx, photo, 600, 455, 345);
  ctx.fillStyle = GREEN_DARK;
  roundedRect(ctx, 175, 664, 850, 76, 18);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = YELLOW;
  roundedRect(ctx, 184, 673, 832, 58, 13);
  ctx.stroke();
  setText(ctx, `bold 37px monospace`, CREAM);
  ctx.fillText((name || 'YOUR NAME').toUpperCase(), 600, 703);
  ctx.fillStyle = YELLOW;
  roundedRect(ctx, 316, 754, 568, 52, 17);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = PINK;
  roundedRect(ctx, 316, 754, 568, 52, 17);
  ctx.stroke();
  setText(ctx, `bold 19px monospace`, PINK);
  ctx.fillText((role || 'FULL STACK DEVELOPER').toUpperCase(), 600, 780);

  ctx.strokeStyle = '#d9a3a7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(400, 840); ctx.lineTo(400, 1030);
  ctx.moveTo(800, 840); ctx.lineTo(800, 1030);
  ctx.stroke();
  drawSignpost(ctx, 210, 875);
  drawSurfboards(ctx, 521, 935);
  drawBeachHut(ctx, 885, 870);
  setText(ctx, `bold 17px monospace`, GREEN);
  ctx.fillText('BUILDER CLASS', 210, 824);
  ctx.fillText('BEACH BAG', 600, 824);
  ctx.fillText('CURRENTLY SHIPPING', 995, 824);
  setText(ctx, `bold 27px monospace`, PINK);
  ctx.fillText('TERMINAL', 210, 1018);
  ctx.fillText('WIZARD', 210, 1049);
  setText(ctx, `bold 18px monospace`, GREEN);
  ctx.fillText('COCONUT / VS CODE', 600, 1030);
  ctx.fillText('LO-FI BEATS / SUNSETS', 600, 1058);
  setText(ctx, `bold 18px monospace`, PINK);
  ctx.fillText('BUILDER ID', 996, 1030);
  setText(ctx, `bold 17px monospace`, GREEN);
  ctx.fillText('#HH-GOA-2026', 996, 1058);

  ctx.fillStyle = GREEN_DARK;
  ctx.fillRect(48, 1090, 1104, 62);
  setText(ctx, `bold 30px monospace`, CREAM);
  ctx.fillText('#FRAMEINGOA', 600, 1121);
  return;

  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Illustrated coastal postcard.
  ctx.fillStyle = GREEN;
  ctx.fillRect(0, 0, SIZE, SIZE * 0.39);
  ctx.fillStyle = '#3f8b5d';
  ctx.fillRect(0, SIZE * 0.25, SIZE, SIZE * 0.15);
  drawSun(ctx, SIZE * 0.5, SIZE * 0.245, SIZE * 0.115);
  drawBeach(ctx);
  drawPalm(ctx, SIZE * 0.07, SIZE * 0.43, 0.42, false);
  drawPalm(ctx, SIZE * 0.93, SIZE * 0.43, 0.42, true);
  drawHut(ctx, SIZE * 0.06, SIZE * 0.39, 0.32);
  drawHut(ctx, SIZE * 0.77, SIZE * 0.39, 0.32);

  ctx.fillStyle = PINK;
  roundedRect(ctx, SIZE * 0.33, SIZE * 0.05, SIZE * 0.34, SIZE * 0.055, 8);
  ctx.fill();
  setText(ctx, `bold ${SIZE * 0.022}px 'DM Mono', monospace`, YELLOW);
  ctx.fillText('HACKER HOUSE · GOA 2026', SIZE * 0.5, SIZE * 0.079);

  const photoSize = SIZE * 0.365;
  const photoX = SIZE * 0.5;
  const photoY = SIZE * 0.5;
  drawPhotoBadge(ctx, photo, photoX, photoY, photoSize);

  setText(ctx, `bold ${SIZE * 0.048}px Georgia, serif`, GREEN);
  ctx.fillText(name || 'YOUR NAME', SIZE * 0.5, SIZE * 0.735);

  ctx.fillStyle = PINK;
  roundedRect(ctx, SIZE * 0.22, SIZE * 0.78, SIZE * 0.56, SIZE * 0.047, 8);
  ctx.fill();
  setText(ctx, `bold ${SIZE * 0.018}px 'DM Mono', monospace`, CREAM);
  ctx.fillText((role || 'FULL STACK DEVELOPER').toUpperCase(), SIZE * 0.5, SIZE * 0.804);

  ctx.fillStyle = GREEN;
  ctx.fillRect(0, SIZE * 0.875, SIZE, SIZE * 0.125);
  ctx.textAlign = 'left';
  ctx.fillStyle = CREAM;
  ctx.font = `bold ${SIZE * 0.02}px 'DM Mono', monospace`;
  ctx.fillText('BUILD · SHIP · REPEAT', SIZE * 0.08, SIZE * 0.937);
  ctx.textAlign = 'right';
  ctx.fillStyle = YELLOW;
  ctx.fillText('#FRAMEINGOA', SIZE * 0.92, SIZE * 0.937);
}

function drawPostcardStamp(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.13);
  ctx.fillStyle = '#f7f0dd'; ctx.strokeStyle = GREEN_DARK; ctx.lineWidth = 6;
  ctx.fillRect(0, 0, 122, 136); ctx.strokeRect(0, 0, 122, 136);
  setText(ctx, 'bold 16px monospace', PINK); ctx.fillText('GOA', 61, 28);
  setText(ctx, 'bold 14px monospace', GREEN); ctx.fillText('INDIA', 61, 48);
  ctx.fillStyle = YELLOW; ctx.beginPath(); ctx.arc(42, 79, 18, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = GREEN; ctx.lineWidth = 4;
  for (let i = 0; i < 3; i += 1) { ctx.beginPath(); ctx.moveTo(16, 102 + i * 8); ctx.quadraticCurveTo(46, 94 + i * 8, 102, 102 + i * 8); ctx.stroke(); }
  ctx.restore();
}

function drawRoundSeal(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = GREEN_DARK; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 65, 0, Math.PI * 2); ctx.stroke();
  setText(ctx, 'bold 13px monospace', GREEN_DARK); ctx.fillText('BUILD IN GOA', x, y - 34); ctx.fillText('SHIP FROM PARADISE', x, y + 42);
  drawMiniPalm(ctx, x, y + 15, 0.32);
}

function drawMiniPalm(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.strokeStyle = GREEN_DARK; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(0, 38); ctx.quadraticCurveTo(3, -15, 0, -52); ctx.stroke();
  for (let i = 0; i < 5; i += 1) { ctx.save(); ctx.rotate(-1.2 + i * 0.6); ctx.beginPath(); ctx.ellipse(26, -48, 31, 8, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}

function drawBadgeRays(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.save(); ctx.strokeStyle = YELLOW; ctx.lineWidth = 7;
  for (let i = 0; i < 22; i += 1) { const a = (i / 22) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * radius, y + Math.sin(a) * radius); ctx.lineTo(x + Math.cos(a) * (radius + 16), y + Math.sin(a) * (radius + 16)); ctx.stroke(); }
  ctx.restore();
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y - 17); ctx.lineTo(x + 6, y - 6); ctx.lineTo(x + 17, y); ctx.lineTo(x + 6, y + 6); ctx.lineTo(x, y + 17); ctx.lineTo(x - 6, y + 6); ctx.lineTo(x - 17, y); ctx.lineTo(x - 6, y - 6); ctx.closePath(); ctx.fill();
}

function drawSignpost(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = GREEN_DARK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(x, y + 5); ctx.lineTo(x, y + 109); ctx.stroke();
  ctx.fillStyle = YELLOW; roundedRect(ctx, x - 78, y + 15, 130, 38, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = PINK; roundedRect(ctx, x - 46, y + 59, 130, 38, 7); ctx.fill(); ctx.stroke();
  setText(ctx, 'bold 16px monospace', GREEN_DARK); ctx.fillText('BUILD', x - 14, y + 34);
  setText(ctx, 'bold 15px monospace', CREAM); ctx.fillText('SHIP', x + 19, y + 78);
}

function drawSurfboards(ctx: CanvasRenderingContext2D, x: number, y: number) {
  for (const [offset, color] of [[0, YELLOW], [46, PINK]] as const) {
    ctx.fillStyle = color; ctx.strokeStyle = GREEN_DARK; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(x + offset, y, 20, 83, 0.12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + offset, y - 72); ctx.lineTo(x + offset, y + 70); ctx.stroke();
  }
  ctx.fillStyle = GREEN; ctx.beginPath(); ctx.ellipse(x + 18, y + 68, 86, 18, 0, 0, Math.PI * 2); ctx.fill();
}

function drawBeachHut(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = PINK; ctx.strokeStyle = GREEN_DARK; ctx.lineWidth = 5;
  ctx.fillRect(x, y + 42, 140, 100); ctx.strokeRect(x, y + 42, 140, 100);
  ctx.fillStyle = GREEN; ctx.beginPath(); ctx.moveTo(x - 16, y + 45); ctx.lineTo(x + 70, y - 6); ctx.lineTo(x + 156, y + 45); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = YELLOW; ctx.fillRect(x + 52, y + 82, 38, 60); ctx.strokeRect(x + 52, y + 82, 38, 60);
  ctx.fillStyle = '#6aa866'; ctx.beginPath(); ctx.ellipse(x + 70, y + 148, 100, 13, 0, 0, Math.PI * 2); ctx.fill();
}

function drawSun(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(x, y, radius, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(x - radius, y, radius * 2, SIZE * 0.015);

  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 5;
  for (let i = -3; i <= 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + i * SIZE * 0.055, y);
    ctx.lineTo(x + i * SIZE * 0.073, y + SIZE * 0.03 + Math.abs(i) * SIZE * 0.008);
    ctx.stroke();
  }
}

function drawBeach(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#fffbed';
  ctx.beginPath();
  ctx.moveTo(0, SIZE * 0.37);
  ctx.bezierCurveTo(SIZE * 0.23, SIZE * 0.31, SIZE * 0.38, SIZE * 0.43, SIZE * 0.57, SIZE * 0.365);
  ctx.bezierCurveTo(SIZE * 0.74, SIZE * 0.315, SIZE * 0.9, SIZE * 0.41, SIZE, SIZE * 0.35);
  ctx.lineTo(SIZE, SIZE * 0.56);
  ctx.lineTo(0, SIZE * 0.56);
  ctx.closePath();
  ctx.fill();
}

function drawPalm(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, flip: boolean) {
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
  for (let i = 0; i < 4; i += 1) {
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

function drawHut(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#f5ebc9';
  ctx.strokeStyle = GREEN_DARK;
  ctx.lineWidth = 4;
  ctx.fillRect(0, 0, 170, 110);
  ctx.strokeRect(0, 0, 170, 110);
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
  ctx.fillRect(113, 70, 35, 35);
  ctx.strokeRect(113, 70, 35, 35);
  ctx.restore();
}

function drawPhotoBadge(ctx: CanvasRenderingContext2D, photo: HTMLImageElement | null, x: number, y: number, size: number) {
  ctx.fillStyle = GREEN_DARK;
  ctx.beginPath();
  ctx.arc(x, y, size / 2 + 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = YELLOW;
  ctx.beginPath();
  ctx.arc(x, y, size / 2 + 10, 0, Math.PI * 2);
  ctx.fill();

  if (photo) drawCircleImage(ctx, photo, x, y, size);
  else drawPlaceholder(ctx, x, y, size);
}

function drawCoverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const sourceSize = Math.min(image.width, image.height);
  const sourceX = (image.width - sourceSize) / 2;
  const sourceY = (image.height - sourceSize) / 2;
  ctx.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, x, y, width, height);
}

function drawCircleImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, size: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.clip();
  drawCoverImage(ctx, image, x - size / 2, y - size / 2, size, size);
  ctx.restore();
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = '#e8d8ac';
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();
  setText(ctx, `bold ${size * 0.35}px Georgia, serif`, PINK);
  ctx.fillText('HH', x, y);
}

function setText(ctx: CanvasRenderingContext2D, font: string, color: string) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load image'));
    image.src = src;
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
