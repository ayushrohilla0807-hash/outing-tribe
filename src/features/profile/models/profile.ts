export type GenderOption = "Male" | "Female" | "Non-binary" | "Prefer not to say";

export interface UserProfile {
  id: string;

  name: string;

  email: string;

  phone: string;

  age: number;

  gender: GenderOption | string;

  state: string;

  city: string;

  bio: string;

  avatarUrl: string;

  interests: string[];

  hostRating: number;

  hostedCount: number;

  joinedCount: number;

  savedCount: number;

  verified: boolean;
}
