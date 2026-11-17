import { OnboardingForm } from "@/components/workspace/OnboardingForm";
import { requireUser } from "@/lib/auth/current";
import { criminalEnabled } from "@/lib/config";

export default async function OnboardingPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-[2.2rem] leading-tight">Set up your case file</h1>
      <p className="mt-2 text-ink-2">
        {user.displayName ? `Welcome, ${user.displayName}. ` : ""}A few questions so your checklists and weekly plan fit your situation. We never ask about the strength of
        your case.
      </p>
      <OnboardingForm criminalOpen={criminalEnabled()} />
    </div>
  );
}

// Authenticated, per-request page: allowed to block on the server.
export const instant = false;
