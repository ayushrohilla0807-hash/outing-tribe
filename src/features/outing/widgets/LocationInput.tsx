type Props = {
    value: string;
    onChange: (value: string) => void;
  };
  
  export default function LocationInput({
    value,
    onChange,
  }: Props) {
    return (
      <div className="space-y-2">
  
        <label className="font-medium">
          Meeting Location
        </label>
  
        <input
          type="text"
          placeholder="Connaught Place, Delhi"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
        />
  
      </div>
    );
  }