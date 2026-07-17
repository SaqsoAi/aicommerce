export default function AdminSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={["animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.045]", className].join(" ")} />
  );
}
