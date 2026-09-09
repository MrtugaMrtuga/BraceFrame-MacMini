import { el } from "../lib/dom";
import { formatDayMonth, formatMonthLong, todayISO, weekdayName, periodLabel } from "../lib/dates";
import {
  addAppointment,
  deleteAppointment,
  listAppointments,
  loadProfile,
  patchProfile,
  type Appointment,
  type Period,
} from "../db/store";
import { downloadIcs } from "../pwa/reminders";

export async function renderConsultas(root: HTMLElement): Promise<void> {
  const draw = async () => {
    const appts = await listAppointments();
    const upcoming = appts.filter((a) => a.date >= todayISO());
    const cards = el("div", { class: "cards" });

    for (const appt of upcoming) {
      const card = el("article", { class: "card" });
      const soon = appt === upcoming[0];
      const actions = el("div", { class: "card-actions" });
      const ics = el("button", { class: "icon-btn", type: "button", title: "Calendário" }, "ICS");
      const del = el("button", { class: "icon-btn", type: "button", title: "Apagar" }, "✕");
      ics.addEventListener("click", () => downloadIcs(appt));
      del.addEventListener("click", async () => {
        await deleteAppointment(appt.id);
        await draw();
      });
      actions.append(ics, del);
      card.append(
        el("span", { class: `dot ${soon ? "accent" : "mute"}` }),
        el(
          "div",
          {},
          el("h3", {}, `${appt.title} · ${formatDayMonth(appt.date)}`),
          el("p", {}, `${weekdayName(appt.date)} · ${periodLabel(appt.period)}`),
        ),
        actions,
      );
      cards.append(card);
    }

    const form = buildForm(async (appt) => {
      await addAppointment(appt);
      const profile = loadProfile();
      if (!profile?.nextAppointmentDate || appt.date < profile.nextAppointmentDate || profile.nextAppointmentDate < todayISO()) {
        patchProfile({ nextAppointmentDate: appt.date });
      }
      await draw();
    });

    const empty =
      upcoming.length === 0
        ? el("div", { class: "soft-box" }, "Nada mais marcado por agora. Quando fores à consulta, anota aqui.")
        : null;

    root.replaceChildren(
      el(
        "section",
        { class: "screen" },
        el("h1", { class: "title" }, formatMonthLong()),
        el("p", { class: "tagline" }, "os teus próximos passos"),
        el("h2", { class: "section-label" }, "Próximos"),
        cards,
        empty,
        form,
      ),
    );
  };

  await draw();
}

function buildForm(onSave: (a: Omit<Appointment, "id" | "createdAt">) => void): HTMLElement {
  const title = el("input", { type: "text", value: "Ajuste", maxlength: "40" });
  const date = el("input", { type: "date", value: todayISO() });
  const period = el("select") as HTMLSelectElement;
  period.append(new Option("manhã", "manha"), new Option("tarde", "tarde"));
  const save = el("button", { class: "cta", type: "button" }, "Guardar consulta");
  save.addEventListener("click", () => {
    if (!title.value.trim() || !date.value) return;
    onSave({
      title: title.value.trim(),
      date: date.value,
      period: period.value as Period,
    });
  });
  return el(
    "div",
    {},
    el("h2", { class: "section-label" }, "Anotar"),
    el("div", { class: "field" }, el("label", {}, "Nota"), title),
    el("div", { class: "field" }, el("label", {}, "Dia"), date),
    el("div", { class: "field" }, el("label", {}, "Quando"), period),
    save,
  );
}
