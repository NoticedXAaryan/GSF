import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Status pill. Accent variants use near-black text on a neon fill so they stay
 * legible in both themes; neutral variants ride the theme tokens.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-tight",
  {
    variants: {
      variant: {
        default: "bg-panel-alt text-fg-dim",
        pending: "bg-volt text-void",
        accepted: "bg-lime text-void",
        rejected: "bg-panel-alt text-fg-dim",
        waitlisted: "bg-azure text-void",
        priority: "bg-magenta text-void",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string;
  children: React.ReactNode;
}

function Badge({ variant, className, children }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
