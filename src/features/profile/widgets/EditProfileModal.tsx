import { useEffect, useState } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import type { UserProfile } from "../models/profile";
import { uploadAvatar } from "../services/profileService";
import { toast } from "sonner";

type Props = {
  open: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
};

const AVAILABLE_INTERESTS = [
  "Coffee",
  "Movies",
  "Travel",
  "Tech",
  "Sports",
  "Gaming",
  "Music",
  "Photography",
  "Fitness",
  "Food",
];

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

    try {
      setUploadingAvatar(true);
      const url = await uploadAvatar(file);
      setForm((prev) => ({ ...prev, avatarUrl: url }));
      toast.success("Avatar uploaded!");
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
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
        <div className="w-full max-w-lg rounded-3xl bg-background border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-white/5 transition">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={
                    form.avatarUrl ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
                  }
                  alt=""
                  className="h-28 w-28 rounded-full object-cover border border-white/15"
                />

                <label className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-primary p-2 text-white shadow-glow cursor-pointer hover:opacity-90 transition">
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
              <label className="text-sm font-medium">Full Name</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none placeholder:text-muted-foreground"
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
              <label className="text-sm font-medium">Bio</label>
              <textarea
                rows={3}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none placeholder:text-muted-foreground"
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
                <label className="text-sm font-medium">Age</label>
                <input
                  type="number"
                  min={13}
                  max={120}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none placeholder:text-muted-foreground"
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
                <label className="text-sm font-medium">Gender</label>
                <select
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none text-foreground"
                  value={form.gender}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gender: e.target.value as UserProfile["gender"],
                    })
                  }
                >
                  <option value="Male" className="bg-background">
                    Male
                  </option>
                  <option value="Female" className="bg-background">
                    Female
                  </option>
                  <option value="Other" className="bg-background">
                    Other
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium">City</label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none placeholder:text-muted-foreground"
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
              <label className="text-sm font-medium">Interests</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {AVAILABLE_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium transition cursor-pointer ${
                      form.interests.includes(interest)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-6">
            <button
              onClick={() => onSave(form)}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
