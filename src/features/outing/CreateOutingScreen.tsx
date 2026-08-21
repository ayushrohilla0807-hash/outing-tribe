import { FormProvider } from "react-hook-form";

import { useCreateOuting } from "./hooks/useCreateOuting";

import CoverUploader from "./widgets/CoverUploader";
import CategorySelector from "./widgets/CategorySelector";
import DateTimePicker from "./widgets/DateTimePicker";
import LocationInput from "./widgets/LocationInput";
import ParticipantsStepper from "./widgets/ParticipantsStepper";
import PublishButton from "./widgets/PublishButton";

export default function CreateOutingScreen() {
  const { form, loading, onSubmit } = useCreateOuting();

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-2xl space-y-6 px-4 sm:px-6 py-8 pb-32 overflow-x-hidden box-border"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Outing</h1>

        <CoverUploader />

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">Title *</label>
          <input
            {...form.register("title")}
            placeholder="e.g. Weekend Coffee & Chill"
            className="w-full rounded-2xl border border-white/15 bg-white/5 p-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
          />

          {form.formState.errors.title && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>

        <CategorySelector />

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">Description *</label>
          <textarea
            {...form.register("description")}
            placeholder="Describe what you're planning, who should join, and what to expect..."
            rows={4}
            className="w-full rounded-2xl border border-white/15 bg-white/5 p-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition resize-none"
          />

          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{form.watch("description")?.length ?? 0}/500</span>

            {form.formState.errors.description && (
              <span className="text-destructive font-medium">
                {form.formState.errors.description.message}
              </span>
            )}
          </div>
        </div>

        <LocationInput />

        <DateTimePicker />

        <ParticipantsStepper />

        <PublishButton loading={loading} disabled={loading} />
      </form>
    </FormProvider>
  );
}
