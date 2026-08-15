import { MapPin, LocateFixed } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { CreateOutingForm } from "../schema";
import { toast } from "sonner";

export default function LocationInput() {
  const { register, setValue } = useFormContext<CreateOutingForm>();

  function useCurrentLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);

        setValue("location", `${lat}, ${lng}`, { shouldValidate: true });
      },
      () => {
        toast.error("Unable to fetch location.");
      },
    );
  }

  return (
    <div className="space-y-4">
      <label className="text-sm font-semibold">Location</label>

      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

        <input
          {...register("location")}
          placeholder="Venue / Area"
          className="w-full rounded-xl border py-3 pl-10 pr-4"
        />
      </div>

      <input {...register("city")} placeholder="City" className="w-full rounded-xl border p-3" />

      <button
        type="button"
        onClick={useCurrentLocation}
        className="flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-muted"
      >
        <LocateFixed className="h-4 w-4" />
        Use Current Location
      </button>
    </div>
  );
}
