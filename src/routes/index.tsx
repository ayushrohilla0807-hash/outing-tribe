import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Sparkles,
  Users,
  MapPin,
  MessageCircle,
  Shield,
  Bell,
  Star,
  Sun,
  Moon,
  CheckCircle2,
  X,
  Compass,
  Heart,
  BadgeCheck,
  Lock,
  Film,
  Trophy,
  Calendar,
  Sparkle,
  Menu,
  Twitter,
  Instagram,
  Github,
  Send,
} from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-illustration.jpg";
import { useTheme } from "@/hooks/use-theme";
import { PhoneMockup } from "@/components/landing/PhoneMockup";
import {
  MockHome,
  MockCreate,
  MockProfile,
  MockChat,
  MockExplore,
} from "@/components/landing/mockups";


export const Route = createFileRoute("/")({
  component: Landing,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative mx-auto max-w-7xl px-6 py-24 sm:py-32 ${className}`}>
      {(eyebrow || title || subtitle) && (
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkle className="h-3 w-3 text-primary" /> {eyebrow}
            </span>
          )}
          {title && (
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h2>
          )}
          {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
        </motion.div>
      )}
      {children}
    </section>
  );
}

function Nav() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#how", label: "How it works" },
    { href: "#features", label: "Features" },
    { href: "#safety", label: "Safety" },
    { href: "#faq", label: "FAQ" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <a href="#" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-glow">
            <Compass className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Outsy</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a
            href="#cta"
            className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 sm:inline-block"
          >
            Get the app
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/5 bg-background/95 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="pointer-events-none absolute inset-0 bg-radial-primary" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(60%_50%_at_50%_30%,#000,transparent)]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> Activity-first · Not a dating app
          </span>
          <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Never <span className="gradient-text">Cancel Plans</span>
            <br /> Again.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Find people nearby who already want to do the same activity as you. Movies, cafés,
            cricket, trips — real plans with real people.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#cta"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
            >
              Explore Outings
            </a>
          </div>
          <div className="mt-10 flex items-center gap-6">
            <div className="flex -space-x-2">
              {["🧑‍🎤", "👩‍💻", "🧑‍🎨", "👨‍🚀"].map((e) => (
                <div
                  key={e}
                  className="grid h-9 w-9 place-items-center rounded-full border-2 border-background bg-surface-elevated text-sm"
                >
                  {e}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground">Loved by 12,000+ early users</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/40 via-primary-glow/20 to-transparent blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-card">
            <img
              src={heroImage}
              alt="Group of young friends laughing together while planning an outing"
              width={1280}
              height={1024}
              className="h-auto w-full"
            />
          </div>
          {/* floating cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass absolute -left-4 top-10 hidden rounded-2xl p-3 shadow-card sm:block"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/25 text-primary">
                <Film className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Dune 3 · Tonight</p>
                <p className="text-xs text-muted-foreground">6 people joined</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="glass absolute -right-4 bottom-10 hidden rounded-2xl p-3 shadow-card sm:block"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Sunday Cricket</p>
                <p className="text-xs text-muted-foreground">2 spots left</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Problem() {
  const problems = [
    { icon: Users, title: "Friends are busy", body: "Everyone's schedules never seem to line up." },
    { icon: Heart, title: "Going alone feels off", body: "Some plans just need company to enjoy." },
    { icon: X, title: "Plans get cancelled", body: "Last-minute drops leave you stuck at home." },
    { icon: MapPin, title: "New in the city", body: "Hard to meet people who share your interests." },
  ];
  return (
    <Section
      id="problem"
      eyebrow="The problem"
      title="Great plans die in group chats."
      subtitle="Outsy exists so you never have to skip the movie, the café run, or the Sunday match again."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {problems.map((p, i) => (
          <motion.div
            key={p.title}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ delay: i * 0.08 }}
            className="group relative rounded-3xl border border-white/10 bg-surface p-6 transition-transform hover:-translate-y-1"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
              <p.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <div className="glass inline-flex items-center gap-3 rounded-full px-5 py-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Outsy fixes this in under 30 seconds.</span>
        </div>
      </div>
    </Section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Sparkles,
      title: "Create an outing",
      body: "Pick an activity — movie, café, cricket, trip — and set a time.",
      accent: "from-fuchsia-500/25 to-purple-500/5",
    },
    {
      icon: Compass,
      title: "Match nearby",
      body: "We surface it to people close by who share your interests.",
      accent: "from-violet-500/25 to-indigo-500/5",
    },
    {
      icon: BadgeCheck,
      title: "Approve requests",
      body: "Verified profiles ask to join. Accept the vibes you want.",
      accent: "from-purple-500/25 to-pink-500/5",
    },
    {
      icon: MessageCircle,
      title: "Chat and go",
      body: "Coordinate inside Outsy, meet in public, and have a great time.",
      accent: "from-pink-500/25 to-rose-500/5",
    },
  ];
  return (
    <Section
      id="how"
      eyebrow="How it works"
      title="From idea to outing in four taps."
      subtitle="Designed for spontaneity — no group polls, no long threads."
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ delay: i * 0.1 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface p-6"
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.accent}`} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="font-display text-4xl font-bold text-white/10">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function Features() {
  const features = [
    { icon: Sparkles, title: "Create outings", body: "One tap to publish. Sensible defaults." },
    { icon: Compass, title: "Discover nearby", body: "Map + feed with what's happening around you." },
    { icon: Heart, title: "Interest-based matches", body: "See outings that actually fit you." },
    { icon: Users, title: "Join requests", body: "Approve who joins with a single swipe." },
    { icon: MessageCircle, title: "In-app chat", body: "Group threads scoped to the outing." },
    { icon: BadgeCheck, title: "Profile verification", body: "Verified badges you can trust." },
    { icon: Shield, title: "Safe meetup system", body: "Public places, share ETA, quick report." },
    { icon: Bell, title: "Smart notifications", body: "Nudges that don't spam. Actually useful." },
    { icon: Star, title: "Ratings & reviews", body: "Community-driven reputation." },
    { icon: Sun, title: "Dark & light mode", body: "Pixel-perfect either way. Try the toggle." },
  ];
  return (
    <Section
      id="features"
      eyebrow="Features"
      title="Everything you need. Nothing you don't."
      subtitle="Built for real-world plans, not endless scrolling."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ delay: (i % 3) * 0.06 }}
            className="group rounded-3xl border border-white/10 bg-surface p-6 transition hover:border-primary/40 hover:bg-surface-elevated"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function AppPreview() {
  const screens = [
    { title: "Home Feed", node: <MockHome /> },
    { title: "Create", node: <MockCreate /> },
    { title: "Profile", node: <MockProfile /> },
    { title: "Chat", node: <MockChat /> },
    { title: "Explore", node: <MockExplore /> },
  ];
  return (
    <Section
      id="app"
      eyebrow="Inside the app"
      title="Beautifully crafted. Genuinely fast."
      subtitle="A Flutter-native app that feels at home on both iOS and Android."
    >
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-64 max-w-4xl rounded-full bg-primary/25 blur-3xl" />
        <div className="flex snap-x snap-mandatory gap-8 overflow-x-auto pb-8 md:justify-center md:overflow-visible">
          {screens.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 40, rotate: i % 2 === 0 ? -2 : 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -2 : 2 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="snap-center shrink-0"
            >
              <PhoneMockup label={s.title}>{s.node}</PhoneMockup>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Safety() {
  const items = [
    { icon: BadgeCheck, title: "Email verified" },
    { icon: Lock, title: "Phone verify (soon)" },
    { icon: Shield, title: "Community reporting" },
    { icon: X, title: "Instant block" },
    { icon: MessageCircle, title: "Private chat" },
    { icon: MapPin, title: "Public meetups" },
  ];
  return (
    <Section
      id="safety"
      eyebrow="Safety & Trust"
      title="Built with safety at the core."
      subtitle="Every outing recommendation defaults to public places. Every profile earns trust."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-surface p-5 text-center"
          >
            <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
              <it.icon className="h-5 w-5" />
              <span className="absolute inset-0 rounded-2xl animate-pulse-ring" />
            </div>
            <p className="text-sm font-semibold">{it.title}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function Compare() {
  const rows = [
    { label: "Focus", outsy: "Real-life activities", other: "Endless feed scrolling" },
    { label: "Intent", outsy: "Do things together", other: "Passive consumption" },
    { label: "Discovery", outsy: "Nearby, right now", other: "Global timeline noise" },
    { label: "Safety", outsy: "Verified, public meetups", other: "Anonymous strangers" },
    { label: "Outcome", outsy: "Memories with people", other: "Hours you can't get back" },
  ];
  return (
    <Section
      id="why"
      eyebrow="Why Outsy"
      title="Trade the scroll for the story."
      subtitle="Outsy is designed for real experiences, not another feed."
    >
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-surface">
        <div className="grid grid-cols-3 border-b border-white/10 bg-white/5 text-sm font-semibold">
          <div className="p-4 text-muted-foreground">Compare</div>
          <div className="flex items-center gap-2 p-4">
            <div className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-primary to-primary-glow">
              <Compass className="h-3 w-3 text-white" />
            </div>
            Outsy
          </div>
          <div className="p-4 text-muted-foreground">Traditional social apps</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={`grid grid-cols-3 items-center text-sm ${
              i % 2 ? "bg-white/[0.02]" : ""
            }`}
          >
            <div className="p-4 text-muted-foreground">{r.label}</div>
            <div className="flex items-center gap-2 p-4">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="font-medium">{r.outsy}</span>
            </div>
            <div className="flex items-center gap-2 p-4 text-muted-foreground">
              <X className="h-4 w-4 opacity-60" />
              {r.other}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Testimonials() {
  const quotes = [
    {
      name: "Meera K.",
      role: "College student, Bengaluru",
      quote:
        "Found 3 people to watch Dune with in under 10 minutes. I would've stayed home otherwise.",
      emoji: "🎬",
    },
    {
      name: "Rohan S.",
      role: "Working professional",
      quote:
        "My whole team travels. Outsy got me into a Sunday cricket game with people from my building.",
      emoji: "🏏",
    },
    {
      name: "Ananya P.",
      role: "Solo traveler",
      quote:
        "I'm new to Mumbai. Outsy became my way of making actual friends, not just followers.",
      emoji: "✈️",
    },
  ];
  return (
    <Section
      eyebrow="Loved by early users"
      title="Real people. Real plans. Real happy."
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {quotes.map((q, i) => (
          <motion.div
            key={q.name}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ delay: i * 0.08 }}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-surface to-surface-elevated p-6"
          >
            <div className="flex items-center gap-1 text-yellow-400">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-4 text-base leading-relaxed">"{q.quote}"</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-lg">
                {q.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold">{q.name}</p>
                <p className="text-xs text-muted-foreground">{q.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Is this a dating app?",
      a: "No. Outsy is activity-first. You connect because you want to do the same thing at the same time — movies, sports, cafés, trips.",
    },
    {
      q: "Is it safe?",
      a: "Every outing defaults to public places, profiles are verified, and you can report or block anyone instantly. Phone verification is coming soon.",
    },
    { q: "Is it free?", a: "Yes. Creating and joining outings is free. Premium features will be optional." },
    {
      q: "How do I join an outing?",
      a: "Tap join on any outing. The host reviews your profile and accepts. You'll get a private chat with everyone attending.",
    },
    {
      q: "Can I create my own outing?",
      a: "Absolutely. Pick an activity, add a time and place, publish. People nearby will see it in seconds.",
    },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section id="faq" eyebrow="FAQ" title="Everything you were going to ask.">
      <div className="mx-auto max-w-3xl divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-surface">
        {faqs.map((f, i) => (
          <button
            key={f.q}
            onClick={() => setOpen(open === i ? null : i)}
            className="block w-full text-left"
          >
            <div className="flex items-center justify-between gap-4 p-6">
              <p className="font-semibold">{f.q}</p>
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 transition-transform ${
                  open === i ? "rotate-45 bg-primary text-primary-foreground" : ""
                }`}
              >
                +
              </div>
            </div>
            <div
              className={`grid px-6 transition-all ${
                open === i ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden text-sm text-muted-foreground">{f.a}</div>
            </div>
          </button>
        ))}
      </div>
    </Section>
  );
}

function CTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from("leads").insert({
        email: trimmed,
        source: "landing_cta",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      });
      if (error && error.code !== "23505") {
        throw error;
      }
      setStatus("success");
    } catch (err) {
      console.error("Lead signup failed", err);
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };


  return (
    <section id="cta" className="relative mx-auto max-w-7xl px-6 py-24">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fadeUp}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-primary via-primary-glow to-primary/70 p-10 text-center sm:p-16"
      >
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-10" />
        <Sparkles className="mx-auto h-8 w-8 text-white" />
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Ready to Never Cancel Plans Again?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/85">
          Join thousands turning solo evenings into stories worth telling.
        </p>

        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35 }}
            role="status"
            aria-live="polite"
            className="mx-auto mt-8 flex max-w-md flex-col items-center gap-3 rounded-2xl border border-white/25 bg-white/15 px-6 py-6 backdrop-blur"
          >
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white/90">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white">You're on the list!</h3>
            <p className="text-sm text-white/85">
              We sent a confirmation to <span className="font-medium text-white">{email}</span>.
              Watch your inbox — early access drops soon.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setEmail("");
              }}
              className="mt-1 text-xs font-medium text-white/80 underline-offset-4 hover:underline"
            >
              Sign up another email
            </button>
          </motion.div>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="mx-auto mt-8 flex max-w-md flex-col items-stretch gap-2 sm:flex-row"
            >
              <label htmlFor="cta-email" className="sr-only">
                Email address
              </label>
              <input
                id="cta-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="you@example.com"
                aria-invalid={status === "error"}
                disabled={status === "loading"}
                className="flex-1 rounded-full border border-white/20 bg-white/15 px-5 py-3 text-sm text-white placeholder:text-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-card transition-transform hover:-translate-y-0.5 disabled:opacity-70"
              >
                {status === "loading" ? "Joining..." : (<>Join Outsy <ArrowRight className="h-4 w-4" /></>)}
              </button>
            </form>
            {status === "error" ? (
              <p role="alert" className="mt-3 text-xs font-medium text-white">
                {errorMsg}
              </p>
            ) : (
              <p className="mt-3 text-xs text-white/70">Free forever. No spam. Cancel anytime.</p>
            )}
          </>
        )}
      </motion.div>
    </section>
  );
}


function Footer() {
  const cols = [
    { title: "Product", links: ["Features", "How it works", "Safety", "Download"] },
    { title: "Company", links: ["About", "Careers", "Blog", "Press"] },
    { title: "Legal", links: ["Privacy Policy", "Terms", "Community Guidelines", "Contact"] },
  ];
  return (
    <footer className="mt-16 border-t border-white/10 bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <a href="#" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold">Outsy</span>
          </a>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Activity-first social. Meet people who actually want to do the thing.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {[Twitter, Instagram, Github, Send].map((Ic, i) => (
              <a
                key={i}
                href="#"
                aria-label="social link"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Ic className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold">{c.title}</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-foreground">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Outsy Labs. Made with intent.</p>
          <p className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Weekly outings shipped worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Nav />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <AppPreview />
      <Safety />
      <Compare />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
