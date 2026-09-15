import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import outsyLogo from "@/assets/outsy-logo.png";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Outsy" },
      { name: "description", content: "Outsy Terms and Conditions and User Agreement." },
    ],
  }),
});

function TermsPage() {
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
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Legal Documentation • Version 1.0</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms & Conditions</h1>
          <p className="text-sm text-muted-foreground">
            Effective Date: September 15, 2026 • Last updated: September 15, 2026
          </p>
        </div>

        {/* Notice Banner */}
        <div className="mb-10 rounded-2xl border border-white/10 bg-surface/60 p-4.5 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground font-semibold">Notice:</strong> This document
            outlines the terms and conditions for using OutSy (&quot;Outsy&quot;). By creating an
            account or using the platform, you agree to comply with and be bound by these terms.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              1. Eligibility & Age Requirement
            </h2>
            <p>
              You must be at least 18 years of age to create an account, host outings, or
              participate in meetups organized through Outsy. By registering, you confirm and
              warrant that you are 18 years old or older and possess the legal capacity to enter
              into these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              2. Account Registration & Security
            </h2>
            <p>
              When creating an account, you agree to provide accurate, current, and complete
              information. You are responsible for safeguarding your credentials and for all
              activities that occur under your account. Notify Outsy immediately of any unauthorized
              access.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              3. Real-World Meetups & Community Safety
            </h2>
            <p>
              Outsy is an activity-first platform enabling users to discover and coordinate offline
              outings with other community members. While we promote safe meetup practices:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Always meet in well-lit, public locations.</li>
              <li>
                Exercise personal caution and sound judgment when interacting with new
                acquaintances.
              </li>
              <li>
                Outsy does not conduct background checks on all participants unless explicitly
                verified.
              </li>
              <li>Each participant participates in outings at their own voluntary risk.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              4. User Conduct & Prohibited Activities
            </h2>
            <p>
              You agree not to engage in harassment, hate speech, unlawful conduct, impersonation,
              commercial spamming, or any behavior that compromises member safety or platform
              integrity. Violation of community standards may result in immediate suspension or
              termination of your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Outsy and its creators shall not be
              liable for any indirect, incidental, special, or consequential damages resulting from
              user interactions, meetups, or platform availability.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Changes to Terms</h2>
            <p>
              We may update these Terms periodically (tracked by version identifier, e.g., v1.0). If
              substantive changes occur, you may be prompted to review and accept the revised terms
              upon accessing the application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Contact Information</h2>
            <p>
              If you have any questions or feedback regarding these Terms, please reach out to us at{" "}
              <a
                href="mailto:support@outsy.app"
                className="font-medium text-primary hover:underline"
              >
                support@outsy.app
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} OutSy. All rights reserved.</p>
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy →
          </Link>
        </div>
      </main>
    </div>
  );
}
