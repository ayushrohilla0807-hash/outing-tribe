import { Bell, MapPin } from "lucide-react";

type HeaderProps = {
  userName: string;
  location: string;
};

export default function Header({
  userName,
  location,
}: HeaderProps) {
  const hour = new Date().getHours();

  let greeting = "Hello";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";
  else greeting = "Good Evening";

  return (
    <div className="flex items-start justify-between">

      <div>

        {/* Location */}

        <div className="flex items-center gap-2 text-primary">

          <MapPin size={18} />

          <span className="text-sm font-medium">
            {location}
          </span>

        </div>

        {/* Greeting */}

        <h1 className="mt-3 text-3xl font-bold">

          {greeting},{" "}
          <span className="text-primary">
            {userName}
          </span>

          👋

        </h1>

        <p className="mt-1 text-muted-foreground">

          Ready for your next adventure?

        </p>

      </div>

      {/* Notification */}

      <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-primary hover:text-white transition">

        <Bell size={20} />

      </button>

    </div>
  );
}