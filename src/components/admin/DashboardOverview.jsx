import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Handshake, Image as ImageIcon, Inbox, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getMembers } from "@/lib/member-api";
import { getPartners } from "@/lib/partner-api";
import { getGalleryImages } from "@/lib/gallery-api";
import { getEnquiries } from "@/lib/enquiry-api";
import { StatCard } from "./directory-shared";

function requestTypeLabel(value) {
  return value === "MEMBERSHIP" || !value ? "Membership" : "General Enquiry";
}

function StatCardSkeleton() {
  return (
    <div className="rounded-[3px] border border-slate-300 bg-white p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 shrink-0 rounded-[3px]" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="ml-auto h-6 w-8" />
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { label: "Add a member", to: "/admin/directory/create" },
  { label: "Upload gallery images", to: "/admin/image" },
  { label: "View enquiries", to: "/admin/enquiries" },
];

export function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    Promise.all([
      getMembers({ limit: 1 }),
      getPartners({ limit: 1000 }),
      getGalleryImages(),
      getEnquiries(),
    ])
      .then(([membersResult, partners, galleryResult, enquiriesResult]) => {
        if (!mounted) return;
        const enquiries = [...enquiriesResult.enquiries].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
        setStats({
          totalMembers: membersResult.pagination?.total ?? membersResult.members.length,
          totalPartners: partners.length,
          totalGallery: galleryResult.gallery.filter((image) => image.category !== "BANNER").length,
          totalEnquiries: enquiries.length,
        });
        setRecentEnquiries(enquiries.slice(0, 5));
      })
      .catch((requestError) => {
        if (mounted) setError(requestError.message || "Could not load dashboard data.");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-2">
      <div className="rounded-[3px] border border-slate-300 bg-white px-3 py-2">
        <h2 className="text-lg font-bold">Welcome back, Admin</h2>
        <p className="text-[13px] text-slate-500">Here’s what’s happening with AICDA today.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-[3px] bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 sm:gap-3">
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            <StatCard icon={Users} label="Total Members" value={stats.totalMembers} accent="sky" />
            <StatCard
              icon={Handshake}
              label="Partners"
              value={stats.totalPartners}
              accent="emerald"
            />
            <StatCard
              icon={ImageIcon}
              label="Gallery Images"
              value={stats.totalGallery}
              accent="violet"
            />
            <StatCard icon={Inbox} label="Enquiries" value={stats.totalEnquiries} accent="amber" />
          </>
        )}
      </div>

      <div className="grid gap-2 lg:grid-cols-3">
        <div className="rounded-[3px] border border-slate-300 bg-white p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-500">
              Recent Enquiries
            </h3>
            <Link
              to="/admin/enquiries"
              className="text-[13px] font-semibold text-sky-700 transition-colors hover:underline"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <div className="mt-1 divide-y divide-slate-100">
              {Array.from({ length: 4 }).map((_, index) => (
                <ActivitySkeleton key={index} />
              ))}
            </div>
          ) : recentEnquiries.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-slate-500">No enquiries yet.</p>
          ) : (
            <div className="mt-1 divide-y divide-slate-100">
              {recentEnquiries.map((entry) => (
                <div key={entry.id || entry._id} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sm font-bold text-sky-700">
                    {(entry.fullName || "?").charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{entry.fullName || "—"}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {requestTypeLabel(entry.requestType)}
                      {entry.createdAt
                        ? ` · ${new Date(entry.createdAt).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[3px] border border-slate-300 bg-white p-4">
          <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-500">
            Quick actions
          </h3>
          <div className="mt-3 space-y-2">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center justify-between rounded-[3px] border border-slate-200 px-3 py-2.5 text-[13px] font-medium transition-colors hover:border-sky-300 hover:bg-sky-50/40"
              >
                {action.label}
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
