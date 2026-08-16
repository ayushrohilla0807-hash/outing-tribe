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
        className="mx-auto w-full max-w-2xl space-y-6 p-6"
      >
        <h1 className="text-3xl font-bold">Create Outing</h1>

        <CoverUploader />

        <div>
          <input
            {...form.register("title")}
            placeholder="Outing title"
            className="w-full rounded-xl border p-3"
          />

          {form.formState.errors.title && (
            <p className="mt-1 text-sm text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>

        <CategorySelector />

        <div>
          <textarea
            {...form.register("description")}
            placeholder="Describe your outing..."
            className="min-h-40 w-full rounded-xl border p-3"
          />

          <div className="mt-1 flex justify-between text-sm text-muted-foreground">
            <span>{form.watch("description")?.length ?? 0}/500</span>

            {form.formState.errors.description && (
              <span className="text-destructive">{form.formState.errors.description.message}</span>
            )}
          </div>
        </div>

        <LocationInput />

        <DateTimePicker />

        <ParticipantsStepper />

        <PublishButton loading={loading} disabled={false} />
      </form>
    </FormProvider>
  );
}
