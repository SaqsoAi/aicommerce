import { ReactNode } from "react";

export default function SaqsoContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-6 ${className}`}>
      {children}
    </div>
  );
}


