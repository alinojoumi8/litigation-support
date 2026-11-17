"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  BookOpen,
  CalendarClock,
  FileText,
  Flag,
  FolderOpen,
  House,
  ListOrdered,
  MessageCircleQuestion,
  Package,
  PenLine,
  Settings,
  Users,
} from "lucide-react";
import { cx } from "@/components/ui";

const ITEMS = [
  { seg: "", label: "This week", icon: House },
  { seg: "overview", label: "Case overview", icon: FolderOpen },
  { seg: "documents", label: "Documents", icon: FileText },
  { seg: "timeline", label: "Timeline", icon: ListOrdered },
  { seg: "people", label: "People", icon: Users },
  { seg: "flags", label: "Flags", icon: Flag },
  { seg: "signatures", label: "Signature compare", icon: PenLine },
  { seg: "money", label: "Money patterns", icon: Banknote },
  { seg: "deadlines", label: "Deadlines", icon: CalendarClock },
  { seg: "packages", label: "Packages", icon: Package },
  { seg: "questions", label: "Notes and questions", icon: MessageCircleQuestion },
  { seg: "guides", label: "Guides and checklists", icon: BookOpen },
  { seg: "settings", label: "Settings", icon: Settings },
];

export function CaseNav({ caseId }: { caseId: string }) {
  const pathname = usePathname();
  const base = `/app/cases/${caseId}`;
  return (
    <nav aria-label="Case" className="px-2 pb-3 lg:pb-6">
      <ul className="flex gap-1 overflow-x-auto lg:block lg:space-y-0.5 lg:overflow-visible">
        {ITEMS.map(({ seg, label, icon: Icon }) => {
          const href = seg ? `${base}/${seg}` : base;
          const active = seg ? pathname === href || pathname.startsWith(`${href}/`) : pathname === base;
          return (
            <li key={seg || "home"} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex min-h-10 items-center gap-2.5 whitespace-nowrap rounded-md px-3 text-[0.93rem]",
                  active ? "bg-spruce-tint font-semibold text-spruce-deep" : "text-ink-2 hover:bg-sunken hover:text-ink",
                )}
              >
                <Icon aria-hidden className="size-4 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
