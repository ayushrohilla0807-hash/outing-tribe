import { useEffect, useState } from "react";
import { Route } from "@/routes/_authenticated/host-dashboard-edit.$outingId";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import FormField from "./widgets/FormField";
import ImageUploader from "./widgets/ImageUploader";

import { getOuting, updateOuting, type EditOutingData } from "./services/editOutingService";

export default function EditOutingScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { outingId } = Route.useParams();

  const [form, setForm] = useState<EditOutingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isHost, setIsHost] = useState<boolean | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          navigate({ to: "/auth", replace: true });
          return;
        }

        const data = await getOuting(outingId);
        if (!data) {
          toast.error("Outing not found");
          navigate({ to: "/host-dashboard" });
          return;
        }

        // Verify host
        const { data: outingRow } = await supabase
          .from("outings")
          .select("host_id")
          .eq("id", outingId)
          .single();

        if (outingRow?.host_id !== user.id) {
          setIsHost(false);
          setLoading(false);
          return;
        }

        setIsHost(true);
        setForm(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load outing");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [outingId, navigate]);

  function updateField<K extends keyof EditOutingData>(key: K, value: EditOutingData[K]) {
    if (!form) return;
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    if (!form.title.trim() || !form.location.trim() || !form.date || !form.time) {
      toast.error("Please fill in all required fields (title, location, date, time)");
      return;
    }

    if (form.capacity < 1) {
      toast.error("Participant capacity must be at least 1");
      return;
    }

    try {
      setSaving(true);
      await updateOuting(form);
      toast.success("Outing updated successfully!");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["outing-details", outingId] }),
        queryClient.invalidateQueries({ queryKey: ["explore-outings"] }),
        queryClient.invalidateQueries({ queryKey: ["hosted-outings"] }),
        queryClient.invalidateQueries({ queryKey: ["history-outings"] }),
      ]);

      navigate({
        to: "/host-dashboard",
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update outing");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading outing details...</p>
      </div>
    );
  }

  if (isHost === false || !form) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h2 className="text-xl font-bold">Unauthorized</h2>
        <p className="mt-2 text-sm text-muted-foreground">Only the host can edit this outing.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 py-8 pb-32">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/host-dashboard" })}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-surface hover:bg-surface-elevated transition"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Outing</h1>
          <p className="text-sm text-muted-foreground">Update details for your outing</p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-3xl border border-white/10 bg-surface/60 p-6 sm:p-8 backdrop-blur-xl"
      >
        <ImageUploader image={form.image} onChange={(value) => updateField("image", value)} />

        <FormField
          label="Title"
          value={form.title}
          onChange={(value) => updateField("title", value)}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-background/50 p-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Describe what you plan to do..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Category"
            value={form.category}
            onChange={(value) => updateField("category", value)}
          />

          <FormField
            label="City"
            value={form.city || ""}
            onChange={(value) => updateField("city", value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Date (YYYY-MM-DD)"
            value={form.date}
            onChange={(value) => updateField("date", value)}
          />

          <FormField
            label="Time (HH:MM)"
            value={form.time}
            onChange={(value) => updateField("time", value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Location"
            value={form.location}
            onChange={(value) => updateField("location", value)}
          />

          <FormField
            label="Capacity (Max Participants)"
            value={String(form.capacity)}
            onChange={(value) => updateField("capacity", Number(value) || 1)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Guidelines & Rules (Optional)</label>
          <textarea
            rows={3}
            value={form.rules || ""}
            onChange={(e) => updateField("rules", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-background/50 p-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Any special requirements or instructions..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving Changes..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
