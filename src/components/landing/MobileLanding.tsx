import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import { useTheme } from "@/hooks/use-theme";
import { getExploreOutings } from "@/features/explore/services/exploreService";
import heroIllustration from "@/assets/hero-night-friends.jpg";
import {
  Compass,
  ArrowRight,
  Plus,
  Sun,
  Moon,
  MapPin,
  Calendar,
  Sparkles,
  Users,
  ShieldCheck,
  Star,
  CheckCircle2,
  Coffee,
  Film,
  Trophy,
  Mountain,
  Utensils,
  Car,
  Music,
  Gamepad2,
  Home,
  MessageSquare,
  User,
} from "lucide-react";

const VIBE_CATEGORIES = [
  { label: "All Vibes", icon: Sparkles, query: "" },
  { label: "Cafés & Coffee", icon: Coffee, query: "cafe" },
  { label: "Cinema & Shows", icon: Film, query: "cinema" },
  { label: "Turf & Sports", icon: Trophy, query: "sports" },
  { label: "Treks & Hikes", icon: Mountain, query: "adventure" },
  { label: "Food & Dining", icon: Utensils, query: "food" },
  { label: "Roadtrips", icon: Car, query: "travel" },
  { label: "Art & Music", icon: Music, query: "music" },
  { label: "Board Games", icon: Gamepad2, query: "games" },
];

const CURATED_FALLBACK_OUTINGS = [
  {
    id: "sample-1",
    title: "Sunset Coffee & Design Jam",
    category: "Café",
    location: "Third Wave Coffee, Koramangala",
    date: "Today • 6:30 PM",
    participants: 4,
    maxParticipants: 6,
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "sample-2",
    title: "Late Night IMAX Dune: Part Two",
    category: "Cinema",
    location: "PVR Superplex, BKC",
    date: "Tomorrow • 9:45 PM",
    participants: 6,
    maxParticipants: 8,
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "sample-3",
    title: "Sunday 7v7 Box Cricket",
    category: "Sports",
    location: "Dribble Turf, Indiranagar",
    date: "Sunday • 7:00 AM",
    participants: 10,
    maxParticipants: 14,
    image:
      "https://images.unsplash.com/photo-1531415074868-036b1c5f53ec?w=800&auto=format&fit=crop&q=80",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "sample-4",
    title: "Weekend Sunrise Trek to Nandi Hills",
    category: "Adventure",
    location: "Nandi Base, Bangalore",
    date: "Saturday • 5:00 AM",
    participants: 5,
    maxParticipants: 8,
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },
];

