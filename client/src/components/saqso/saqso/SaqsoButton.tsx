import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
};

const styles = {
  primary:
    "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200",
  secondary:
    "border border-zinc-300 bg-white/70 text-zinc-950 hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10",
};

export default function SaqsoButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
}: Props) {
  const classNames = `inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5 ${styles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classNames}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classNames}>
      {children}
    </button>
  );
}


