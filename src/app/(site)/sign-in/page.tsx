import type { Metadata } from "next";
import { SignInForm } from "@/components/site/AuthForms";
import { DemoButton } from "@/components/site/DemoButton";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-5 py-14 md:grid-cols-[1fr_20rem]">
      <section aria-labelledby="signin" className="max-w-md">
        <h1 id="signin" className="mb-8 font-display text-[2.4rem] leading-tight">
          Sign in
        </h1>
        <SignInForm />
      </section>
      <aside className="border-t border-line pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-16">
        <h2 className="font-bold">Just exploring?</h2>
        <p className="mt-1 mb-4 text-ink-2">Try the workspace with a fictional sample case.</p>
        <DemoButton />
      </aside>
    </div>
  );
}
