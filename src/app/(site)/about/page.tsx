import type { Metadata } from "next";
import { MarketingHeader, Prose } from "@/components/site/content";
import { PRODUCT_NAME } from "@/lib/brand";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <MarketingHeader title="Why we built this" />
      <Prose>
        <div className="prose-read">
          <p className="text-lg">
            {PRODUCT_NAME} was started by someone who has been through a court case and did much of the legwork themselves: sorting thousands of emails, building
            timelines by hand, and trying to explain it all to lawyers whose time was expensive.
          </p>
          <p>
            The hardest part was not the law. It was keeping the facts in order, knowing what was missing, and walking into each meeting prepared. That is the part
            we set out to make easier.
          </p>
          <h2>What we believe</h2>
          <ul>
            <li>Preparation is a habit. Small weekly steps beat last-minute panic.</li>
            <li>Your facts, in order. One timeline, one index, every claim sourced.</li>
            <li>Spend on experts when it counts. Know what to ask before you pay.</li>
            <li>Plain words, real sources. Nothing invented. Everything checkable.</li>
          </ul>
          <h2>What we are not</h2>
          <p>
            We are not a law firm, and we do not give legal advice. Lawyers, paralegals and experts do work we never will. We want to make their time with you count.
          </p>
          <h2>Where we are</h2>
          <p>
            This is an early build for Ontario. We are talking with people who have been to court, with lawyers and with experts before we open a private beta. The
            name {PRODUCT_NAME} is a working name.
          </p>
        </div>
      </Prose>
    </>
  );
}
