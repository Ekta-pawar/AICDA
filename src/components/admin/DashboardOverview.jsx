import { ChevronRight } from "lucide-react";

export function DashboardOverview() {
  const stats = [
    ["Total members", "1,248", "+12 this month", "text-emerald-600"],
    ["Gallery images", "86", "4 awaiting review", "text-amber-600"],
    ["Upcoming events", "5", "Next: 12 Aug", "text-sky-600"],
    ["Published notices", "24", "3 drafts saved", "text-violet-600"],
  ];
  return (
    <>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, Admin</h2>
          <p className="mt-1 text-sm text-slate-500">Here’s what’s happening with AICDA today.</p>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-deep">
          Create announcement
        </button>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, note, color]) => (
          <article
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold">{value}</p>
            <p className={`mt-2 text-xs font-semibold ${color}`}>{note}</p>
          </article>
        ))}
      </section>
      <section className="mt-5 grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Recent activity</h3>
            <button className="text-sm font-semibold text-primary">View all</button>
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {[
              "New member application submitted",
              "Gallery album ‘National Meet 2026’ updated",
              "Transfer ownership guide was published",
              "August committee event was created",
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-4 py-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{item}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {index + 1} hour{index ? "s" : ""} ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-bold">Quick actions</h3>
          <div className="mt-4 space-y-2">
            {["Add a member", "Upload gallery images", "Publish notice"].map((action) => (
              <button
                key={action}
                className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium hover:bg-slate-100"
              >
                {action}
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
