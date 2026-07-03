import { ReactNode } from "react";
import SaqsoContainer from "./SaqsoContainer";

export default function SaqsoSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-10 ${className}`}>
      <SaqsoContainer>{children}</SaqsoContainer>
    </section>
  );
}


