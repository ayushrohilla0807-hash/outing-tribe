import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Loader2,
  User,
  Cake,
  Heart,
  MapPin,
  Compass,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { interests as interestGroups } from "@/lib/interests";
import { completeProfileSetup, uploadAvatar } from "./services/profileService";

// Flat list of all interests for the dropdown
const ALL_INTERESTS = interestGroups.flatMap((g) => g.items);

// Default avatar options
const DEFAULT_AVATARS = [
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4",
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Aneka&backgroundColor=ffd5dc",
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Whiskers&backgroundColor=d1f4cc",
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Boo&backgroundColor=ffecc8",
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Luna&backgroundColor=c7d9ff",
  "https://api.dicebear.com/8.x/adventurer/svg?seed=Zara&backgroundColor=f9c6ff",
];

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"] as const;

interface FormErrors {
  name?: string;
  age?: string;
  gender?: string;
  city?: string;
  interests?: string;
}

export default function ProfileSetupScreen() {
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATARS[0]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [interestSearch, setInterestSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pre-fill name from Supabase user metadata
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata;
        setName(meta?.full_name || data.user.email?.split("@")[0] || "");
        if (meta?.avatar_url) {
          setAvatarUrl(meta.avatar_url);
        }
        if (meta?.gender) {
          setGender(meta.gender);
        }
      }
    });
  }, []);

  // ─── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: FormErrors = {};

    if (!name.trim()) errs.name = "Name is required.";
    else if (name.trim().length < 2) errs.name = "Name must be at least 2 characters.";

    const ageNum = Number(age);
    if (!age) errs.age = "Age is required.";
    else if (!Number.isInteger(ageNum) || ageNum < 13 || ageNum > 100)
      errs.age = "Enter a valid age between 13 and 100.";

    if (!gender) errs.gender = "Please select your gender.";

    if (!city.trim()) errs.city = "City is required.";
    else if (city.trim().length < 2) errs.city = "Enter a valid city name.";

    if (selectedInterests.length < 3)
      errs.interests = `Select at least 3 interests (${selectedInterests.length}/3 chosen).`;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ─── Avatar upload ──────────────────────────────────────────────────────────
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
      setShowAvatarPicker(false);
      toast.success("Photo uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  }

  // ─── Interests multi-select ─────────────────────────────────────────────────
  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
    if (errors.interests) setErrors((e) => ({ ...e, interests: undefined }));
  }

  function removeInterest(interest: string) {
    setSelectedInterests((prev) => prev.filter((i) => i !== interest));
  }

  const filteredInterests = ALL_INTERESTS.filter(
    (i) => i.toLowerCase().includes(interestSearch.toLowerCase()) && !selectedInterests.includes(i),
  );

  // ─── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await completeProfileSetup({
        name: name.trim(),
        age: Number(age),
        gender,
        city: city.trim(),
        avatarUrl,
        interests: selectedInterests,
      });
      toast.success("Profile saved! Welcome to Outsy 🎉");
      navigate({ to: "/home", replace: true });
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isValid =
    name.trim().length >= 2 &&
    Number(age) >= 13 &&
    Number(age) <= 100 &&
    Boolean(gender) &&
    city.trim().length >= 2 &&
    selectedInterests.length >= 3;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-radial-primary opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(60%_50%_at_50%_30%,#000,transparent)]" />

      <div className="relative mx-auto max-w-lg px-5 py-10 pb-16">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow shadow-glow">
            <Compass className="h-5 w-5 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Set up your profile</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            Tell us a little about yourself so we can find the best outings for you.
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          {/* ── Avatar ── */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={avatarUrl}
                alt="Your avatar"
                className="h-28 w-28 rounded-full object-cover border-2 border-white/15 shadow-lg bg-surface"
              />
              <button
                type="button"
                onClick={() => setShowAvatarPicker((p) => !p)}
                className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-primary text-white shadow-glow hover:opacity-90 transition"
                aria-label="Change avatar"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Pick an avatar or upload a photo</p>

            {/* Avatar picker panel */}
            <AnimatePresence>
              {showAvatarPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="w-full rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-md p-4 shadow-card"
                >
                  <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Choose an avatar
                  </p>
                  <div className="grid grid-cols-6 gap-2 mb-4">
                    {DEFAULT_AVATARS.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(src);
                          setShowAvatarPicker(false);
                        }}
                        className={`relative rounded-full overflow-hidden border-2 transition-all ${
                          avatarUrl === src
                            ? "border-primary scale-110"
                            : "border-transparent hover:border-white/30"
                        }`}
                      >
                        <img src={src} alt={`Avatar ${i + 1}`} className="h-10 w-10 bg-surface" />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium hover:bg-white/10 transition flex items-center justify-center gap-2"
                  >
                    <Camera className="h-4 w-4" /> Upload a photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Name ── */}
          <div className="space-y-1.5">
            <label htmlFor="setup-name" className="block text-sm font-medium">
              Full Name <span className="text-primary">*</span>
            </label>
            <div
              className={`flex items-center gap-3 rounded-2xl border bg-white/5 px-4 transition-colors ${
                errors.name ? "border-red-400/60" : "border-white/10 focus-within:border-primary/60"
              }`}
            >
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                id="setup-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((err) => ({ ...err, name: undefined }));
                }}
                placeholder="Your full name"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>

          {/* ── Age ── */}
          <div className="space-y-1.5">
            <label htmlFor="setup-age" className="block text-sm font-medium">
              Age <span className="text-primary">*</span>
            </label>
            <div
              className={`flex items-center gap-3 rounded-2xl border bg-white/5 px-4 transition-colors ${
                errors.age ? "border-red-400/60" : "border-white/10 focus-within:border-primary/60"
              }`}
            >
              <Cake className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                id="setup-age"
                type="number"
                min={13}
                max={100}
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  if (errors.age) setErrors((err) => ({ ...err, age: undefined }));
                }}
                placeholder="e.g. 22"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            {errors.age && <p className="text-xs text-red-400">{errors.age}</p>}
          </div>

          {/* ── Gender ── */}
          <div className="space-y-1.5">
            <label htmlFor="setup-gender" className="block text-sm font-medium">
              Gender <span className="text-primary">*</span>
            </label>
            <div
              className={`flex items-center gap-3 rounded-2xl border bg-white/5 px-4 transition-colors ${
                errors.gender
                  ? "border-red-400/60"
                  : "border-white/10 focus-within:border-primary/60"
              }`}
            >
              <Heart className="h-4 w-4 shrink-0 text-muted-foreground" />
              <select
                id="setup-gender"
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  if (errors.gender) setErrors((err) => ({ ...err, gender: undefined }));
                }}
                className="h-12 w-full bg-transparent text-sm text-foreground outline-none cursor-pointer"
              >
                <option value="" disabled className="bg-background text-muted-foreground">
                  Select your gender
                </option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-background text-foreground">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            {errors.gender && <p className="text-xs text-red-400">{errors.gender}</p>}
          </div>

          {/* ── City ── */}
          <div className="space-y-1.5">
            <label htmlFor="setup-city" className="block text-sm font-medium">
              City <span className="text-primary">*</span>
            </label>
            <div
              className={`flex items-center gap-3 rounded-2xl border bg-white/5 px-4 transition-colors ${
                errors.city ? "border-red-400/60" : "border-white/10 focus-within:border-primary/60"
              }`}
            >
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                id="setup-city"
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) setErrors((err) => ({ ...err, city: undefined }));
                }}
                placeholder="e.g. Mumbai"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            {errors.city && <p className="text-xs text-red-400">{errors.city}</p>}
          </div>

          {/* ── Interests multi-select dropdown ── */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">
              Interests <span className="text-primary">*</span>{" "}
              <span className="text-muted-foreground font-normal">(pick at least 3)</span>
            </label>

            {/* Selected chips */}
            {selectedInterests.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedInterests.map((interest) => (
                  <span
                    key={interest}
                    className="flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-medium text-primary"
                  >
                    <Check className="h-3 w-3" />
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="ml-0.5 rounded-full hover:bg-primary/20 transition p-0.5"
                      aria-label={`Remove ${interest}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Dropdown trigger */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                id="setup-interests"
                onClick={() => setDropdownOpen((o) => !o)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border bg-white/5 px-4 py-3 text-sm transition-colors ${
                  errors.interests
                    ? "border-red-400/60"
                    : dropdownOpen
                      ? "border-primary/60"
                      : "border-white/10 hover:border-white/20"
                }`}
              >
                <span className={selectedInterests.length === 0 ? "text-muted-foreground" : ""}>
                  {selectedInterests.length === 0
                    ? "Search and pick interests…"
                    : `${selectedInterests.length} interest${selectedInterests.length !== 1 ? "s" : ""} selected`}
                </span>
                {dropdownOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 mt-2 w-full rounded-2xl border border-white/10 bg-surface/95 backdrop-blur-xl shadow-card overflow-hidden"
                  >
                    {/* Search inside dropdown */}
                    <div className="border-b border-white/10 px-4 py-3">
                      <input
                        type="text"
                        placeholder="Search interests…"
                        value={interestSearch}
                        onChange={(e) => setInterestSearch(e.target.value)}
                        autoFocus
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Grouped interests */}
                    <div className="max-h-60 overflow-y-auto py-2">
                      {interestGroups.map((group) => {
                        const items = group.items.filter(
                          (i) =>
                            i.toLowerCase().includes(interestSearch.toLowerCase()) &&
                            !selectedInterests.includes(i),
                        );
                        if (items.length === 0) return null;
                        return (
                          <div key={group.category}>
                            <p className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {group.category}
                            </p>
                            {items.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => {
                                  toggleInterest(item);
                                  setInterestSearch("");
                                }}
                                className="flex w-full items-center px-4 py-2.5 text-sm hover:bg-white/5 transition text-left"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        );
                      })}
                      {filteredInterests.length === 0 && (
                        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                          No interests match "{interestSearch}"
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {errors.interests && <p className="text-xs text-red-400">{errors.interests}</p>}

            {/* Progress bar */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  animate={{ width: `${Math.min((selectedInterests.length / 3) * 100, 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {selectedInterests.length}/3 min
              </span>
            </div>
          </div>

          {/* ── Submit ── */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className={`mt-2 w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold shadow-glow transition-all ${
              isValid
                ? "bg-primary text-primary-foreground hover:-translate-y-0.5"
                : "bg-primary/50 text-primary-foreground/60 cursor-not-allowed"
            } disabled:opacity-70`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Saving profile…" : "Complete setup & Continue"}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
