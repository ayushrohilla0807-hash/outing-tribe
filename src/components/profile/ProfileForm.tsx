import { Mail, User, Phone, MapPin, Cake } from "lucide-react";

type ProfileFormProps = {
  email: string;

  fullName: string;
  setFullName: (value: string) => void;

  age: string;
  setAge: (value: string) => void;

  phone: string;
  setPhone: (value: string) => void;

  city: string;
  setCity: (value: string) => void;

  area: string;
  setArea: (value: string) => void;
};

export default function ProfileForm({
  email,
  fullName,
  setFullName,
  age,
  setAge,
  phone,
  setPhone,
  city,
  setCity,
  area,
  setArea,
}: ProfileFormProps) {
  return (
    <div className="space-y-5">
      {/* Full Name */}
      <div>
        <label className="mb-2 block text-sm font-medium">Full Name</label>

        <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4">
          <User className="mr-3 h-5 w-5 text-muted-foreground" />

          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-12 w-full bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="mb-2 block text-sm font-medium">Email</label>

        <div className="flex items-center rounded-xl border border-white/10 bg-white/10 px-4">
          <Mail className="mr-3 h-5 w-5 text-muted-foreground" />

          <input
            type="email"
            value={email}
            disabled
            className="h-12 w-full cursor-not-allowed bg-transparent text-muted-foreground outline-none"
          />
        </div>
      </div>

      {/* Age */}
      <div>
        <label className="mb-2 block text-sm font-medium">Age</label>

        <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4">
          <Cake className="mr-3 h-5 w-5 text-muted-foreground" />

          <input
            type="number"
            min="18"
            max="80"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="h-12 w-full bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="mb-2 block text-sm font-medium">Phone Number</label>

        <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4">
          <Phone className="mr-3 h-5 w-5 text-muted-foreground" />

          <input
            type="tel"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 w-full bg-transparent outline-none"
          />
        </div>
      </div>

      {/* City */}
      <div>
        <label className="mb-2 block text-sm font-medium">City</label>

        <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4">
          <MapPin className="mr-3 h-5 w-5 text-muted-foreground" />

          <input
            type="text"
            placeholder="Enter your city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-12 w-full bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Area */}
      <div>
        <label className="mb-2 block text-sm font-medium">Area / Locality</label>

        <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4">
          <MapPin className="mr-3 h-5 w-5 text-muted-foreground" />

          <input
            type="text"
            placeholder="Enter your area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="h-12 w-full bg-transparent outline-none"
          />
        </div>
      </div>
    </div>
  );
}
