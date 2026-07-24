import { useState } from "react";
import { Route } from "@/routes/_authenticated/host-dashboard-edit.$outingId";
import { useNavigate } from "@tanstack/react-router";

import FormField from "./widgets/FormField";
import ImageUploader from "./widgets/ImageUploader";

import {
  getOuting,
  updateOuting,
} from "./services/editOutingService";

export default function EditOutingScreen() {
  const navigate = useNavigate();

  const { outingId } = Route.useParams();

  const outing = getOuting(outingId);

  if (!outing) {
    return (
      <div className="p-8 text-center">
        Outing not found.
      </div>
    );
  }

  const [form, setForm] = useState(outing);

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleSave() {
    updateOuting(form);

    alert("Outing updated successfully!");

    navigate({
      to: "/host-dashboard",
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">

      <h1 className="text-3xl font-bold">
        Edit Outing
      </h1>

      <ImageUploader
        image={form.image}
        onChange={(value) =>
          updateField("image", value)
        }
      />

      <FormField
        label="Title"
        value={form.title}
        onChange={(value) =>
          updateField("title", value)
        }
      />

      <FormField
        label="Description"
        value={form.description}
        onChange={(value) =>
          updateField("description", value)
        }
      />

      <FormField
        label="Category"
        value={form.category}
        onChange={(value) =>
          updateField("category", value)
        }
      />

      <FormField
        label="Date"
        value={form.date}
        onChange={(value) =>
          updateField("date", value)
        }
      />

      <FormField
        label="Time"
        value={form.time}
        onChange={(value) =>
          updateField("time", value)
        }
      />

      <FormField
        label="Location"
        value={form.location}
        onChange={(value) =>
          updateField("location", value)
        }
      />

      <FormField
        label="Capacity"
        value={String(form.capacity)}
        onChange={(value) =>
          updateField(
            "capacity",
            Number(value)
          )
        }
      />

      <button
        onClick={handleSave}
        className="w-full rounded-xl bg-primary py-3 text-primary-foreground font-semibold"
      >
        Save Changes
      </button>

    </div>
  );
}