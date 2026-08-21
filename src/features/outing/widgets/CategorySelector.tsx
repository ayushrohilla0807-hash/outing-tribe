import { useFormContext } from "react-hook-form";
import { outingCategories, type CreateOutingForm } from "../schema";

export default function CategorySelector() {
  const { register } = useFormContext<CreateOutingForm>();

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">
        Category <span className="text-primary">*</span>
      </label>

      <select
        {...register("category")}
        className="w-full rounded-2xl border border-white/15 bg-white/5 p-3.5 text-sm text-foreground outline-none focus:border-primary transition cursor-pointer [color-scheme:dark]"
      >
        {outingCategories.map((category) => (
          <option key={category} value={category} className="bg-background text-foreground">
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}
