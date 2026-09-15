import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Loader2, Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { needsProfileSetup } from "@/features/profile/services/profileService";
import { CURRENT_TERMS_VERSION, hasAcceptedCurrentTerms } from "@/config/terms";
import outsyLogo from "@/assets/outsy-logo.png";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: "signin" | "signup" } => {
    return {
      mode: search.mode === "signup" ? "signup" : "signin",
    };
  },
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — Outsy" },
      { name: "description", content: "Sign in to Outsy to explore outings near you." },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode || "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        if (!hasAcceptedCurrentTerms(data.session.user)) {
          navigate({ to: "/consent", replace: true });
          return;
        }
        const needs = await needsProfileSetup();
        navigate({ to: needs ? "/profile-setup" : "/home", replace: true });
      }
    });
  }, [navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!termsAccepted) {
        setError(
          "Please confirm that you are 18 or older and agree to the Terms & Conditions and Privacy Policy.",
        );
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/explore`,
            data: {
              full_name: name || email.split("@")[0],
              terms_accepted_at: new Date().toISOString(),
              terms_version: CURRENT_TERMS_VERSION,
            },
          },
        });

        if (error) throw error;

        alert("Account created successfully. Please verify your email before signing in.");

        setMode("signin");
        setPassword("");
        setConfirmPassword("");
        setTermsAccepted(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user && !hasAcceptedCurrentTerms(userData.user)) {
        navigate({ to: "/consent", replace: true });
        return;
      }

      const needs = await needsProfileSetup();
      navigate({
        to: needs ? "/profile-setup" : "/home",
        replace: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);

    if (mode === "signup" && !termsAccepted) {
      setError(
        "Please confirm that you are 18 or older and agree to the Terms & Conditions and Privacy Policy.",
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign in failed");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-radial-primary opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(60%_50%_at_50%_30%,#000,transparent)]" />
      <div className="relative mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center px-4 sm:px-6 pt-[calc(2rem+env(safe-area-inset-top,0px))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
        <Link to="/" className="mb-8 flex items-center gap-2.5">
          <img
            src={outsyLogo}
            alt="Outsy"
            className="h-10 w-10 rounded-full object-cover shadow-glow ring-1 ring-white/20"
          />
          <span className="font-display text-xl font-bold tracking-tight">Outsy</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-3xl border border-white/10 bg-surface/60 p-8 shadow-card backdrop-blur-xl"
        >
          {/* Segmented Tab Switcher */}
          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-white/5 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setConfirmPassword("");
                setTermsAccepted(false);
              }}
              className={`rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-primary text-primary-foreground shadow-md font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setConfirmPassword("");
                setTermsAccepted(false);
              }}
              className={`rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-primary text-primary-foreground shadow-md font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to discover outings happening near you."
              : "Join Outsy to find companions for your next plan."}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-60 cursor-pointer"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-white/10" />
            or with email
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleEmail} className="flex flex-col gap-3">
            {mode === "signup" && (
              <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </label>
            )}
            <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Password (min 6 characters)" : "Password (min 6)"}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            {mode === "signup" && (
              <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </label>
            )}

            {/* Terms & Privacy Consent Checkbox (Signup only) */}
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5 pt-2">
                <label
                  htmlFor="terms-consent"
                  className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-3.5 cursor-pointer transition-colors hover:border-white/25"
                >
                  <input
                    type="checkbox"
                    id="terms-consent"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (e.target.checked && error?.includes("Terms & Conditions")) {
                        setError(null);
                      }
                    }}
                    className="mt-0.5 h-5 w-5 min-w-5 shrink-0 cursor-pointer rounded border-2 border-white/40 bg-white/10 accent-[#D99A7C] transition-all hover:border-[#D99A7C] focus:ring-2 focus:ring-[#D99A7C] focus:ring-offset-2 focus:ring-offset-background"
                    aria-required="true"
                    aria-invalid={
                      !termsAccepted && error?.includes("Terms & Conditions") ? "true" : "false"
                    }
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
            )}

            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New to Outsy?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setConfirmPassword("");
                setTermsAccepted(false);
              }}
              className="font-medium text-primary hover:underline cursor-pointer"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.3 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.3 29.4 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.4 34.9 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.3 5.2C41 34.9 44 30 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
