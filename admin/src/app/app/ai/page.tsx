import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AIPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">
          AI Tools
        </h1>

        <div className="grid grid-cols-3 gap-5">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow dark:shadow-none">
            <h2 className="text-xl font-semibold">
              AI Product Writer
            </h2>

            <p className="mt-3 text-zinc-500">
              Generate luxury product descriptions
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow dark:shadow-none">
            <h2 className="text-xl font-semibold">
              AI Social Media
            </h2>

            <p className="mt-3 text-zinc-500">
              Create captions & hashtags
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow dark:shadow-none">
            <h2 className="text-xl font-semibold">
              AI Campaign
            </h2>

            <p className="mt-3 text-zinc-500">
              Generate smart campaign ideas
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}