/**
 * Readiness score: a transparent checklist of how organized the file is
 * (site plan 5.1 item 7). It never looks at the merits of the case.
 * Caption (always visible): READINESS_CAPTION in ./wording.ts
 */

export interface ReadinessInput {
  caseDetailsComplete: boolean;
  documentCount: number;
  documentsWithSummary: number;
  eventCount: number;
  confirmedEventCount: number;
  flagCount: number;
  reviewedFlagCount: number;
  deadlineCount: number;
  noDeadlinesYet: boolean;
  questionCount: number;
  summaryWritten: boolean;
  briefExported: boolean;
}

export interface ReadinessItem {
  key: string;
  label: string;
  detail: string;
  weight: number;
  /** 0 to 1. Partial credit where progress is countable. */
  progress: number;
  done: boolean;
}

export interface Readiness {
  score: number; // 0-100, rounded
  items: ReadinessItem[];
  doneCount: number;
}

function ratio(n: number, d: number): number {
  if (d <= 0) return 0;
  return Math.max(0, Math.min(1, n / d));
}

export function computeReadiness(i: ReadinessInput): Readiness {
  const items: ReadinessItem[] = [
    {
      key: "details",
      label: "Case details entered",
      detail: "Court, stage and your role are filled in.",
      weight: 10,
      progress: i.caseDetailsComplete ? 1 : 0,
      done: i.caseDetailsComplete,
    },
    {
      key: "documents",
      label: "Documents added and labelled",
      detail: i.documentCount > 0 ? `${i.documentCount} document${i.documentCount === 1 ? "" : "s"} with origin labels.` : "No documents yet.",
      weight: 15,
      progress: i.documentCount > 0 ? 1 : 0,
      done: i.documentCount > 0,
    },
    {
      key: "summaries",
      label: "Every document summarized",
      detail: `${i.documentsWithSummary} of ${i.documentCount} documents have a summary.`,
      weight: 10,
      progress: i.documentCount === 0 ? 0 : ratio(i.documentsWithSummary, i.documentCount),
      done: i.documentCount > 0 && i.documentsWithSummary >= i.documentCount,
    },
    {
      key: "timeline",
      label: "Timeline confirmed",
      detail: i.eventCount > 0 ? `${i.confirmedEventCount} of ${i.eventCount} events checked against the source.` : "No timeline events yet.",
      weight: 20,
      progress: ratio(i.confirmedEventCount, i.eventCount),
      // 80% confirmed counts as done: some AI drafts are rightly left for later.
      done: i.eventCount > 0 && i.confirmedEventCount / i.eventCount >= 0.8,
    },
    {
      key: "flags",
      label: "Flags reviewed",
      detail: i.flagCount > 0 ? `${i.reviewedFlagCount} of ${i.flagCount} flags reviewed.` : "No flags to review.",
      weight: 15,
      progress: i.flagCount === 0 ? (i.documentCount > 0 ? 1 : 0) : ratio(i.reviewedFlagCount, i.flagCount),
      done: i.documentCount > 0 && i.reviewedFlagCount >= i.flagCount,
    },
    {
      key: "deadlines",
      label: "Deadlines entered",
      detail: i.deadlineCount > 0 ? `${i.deadlineCount} deadline${i.deadlineCount === 1 ? "" : "s"} tracked.` : i.noDeadlinesYet ? "You noted there are no deadlines yet." : "No deadlines entered.",
      weight: 10,
      progress: i.deadlineCount > 0 || i.noDeadlinesYet ? 1 : 0,
      done: i.deadlineCount > 0 || i.noDeadlinesYet,
    },
    {
      key: "questions",
      label: "Questions written",
      detail: i.questionCount > 0 ? `${i.questionCount} question${i.questionCount === 1 ? "" : "s"} for your lawyer or expert.` : "No questions yet.",
      weight: 5,
      progress: i.questionCount > 0 ? 1 : 0,
      done: i.questionCount > 0,
    },
    {
      key: "summary",
      label: "One-page summary written",
      detail: i.summaryWritten ? "Your summary is in the case overview." : "Write it in your own words.",
      weight: 10,
      progress: i.summaryWritten ? 1 : 0,
      done: i.summaryWritten,
    },
    {
      key: "brief",
      label: "Brief exported",
      detail: i.briefExported ? "You have exported a brief." : "Not exported yet.",
      weight: 5,
      progress: i.briefExported ? 1 : 0,
      done: i.briefExported,
    },
  ];
  const total = items.reduce((s, x) => s + x.weight, 0);
  const earned = items.reduce((s, x) => s + x.weight * x.progress, 0);
  return {
    score: Math.round((earned / total) * 100),
    items,
    doneCount: items.filter((x) => x.done).length,
  };
}
