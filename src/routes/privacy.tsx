import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";
import outsyLogo from "@/assets/outsy-logo.png";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Outsy" },
      { name: "description", content: "Outsy Privacy Policy and Data Handling Practices." },
    ],
  }),
});

function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={outsyLogo}
              alt="OutSy"
              className="h-9 w-9 rounded-full object-cover shadow-glow ring-1 ring-white/20"
            />
            <span className="font-display text-lg font-bold tracking-tight">Outsy</span>
          </Link>

          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Lock className="h-3.5 w-3.5" />
            <span>Privacy & Data Protection • Version 1.0</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: September 15, 2026 • Last updated: September 15, 2026
          </p>
        </div>

        {/* Notice Banner */}
        <div className="mb-10 rounded-2xl border border-white/10 bg-surface/60 p-4.5 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground font-semibold">Privacy Commitment:</strong> OutSy
            values your privacy. This Privacy Policy details the types of information we collect,
            how it is utilized to coordinate real-world outings, and the controls you have over your
            data.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p>
              We collect information necessary to facilitate safe, interest-aligned community
              outings:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-foreground">Account Information:</strong> Name, email
                address, and basic profile details (such as city, bio, and chosen interests).
              </li>
              <li>
                <strong className="text-foreground">Consent & Age Verification:</strong> Timestamp
                and version agreement confirming eligibility (18+) and Terms acceptance.
              </li>
              <li>
                <strong className="text-foreground">Outing & Chat Data:</strong> Information you
                provide when hosting outings, requesting to join plans, and participating in group
                chat discussions.
              </li>
              <li>
                <strong className="text-foreground">Media Uploads:</strong> Avatar images and outing
                cover photos (optimized and stored securely).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              2. How We Use Your Information
            </h2>
            <p>Your information is used strictly to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Enable you to discover, create, host, and join nearby social outings.</li>
              <li>
                Facilitate real-time messaging with accepted participants in outing group chats.
              </li>
              <li>Maintain platform integrity, prevent abuse, and uphold community standards.</li>
              <li>Deliver important service notifications and plan updates.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              3. Information Sharing & Visibility
            </h2>
            <p>
              Your public profile (name, avatar, city, bio, interests, host rating) is visible to
              other logged-in Outsy members to facilitate outing connections. Group chats are
              private and accessible only to confirmed participants of that specific outing. We do
              not sell your personal data to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Data Storage & Security</h2>
            <p>
              We implement industry-standard encryption, Row Level Security (RLS) database policies,
              and authenticated access controls. Media assets are sanitized, compressed, and stored
              in secure cloud storage buckets.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              5. Your Rights & Account Deletion
            </h2>
            <p>
              You have the right to access, update, or request deletion of your account and
              associated data at any time. When you update or remove content, orphaned media and
              associated records are safely cleaned up.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Policy Updates</h2>
            <p>
              We may revise this Privacy Policy from time to time. The latest version will always be
              accessible on this page with an updated effective date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Contact Us</h2>
            <p>
              For privacy-related inquiries or data requests, please contact us at{" "}
              <a
                href="mailto:privacy@outsy.app"
                className="font-medium text-primary hover:underline"
              >
                privacy@outsy.app
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} OutSy. All rights reserved.</p>
          <Link to="/terms" className="text-primary hover:underline">
            Terms & Conditions →
          </Link>
        </div>
      </main>
    </div>
  );
}
