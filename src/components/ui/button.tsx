import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "secondary";
};

export function Button({ variant = "default", className, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors focus:outline-none";
  const styles =
    variant === "default"
      ? "bg-[#D4AF37] text-white hover:bg-[#C4A030]"
      : variant === "outline"
      ? "border-2 border-white/30 bg-transparent text-white hover:bg-white hover:text-black"
      : "bg-white text-black hover:bg-[#D4AF37] hover:text-white";
  return <button className={cn(base, styles, className || "")} {...props} />;
}