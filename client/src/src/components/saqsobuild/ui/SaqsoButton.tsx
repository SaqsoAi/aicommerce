import type { ButtonHTMLAttributes, ReactNode } from "react";

type SaqsoButtonVariant = "primary" | "secondary" | "ghost" | "soft";
type SaqsoButtonSize = "sm" | "md" | "lg";

type SaqsoButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: SaqsoButtonVariant;
  size?: SaqsoButtonSize;
  fullWidth?: boolean;
};

export function SaqsoButton({ children, className = "", variant = "primary", size = "md", fullWidth = false, ...props }: SaqsoButtonProps) {
  const classes = [
    "saqso-btn",
    `saqso-btn--${variant}`,
    `saqso-btn--${size}`,
    fullWidth ? "saqso-btn--full" : "",
    className,
  ].filter(Boolean).join(" ");

  return <button className={classes} {...props}>{children}</button>;
}