import { startDemoAction } from "@/app/actions/auth";
import { Button } from "@/components/ui";

/** Starts a throwaway demo account with the fictional sample case (local demo mode only). */
export function DemoButton() {
  return (
    <form action={startDemoAction}>
      <Button type="submit" variant="secondary" className="w-full">
        Explore the sample case, no account needed
      </Button>
      <p className="mt-2 text-sm text-ink-3">Opens a fictional case with sample documents. Nothing leaves this server, and you can delete the demo account from Account settings.</p>
    </form>
  );
}
