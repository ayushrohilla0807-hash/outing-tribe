type SectionHeaderProps = {
    title: string;
    count: number;
  };
  
  export default function SectionHeader({
    title,
    count,
  }: SectionHeaderProps) {
    return (
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
  
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {count}
        </span>
      </div>
    );
  }