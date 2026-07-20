export default function SaqsoSectionHeader({ eyebrow, title, subtitle, align = "left" }: { eyebrow?: string; title: string; subtitle?: string; align?: "left" | "center" }) {
 return <div className={align === "center" ? "mx-auto mb-10 max-w-3xl text-center" : "mb-10 max-w-3xl"}>{eyebrow ? <p className="saqso-eyebrow">{eyebrow}</p> : null}<h2 className="saqso-title mt-3">{title}</h2>{subtitle ? <p className={`saqso-subtitle mt-5 ${align === "center" ? "mx-auto" : ""}`}>{subtitle}</p> : null}</div>;
}
