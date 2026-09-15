import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Loader2, ShieldCheck, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  CURRENT_TERMS_VERSION,
  hasAcceptedCurrentTerms,
  recordTermsAcceptance,
} from "@/config/terms";
import { needsProfileSetup } from "@/features/profile/services/profileService";
import outsyLogo from "@/assets/outsy-logo.png";

export const Route = createFileRoute("/consent")({
  ssr: false,

  beforeLoad: async () => {
    // 1. User must be authenticated to consent
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }

    // 2. If user has ALREADY accepted current terms, proceed to app
    if (hasAcceptedCurrentTerms(data.user)) {
      const needs = await needsProfileSetup();
      throw redirect({ to: needs ? "/profile-setup" : "/home" });
    }
  },

  component: ConsentPage,

  head: () => ({
    meta: [
      { title: "Terms Consent — Outsy" },
      {
        name: "description",
        content: "Review and accept Outsy Terms & Conditions and Privacy Policy to continue.",
      },
    ],
  }),
});

function ConsentPage() {
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError(
        "Please confirm that you are 18 or older and agree to the Terms & Conditions and Privacy Policy.",
      );
      return;
    }

    setLoading(true);

    try {
      await recordTermsAcceptance();
      const needs = await needsProfileSetup();
      navigate({
        to: needs ? "/profile-setup" : "/home",
        replace: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record consent. Please try again.");
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="relative min-h-[100dvh] bg-background text-foreground">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-radial-primary opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(60%_50%_at_50%_30%,#000,transparent)]" />

      <div className="relative mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center px-4 sm:px-6 pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
        {/* Brand Header */}
        <Link to="/" className="mb-6 flex items-center gap-2.5">
          <img
            src={outsyLogo}
            alt="OutSy"
            className="h-10 w-10 rounded-full object-cover shadow-glow ring-1 ring-white/20"
          />
          <span className="font-display text-xl font-bold tracking-tight">Outsy</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-3xl border border-white/10 bg-surface/70 p-6 sm:p-8 shadow-card backdrop-blur-xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Action Required • Version {CURRENT_TERMS_VERSION}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Terms & Privacy Consent</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            To ensure a safe and trusted community for real-world plans, please review and accept
            our terms before continuing.
          </p>

          <form onSubmit={handleConsent} className="mt-6 flex flex-col gap-4">
            {/* Highlights Box */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Community & Safety Standards:</p>
              <ul className="list-disc pl-4 space-y-1 text-xs leading-relaxed">
                <li>You must be at least 18 years of age to participate in outings.</li>
                <li>Meetups take place in public venues with genuine members.</li>
                <li>Treat hosts and participants with mutual respect.</li>
              </ul>
            </div>

            {/* Checkbox Container */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label
                htmlFor="consent-checkbox"
                className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-3.5 cursor-pointer transition-colors hover:border-white/25"
              >
                <input
                  type="checkbox"
                  id="consent-checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked && error) {
                      setError(null);
                    }
                  }}
                  className="mt-0.5 h-5 w-5 min-w-5 shrink-0 cursor-pointer rounded border-2 border-white/40 bg-white/10 accent-[#D99A7C] transition-all hover:border-[#D99A7C] focus:ring-2 focus:ring-[#D99A7C] focus:ring-offset-2 focus:ring-offset-background"
                  aria-required="true"
                  aria-invalid={!termsAccepted && error ? "true" : "false"}
                />
                <span className="select-none text-xs sm:text-[13px] leading-relaxed text-[#F1F5F9]">
                  I confirm that I am 18 or older and agree to OutSy’s{" "}
                  <Link
                    to="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#D99A7C] underline decoration-[#D99A7C]/60 underline-offset-2 transition-colors hover:text-[#e8b59e]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#D99A7C] underline decoration-[#D99A7C]/60 underline-offset-2 transition-colors hover:text-[#e8b59e]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue to OutSy
            </button>
          </form>

          {/* Sign out fallback */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Use a different account</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
