import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  Handshake,
  UserCheck,
  UserCog,
  Users,
  UserX,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getMembers } from "@/lib/member-api";
import { getPartners } from "@/lib/partner-api";
import { getEnquiries } from "@/lib/enquiry-api";
import { isExpired, isProfileIncomplete, isWithinDays } from "./directory-shared";

const LARGE_BATCH = 1000;
const DASHBOARD_EXPIRING_DAYS = 10;

function requestTypeLabel(value) {
  return value === "MEMBERSHIP" || !value ? "Membership" : "General Enquiry";
}

// Distinct background/icon/hover tones per card status — kept local to the
// dashboard rather than added to directory-shared's StatCard, which other
// pages already use as a plain (non-clickable) summary tile.
const CARD_ACCENTS = {
  sky: { bg: "bg-sky-50", text: "text-sky-600", hoverBorder: "hover:border-sky-300" },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    hoverBorder: "hover:border-emerald-300",
  },
  slate: { bg: "bg-slate-100", text: "text-slate-600", hoverBorder: "hover:border-slate-300" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", hoverBorder: "hover:border-amber-300" },
  red: { bg: "bg-red-50", text: "text-red-600", hoverBorder: "hover:border-red-300" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", hoverBorder: "hover:border-violet-300" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", hoverBorder: "hover:border-indigo-300" },
};

function DashboardStatCard({ icon: Icon, label, value, accent, to, search }) {
  const tone = CARD_ACCENTS[accent];
  return (
    <Link
      to={to}
      search={search}
      className={`group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${tone.hoverBorder}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${tone.bg} ${tone.text}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <ChevronRight className="h-4 w-4 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-400" />
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold tabular-nums text-slate-900">{value}</p>
        <p className="mt-1 text-[13px] font-medium text-slate-500">{label}</p>
      </div>
    </Link>
  );
}

function DashboardStatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <div className="mt-4 space-y-1.5">
        <Skeleton className="h-7 w-12" />
        <Skeleton className="h-3 w-24" />
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
      getMembers({ limit: LARGE_BATCH }),
      getPartners({ limit: LARGE_BATCH }),
      getEnquiries(),
    ])
      .then(([membersResult, partners, enquiriesResult]) => {
        if (!mounted) return;
        const enquiries = [...enquiriesResult.enquiries].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
        const members = membersResult.members;
        // Active/Inactive totals come straight from the server (same field
        // DirectoryManagement.jsx uses) — everything else has no backend
        // filter, so it's counted from the fetched batch instead.
        const serverStats = membersResult.stats;
        setStats({
          totalMembers: serverStats?.total ?? membersResult.pagination?.total ?? members.length,
          activeMembers:
            serverStats?.active ?? members.filter((m) => m.isActive && !isExpired(m)).length,
          inactiveMembers:
            serverStats?.inactive ?? members.filter((m) => !m.isActive || isExpired(m)).length,
          profileIncomplete: members.filter(isProfileIncomplete).length,
          expiredMembers: members.filter(isExpired).length,
          expiringSoon: members.filter((m) => isWithinDays(m, DASHBOARD_EXPIRING_DAYS)).length,
          totalPartners: partners.length,
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

  const memberCards = stats && [
    {
      key: "all",
      label: "All Members",
      value: stats.totalMembers,
      icon: Users,
      accent: "sky",
      search: { status: "all" },
    },
    {
      key: "active",
      label: "Active Members",
      value: stats.activeMembers,
      icon: UserCheck,
      accent: "emerald",
      search: { status: "active" },
    },
    {
      key: "inactive",
      label: "Inactive Members",
      value: stats.inactiveMembers,
      icon: UserX,
      accent: "slate",
      search: { status: "inactive" },
    },
    {
      key: "incomplete",
      label: "Incomplete Members",
      value: stats.profileIncomplete,
      icon: UserCog,
      accent: "amber",
      search: { status: "incomplete" },
    },
 
    {
      key: "expiring",
      label: `Expiring Within ${DASHBOARD_EXPIRING_DAYS} Days`,
      value: stats.expiringSoon,
      icon: Clock,
      accent: "violet",
      search: { status: "expiring", days: DASHBOARD_EXPIRING_DAYS },
    },
  ];

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Welcome back, Admin</h2>
        <p className="text-[13px] text-slate-500">Here’s what’s happening with AICDA today.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-2.5 text-[13px] text-red-700">
          {error}
        </p>
      )}

      <div>
        <h3 className="mb-2.5 px-1 text-[13px] font-bold uppercase tracking-wide text-slate-500">
          Members
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {loading || !memberCards
            ? Array.from({ length: 6 }).map((_, index) => <DashboardStatCardSkeleton key={index} />)
            : memberCards.map((card) => (
                <DashboardStatCard
                  key={card.key}
                  icon={card.icon}
                  label={card.label}
                  value={card.value}
                  accent={card.accent}
                  to="/admin/directory"
                  search={card.search}
                />
              ))}
        </div>
      </div>

      <div>
        {/* <h3 className="mb-2.5 px-1 text-[13px] font-bold uppercase tracking-wide text-slate-500">
          Partners
        </h3> */}
        {/* <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {loading || !stats ? (
            <DashboardStatCardSkeleton />
          ) : (
            <DashboardStatCard
              icon={Handshake}
              label="All Partners"
              value={stats.totalPartners}
              accent="indigo"
              to="/admin/directory/partener"
            />
          )}
        </div> */}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
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

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-500">
            Quick actions
          </h3>
          <div className="mt-3 space-y-2">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-[13px] font-medium transition-colors hover:border-sky-300 hover:bg-sky-50/40"
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
