import { useState } from "react";

import CoverUploader from "./widgets/CoverUploader";
import CategorySelector from "./widgets/CategorySelector";
import DateTimePicker from "./widgets/DateTimePicker";
import LocationInput from "./widgets/LocationInput";
import PublishButton from "./widgets/PublishButton";

import { createOuting } from "./services/outingService";

export default function CreateOutingScreen() {
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [coverImage, setCoverImage] = useState("");

  const [category, setCategory] = useState("Coffee");

  const [location, setLocation] = useState("");

  const [date, setDate] = useState("");

  const [time, setTime] = useState("");

  const [participants, setParticipants] = useState(5);

  async function publish() {
    setLoading(true);

    await createOuting({
      id: crypto.randomUUID(),
      title,
      description,
      coverImage,
      category,
      location,
      date,
      time,
      maxParticipants: participants,
      interests: [category],
    });

    setLoading(false);

    alert("Outing Created 🎉");
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 pb-32">

      <h1 className="mb-8 text-4xl font-bold">
        Create Outing
      </h1>

      <div className="space-y-6">

        <CoverUploader
          image={coverImage}
          onChange={setCoverImage}
        />

        <div>

          <label className="font-medium">
            Title
          </label>

          <input
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="Coffee Meetup"
            className="mt-2 w-full rounded-xl border p-3"
          />

        </div>

        <CategorySelector
          value={category}
          onChange={setCategory}
        />

        <DateTimePicker
          date={date}
          time={time}
          onDate={setDate}
          onTime={setTime}
        />

        <LocationInput
          value={location}
          onChange={setLocation}
        />

        <div>

          <label className="font-medium">
            Max Participants
          </label>

          <input
            type="number"
            value={participants}
            onChange={(e) =>
              setParticipants(Number(e.target.value))
            }
            className="mt-2 w-full rounded-xl border p-3"
          />

        </div>

        <div>

          <label className="font-medium">
            Description
          </label>

          <textarea
            rows={5}
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            className="mt-2 w-full rounded-xl border p-3"
          />

        </div>

        <PublishButton
          loading={loading}
          onClick={publish}
        />

      </div>

    </main>
  );
}