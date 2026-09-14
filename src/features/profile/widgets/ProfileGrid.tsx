import { LayoutGrid, Users, Bookmark, Calendar, Plus, Compass } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { HostedOuting } from "@/features/host/dashboard/models/hostedOuting";
import type { HistoryOuting } from "@/features/outing/history/models/history";
import type { SavedOuting } from "@/features/outing/saved/models/savedOuting";

type TabType = "hosted" | "joined" | "saved";

type Props = {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isOwnProfile?: boolean;
  hostedOutings: HostedOuting[];
  joinedOutings: HistoryOuting[];
  savedOutings: SavedOuting[];
};

export default function ProfileGrid({
  activeTab,
  onTabChange,
  isOwnProfile = true,
  hostedOutings,
  joinedOutings,
  savedOutings,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="mt-4 border-t border-white/10 pt-1">
      {/* Instagram-style Tab Bar */}
      <div className="flex border-b border-white/10">
        <button
          type="button"
          onClick={() => onTabChange("hosted")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-semibold transition cursor-pointer relative ${
            activeTab === "hosted"
              ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          <span>Hosted ({hostedOutings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("joined")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-semibold transition cursor-pointer relative ${
            activeTab === "joined"
              ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Joined ({joinedOutings.length})</span>
        </button>

        {isOwnProfile && (
          <button
            type="button"
            onClick={() => onTabChange("saved")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs sm:text-sm font-semibold transition cursor-pointer relative ${
              activeTab === "saved"
                ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Saved ({savedOutings.length})</span>
          </button>
        )}
      </div>

      {/* Grid Content */}
      <div className="pt-3 pb-8">
        {/* Hosted Outings Grid */}
        {activeTab === "hosted" && (
          <div>
            {hostedOutings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary mb-3">
                  <LayoutGrid className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-foreground">No Hosted Outings Yet</h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xs">
                  {isOwnProfile
                    ? "Create and host your first outing with friends and tribe members!"
                    : "This member has not hosted any public outings yet."}
                </p>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/create" })}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs sm:text-sm font-bold text-primary-foreground shadow-glow hover:opacity-95 active:scale-95 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Host an Outing
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {hostedOutings.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      navigate({
                        to: "/outing/$id",
                        params: { id: item.id },
                      })
                    }
                    className="group relative aspect-square overflow-hidden rounded-md sm:rounded-lg bg-surface cursor-pointer border border-white/5"
                  >
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&auto=format&fit=crop&q=80"
                      }
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                      <div className="flex justify-end">
                        <span className="rounded-full bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold">
                          {item.category || "Outing"}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold leading-tight">{item.title}</p>
                        <p className="text-[10px] text-white/80 flex items-center gap-1 mt-0.5">
                          <Users className="h-2.5 w-2.5" />
                          <span>{item.joined} going</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Joined Outings Grid */}
        {activeTab === "joined" && (
          <div>
            {joinedOutings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary mb-3">
                  <Compass className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-foreground">No Joined Outings</h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xs">
                  {isOwnProfile
                    ? "Discover trending outings happening around you and join in!"
                    : "This member has not joined any public outings yet."}
                </p>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/explore" })}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs sm:text-sm font-bold text-primary-foreground shadow-glow hover:opacity-95 active:scale-95 transition cursor-pointer"
                  >
                    <Compass className="h-4 w-4" />
                    Explore Outings
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {joinedOutings.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      navigate({
                        to: "/outing/$id",
                        params: { id: item.id },
                      })
                    }
                    className="group relative aspect-square overflow-hidden rounded-md sm:rounded-lg bg-surface cursor-pointer border border-white/5"
                  >
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&auto=format&fit=crop&q=80"
                      }
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                      <div className="flex justify-end">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                            item.status === "joined"
                              ? "bg-emerald-500/80 text-white"
                              : item.status === "completed"
                                ? "bg-primary/80 text-white"
                                : "bg-black/60 text-white"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold leading-tight">{item.title}</p>
                        <p className="text-[10px] text-white/80 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-2.5 w-2.5" />
                          <span className="truncate">{item.date}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Outings Grid */}
        {activeTab === "saved" && (
          <div>
            {savedOutings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary mb-3">
                  <Bookmark className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-foreground">No Saved Outings</h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xs">
                  Save interesting outings to easily plan your weekends and hangouts!
                </p>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/explore" })}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs sm:text-sm font-bold text-primary-foreground shadow-glow hover:opacity-95 active:scale-95 transition cursor-pointer"
                >
                  <Compass className="h-4 w-4" />
                  Browse Outings
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {savedOutings.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      navigate({
                        to: "/outing/$id",
                        params: { id: item.id },
                      })
                    }
                    className="group relative aspect-square overflow-hidden rounded-md sm:rounded-lg bg-surface cursor-pointer border border-white/5"
                  >
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&auto=format&fit=crop&q=80"
                      }
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                      <div className="flex justify-end">
                        <span className="rounded-full bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold">
                          {item.category || "Saved"}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold leading-tight">{item.title}</p>
                        <p className="text-[10px] text-white/80 truncate mt-0.5">{item.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
