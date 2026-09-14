import { useEffect, useState } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import type { UserProfile } from "../models/profile";
import { uploadAvatar } from "../services/profileService";
import { validateImageFile } from "@/lib/imageOptimization";
import { toast } from "sonner";
import { interests as interestGroups } from "@/lib/interests";

type Props = {
  open: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
};

const AVAILABLE_INTERESTS = interestGroups.flatMap((g) => g.items);

export default function EditProfileModal({ open, profile, onClose, onSave }: Props) {
  const [form, setForm] = useState(profile);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  if (!open) return null;

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Please select a valid image file.");
      return;
    }

    try {
      setUploadingAvatar(true);
      const url = await uploadAvatar(file, profile.id);
      setForm((prev) => ({ ...prev, avatarUrl: url }));
      toast.success("Avatar optimized & uploaded!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }

  function toggleInterest(value: string) {
    const exists = form.interests.includes(value);

    if (exists) {
      setForm({
        ...form,
        interests: form.interests.filter((i) => i !== value),
      });
    } else {
      setForm({
        ...form,
        interests: [...form.interests, value],
      });
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3.5 sm:p-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-5 pointer-events-none">
        <div className="relative flex flex-col w-full max-w-lg max-h-[90dvh] sm:max-h-[85vh] rounded-3xl bg-background border border-white/10 shadow-2xl overflow-hidden pointer-events-auto">
          {/* Sticky Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6 shrink-0 bg-background">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Edit Profile
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Body Content */}
          <div className="flex-1 min-h-0 space-y-5 overflow-y-auto p-5 sm:p-6 overscroll-contain [-webkit-overflow-scrolling:touch]">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={
                    form.avatarUrl ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
                  }
                  alt=""
                  className="h-28 w-28 rounded-full object-cover border border-white/15 shadow-md"
                />

                <label className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-primary p-2 text-primary-foreground shadow-glow cursor-pointer hover:opacity-90 transition active:scale-95">
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <input
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Bio</label>
              <textarea
                rows={3}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition resize-none"
                value={form.bio}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bio: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Age</label>
                <input
                  type="number"
                  min={13}
                  max={120}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition"
                  value={form.age || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      age: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Gender</label>
                <select
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3.5 text-sm text-foreground outline-none focus:border-primary transition cursor-pointer"
                  value={form.gender || "Prefer not to say"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gender: e.target.value as UserProfile["gender"],
                    })
                  }
                >
                  <option value="Male" className="bg-background text-foreground">
                    Male
                  </option>
                  <option value="Female" className="bg-background text-foreground">
                    Female
                  </option>
                  <option value="Non-binary" className="bg-background text-foreground">
                    Non-binary
                  </option>
                  <option value="Prefer not to say" className="bg-background text-foreground">
                    Prefer not to say
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">City</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition"
                  value={form.city}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      city: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Interests</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {AVAILABLE_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-medium transition cursor-pointer active:scale-95 ${
                      form.interests.includes(interest)
                        ? "bg-primary text-primary-foreground border-primary shadow-sm font-semibold"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Footer with Save Button */}
          <div className="border-t border-white/10 p-4 sm:p-6 shrink-0 bg-background/95 backdrop-blur-md">
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => onSave(form)}
              className="w-full min-h-[48px] rounded-full bg-primary py-3.5 px-4 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-90 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 flex items-center justify-center"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
