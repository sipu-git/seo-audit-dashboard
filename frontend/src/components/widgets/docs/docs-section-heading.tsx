import { Badge } from "@/src/components/ui/badge";

export function DocsSectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 pb-2">
      <Badge
        variant="secondary"
        className="w-fit bg-emerald-50 text-[10px] font-bold tracking-wider text-emerald-800 uppercase hover:bg-emerald-100"
      >
        {eyebrow}
      </Badge>
      <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
        {title}
      </h2>
      <p className="max-w-3xl text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}

