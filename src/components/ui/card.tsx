import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-slate-800/50 border border-slate-700/50 p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
