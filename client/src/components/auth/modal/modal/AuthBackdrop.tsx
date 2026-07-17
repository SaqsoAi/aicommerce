"use client";

type Props = {
  children: React.ReactNode;
};

export default function AuthBackdrop({ children }: Props) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#334155,transparent_40%),linear-gradient(135deg,#020617,#18181b,#000)]" />

      <div className="absolute inset-0 opacity-30 blur-3xl">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-white/20" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-zinc-500/20" />
      </div>

      <div className="relative min-h-screen backdrop-blur-xl">
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
          {children}
        </div>
      </div>
    </main>
  );
}
