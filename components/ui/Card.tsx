import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

/** Theme-reactive surface block. Inherits the bento radius and hairline. */
function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-bento border border-line bg-panel text-fg",
        className
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children }: CardProps) {
  return (
    <div className={cn("border-b border-line px-5 py-4", className)}>
      {children}
    </div>
  );
}

function CardBody({ className, children }: CardProps) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

function CardFooter({ className, children }: CardProps) {
  return (
    <div className={cn("border-t border-line px-5 py-4", className)}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardBody, CardFooter };
