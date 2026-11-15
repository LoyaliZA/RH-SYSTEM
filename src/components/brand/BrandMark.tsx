import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      data-brand-mark=""
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path
        data-brand-petal="amethyst"
        fill="#7956B5"
        d="M13.2 7.4c7.2-3.2 16.4.4 18.6 7.2 1.4 4.4-1.2 8.6-5.6 13.2-6.2 6.4-14.2 10.2-18.4 8.2-4.8-2.2-4.6-8.2-.2-16.2 2.6-4.8 3.4-9.2 5.6-12.4z"
      />
      <path
        data-brand-petal="mint"
        fill="#65BFA8"
        d="M24.5 18.2c6.4-3.4 14.6-.2 16.6 6.2 1.2 4-1 8-5 12.2-5.4 5.6-12.4 9-16.2 7.2-4.2-2-4.2-7.4-.4-14.6 2.2-4.2 3-8 5-11z"
      />
    </svg>
  );
}
