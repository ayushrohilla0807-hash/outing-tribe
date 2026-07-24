import { useEffect, useState } from "react";
import { X, Camera } from "lucide-react";
import type { UserProfile } from "../models/profile";

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

export default function EditProfileModal({
  open,
  profile,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState(profile);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  if (!open) return null;

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
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-5">

        <div className="w-full max-w-lg rounded-3xl bg-background shadow-2xl">

          <div className="flex items-center justify-between border-b p-6">

            <h2 className="text-2xl font-bold">
              Edit Profile
            </h2>

            <button onClick={onClose}>
              <X />
            </button>

          </div>

          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">

            <div className="flex flex-col items-center">

              <div className="relative">

                <img
                  src={form.avatarUrl}
                  alt=""
                  className="h-28 w-28 rounded-full object-cover"
                />

                <button
                  className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white"
                >
                  <Camera size={18} />
                </button>

              </div>

            </div>

            <div>

              <label className="text-sm font-medium">
                Full Name
              </label>

              <input
                className="mt-2 w-full rounded-xl border p-3"
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

              <label className="text-sm font-medium">
                Bio
              </label>

              <textarea
                rows={3}
                className="mt-2 w-full rounded-xl border p-3"
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

                <label className="text-sm font-medium">
                  Age
                </label>

                <input
                  type="number"
                  className="mt-2 w-full rounded-xl border p-3"
                  value={form.age}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      age: Number(e.target.value),
                    })
                  }
                />

              </div>

              <div>

                <label className="text-sm font-medium">
                  Gender
                </label>

                <select
                  className="mt-2 w-full rounded-xl border p-3"
                  value={form.gender}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gender: e.target.value as UserProfile["gender"],
                    })
                  }
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>

              </div>

            </div>

            <div className="grid grid-cols-2 gap-4">

              <div>

                <label className="text-sm font-medium">
                  State
                </label>

                <input
                  className="mt-2 w-full rounded-xl border p-3"
                  value={form.state}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      state: e.target.value,
                    })
                  }
                />

              </div>

              <div>

                <label className="text-sm font-medium">
                  City
                </label>

                <input
                  className="mt-2 w-full rounded-xl border p-3"
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

              <label className="text-sm font-medium">
                Interests
              </label>

              <div className="mt-3 flex flex-wrap gap-2">

                {AVAILABLE_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full border px-4 py-2 transition ${
                      form.interests.includes(interest)
                        ? "bg-primary text-white"
                        : ""
                    }`}
                  >
                    {interest}
                  </button>
                ))}

              </div>

            </div>

          </div>

          <div className="border-t p-6">

            <button
              onClick={() => onSave(form)}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-white"
            >
              Save Changes
            </button>

          </div>

        </div>

      </div>
    </>
  );
}