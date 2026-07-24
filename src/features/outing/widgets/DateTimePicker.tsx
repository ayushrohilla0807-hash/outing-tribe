type Props = {
    date: string;
    time: string;
    onDate: (v: string) => void;
    onTime: (v: string) => void;
  };
  
  export default function DateTimePicker({
    date,
    time,
    onDate,
    onTime,
  }: Props) {
    return (
      <div className="grid grid-cols-2 gap-4">
  
        <div>
  
          <label className="font-medium">
            Date
          </label>
  
          <input
            type="date"
            className="mt-2 w-full rounded-xl border p-3"
            value={date}
            onChange={(e) =>
              onDate(e.target.value)
            }
          />
  
        </div>
  
        <div>
  
          <label className="font-medium">
            Time
          </label>
  
          <input
            type="time"
            className="mt-2 w-full rounded-xl border p-3"
            value={time}
            onChange={(e) =>
              onTime(e.target.value)
            }
          />
  
        </div>
  
      </div>
    );
  }