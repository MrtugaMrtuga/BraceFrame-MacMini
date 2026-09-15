import type { ElasticSlot } from "../db/adherence";

export const SLOT_LABEL: Record<ElasticSlot, string> = {
  manha: "manhã",
  tarde: "tarde",
  merenda: "merenda",
  noite: "noite",
};

export const SLOT_LABEL_TITLE: Record<ElasticSlot, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  merenda: "Merenda",
  noite: "Noite",
};

export function kidsHeadline(done: number, active: number): string {
  if (!active) return "Activa o plano";
  if (done >= active) return "Hoje está feito";
  if (done === active - 1) return "Quase lá";
  if (done > 0) return "Já começaste";
  return "Marca o primeiro";
}

export function missingLine(kids: boolean, kind: "elasticos" | "alinhadores" | "ofm" | undefined, slot?: ElasticSlot, hoursLeft = 0): string {
  if (!kind) return kids ? "Hoje está feito." : "Uso de hoje completo.";
  if (kind === "ofm") return kids ? "Falta o OFM da noite" : "Falta o OFM nocturno";
  if (kind === "elasticos") {
    const name = slot ? SLOT_LABEL[slot] : "próxima troca";
    return kids ? `Falta o da ${name}` : `Falta a troca da ${name}`;
  }
  if (hoursLeft <= 0) return kids ? "Meta de horas feita" : "Meta de horas feita";
  return kids ? `Faltam ${hoursLeft} h` : `Faltam ${hoursLeft} horas para a meta de hoje`;
}
