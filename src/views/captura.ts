import { el } from "../lib/dom";
import { todayISO } from "../lib/dates";
import { addPhoto, type Pose } from "../db/store";
import { icon } from "../lib/icons";

const POSES: Array<{ id: Pose; label: string }> = [
  { id: "frente", label: "Frente" },
  { id: "sorriso", label: "Sorriso" },
  { id: "oclusao", label: "Oclusão" },
];

export async function renderCaptura(root: HTMLElement): Promise<void> {
  let step = 0;
  let stream: MediaStream | null = null;
  let flashOn = false;
  let snapshot: Blob | null = null;

  const video = el("video", { playsinline: "", autoplay: "", muted: "" });
  video.setAttribute("playsinline", "");
  const preview = el("img", { class: "preview hidden", alt: "" });
  const fallback = el("div", { class: "vf-fallback hidden" });
  const file = el("input", { class: "file-input", type: "file", accept: "image/*" });
  file.setAttribute("capture", "user");

  const poseChip = el("span", { class: "vf-pose" }, POSES[0].label);
  const hint = el("p", { class: "vf-hint" }, "Alinha o sorriso · 1 de 3");
  const frame = el("div", { class: "vf-frame" }, poseChip);
  const finder = el("div", { class: "viewfinder" }, video, preview, fallback, frame, hint);

  const steps = el("div", { class: "steps" });
  const stepBtns = POSES.map((p, i) => {
    const b = el("button", { class: `step${i === 0 ? " active" : ""}`, type: "button" }, `${i + 1} · ${p.label}`);
    b.addEventListener("click", () => {
      if (snapshot) return;
      step = i;
      sync();
    });
    return b;
  });
  steps.append(...stepBtns);

  fallback.append(
    el("p", {}, "Não deu para abrir a câmara. Escolhe uma foto — fica guardada só neste aparelho."),
    el("button", { class: "cta", type: "button" }, "Escolher foto"),
  );
  fallback.querySelector("button")?.addEventListener("click", () => file.click());

  const retake = el("button", { class: "round-btn", type: "button", "aria-label": "Repetir" });
  retake.innerHTML = icon("retake");
  const shutter = el("button", { class: "shutter", type: "button", "aria-label": "Disparar" });
  const flash = el("button", { class: "round-btn", type: "button", "aria-label": "Flash" });
  flash.innerHTML = icon("flash");
  const controls = el("div", { class: "capture-controls" }, retake, shutter, flash);
  const status = el("p", { class: "status" }, "");

  const screen = el(
    "section",
    { class: "screen capture-screen" },
    el("h1", { class: "title" }, "Captura"),
    steps,
    finder,
    controls,
    file,
    status,
  );
  root.replaceChildren(screen);

  const sync = () => {
    const pose = POSES[step];
    poseChip.textContent = pose.label;
    hint.textContent = `Alinha o sorriso · ${step + 1} de 3`;
    stepBtns.forEach((b, i) => b.classList.toggle("active", i === step));
    preview.classList.toggle("hidden", !snapshot);
    video.classList.toggle("hidden", Boolean(snapshot) || fallback.classList.contains("hidden") === false);
  };

  const showFallback = () => {
    stopStream();
    fallback.classList.remove("hidden");
    video.classList.add("hidden");
  };

  const stopStream = () => {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      showFallback();
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
      });
      video.srcObject = stream;
      await video.play();
      fallback.classList.add("hidden");
    } catch {
      showFallback();
    }
  };

  const grabFrame = async (): Promise<Blob | null> => {
    const w = video.videoWidth || 1080;
    const h = video.videoHeight || 1440;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.88));
  };

  const setSnapshot = (blob: Blob) => {
    snapshot = blob;
    preview.src = URL.createObjectURL(blob);
    preview.classList.remove("hidden");
    video.classList.add("hidden");
    status.textContent = "Gostas? Dispara de novo para guardar.";
  };

  shutter.addEventListener("click", async () => {
    if (fallback.classList.contains("hidden") === false && !snapshot) {
      file.click();
      return;
    }
    if (!snapshot) {
      if (flashOn) document.body.style.background = "#fff";
      const blob = await grabFrame();
      document.body.style.background = "";
      if (blob) setSnapshot(blob);
      try {
        navigator.vibrate?.(10);
      } catch {
        /* ignore */
      }
      return;
    }
    const pose = POSES[step].id;
    await addPhoto({ pose, date: todayISO(), blob: snapshot });
    snapshot = null;
    preview.classList.add("hidden");
    video.classList.remove("hidden");
    status.textContent = `${POSES[step].label} guardada.`;
    if (step < 2) {
      step += 1;
      sync();
    } else {
      status.textContent = "Feito · 3 fotos de hoje.";
      location.hash = "#/";
    }
  });

  retake.addEventListener("click", () => {
    snapshot = null;
    preview.classList.add("hidden");
    if (stream) video.classList.remove("hidden");
    status.textContent = "";
    sync();
  });

  flash.addEventListener("click", async () => {
    flashOn = !flashOn;
    flash.classList.toggle("on", flashOn);
    const track = stream?.getVideoTracks()[0];
    const caps = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined;
    if (track && caps?.torch) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: flashOn } as unknown as MediaTrackConstraintSet],
        });
      } catch {
        /* ecrã flash only */
      }
    }
  });

  file.addEventListener("change", () => {
    const f = file.files?.[0];
    if (!f) return;
    setSnapshot(f);
  });

  const observer = new MutationObserver(() => {
    if (!root.contains(screen)) {
      stopStream();
      observer.disconnect();
    }
  });
  observer.observe(root, { childList: true });

  sync();
  await startCamera();
}
