import { SaqsoButton, SaqsoCard } from "@/components/saqso";

export default function DashboardHeader({
  user,
  profile,
  logout,
}: {
  user: any;
  profile: any;
  logout: () => void;
}) {
  return (
    /* HEADER_GLASS_V3_ACTIVE_MARKER */
    <SaqsoCard className="relative overflow-hidden p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.22),transparent_35%)]" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-4xl font-black dark:bg-zinc-800">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              profile?.name?.[0] || user?.name?.[0] || "U"
            )}
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              SAQSOBUILD MEMBER
            </p>

            <h1 className="mt-2 text-4xl font-black text-zinc-950 dark:text-white md:text-5xl">
              Welcome Back {profile?.name || user?.name || "Customer"}
            </h1>

            <p className="mt-2 text-zinc-500">
              Manage orders, rewards, wishlist, profile and style preferences.
            </p>
          </div>
        </div>

        <SaqsoButton variant="danger" onClick={logout}>
          Logout
        </SaqsoButton>
      </div>
    </SaqsoCard>
  );
}



