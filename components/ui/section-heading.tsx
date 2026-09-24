import { T, type TKey } from "@/lib/i18n";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow: TKey;
  title: TKey;
  subtitle?: TKey;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      <p className={cn("eyebrow", align === "center" && "justify-center")}>
        <T k={eyebrow} />
      </p>
      <h2 className="mt-5 text-[2.1rem] font-medium sm:text-[2.6rem] lg:text-5xl">
        <T k={title} />
      </h2>
      {subtitle && (
        <p className="mt-5 text-base text-muted sm:text-lg">
          <T k={subtitle} />
        </p>
      )}
    </Reveal>
  );
}
