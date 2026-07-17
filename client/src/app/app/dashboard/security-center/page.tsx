"use client";

export default function SecurityCenterPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
      <section className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
          Security Center
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          Account Security & Identity
        </h1>

        <p className="mt-3 text-neutral-300">
          Manage active sessions, trusted devices, login history, password
          security, and two-factor authentication.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            "Active Sessions",
            "Trusted Devices",
            "Login History",
            "Password Security",
            "Two-Factor Authentication",
            "Magic Link Login",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-black/30 p-5"
            >
              <div className="font-semibold">{item}</div>
              <div className="mt-2 text-sm text-neutral-400">
                Enterprise identity foundation ready.
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
