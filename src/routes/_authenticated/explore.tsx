import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Compass,
  MapPin,
  Users,
  Calendar,
  Plus,
  LogOut,
  Search,
  Loader2,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Outing = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string;
  city: string | null;
  starts_at: string;
  capacity: number;
  image_url: string | null;
  host_id: string | null;
  host_name: string | null;
  host_avatar_url: string | null;
};

export const Route = createFileRoute("/_authenticated/explore")({
  component: ExplorePage,
  head: () => ({
    meta: [
      { title: "Explore Outings — Outsy" },
      { name: "description", content: "Browse and join outings happening near you." },
    ],
  }),
});

const CATEGORIES = [
  "All",
  "Nightlife",
  "Fitness",
  "Food",
  "Games",
  "Creative",
  "Culture",
  "Music",
  "Sports",
  "Wellness",
];

function ExplorePage() {
  const navigate = useNavigate();
  const [outings, setOutings] = useState<Outing[]>([]);
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});
  const [myRsvps, setMyRsvps] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [me, setMe] = useState<{ name: string | null; avatar: string | null } | null>(null);
  const [live, setLive] = useState(false);

  const loadAll = async (uid: string | null) => {
    const [outingsRes, rsvpsRes] = await Promise.all([
      supabase.from("outings").select("*").order("starts_at", { ascending: true }),
      supabase.from("rsvps").select("outing_id, user_id"),
    ]);
    if (outingsRes.error) setError(outingsRes.error.message);
    else setOutings(outingsRes.data as Outing[]);
    if (!rsvpsRes.error && rsvpsRes.data) {
      const counts: Record<string, number> = {};
      const mine = new Set<string>();
      for (const r of rsvpsRes.data as { outing_id: string; user_id: string }[]) {
        counts[r.outing_id] = (counts[r.outing_id] ?? 0) + 1;
        if (uid && r.user_id === uid) mine.add(r.outing_id);
      }
      setRsvpCounts(counts);
      setMyRsvps(mine);
    }
    setLoading(false);
  };

  useEffect(() => {
    let uid: string | null = null;
    (async () => {
      const { data } = await supabase.auth.getUser();
      uid = data.user?.id ?? null;
      setUserId(uid);
      if (data.user) {
        const { data: p } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", data.user.id)
          .maybeSingle();
        setMe({
          name: p?.display_name ?? data.user.email?.split("@")[0] ?? "You",
          avatar: p?.avatar_url ?? null,
        });
      }
      await loadAll(uid);
    })();

    const channel = supabase
      .channel("explore-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "outings" },
        (payload) => {
          setOutings((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as Outing;
              if (prev.some((o) => o.id === row.id)) return prev;
              return [...prev, row].sort(
                (a, b) => +new Date(a.starts_at) - +new Date(b.starts_at),
              );
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as Outing;
              return prev
                .map((o) => (o.id === row.id ? row : o))
                .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old as Partial<Outing>;
              return prev.filter((o) => o.id !== row.id);
            }
            return prev;
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rsvps" },
        (payload) => {
          const row = (payload.new ?? payload.old) as {
            outing_id: string;
            user_id: string;
          };
          if (!row?.outing_id) return;
          const delta =
            payload.eventType === "INSERT" ? 1 : payload.eventType === "DELETE" ? -1 : 0;
          if (delta !== 0) {
            setRsvpCounts((prev) => ({
              ...prev,
              [row.outing_id]: Math.max(0, (prev[row.outing_id] ?? 0) + delta),
            }));
          }
          setMyRsvps((prev) => {
            if (!uid || row.user_id !== uid) return prev;
            const next = new Set(prev);
            if (payload.eventType === "INSERT") next.add(row.outing_id);
            if (payload.eventType === "DELETE") next.delete(row.outing_id);
            return next;
          });
        },
      )
      .subscribe((status) => {
        setLive(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleRsvp = async (outingId: string) => {
    if (!userId) return;
    const going = myRsvps.has(outingId);
    if (going) {
      await supabase.from("rsvps").delete().eq("outing_id", outingId).eq("user_id", userId);
    } else {
      await supabase.from("rsvps").insert({ outing_id: outingId, user_id: userId });
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return outings.filter((o) => {
      if (category !== "All" && o.category !== category) return false;
      if (!q) return true;
      return (
        o.title.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q) ||
        (o.city ?? "").toLowerCase().includes(q) ||
        (o.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [outings, category, query]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-background/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-glow">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">Outsy</span>
          </Link>
          <div className="flex items-center gap-2">

            <span
              className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide sm:inline-flex ${
                live
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-white/10 bg-white/5 text-muted-foreground"
              }`}
              aria-live="polite"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  live ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"
                }`}
              />
              {live ? "Live" : "Offline"}
            </span>
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" /> Create outing
            </button>

            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 sm:flex">
              {me?.avatar ? (
                <img src={me.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/30 text-[10px] font-semibold uppercase">
                  {me?.name?.[0] ?? "U"}
                </div>
              )}
              <span className="text-xs font-medium">{me?.name ?? "You"}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-10">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Explore outings</h1>
          <p className="mt-2 text-muted-foreground">
            Fresh plans from real people. Pick one and RSVP — solo is welcome.
          </p>
        </motion.div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search outings, cities, vibes…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading outings…
          </div>
        ) : error ? (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-surface/40 py-20 text-center">
            <p className="text-muted-foreground">No outings match your filters yet.</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Be the first to host
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((o, i) => (
              <OutingCard
                key={o.id}
                outing={o}
                index={i}
                count={rsvpCounts[o.id] ?? 0}
                going={myRsvps.has(o.id)}
                canRsvp={!!userId}
                onToggle={() => toggleRsvp(o.id)}
              />
            ))}
          </div>
        )}
      </section>

      {createOpen && (
        <CreateOutingModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => setCreateOpen(false)}
          defaultHostName={me?.name ?? null}
          defaultAvatar={me?.avatar ?? null}
        />
      )}

    </div>
  );
}

function OutingCard({ outing, index }: { outing: Outing; index: number }) {
  const date = new Date(outing.starts_at);
  const dateStr = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-surface/40 shadow-card transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
        {outing.image_url && (
          <img
            src={outing.image_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
          {outing.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold">{outing.title}</h3>
        {outing.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{outing.description}</p>
        )}
        <dl className="mt-4 grid grid-cols-1 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-primary" /> {dateStr} · {timeStr}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary" /> {outing.location}
            {outing.city ? `, ${outing.city}` : ""}
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-primary" /> Up to {outing.capacity} people
          </div>
        </dl>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            {outing.host_avatar_url ? (
              <img
                src={outing.host_avatar_url}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/30 text-[10px] font-semibold">
                {(outing.host_name ?? "H")[0]}
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              Hosted by {outing.host_name ?? "Outsy Host"}
            </span>
          </div>
          <button className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/20">
            RSVP
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function CreateOutingModal({
  onClose,
  onCreated,
  defaultHostName,
  defaultAvatar,
}: {
  onClose: () => void;
  onCreated: () => void;
  defaultHostName: string | null;
  defaultAvatar: string | null;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Food",
    location: "",
    city: "",
    starts_at: "",
    capacity: 6,
    image_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("outings").insert({
        host_id: user.id,
        host_name: defaultHostName ?? user.email?.split("@")[0] ?? "Host",
        host_avatar_url: defaultAvatar,
        title: form.title,
        description: form.description || null,
        category: form.category,
        location: form.location,
        city: form.city || null,
        starts_at: new Date(form.starts_at).toISOString(),
        capacity: Number(form.capacity) || 6,
        image_url: form.image_url || null,
      });
      if (error) throw error;
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create outing");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg overflow-hidden rounded-t-3xl border border-white/10 bg-surface p-6 sm:rounded-3xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/10 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-xl font-bold">Create an outing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Post a plan and let others RSVP.
        </p>
        <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
          <Input label="Title" value={form.title} onChange={(v) => set("title", v)} required />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={form.category}
              onChange={(v) => set("category", v)}
              options={CATEGORIES.filter((c) => c !== "All")}
            />
            <Input
              label="Capacity"
              type="number"
              min={2}
              max={50}
              value={String(form.capacity)}
              onChange={(v) => set("capacity", Number(v))}
              required
            />
          </div>
          <Input label="Location" value={form.location} onChange={(v) => set("location", v)} required />
          <Input label="City" value={form.city} onChange={(v) => set("city", v)} />
          <Input
            label="Date & time"
            type="datetime-local"
            value={form.starts_at}
            onChange={(v) => set("starts_at", v)}
            required
          />
          <Input
            label="Cover image URL (optional)"
            value={form.image_url}
            onChange={(v) => set("image_url", v)}
          />
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
            />
          </label>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Post outing
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min}
        max={max}
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-background">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
