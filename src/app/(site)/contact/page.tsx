import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/site/ContactForm";
import { MarketingHeader, Prose } from "@/components/site/content";
import { Callout } from "@/components/ui";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <MarketingHeader title="Contact us" lede="Questions about the product, feedback, accessibility or privacy." />
      <Prose>
        <Callout tone="caution" className="mb-8 max-w-xl" title="No case details, please">
          We cannot give legal advice, and this form is not a secure place for case information. For urgent help, see{" "}
          <Link href="/get-help" className="underline">
            Get help now
          </Link>
          .
        </Callout>
        <ContactForm />
      </Prose>
    </>
  );
}
