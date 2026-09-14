import { Link, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { useTheme } from "@/hooks/use-theme";
import {
  Compass,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  Sun,
  Moon,
  Star,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export function MobileLanding() {
  const { user, loading } = useSession();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-background text-foreground flex flex-col justify-between">
      {/* 1. COMPACT MOBILE HEADER with Safe Area Support */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/90 backdrop-blur-md pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2.5 px-4 sm:px-6">
        <div className="mx-auto flex w-full items-center justify-between">
          <Link to="/" className="flex items-center gap-2 active:scale-95 transition-transform">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-glow">
              <Compass className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              Outsy
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-muted-foreground hover:text-foreground active:scale-90 transition cursor-pointer"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {!loading && (
              user ? (
                <Link
                  to="/explore"
                  className="rounded-full bg-primary/20 border border-primary/40 px-3.5 py-1.5 text-xs font-bold text-primary active:scale-95 transition"
                >
                  Explore
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-glow active:scale-95 transition"
                >
                  Sign In
                </Link>
              )
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN MOBILE CONTENT */}
      <main className="flex-1 px-4 sm:px-6 pt-5 pb-8 space-y-6 max-w-md mx-auto w-full">
        {/* HERO SECTION */}
        <section className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            <span>Activity-first · Not a dating app</span>
          </div>

          <h1 className="text-3xl xs:text-4xl font-extrabold tracking-tight leading-[1.12] text-foreground">
            Never <span className="text-primary">Cancel Plans</span> Again.
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Find people who are into the same things and make plans together.
          </p>
        </section>

        {/* 3. COMPACT SOCIAL DISCOVERY VISUAL CARD */}
        <div className="relative rounded-2xl border border-white/10 bg-surface/70 backdrop-blur-md p-3.5 shadow-card overflow-hidden">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Happening Nearby
              </span>
              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Live Tribe
              </span>
            </div>

            {/* Outing preview item 1 */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-background/60 p-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/15 text-sm shrink-0">
                  🎬
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">Dune: Part Two · Tonight</p>
                  <p className="text-[10px] text-muted-foreground">PVR Inox • 4 going</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Joined
              </span>
            </div>

            {/* Outing preview item 2 */}
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-background/60 p-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-sm shrink-0">
                  ☕
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">Filter Coffee & Tech Talk</p>
                  <p className="text-[10px] text-muted-foreground">Third Wave • 2 spots left</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-primary shrink-0 bg-primary/10 px-2 py-0.5 rounded-full">
                Open
              </span>
            </div>
          </div>
        </div>

        {/* 4. PRIMARY & SECONDARY CTAs */}
        <section className="space-y-2.5 pt-1">
          {user ? (
            <>
              <button
                type="button"
                onClick={() => navigate({ to: "/explore" })}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-glow min-h-[48px] px-6 text-sm sm:text-base font-bold text-primary-foreground shadow-glow active:scale-[0.98] transition-all cursor-pointer"
                aria-label="Explore Outings"
              >
                <span>Explore Outings</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate({ to: "/create" })}
                className="w-full flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 min-h-[48px] px-6 text-sm sm:text-base font-semibold text-foreground active:scale-[0.98] transition-all cursor-pointer"
                aria-label="Create Outing"
              >
                <Plus className="h-4 w-4" />
                <span>Create an Outing</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate({ to: "/auth" })}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-glow min-h-[48px] px-6 text-sm sm:text-base font-bold text-primary-foreground shadow-glow active:scale-[0.98] transition-all cursor-pointer"
                aria-label="Find Your People"
              >
                <span>Find Your People</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate({ to: "/create" })}
                className="w-full flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 min-h-[48px] px-6 text-sm sm:text-base font-semibold text-foreground active:scale-[0.98] transition-all cursor-pointer"
                aria-label="Create an Outing"
              >
                <Plus className="h-4 w-4" />
                <span>Create an Outing</span>
              </button>
            </>
          )}

          {/* Micro trust indicator */}
          <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-primary" /> Free forever
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" /> Verified members
            </span>
          </div>
        </section>

        {/* 5. 3 KEY BENEFITS SECTION */}
        <section className="pt-2 space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
            How Outsy Works
          </h2>

          <div className="space-y-2">
            {/* Benefit 1: Discover */}
            <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-surface/50 p-3.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary shrink-0">
                <Compass className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-foreground">Discover</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                  Find outings and activities around you.
                </p>
              </div>
            </div>

            {/* Benefit 2: Meet */}
            <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-surface/50 p-3.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/15 text-violet-400 shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-foreground">Meet</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                  Connect with people who share your interests.
                </p>
              </div>
            </div>

            {/* Benefit 3: Plan */}
            <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-surface/50 p-3.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-foreground">Plan</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                  Create outings and bring your group together.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. SOCIAL PROOF */}
        <section className="rounded-2xl border border-white/5 bg-surface/30 p-3.5 text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          <p className="text-xs font-semibold text-foreground">Loved by 12,000+ early users</p>
          <p className="text-[11px] text-muted-foreground">Trade the scroll for real-world stories.</p>
        </section>
      </main>

      {/* 7. COMPACT MOBILE FOOTER with Safe Area */}
      <footer className="w-full border-t border-white/5 bg-surface/30 py-4 px-4 text-center text-[11px] text-muted-foreground pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <p>© {new Date().getFullYear()} Outsy Labs. Never cancel plans again.</p>
      </footer>
    </div>
  );
}
