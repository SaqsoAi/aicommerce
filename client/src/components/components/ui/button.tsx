"use client";

import React from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "success"
  | "ghost";

type ButtonSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "icon-sm";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantClasses = {
  primary:
    "bg-black text-white hover:opacity-90",

  secondary:
    "bg-zinc-200 text-black hover:bg-zinc-300",

  outline:
    "border border-zinc-400 bg-transparent hover:bg-zinc-100",

  danger:
    "bg-red-600 text-white hover:bg-red-700",

  success:
    "bg-green-600 text-white hover:bg-green-700",

  ghost:
    "bg-transparent hover:bg-zinc-100",
};

const sizeClasses = {
  sm:
    "px-3 py-2 text-sm",

  md:
    "px-4 py-2 text-base",

  lg:
    "px-6 py-3 text-lg",

  xl:
    "px-8 py-4 text-xl",

  "icon-sm":
    "h-8 w-8 p-0 flex items-center justify-center",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        rounded-lg
        font-medium
        transition-all
        duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

