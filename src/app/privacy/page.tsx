import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how RecStudio handles recordings, Google Drive uploads, account data, and browser storage.",
};

const sections = [
  {
    title: "What RecStudio Records",
    body: [
      "RecStudio lets you capture your screen, webcam, microphone, and system audio when your browser and operating system allow it. Recording starts only after you choose a source and grant browser permission.",
      "Your raw recording is processed in your browser. We do not receive, store, or review your video unless you choose to upload it through an integrated third-party service such as Google Drive.",
    ],
  },
  {
    title: "Information We Collect",
    body: [
      "When you sign in with Google, we receive basic account information such as your name, email address, profile image, and authentication tokens needed to keep the app connected.",
      "We may store app preferences, recording metadata, upload status, and share links in your browser so the product can remember your settings and show your recent recordings.",
    ],
  },
  {
    title: "Google Drive Uploads",
    body: [
      "If you publish a recording, RecStudio uploads that file directly to your Google Drive using the permission you granted. The share link is generated from the uploaded Drive file.",
      "When you make a recording shareable, Google Drive controls access to the file based on the permission applied to that file. You can manage or remove that access from your Google Drive account.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use account and app data to authenticate you, connect Google Drive, upload recordings you choose to publish, remember preferences, maintain product reliability, and improve the user experience.",
      "We do not sell your personal information or use your private recordings for advertising.",
    ],
  },
  {
    title: "Data Stored On Your Device",
    body: [
      "Some data is saved locally in your browser, including settings and recording history. Blob-based recordings may become unavailable after refreshes or browser cleanup because they are local browser resources.",
      "You can remove local app data by clearing site data in your browser or using product controls where available.",
    ],
  },
  {
    title: "Data Sharing",
    body: [
      "We share data only when needed to operate the service, comply with the law, protect the product, or complete an action you request, such as signing in with Google or uploading to Google Drive.",
      "Third-party services process your data under their own privacy terms when you use their integrations.",
    ],
  },
  {
    title: "Security",
    body: [
      "We use reasonable technical and organizational safeguards to protect account and integration data. No internet service can guarantee absolute security, so you should keep your account credentials safe and review sharing permissions for published files.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You can choose not to sign in, not to upload recordings, revoke Google Drive access from your Google Account, delete uploaded files from Drive, and clear local browser data.",
      "If you need help with privacy-related requests, contact the RecStudio team through the support channel provided in the app or on the website.",
    ],
  },
  {
    title: "Changes To This Policy",
    body: [
      "We may update this policy as RecStudio changes. When we make material updates, we will revise the last updated date and provide additional notice when appropriate.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28">
        <section className="border-b border-border/40">
          <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
            <p className="text-sm font-medium text-primary">Legal</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
              This policy explains how RecStudio handles your account information,
              browser-based recordings, local app data, and Google Drive uploads.
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
                id={section.title === "Data Stored On Your Device" ? "cookies" : undefined}
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
