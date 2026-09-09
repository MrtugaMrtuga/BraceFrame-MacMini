import type { Photo } from "../db/store";

const W = 1080;
const H = 1920;

export type ExportKind = "free" | "pro";

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

function pickMime(): string | undefined {
  const types = [
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  if (typeof MediaRecorder === "undefined") return undefined;
  return types.find((t) => MediaRecorder.isTypeSupported(t));
}

export async function exportReveal(opts: {
  before: Photo;
  after: Photo;
  week: number;
  kind: ExportKind;
}): Promise<{ blob: Blob; mime: string; poster: Blob }> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const beforeUrl = URL.createObjectURL(opts.before.blob);
  const afterUrl = URL.createObjectURL(opts.after.blob);
  const beforeImg = await loadImage(beforeUrl);
  const afterImg = await loadImage(afterUrl);

  const drawFrame = (t: number) => {
    ctx.fillStyle = "#ececee";
    ctx.fillRect(0, 0, W, H);
    const hold = 0.9;
    const wipe = 1.3;
    const rest = 1.6;
    const total = hold + wipe + rest;
    const u = t % total;
    coverDraw(ctx, beforeImg, beforeImg.naturalWidth, beforeImg.naturalHeight);
    if (u > hold) {
      const p = Math.min(1, (u - hold) / wipe);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, H * p);
      ctx.clip();
      coverDraw(ctx, afterImg, afterImg.naturalWidth, afterImg.naturalHeight);
      ctx.restore();
    }
    if (opts.kind === "pro") drawProFrame(ctx, opts.week);
    else drawFreeWatermark(ctx);
  };

  drawFrame(holdEnd());
  const poster = await canvasToBlob(canvas, "image/jpeg", 0.9);

  const mime = pickMime();
  if (!mime || !("captureStream" in canvas)) {
    URL.revokeObjectURL(beforeUrl);
    URL.revokeObjectURL(afterUrl);
    return { blob: poster, mime: "image/jpeg", poster };
  }

  const stream = canvas.captureStream(30);
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };

  const duration = 3800;
  const started = performance.now();
  rec.start(100);

  await new Promise<void>((resolve) => {
    const tick = () => {
      const t = (performance.now() - started) / 1000;
      drawFrame(t);
      if (t < duration / 1000) requestAnimationFrame(tick);
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

  URL.revokeObjectURL(beforeUrl);
  URL.revokeObjectURL(afterUrl);
  return { blob, mime, poster };
}

function holdEnd(): number {
  return 3;
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
