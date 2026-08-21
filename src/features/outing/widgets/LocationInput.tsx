import { MapPin, LocateFixed, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { CreateOutingForm } from "../schema";
import { toast } from "sonner";

async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{ locationName: string; cityName: string }> {
  // Try BigDataCloud first (fast, reliable client-side geocoder)
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
    );
    if (res.ok) {
      const data = await res.json();
      const city =
        data.city || data.locality || data.principalSubdivision || data.countryName || "";
      const area = data.locality || data.localityInfo?.administrative?.[3]?.name || "";
      const locationParts = [area, city].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
      const locationName =
        locationParts.length > 0
          ? locationParts.join(", ")
          : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      return {
        locationName: locationName || city,
        cityName: city,
      };
    }
  } catch (e) {
    console.warn("Primary reverse geocode failed, attempting fallback...", e);
  }

  // Fallback to OpenStreetMap Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
        },
      },
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city =
        addr.city || addr.town || addr.village || addr.state_district || addr.state || "";
      const venue = data.name || addr.road || addr.suburb || addr.neighbourhood || "";
      const locationParts = [venue, addr.suburb || addr.neighbourhood, city]
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i);
      return {
        locationName:
          locationParts.length > 0
            ? locationParts.join(", ")
            : city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        cityName: city,
      };
    }
  } catch (e) {
    console.warn("Nominatim reverse geocode failed:", e);
  }

  return {
    locationName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    cityName: "",
  };
}

export default function LocationInput() {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CreateOutingForm>();

  const [locating, setLocating] = useState(false);

  function useCurrentLocation() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const { locationName, cityName } = await reverseGeocode(latitude, longitude);

          if (locationName) {
            setValue("location", locationName, { shouldValidate: true, shouldDirty: true });
          }
          if (cityName) {
            setValue("city", cityName, { shouldValidate: true, shouldDirty: true });
          }
          toast.success("Location detected successfully!");
        } catch (err) {
          console.error("Geocoding error:", err);
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          setValue("location", `${lat}, ${lng}`, { shouldValidate: true });
          toast.success("Location coordinates fetched.");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(
              "Location permission denied. Please enable location access in your browser settings.",
            );
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable. Please type your location.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out. Please try again.");
            break;
          default:
            toast.error("Unable to retrieve your location. Please type your location manually.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          Location & City <span className="text-primary">*</span>
        </label>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {locating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Detecting...</span>
            </>
          ) : (
            <>
              <LocateFixed className="h-3.5 w-3.5" />
              <span>Use Current Location</span>
            </>
          )}
        </button>
      </div>

      {/* Venue / Area */}
      <div className="space-y-1">
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

          <input
            {...register("location")}
            placeholder="Venue / Area (e.g. Blue Tokai, Bandra West)"
            className="w-full rounded-2xl border border-white/15 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
          />
        </div>

        {errors.location && (
          <div className="flex items-center gap-1.5 text-xs text-destructive font-medium">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errors.location.message as string}</span>
          </div>
        )}
      </div>

      {/* City */}
      <div className="space-y-1">
        <input
          {...register("city")}
          placeholder="City (e.g. Mumbai, Bengaluru)"
          className="w-full rounded-2xl border border-white/15 bg-white/5 p-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
        />

        {errors.city && (
          <div className="flex items-center gap-1.5 text-xs text-destructive font-medium">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errors.city.message as string}</span>
          </div>
        )}
      </div>
    </div>
  );
}