export function MobileLanding() {
  const { user, loading: sessionLoading } = useSession();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [selectedVibe, setSelectedVibe] = useState("");

  const { data: realOutings = [], isLoading: outingsLoading } = useQuery({
    queryKey: ["explore-outings"],
    queryFn: getExploreOutings,
    staleTime: 1000 * 60 * 2,
  });

  const displayOutings = realOutings.length > 0 ? realOutings : CURATED_FALLBACK_OUTINGS;

  const handleOutingClick = (id: string) => {
    if (id.startsWith("sample-")) {
      navigate({ to: user ? "/explore" : "/auth" });
    } else {
      navigate({ to: "/outing/$id", params: { id } });
    }
  };

  const handleVibeClick = (vibeQuery: string) => {
    setSelectedVibe(vibeQuery);
    navigate({ to: user ? "/explore" : "/auth" });
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#000000] text-[#F5F5F5] flex flex-col justify-between pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]">
      {/* ─── 1. MOBILE TOP BRAND BAR ────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#000000]/80 backdrop-blur-xl pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2.5 px-4">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <Link to="/" className="flex items-center gap-2 active:scale-95 transition-transform">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#D99A7C] to-[#A97065] shadow-lg shadow-[#D99A7C]/20">
              <Compass className="h-4 w-4 text-[#0F3040] stroke-[2.5]" />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight text-[#F5F5F5]">
              OutSy
            </span>
          </Link>

          {/* Live indicator badge */}
          <div className="hidden xs:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live in your city</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-[#CBD5E1] hover:text-[#F5F5F5] active:scale-90 transition cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </button>

            {!sessionLoading &&
              (user ? (
                <button
                  type="button"
                  onClick={() => navigate({ to: "/explore" })}
                  className="rounded-full bg-[#D99A7C] px-3.5 py-1.5 text-xs font-bold text-[#0F3040] shadow-md shadow-[#D99A7C]/20 active:scale-95 transition cursor-pointer"
                >
                  Explore
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate({ to: "/auth" })}
                  className="rounded-full bg-[#D99A7C] px-3.5 py-1.5 text-xs font-bold text-[#0F3040] shadow-md shadow-[#D99A7C]/20 active:scale-95 transition cursor-pointer"
                >
                  Sign In
                </button>
              ))}
          </div>
        </div>
      </header>

      {/* ─── 2. IMMERSIVE MOBILE HERO (Near Full Viewport) ─────────────── */}
      <section className="relative w-full overflow-hidden px-4 pt-4 pb-6 max-w-md mx-auto">
        <div className="relative min-h-[460px] xs:min-h-[500px] w-full rounded-[28px] overflow-hidden border border-white/10 bg-[#0F3040] shadow-2xl flex flex-col justify-between p-5 sm:p-6">
          {/* Background image with cinematic dark vignette overlays */}
          <img
            src={heroIllustration}
            alt="Friends laughing and enjoying an outing together"
            className="absolute inset-0 h-full w-full object-cover object-center filter brightness-[0.7] contrast-[1.05]"
            loading="eager"
          />

          {/* Cinematic Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#0F3040]/70 to-[#000000]/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,154,124,0.3)_0%,transparent_60%)]" />

          {/* Top Layer in Hero Card */}
          <div className="relative z-10 flex items-start justify-between gap-2">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-[#D99A7C] shadow-sm"
            >
              <Sparkles className="h-3 w-3" />
              <span>Activity-First Social</span>
            </motion.div>

            {/* Floating Location Tag */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-white/90 shadow-sm"
            >
              <MapPin className="h-3 w-3 text-[#D99A7C]" />
              <span>Nearby Plans</span>
            </motion.div>
          </div>

          {/* Middle Floating Live Social Indicator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative z-10 self-end max-w-[210px] rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md p-2.5 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                  alt="Attendee avatar"
                  className="h-6 w-6 rounded-full object-cover border border-[#0F3040]"
                />
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80"
                  alt="Attendee avatar"
                  className="h-6 w-6 rounded-full object-cover border border-[#0F3040]"
                />
                <div className="grid h-6 w-6 place-items-center rounded-full bg-[#D99A7C] text-[9px] font-bold text-[#0F3040] border border-[#0F3040]">
                  +6
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#F5F5F5] truncate">Café & Chai Run</p>
                <p className="text-[9px] text-emerald-400 font-medium">8 people joined</p>
              </div>
            </div>
          </motion.div>

          {/* Bottom Hero Content & CTAs */}
          <div className="relative z-10 space-y-4 pt-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-1.5"
            >
              <h1 className="text-[32px] xs:text-[36px] font-extrabold tracking-tight leading-[1.08] text-white">
                Never <span className="bg-gradient-to-r from-[#D99A7C] via-[#E2A88D] to-[#F5E8E2] bg-clip-text text-transparent">Cancel Plans</span>
                <br /> Again.
              </h1>
              <p className="text-xs xs:text-sm text-white/80 leading-snug max-w-xs font-normal">
                Find people nearby who want to do the exact same thing right now.
              </p>
            </motion.div>

            {/* Dominant Hero CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col gap-2.5 pt-1"
            >
              <button
                type="button"
                onClick={() => navigate({ to: user ? "/explore" : "/auth" })}
                className="group w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D99A7C] to-[#C88465] min-h-[50px] px-6 text-[15px] font-bold text-[#0F3040] shadow-xl shadow-[#D99A7C]/25 active:scale-[0.98] transition-all cursor-pointer"
                aria-label="Explore Outings"
              >
                <span>Explore Outings</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => navigate({ to: user ? "/create" : "/auth" })}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/15 backdrop-blur-md min-h-[46px] px-6 text-sm font-semibold text-white active:scale-[0.98] transition-all cursor-pointer"
                aria-label="Create an Outing"
              >
                <Plus className="h-4 w-4 text-[#D99A7C]" />
                <span>Create an Outing</span>
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 3. VIBE / CATEGORY SELECTOR SLIDER ───────────────────────── */}
      <section className="w-full py-2 max-w-md mx-auto">
        <div className="px-4 mb-2 flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider uppercase text-[#CBD5E1]/70">
            Choose Your Vibe
          </span>
          <span className="text-[11px] text-[#D99A7C] font-semibold">Tap to filter</span>
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar snap-x">
          {VIBE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedVibe === cat.query;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => handleVibeClick(cat.query)}
                className={`snap-start flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#D99A7C] text-[#0F3040] shadow-md shadow-[#D99A7C]/20"
                    : "border border-white/10 bg-[#0F3040]/70 text-[#F5F5F5] hover:border-white/20 active:scale-95"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${isSelected ? "text-[#0F3040]" : "text-[#D99A7C]"}`}
                />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── 4. LIVE DISCOVERY SECTION: SWIPEABLE CAROUSEL ─────────────── */}
      <section className="w-full py-4 max-w-md mx-auto space-y-3">
        <div className="px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-base font-extrabold tracking-tight text-[#F5F5F5]">
              Happening Near You
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate({ to: user ? "/explore" : "/auth" })}
            className="text-xs font-semibold text-[#D99A7C] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>See all</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Horizontal Swipeable Cards */}
        <div className="flex gap-3.5 overflow-x-auto px-4 pb-3 no-scrollbar snap-x snap-mandatory">
          {displayOutings.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              onClick={() => handleOutingClick(item.id)}
              className="snap-start shrink-0 w-[260px] xs:w-[280px] rounded-2xl border border-white/10 bg-[#0F3040] overflow-hidden shadow-xl hover:border-[#D99A7C]/50 transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between group"
            >
              {/* Card Image with Floating Category & Avatar Chips */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F3040] via-transparent to-black/40" />

                {/* Floating Category Pill */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    {item.category || "Outing"}
                  </span>
                </div>

                {/* Floating Social Attendees Stack */}
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    <Users className="h-3 w-3" />
                    <span>{item.participants || 3} going</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 space-y-1.5">
                <h3 className="text-sm font-bold text-[#F5F5F5] leading-snug line-clamp-1 group-hover:text-[#D99A7C] transition-colors">
                  {item.title}
                </h3>

                <div className="flex items-center gap-1.5 text-[11px] text-[#D99A7C]">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-[#CBD5E1]">
                  <Calendar className="h-3 w-3 shrink-0 text-white/50" />
                  <span className="truncate">{item.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── 5. "THE OUTSY WAY" VISUAL MICRO-STORY TILES ───────────────── */}
      <section className="px-4 py-4 max-w-md mx-auto w-full space-y-3">
        <div className="text-center space-y-1">
          <h2 className="text-base font-extrabold tracking-tight text-[#F5F5F5]">
            How OutSy Works
          </h2>
          <p className="text-xs text-[#CBD5E1]/80">From idea to real-world memory in 3 taps.</p>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {/* Step 1 */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-[#0F3040]/80 p-3.5 backdrop-blur-sm shadow-md">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#D99A7C]/20 border border-[#D99A7C]/30 text-[#D99A7C]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#F5F5F5]">1. Pick a Plan</h3>
                <span className="text-[10px] font-bold text-[#D99A7C]">01</span>
              </div>
              <p className="text-[11px] text-[#CBD5E1] mt-0.5 leading-snug">
                Movie, turf cricket, café brunch, or weekend trek.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-[#0F3040]/80 p-3.5 backdrop-blur-sm shadow-md">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#D99A7C]/20 border border-[#D99A7C]/30 text-[#D99A7C]">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#F5F5F5]">2. Match Your Crowd</h3>
                <span className="text-[10px] font-bold text-[#D99A7C]">02</span>
              </div>
              <p className="text-[11px] text-[#CBD5E1] mt-0.5 leading-snug">
                Verified people nearby request to join your plan.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-[#0F3040]/80 p-3.5 backdrop-blur-sm shadow-md">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#D99A7C]/20 border border-[#D99A7C]/30 text-[#D99A7C]">
              <Compass className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#F5F5F5]">3. Show Up & Go</h3>
                <span className="text-[10px] font-bold text-[#D99A7C]">03</span>
              </div>
              <p className="text-[11px] text-[#CBD5E1] mt-0.5 leading-snug">
                Coordinate inside group chat and meet at public venues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. TRUST & SAFETY MICRO-STRIP ────────────────────────────── */}
      <section className="px-4 py-3 max-w-md mx-auto w-full">
        <div className="rounded-2xl border border-white/10 bg-[#0F3040]/50 p-3.5 text-center space-y-2">
          <div className="flex items-center justify-center gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          <p className="text-xs font-bold text-[#F5F5F5]">Loved by 12,000+ early explorers</p>

          <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-[#CBD5E1]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-[#D99A7C]" /> 100% Free
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" /> Verified Members
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#D99A7C]" /> Public Meetups
            </span>
          </div>
        </div>
      </section>

      {/* ─── 7. FINAL HIGH-CONVERSION CTA ──────────────────────────────── */}
      <section className="px-4 pt-2 pb-6 max-w-md mx-auto w-full">
        <div className="relative rounded-3xl border border-[#D99A7C]/40 bg-gradient-to-br from-[#0F3040] via-[#0F3040]/90 to-[#000000] p-6 text-center shadow-2xl overflow-hidden space-y-3">
          <div className="absolute top-0 right-0 h-32 w-32 bg-[#D99A7C]/15 rounded-full blur-2xl" />
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Never Cancel Plans Again.
          </h3>
          <p className="text-xs text-[#CBD5E1] max-w-xs mx-auto">
            Trade the endless feed for real-world stories with great people.
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: user ? "/explore" : "/auth" })}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#D99A7C] hover:bg-[#D99A7C]/90 min-h-[48px] px-6 text-sm font-bold text-[#0F3040] shadow-lg shadow-[#D99A7C]/20 active:scale-[0.98] transition cursor-pointer"
          >
            <span>Get Started with OutSy</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ─── 8. NATIVE MOBILE BOTTOM NAVIGATION BAR ────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#000000]/90 backdrop-blur-2xl pb-[env(safe-area-inset-bottom,0px)] shadow-2xl">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-3">
          {/* Home */}
          <Link
            to="/"
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] gap-1 text-[#D99A7C] active:scale-95 transition"
            aria-label="Home"
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-bold">Home</span>
          </Link>

          {/* Explore */}
          <button
            type="button"
            onClick={() => navigate({ to: user ? "/explore" : "/auth" })}
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] gap-1 text-[#CBD5E1] hover:text-white active:scale-95 transition cursor-pointer"
            aria-label="Explore"
          >
            <Compass className="h-5 w-5" />
            <span className="text-[10px] font-medium">Explore</span>
          </button>

          {/* Elevated Create Button */}
          <button
            type="button"
            onClick={() => navigate({ to: user ? "/create" : "/auth" })}
            className="group relative -translate-y-3 flex items-center justify-center cursor-pointer active:scale-95 transition"
            aria-label="Create Outing"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D99A7C] text-[#0F3040] shadow-lg shadow-[#D99A7C]/35 group-hover:scale-105 transition-transform">
              <Plus className="h-6 w-6 stroke-[3]" />
            </div>
          </button>

          {/* Chats */}
          <button
            type="button"
            onClick={() => navigate({ to: user ? "/chats" : "/auth" })}
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] gap-1 text-[#CBD5E1] hover:text-white active:scale-95 transition cursor-pointer"
            aria-label="Chats"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-[10px] font-medium">Chats</span>
          </button>

          {/* Profile */}
          <button
            type="button"
            onClick={() => navigate({ to: user ? "/profile" : "/auth" })}
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] gap-1 text-[#CBD5E1] hover:text-white active:scale-95 transition cursor-pointer"
            aria-label="Profile"
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
