import type { Metadata } from "next";
import { SignUpForm } from "@/components/site/AuthForms";
import { DemoButton } from "@/components/site/DemoButton";
import { SIGNUP_ACK } from "@/lib/brand";

export const metadata: Metadata = { title: "Create your account" };

export default function SignUpPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-5 py-14 md:grid-cols-[1fr_20rem]">
      <section aria-labelledby="signup" className="max-w-md">
        <h1 id="signup" className="font-display text-[2.4rem] leading-tight">
          Start your case file
        </h1>
        <p className="mt-2 mb-8 text-ink-2">Free for one case. No payment details needed.</p>
        <SignUpForm ack={SIGNUP_ACK} />
      </section>
      <aside className="border-t border-line pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-16">
        <h2 className="font-bold">Want to look around first?</h2>
        <p className="mt-1 mb-4 text-ink-2">See every feature with a fictional sample case.</p>
        <DemoButton />
      </aside>
    </div>
  );
}
