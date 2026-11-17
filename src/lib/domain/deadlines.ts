import type { Deadline } from "./types";

/** Reminder thresholds in days (site plan 5.1 item 8). */
export const REMINDER_DAYS = [14, 7, 2, 1] as const;

export type DeadlineUrgency = "done" | "overdue" | "today" | "within_2" | "within_7" | "within_14" | "later";

/** Whole days from `today` (yyyy-mm-dd) to `date` (yyyy-mm-dd). Timezone-free. */
export function daysBetween(today: string, date: string): number {
  const a = Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10));
  const b = Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

export function urgency(d: Pick<Deadline, "date" | "done">, today: string): DeadlineUrgency {
  if (d.done) return "done";
  const n = daysBetween(today, d.date);
  if (n < 0) return "overdue";
  if (n === 0) return "today";
  if (n <= 2) return "within_2";
  if (n <= 7) return "within_7";
  if (n <= 14) return "within_14";
  return "later";
}

export const URGENCY_LABEL: Record<DeadlineUrgency, string> = {
  done: "Done",
  overdue: "Date has passed",
  today: "Due today",
  within_2: "Due in 2 days or less",
  within_7: "Due within a week",
  within_14: "Due within 2 weeks",
  later: "Coming up",
};

export interface DeadlineWarning {
  deadline: Deadline;
  daysLeft: number;
  level: DeadlineUrgency;
  message: string;
}

/** Warnings shown in the app: anything overdue or inside the 14-day reminder window. */
export function deadlineWarnings(deadlines: Deadline[], today: string): DeadlineWarning[] {
  return deadlines
    .filter((d) => !d.done)
    .map((d) => {
      const n = daysBetween(today, d.date);
      const level = urgency(d, today);
      let message: string;
      if (n < 0) message = `${d.title}: this date was ${-n} day${n === -1 ? "" : "s"} ago. Check with the court office or your lawyer what it means now.`;
      else if (n === 0) message = `${d.title} is today.`;
      else message = `${d.title} is in ${n} day${n === 1 ? "" : "s"}.`;
      return { deadline: d, daysLeft: n, level, message };
    })
    .filter((w) => w.daysLeft <= REMINDER_DAYS[0])
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

/** Which reminder step a deadline is at today (14, 7, 2 or 1), if any. */
export function reminderStep(d: Pick<Deadline, "date" | "done">, today: string): number | null {
  if (d.done) return null;
  const n = daysBetween(today, d.date);
  return (REMINDER_DAYS as readonly number[]).includes(n) ? n : null;
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** iCalendar export with all-day events and alarms at the reminder steps. */
export function deadlinesToIcs(deadlines: Deadline[], stamp: string, productName: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${icsEscape(productName)}//Deadlines//EN`,
    "CALSCALE:GREGORIAN",
  ];
  for (const d of deadlines.filter((x) => !x.done)) {
    const day = d.date.replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${d.id}@deadlines.local`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day}`,
      `SUMMARY:${icsEscape(d.title)}`,
      `DESCRIPTION:${icsEscape("Confirm every deadline with the court office, the order, or your lawyer.")}`,
    );
    for (const n of REMINDER_DAYS) {
      lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsEscape(d.title)}`, `TRIGGER:-P${n}D`, "END:VALARM");
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
