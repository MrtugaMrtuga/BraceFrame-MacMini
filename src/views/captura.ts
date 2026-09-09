import { el } from "../lib/dom";
import { todayISO } from "../lib/dates";
import { addPhoto, photosOnDate, type Pose } from "../db/store";
import { icon } from "../lib/icons";
import { POSES, poseHint } from "../capture/poses";
import { createGuideOverlay } from "../capture/guides";
import { facingFromTrack, shouldMirrorPreview } from "../capture/mirror";

export async function renderCaptura(root: HTMLElement): Promise<void> {
  let step = 0;
  let stream: MediaStream | null = null;
  let flashOn = false;
  let busy = false;
  const saved = new Set<Pose>((await photosOnDate(todayISO())).map((p) => p.pose));

  const video = el("video", { class: "vf-live", playsinline: "", autoplay: "", muted: "" });
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  const stage = el("div", { class: "vf-stage", "data-mirror": "off" }, video);
  const preview = el("img", { class: "preview hidden", alt: "" });
  const fallback = el("div", { class: "vf-fallback hidden" });
  const file = el("input", { class: "file-input", type: "file", accept: "image/*" });
  file.setAttribute("capture", "user");

  const { frame, apply: applyGuide } = createGuideOverlay();
  const hint = el("p", { class: "vf-hint" }, poseHint(POSES[0], 0));
  const finder = el("div", { class: "viewfinder" }, stage, preview, fallback, frame, hint);

  const steps = el("div", { class: "steps" });
  const stepBtns = POSES.map((p, i) => {
    const b = el("button", { class: `step${i === 0 ? " active" : ""}`, type: "button" }, `${i + 1} · ${p.label}`);
    b.addEventListener("click", () => {
      if (busy) return;
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

  const setMirror = (on: boolean) => {
    stage.classList.toggle("is-mirror", on);
    stage.dataset.mirror = on ? "user" : "off";
    video.classList.toggle("is-environment", !on);
  };

  const liveHidden = () => fallback.classList.contains("hidden") === false;

  const sync = () => {
    const pose = POSES[step];
    applyGuide(pose);
    hint.textContent = poseHint(pose, step);
    stepBtns.forEach((b, i) => {
      b.classList.toggle("active", i === step);
      b.classList.toggle("done", saved.has(POSES[i].id));
    });
    preview.classList.add("hidden");
    video.classList.toggle("hidden", liveHidden());
  };

  const showFallback = () => {
    stopStream();
    fallback.classList.remove("hidden");
    video.classList.add("hidden");
    setMirror(false);
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
      const facing = facingFromTrack(stream.getVideoTracks()[0]);
      setMirror(shouldMirrorPreview(facing));
      await video.play();
      fallback.classList.add("hidden");
    } catch {
      showFallback();
    }
  };

  const grabFrame = async (): Promise<Blob | null> => {
    if (!video.videoWidth) return null;
    const w = video.videoWidth;
    const h = video.videoHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    // Raw sensor frame — do not scaleX here (preview mirror is CSS on .vf-stage only).
    ctx.drawImage(video, 0, 0, w, h);
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.88));
  };

  const persistAndAdvance = async (blob: Blob) => {
    const pose = POSES[step];
    const date = todayISO();
    await addPhoto({ pose: pose.id, date, blob });
    saved.add(pose.id);
    if (step < POSES.length - 1) {
      step += 1;
      sync();
      if (!stream) fallback.classList.remove("hidden");
      else {
        fallback.classList.add("hidden");
        video.classList.remove("hidden");
      }
      status.textContent = `${pose.label} guardada.`;
      return;
    }
    stopStream();
    status.textContent = "As três fotos de hoje estão guardadas.";
    location.hash = "#/galeria";
  };

  const runCapture = async (blob: Blob | null) => {
    if (!blob) return;
    busy = true;
    shutter.disabled = true;
    try {
      await persistAndAdvance(blob);
    } finally {
      busy = false;
      shutter.disabled = false;
    }
  };

  shutter.addEventListener("click", async () => {
    if (busy) return;
    if (liveHidden()) {
      file.click();
      return;
    }
    busy = true;
    shutter.disabled = true;
    try {
      if (flashOn) document.body.style.background = "#fff";
      const blob = await grabFrame();
      document.body.style.background = "";
      if (!blob) {
        status.textContent = "A câmara ainda não está pronta.";
        return;
      }
      try {
        navigator.vibrate?.(10);
      } catch {
        /* ignore */
      }
      await persistAndAdvance(blob);
    } finally {
      busy = false;
      shutter.disabled = false;
    }
  });

  retake.addEventListener("click", () => {
    if (busy) return;
    preview.classList.add("hidden");
    if (stream) {
      fallback.classList.add("hidden");
      video.classList.remove("hidden");
    } else fallback.classList.remove("hidden");
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

  file.addEventListener("change", async () => {
    const f = file.files?.[0];
    if (!f || busy) return;
    file.value = "";
    await runCapture(f);
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
