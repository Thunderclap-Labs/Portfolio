import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import {
  CONTACT_EMAIL,
  CONTACT_ADDRESS,
} from "@/constants/contact";

const UPDATED = "5 October 2026";

export const metadata: Metadata = {
  title: "Privacy Policy, Thunderclap Labs",
  description:
    "What Thunderclap Labs does and does not collect. This site sets no cookies, runs no analytics and sends nothing to third parties.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy, Thunderclap Labs",
    description:
      "This site sets no cookies, runs no analytics and sends nothing to third parties.",
    type: "website",
  },
};

const SECTIONS: LegalSection[] = [
  {
    heading: "The short version",
    body: (
      <>
        <p>
          This website sets no cookies, runs no analytics, embeds no tracking
          pixels and loads nothing from third-party servers into your browser.
          Fonts are served from this domain. Images are resized and served by
          this site rather than fetched from anywhere else.
        </p>
        <p>
          If you never write to us, we hold no personal data about you beyond
          the ordinary server records described below.
        </p>
      </>
    ),
  },
  {
    heading: "Who is responsible",
    body: (
      <>
        <p>
          Thunderclap Labs, {CONTACT_ADDRESS.street}, {CONTACT_ADDRESS.city},{" "}
          {CONTACT_ADDRESS.country}, is the controller of any personal data
          described here.
        </p>
        <p>
          For anything in this policy, including a request to see or delete what
          we hold, write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </>
    ),
  },
  {
    heading: "What this site collects",
    body: (
      <>
        <p>
          <strong>Nothing in your browser.</strong> There are no cookies, no
          local storage, no session storage and no fingerprinting. You will not
          see a cookie banner because there is nothing to consent to.
        </p>
        <p>
          <strong>Server records.</strong>{" "}
          Our hosting provider keeps standard
          request logs, which include your IP address, the page requested, the
          time, and your browser and operating system version. These exist to
          keep the site running and secure. They are not combined with anything
          else, are not used to build a profile, and are deleted on the
          provider&rsquo;s ordinary rotation.
        </p>
      </>
    ),
  },
  {
    heading: "If you contact us",
    body: (
      <>
        <p>
          This site has no contact form. If you email or call us, we hold what
          you choose to send: your name, your address or number, and whatever is
          in the message.
        </p>
        <p>
          We use it to answer you and, if it turns into work, to run the
          project. The lawful basis is our legitimate interest in replying to
          people who approach us, or the steps taken before entering a contract.
        </p>
        <p>
          Correspondence is kept while a conversation or project is live and for
          as long afterwards as accounting and limitation periods require.
          Enquiries that go nowhere are deleted once they are plainly stale.
        </p>
      </>
    ),
  },
  {
    heading: "Who else is involved",
    body: (
      <>
        <p>
          We do not sell or share personal data. A small number of suppliers
          process it on our behalf, under contract and on our instructions
          only:
        </p>
        <ul>
          <li>
            Our hosting provider, which serves the site and keeps the request
            logs described above.
          </li>
          <li>
            Sanity, which stores the articles and images published here. It
            holds our content, not data about you.
          </li>
          <li>
            Our email provider, which carries any message you send us. Note that
            our published address is a Gmail address, so email you send to it is
            processed by Google.
          </li>
        </ul>
        <p>
          Where a supplier processes data outside the European Economic Area, it
          is covered by the European Commission&rsquo;s standard contractual
          clauses or an adequacy decision.
        </p>
      </>
    ),
  },
  {
    heading: "Your rights",
    body: (
      <>
        <p>
          Under the GDPR you can ask us for a copy of what we hold about you, to
          correct it, to delete it, to restrict or object to how we use it, or
          to receive it in a portable form. Ask at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will
          answer within one month.
        </p>
        <p>
          If you think we have handled your data badly, you can complain to the
          Lithuanian State Data Protection Inspectorate, Valstybinė duomenų
          apsaugos inspekcija, at{" "}
          <a
            href="https://vdai.lrv.lt"
            target="_blank"
            rel="noopener noreferrer"
          >
            vdai.lrv.lt
          </a>
          . We would rather you told us first.
        </p>
      </>
    ),
  },
  {
    heading: "Links and demos",
    body: (
      <>
        <p>
          The concept sites under <a href="/demos">/demos</a> are
          demonstrations. They are fictional brands built by us, and several of
          them keep a basket or a booking in your own browser so the flow can be
          tried end to end. That data stays on your device, is never sent
          anywhere, and nothing on them takes a payment or issues an order.
        </p>
        <p>
          Pages on this site link out to places such as LinkedIn, Instagram,
          YouTube and GitHub. Once you follow a link you are on their site and
          their policy applies, not ours.
        </p>
      </>
    ),
  },
  {
    heading: "Changes",
    body: (
      <p>
        If this policy changes we update the date at the top of this page.
        Changes that affect you materially will be made obvious rather than
        slipped in.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="We build websites for a living, so we know what most of them get up to. This one does not do any of it. Here is exactly what happens to your data when you visit."
      updated={UPDATED}
      sections={SECTIONS}
    />
  );
}
