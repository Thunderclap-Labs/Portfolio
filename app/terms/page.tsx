import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { CONTACT_EMAIL, CONTACT_ADDRESS } from "@/constants/contact";

const UPDATED = "5 October 2026";

export const metadata: Metadata = {
  title: "Terms of Service, Thunderclap Labs",
  description:
    "The terms covering this website and the concept demos published on it, and how they relate to client work.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service, Thunderclap Labs",
    description:
      "The terms covering this website and the concept demos published on it.",
    type: "website",
  },
};

const SECTIONS: LegalSection[] = [
  {
    heading: "What these terms cover",
    body: (
      <>
        <p>
          These terms apply to this website and everything published on it,
          including the concept sites under <Link href="/demos">/demos</Link> and
          the writing under <Link href="/articles">/articles</Link>. By using the site you
          accept them.
        </p>
        <p>
          They do not govern client work. Projects run under a separate written
          agreement, and where that agreement and these terms disagree, the
          agreement wins.
        </p>
      </>
    ),
  },
  {
    heading: "Who we are",
    body: (
      <p>
        Thunderclap Labs, {CONTACT_ADDRESS.street}, {CONTACT_ADDRESS.city},{" "}
        {CONTACT_ADDRESS.country}. Reach us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    ),
  },
  {
    heading: "The demos are demonstrations",
    body: (
      <>
        <p>
          Every concept site under <Link href="/demos">/demos</Link> is a fictional
          brand built by us to show what we can do. Halcyon, Auriga, Orbit,
          Giria, Iron Hare, Cold Frame, UOLA, Baltic Watch and the rest are not
          real companies, and nothing on them is a real offer.
        </p>
        <p>
          <strong>
            No payment is ever taken and no order, booking, ticket or quote is
            ever issued.
          </strong>{" "}
          Prices, stock levels, capacities, timetables, sensor readings and
          forecasts on those pages are invented or generated to make the
          interface work. Do not rely on any of it for anything.
        </p>
        <p>
          Where a demo remembers a basket or a reservation, it is kept in your
          own browser and goes no further.
        </p>
      </>
    ),
  },
  {
    heading: "Our content",
    body: (
      <>
        <p>
          The design, code, text, images and video on this site belong to
          Thunderclap Labs or to the people credited, and are protected by
          copyright. The Thunderclap Labs name and mark are ours.
        </p>
        <p>
          You may read, link to and quote short extracts with attribution. You
          may not copy the site or a demo wholesale, pass our work off as your
          own, or use it to train a model without written permission. Ask us
          first and we are usually happy to say yes.
        </p>
        <p>
          Third-party libraries used in the demos remain under their own
          licences, which ship alongside them.
        </p>
      </>
    ),
  },
  {
    heading: "Fair use of the site",
    body: (
      <>
        <p>Please do not:</p>
        <ul>
          <li>Try to break, overload or gain unauthorised access to the site.</li>
          <li>Scrape it at a rate that degrades it for anyone else.</li>
          <li>Use it to distribute malware or anything unlawful.</li>
        </ul>
        <p>
          We may withdraw access from anyone doing these things, and the site
          may be changed, taken down or paused at any time without notice.
        </p>
      </>
    ),
  },
  {
    heading: "What we do not promise",
    body: (
      <>
        <p>
          The site is provided as it is. We take care over it, but we do not
          warrant that it will be available without interruption, free of
          errors, or that the information on it is complete or current.
        </p>
        <p>
          Articles describe what we did on particular projects. They are an
          account of our work, not advice you should act on, and results on one
          project do not promise results on another.
        </p>
      </>
    ),
  },
  {
    heading: "Liability",
    body: (
      <>
        <p>
          To the extent the law allows, we are not liable for indirect or
          consequential loss, lost profit, lost data or lost business arising
          from use of this site or the demos on it.
        </p>
        <p>
          Nothing here limits liability for death or personal injury caused by
          negligence, for fraud, or for anything else that cannot lawfully be
          limited. If you are a consumer, your statutory rights are unaffected.
        </p>
      </>
    ),
  },
  {
    heading: "Law and changes",
    body: (
      <>
        <p>
          These terms are governed by Lithuanian law, and the courts of
          Lithuania have jurisdiction.
        </p>
        <p>
          We may update these terms. The date at the top of this page shows when
          they last changed, and the version published here is the one that
          applies.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      intro="Plain terms for this site and the concept demos on it. The short point: the demos are fictional, nothing on them charges you, and client work runs under its own contract."
      updated={UPDATED}
      sections={SECTIONS}
    />
  );
}
