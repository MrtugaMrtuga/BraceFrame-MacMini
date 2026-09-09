import type { Pose } from "../db/store";

export type GuideHook = "guide-frente" | "guide-sorriso" | "guide-oclusao";

export interface PoseConfig {
  id: Pose;
  label: string;
  hint: string;
  guideHook: GuideHook;
}

export const POSES: PoseConfig[] = [
  { id: "frente", label: "Frente", hint: "Alinha a frente", guideHook: "guide-frente" },
  { id: "sorriso", label: "Sorriso", hint: "Alinha o sorriso", guideHook: "guide-sorriso" },
  { id: "oclusao", label: "Oclusão", hint: "Alinha a oclusão", guideHook: "guide-oclusao" },
];

export function poseHint(pose: PoseConfig, index: number, total = POSES.length): string {
  return `${pose.hint} · ${index + 1} de ${total}`;
}
