import { formatDateRange } from "../lib/dates";
import type { Photo } from "../db/store";

const W = 1080;
const H = 1920;

export type ExportKind = "free" | "pro";

export interface RevealCase {
  week: number;
  days: number;
  dateFrom?: string;
  dateTo?: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("imagem"));
    img.src = src;
  });
}

function coverDraw(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  iw: number,
  ih: number,
): void {
  const scale = Math.max(W / iw, H / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawCornerTicks(ctx: CanvasRenderingContext2D): void {
  const inset = 48;
  const len = 42;
  ctx.strokeStyle = "#ff5a4a";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  const corners: Array<[number, number, number, number, number, number]> = [
    [inset, inset + len, inset, inset, inset + len, inset],
    [W - inset - len, inset, W - inset, inset, W - inset, inset + len],
    [inset, H - inset - len, inset, H - inset, inset + len, H - inset],
    [W - inset - len, H - inset, W - inset, H - inset, W - inset, H - inset - len],
  ];
  for (const [x1, y1, x2, y2, x3, y3] of corners) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.stroke();
  }
}

function drawFreeWatermark(ctx: CanvasRenderingContext2D): void {
  drawCornerTicks(ctx);
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = "#8e8e93";
  ctx.font = "500 32px -apple-system, BlinkMacSystemFont, Inter, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("BraceFrame", W - 56, H - 52);
  ctx.strokeStyle = "#8e8e93";
  ctx.lineWidth = 3;
  ctx.strokeRect(W - 56 - 188, H - 86, 22, 22);
  ctx.beginPath();
  ctx.arc(W - 56 - 177, H - 75, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawProFrame(ctx: CanvasRenderingContext2D, week: number): void {
  const inset = 12 * (W / 390);
  ctx.strokeStyle = "#ff5a4a";
  ctx.lineWidth = 4;
  ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
  const tick = 22;
  const xs = [inset, W - inset];
  const ys = [inset, H - inset];
  ctx.lineCap = "square";
  for (const x of xs) {
    for (const y of ys) {
      ctx.beginPath();
      ctx.moveTo(x - tick, y);
      ctx.lineTo(x + tick, y);
      ctx.moveTo(x, y - tick);
      ctx.lineTo(x, y + tick);
      ctx.stroke();
    }
  }
  ctx.fillStyle = "#111111";
  ctx.font = "600 36px -apple-system, BlinkMacSystemFont, Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(`Semana ${week} · BraceFrame`, W / 2, inset + 28);
}

function drawChrome(ctx: CanvasRenderingContext2D, kind: ExportKind, week: number): void {
  if (kind === "pro") drawProFrame(ctx, week);
  else drawFreeWatermark(ctx);
}

function wipeBetween(
  ctx: CanvasRenderingContext2D,
  from: HTMLImageElement,
  to: HTMLImageElement,
  progress: number,
): void {
  ctx.fillStyle = "#ececee";
  ctx.fillRect(0, 0, W, H);
  coverDraw(ctx, from, from.naturalWidth, from.naturalHeight);
  if (progress <= 0) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H * Math.min(1, progress));
  ctx.clip();
  coverDraw(ctx, to, to.naturalWidth, to.naturalHeight);
  ctx.restore();
}

function drawCaseCard(ctx: CanvasRenderingContext2D, info: RevealCase): void {
  ctx.fillStyle = "#fafafa";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#fff1ef";
  ctx.beginPath();
  ctx.ellipse(W / 2, 520, 560, 320, 0, 0, Math.PI * 2);
  ctx.fill();

  drawCornerTicks(ctx);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#111111";
  ctx.font = "750 88px -apple-system, BlinkMacSystemFont, Inter, sans-serif";
  ctx.fillText(`Semana ${info.week}`, W / 2, 780);

  ctx.font = "700 44px -apple-system, BlinkMacSystemFont, Inter, sans-serif";
  ctx.fillText(`${info.days} dias com aparelho`, W / 2, 880);

  const range = formatDateRange(info.dateFrom, info.dateTo);
  if (range) {
    ctx.fillStyle = "#8e8e93";
    ctx.font = "500 34px -apple-system, BlinkMacSystemFont, Inter, sans-serif";
    ctx.fillText(range, W / 2, 960);
  }

  const cta = "o teu sorriso em curso";
  ctx.font = "650 32px -apple-system, BlinkMacSystemFont, Inter, sans-serif";
  const tw = ctx.measureText(cta).width;
  const pw = tw + 72;
  const ph = 76;
  const px = (W - pw) / 2;
  const py = 1088;
  ctx.fillStyle = "#fff1ef";
  roundRect(ctx, px, py, pw, ph, 999);
  ctx.fill();
  ctx.fillStyle = "#ff5a4a";
  ctx.textBaseline = "middle";
  ctx.fillText(cta, W / 2, py + ph / 2);
}

interface Timeline {
  firstHold: number;
  wipe: number;
  stepHold: number;
  lastHold: number;
  fade: number;
  caseHold: number;
  caseStart: number;
  total: number;
}

function buildTimeline(frameCount: number): Timeline {
  const n = Math.max(1, frameCount);
  const firstHold = n === 1 ? 1.1 : 0.85;
  const wipe = 0.55;
  const stepHold = 0.42;
  const lastHold = 0.9;
  const fade = 0.4;
  const caseHold = 2.0;
  const transitions = Math.max(0, n - 1);
  const midHolds = Math.max(0, n - 2);
  const caseStart = firstHold + transitions * wipe + midHolds * stepHold + lastHold;
  return {
    firstHold,
    wipe,
    stepHold,
    lastHold,
    fade,
    caseHold,
    caseStart,
    total: caseStart + fade + caseHold,
  };
}

function pairAt(t: number, n: number, tl: Timeline): { from: number; to: number; p: number } {
  if (n <= 1) return { from: 0, to: 0, p: 0 };
  if (t <= tl.firstHold) return { from: 0, to: 0, p: 0 };

  let cursor = tl.firstHold;
  for (let i = 0; i < n - 1; i++) {
    const holdAfter = i === n - 2 ? tl.lastHold : tl.stepHold;
    if (t < cursor + tl.wipe) {
      return { from: i, to: i + 1, p: (t - cursor) / tl.wipe };
    }
    cursor += tl.wipe;
    if (t < cursor + holdAfter) return { from: i + 1, to: i + 1, p: 0 };
    cursor += holdAfter;
  }
  return { from: n - 1, to: n - 1, p: 0 };
}

function pickMime(): string | undefined {
  const types = [
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  if (typeof MediaRecorder === "undefined") return undefined;
  return types.find((type) => MediaRecorder.isTypeSupported(type));
}

export async function exportReveal(opts: {
  frames: Photo[];
  week: number;
  days: number;
  dateFrom?: string;
  dateTo?: string;
  kind: ExportKind;
}): Promise<{ blob: Blob; mime: string; poster: Blob }> {
  const frames = opts.frames.filter((p) => p.blob);
  if (!frames.length) throw new Error("fotos");

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const urls = frames.map((photo) => URL.createObjectURL(photo.blob));
  const images = await Promise.all(urls.map(loadImage));
  const tl = buildTimeline(images.length);
  const info: RevealCase = {
    week: opts.week,
    days: opts.days,
    dateFrom: opts.dateFrom,
    dateTo: opts.dateTo,
  };

  const drawFrame = (t: number) => {
    const last = images[images.length - 1];
    if (t >= tl.caseStart) {
      wipeBetween(ctx, last, last, 0);
      const fade = Math.min(1, (t - tl.caseStart) / tl.fade);
      if (fade > 0) {
        ctx.save();
        ctx.globalAlpha = fade;
        drawCaseCard(ctx, info);
        ctx.restore();
      }
      drawChrome(ctx, opts.kind, opts.week);
      return;
    }
    const pair = pairAt(t, images.length, tl);
    wipeBetween(ctx, images[pair.from], images[pair.to], pair.p);
    drawChrome(ctx, opts.kind, opts.week);
  };

  drawFrame(Math.max(0, tl.caseStart - 0.05));
  const poster = await canvasToBlob(canvas, "image/jpeg", 0.9);

  const mime = pickMime();
  if (!mime || !("captureStream" in canvas)) {
    urls.forEach((url) => URL.revokeObjectURL(url));
    return { blob: poster, mime: "image/jpeg", poster };
  }

  const stream = canvas.captureStream(30);
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };

  const duration = tl.total;
  const started = performance.now();
  rec.start(100);

  await new Promise<void>((resolve) => {
    const tick = () => {
      const t = (performance.now() - started) / 1000;
      drawFrame(t);
      if (t < duration) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: mime }));
    rec.onerror = () => reject(new Error("gravação"));
    rec.stop();
    stream.getTracks().forEach((tr) => tr.stop());
  });

  urls.forEach((url) => URL.revokeObjectURL(url));
  return { blob, mime, poster };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), type, quality);
  });
}

export async function shareReveal(blob: Blob, mime: string): Promise<void> {
  const ext = mime.includes("mp4") ? "mp4" : mime.includes("webm") ? "webm" : "jpg";
  const file = new File([blob], `braceframe-reveal.${ext}`, { type: mime });
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file], title: "BraceFrame", text: "o teu sorriso em curso" });
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
}
