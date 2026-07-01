import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Review the terms for using RecStudio to record, edit, upload, and share videos.",
};

const sections = [
  {
    title: "Using RecStudio",
    body: [
      "RecStudio is a browser-based screen recording and sharing tool. You may use it to record content you have the right to capture, edit, download, upload, and share.",
      "You are responsible for the recordings you create, the permissions you grant, and the links you publish.",
    ],
  },
  {
    title: "Accounts And Google Drive",
    body: [
      "Some features require signing in with Google. By connecting Google Drive, you authorize RecStudio to create and manage files that the app uploads on your behalf.",
      "You can revoke access through your Google Account settings. If access is revoked or tokens expire, Drive upload and sharing features may stop working until you reconnect.",
    ],
  },
  {
    title: "Your Content",
    body: [
      "You keep ownership of the recordings and files you create. By using RecStudio, you give us the limited permission needed to operate the product features you request.",
      "Do not record, upload, or share content that violates someone else's privacy, intellectual property rights, platform rules, or applicable law.",
    ],
  },
  {
    title: "Published Links",
    body: [
      "When you publish a recording to Google Drive, sharing permissions may allow anyone with the link to view the file. Review each link before distributing it.",
      "You are responsible for managing access to published files, including deleting files or changing permissions in Google Drive.",
    ],
  },
  {
    title: "Acceptable Use",
    body: [
      "You may not use RecStudio to distribute malware, harass others, impersonate people or organizations, violate legal rights, bypass security controls, or overload the service.",
      "We may restrict or suspend access if we believe the product is being misused or if continued access creates risk for RecStudio, users, or third parties.",
    ],
  },
  {
    title: "Product Availability",
    body: [
      "RecStudio depends on browsers, device permissions, network conditions, and third-party services such as Google Drive. Features may change, fail, or become temporarily unavailable.",
      "We may update, modify, or discontinue parts of the service as the product evolves.",
    ],
  },
  {
    title: "Disclaimers",
    body: [
      "RecStudio is provided as is and as available. We do not guarantee that recordings, uploads, exports, links, or integrations will always work without interruption or error.",
      "You should keep backup copies of important recordings and verify published links before relying on them.",
    ],
  },
  {
    title: "Limitation Of Liability",
    body: [
      "To the maximum extent allowed by law, RecStudio is not liable for indirect, incidental, special, consequential, or punitive damages, or for lost recordings, lost data, lost profits, or unauthorized access caused by your sharing choices.",
    ],
  },
  {
    title: "Changes To These Terms",
    body: [
      "We may update these terms when the product, legal requirements, or business needs change. Continued use of RecStudio after updates means you accept the revised terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28">
        <section className="border-b border-border/40">
          <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
            <p className="text-sm font-medium text-primary">Legal</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
              These terms explain the rules for using RecStudio to record,
              edit, upload, and share videos.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: July 1, 2026
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {sections.map((section) => (
              <section
                key={section.title}
                className="border-b border-border/40 pb-8 last:border-b-0"
              >
                <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
