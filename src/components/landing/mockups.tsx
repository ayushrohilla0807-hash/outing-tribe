import { Coffee, Film, Trophy, MapPin, Heart, Search, Home, Plus, MessageCircle, User, Send, Camera, Star, Bell } from "lucide-react";

const TabBar = ({ active }: { active: string }) => (
  <div className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t border-white/10 bg-surface/80 px-4 py-2 backdrop-blur">
    {[
      { id: "home", icon: Home },
      { id: "explore", icon: Search },
      { id: "create", icon: Plus },
      { id: "chat", icon: MessageCircle },
      { id: "me", icon: User },
    ].map(({ id, icon: Icon }) => (
      <div
        key={id}
        className={`grid h-9 w-9 place-items-center rounded-xl ${
          id === active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
    ))}
  </div>
);

const StatusBar = ({ title }: { title: string }) => (
  <div className="flex items-center justify-between px-5 pt-8">
    <p className="font-display text-lg font-bold">{title}</p>
    <Bell className="h-4 w-4 text-muted-foreground" />
  </div>
);

export function MockHome() {
  const items = [
    { icon: Film, tag: "Movie", title: "Dune 3 · IMAX Night", meta: "PVR Forum · 8:30 PM", color: "from-fuchsia-500/30 to-purple-500/10" },
    { icon: Coffee, tag: "Café", title: "Latte + Chill", meta: "Third Wave · 5 PM", color: "from-amber-500/30 to-pink-500/10" },
    { icon: Trophy, tag: "Cricket", title: "Sunday Box Cricket", meta: "Turf 11 · 7 AM", color: "from-emerald-500/30 to-cyan-500/10" },
  ];
  return (
    <div className="relative h-full">
      <StatusBar title="Hey, Aditya 👋" />
      <p className="px-5 pt-1 text-xs text-muted-foreground">Nearby outings for you</p>
      <div className="mt-4 space-y-3 px-4">
        {items.map((it) => (
          <div key={it.title} className={`rounded-2xl border border-white/10 bg-gradient-to-br ${it.color} p-3`}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-black/40 text-white">
                <it.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-white/70">{it.tag}</p>
                <p className="truncate text-sm font-semibold text-white">{it.title}</p>
                <p className="truncate text-[11px] text-white/70">{it.meta}</p>
              </div>
              <button className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-black">Join</button>
            </div>
          </div>
        ))}
      </div>
      <TabBar active="home" />
    </div>
  );
}

export function MockCreate() {
  const chips = ["Movie", "Café", "Cricket", "Trip", "Concert", "Study", "Gaming"];
  return (
    <div className="relative h-full">
      <StatusBar title="Create Outing" />
      <div className="space-y-4 px-5 pt-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Activity</p>
          <div className="flex flex-wrap gap-2">
            {chips.map((c, i) => (
              <span
                key={c}
                className={`rounded-full px-3 py-1 text-xs ${
                  i === 0 ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground"
                }`}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-muted-foreground">Title</p>
          <p className="mt-1 font-semibold">Late night Dune 3 with popcorn</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-muted-foreground">When</p>
            <p className="mt-1 text-sm font-semibold">Fri · 8:30 PM</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-muted-foreground">Where</p>
            <p className="mt-1 text-sm font-semibold">PVR Forum</p>
          </div>
        </div>
        <button className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground">
          Publish outing
        </button>
      </div>
      <TabBar active="create" />
    </div>
  );
}

export function MockProfile() {
  return (
    <div className="relative h-full">
      <div className="h-24 bg-gradient-to-br from-primary to-primary-glow" />
      <div className="-mt-10 flex flex-col items-center px-5">
        <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-background bg-surface text-2xl">
          🧑‍💻
        </div>
        <p className="mt-2 font-display text-lg font-bold">Aditya R.</p>
        <p className="text-xs text-muted-foreground">Bengaluru · Verified</p>
        <div className="mt-3 flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> 4.9 · 32 outings
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 px-5 text-center">
        {["Films", "Cafés", "Cricket", "Trips", "Concerts", "Gaming"].map((i) => (
          <div key={i} className="rounded-xl bg-white/5 py-2 text-[11px]">
            {i}
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 px-5 text-sm">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
          <Camera className="h-4 w-4 text-primary" />
          <p className="text-xs">3 recent outings shared</p>
        </div>
      </div>
      <TabBar active="me" />
    </div>
  );
}

export function MockChat() {
  const msgs = [
    { me: false, t: "Hey! Excited for Dune tonight 🎬" },
    { me: true, t: "Same! Meet at gate 4?" },
    { me: false, t: "Perfect. Getting popcorn 🍿" },
    { me: true, t: "Legend. See you at 8:15" },
  ];
  return (
    <div className="relative h-full">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 pt-8 pb-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/20 text-sm">M</div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Meera · Dune 3 Outing</p>
          <p className="text-[11px] text-emerald-400">● online</p>
        </div>
      </div>
      <div className="space-y-2 px-4 py-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs ${
                m.me ? "bg-primary text-primary-foreground" : "bg-white/8 text-foreground"
              }`}
            >
              {m.t}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-3 bottom-16 flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-2">
        <input
          className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          placeholder="Message Meera"
          readOnly
        />
        <div className="grid h-7 w-7 place-items-center rounded-full bg-primary">
          <Send className="h-3 w-3 text-primary-foreground" />
        </div>
      </div>
      <TabBar active="chat" />
    </div>
  );
}

export function MockExplore() {
  const cats = [
    { icon: Film, label: "Movies", count: 42 },
    { icon: Coffee, label: "Cafés", count: 28 },
    { icon: Trophy, label: "Sports", count: 16 },
    { icon: MapPin, label: "Trips", count: 12 },
    { icon: Heart, label: "Events", count: 9 },
    { icon: Camera, label: "Photo", count: 7 },
  ];
  return (
    <div className="relative h-full">
      <StatusBar title="Explore" />
      <div className="mx-5 mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
        <Search className="h-3.5 w-3.5" /> Search outings near you
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 px-4">
        {cats.map((c) => (
          <div key={c.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/20 text-primary">
              <c.icon className="h-4 w-4" />
            </div>
            <p className="mt-2 text-sm font-semibold">{c.label}</p>
            <p className="text-[11px] text-muted-foreground">{c.count} nearby</p>
          </div>
        ))}
      </div>
      <TabBar active="explore" />
    </div>
  );
}
