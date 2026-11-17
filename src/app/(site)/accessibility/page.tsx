import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader, Prose } from "@/components/site/content";

export const metadata: Metadata = { title: "Accessibility" };

export default function AccessibilityPage() {
  return (
    <>
      <MarketingHeader title="Accessibility statement" />
      <Prose>
        <div className="prose-read">
          <p>
            People often use this product while stressed, tired or on a phone. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA
            across the public site and the workspace. Ontario&apos;s accessibility rules (AODA) require WCAG 2.0 AA for larger organizations; we target the newer
            standard from the start.
          </p>
          <h2>What we do</h2>
          <ul>
            <li>Every feature works with a keyboard, with a visible focus outline.</li>
            <li>Text and controls meet colour contrast minimums. Flags and statuses always use an icon and words, never colour alone.</li>
            <li>Plain language, short sentences, and no time limits on tasks.</li>
            <li>Motion is minimal and turns off when your device asks for reduced motion.</li>
            <li>A calm palette. Red is used only for dates that have passed and for delete actions.</li>
            <li>The signature compare tool can be used with buttons and arrow keys, not only a mouse.</li>
          </ul>
          <h2>Known gaps</h2>
          <ul>
            <li>Uploaded scans and photos are not read aloud, because text recognition (OCR) is not switched on in this build.</li>
            <li>Printed packages are designed for screen readers through the browser&apos;s print to PDF. Tagged PDF export is planned.</li>
            <li>We have not yet had an independent accessibility audit.</li>
          </ul>
          <h2>Tell us</h2>
          <p>
            If something does not work for you, please <Link href="/contact">contact us</Link> and choose &quot;Accessibility&quot;. A person will reply.
          </p>
        </div>
      </Prose>
    </>
  );
}
