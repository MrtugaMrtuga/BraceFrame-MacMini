/** Facing reported by the live track (may be missing on desktop webcams). */
export type FacingMode = "user" | "environment" | string | undefined;

/**
 * True selfie preview when the camera looks at the user.
 * Environment / rear cameras stay unmirrored.
 * Desktop webcams often omit facingMode — we asked for `user`, so mirror.
 */
export function shouldMirrorPreview(facingMode: FacingMode): boolean {
  if (facingMode === "environment") return false;
  return true;
}

export function facingFromTrack(track: MediaStreamTrack | undefined): FacingMode {
  return track?.getSettings?.().facingMode;
}
