import { useFormContext } from "react-hook-form";
import { outingCategories, type CreateOutingForm } from "../schema";

export default function CategorySelector() {
  const { register } = useFormContext<CreateOutingForm>();

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">Category</label>

      <select {...register("category")} className="w-full rounded-xl border p-3 bg-background">
        {outingCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}
