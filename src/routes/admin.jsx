import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  FileText,
  FolderOpen,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import aicdaLogo from "@/assets/logoAICDA.png";
import { createAdmin, deleteAdmin, getAdmins, updateAdminStatus } from "@/lib/admin-api";
import { getCurrentUser, logout } from "@/lib/auth-api";
import { uploadGalleryImage } from "@/lib/gallery-api";

export const Route = createFileRoute("/admin")({ component: AdminRoute });

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Admins", icon: ShieldCheck },
  { label: "Members", icon: Users },
  { label: "Gallery", icon: Image },
  { label: "Content", icon: FileText },
  { label: "Events", icon: CalendarDays },
  { label: "Documents", icon: FolderOpen },
];

function AdminRoute() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname === "/admin/login") {
    return <Outlet />;
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((currentUser) => mounted && setUser(currentUser))
      .catch(() => mounted && navigate({ to: "/admin/login", replace: true }))
      .finally(() => mounted && setAuthLoading(false));
    return () => { mounted = false; };
  }, [navigate]);

  const handleLogout = async () => {
    await logout().catch(() => undefined);
    navigate({ to: "/admin/login", replace: true });
  };

  if (authLoading) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">Checking your session…</main>;
  }

  const role = String(user?.role || user?.userRole || "").toUpperCase();
  if (role && role !== "SUPER_ADMIN") {
    return <main className="flex min-h-screen items-center justify-center p-6"><div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center"><h1 className="text-lg font-bold text-red-800">Super Admin access required</h1><p className="mt-2 text-sm text-red-700">This account cannot manage administrator accounts.</p><button onClick={handleLogout} className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Sign out</button></div></main>;
  }

  const selectSection = (label) => {
    setActive(label);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-950 text-slate-100 transition-transform lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-25 items-center gap-3 border-b border-white/10 px-6">
          <img src={aicdaLogo} alt="AICDA" className="h-11 w-11 rounded-full bg-white object-contain p-1" />
          <div>
            <p className="text-sm font-bold tracking-wide">AICDA Admin</p>
            <p className="text-xs text-slate-400">Management portal</p>
          </div>
          <button className="ml-auto p-1 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4" aria-label="Admin navigation">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => selectSection(label)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${active === label ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {active === label && <ChevronRight className="ml-auto h-4 w-4" />}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          {/* <button onClick={() => selectSection("Settings")} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white">
            <Settings className="h-4 w-4" /> Settings
          </button> */}
          <a href="/" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" /> View website</a>
          <button onClick={handleLogout} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>

      {menuOpen && <button className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}

      <main className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open sidebar">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm text-slate-500">Admin panel</p>
              <h1 className="text-lg font-bold">{active}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 md:flex"><Search className="h-4 w-4" /> Search</button>
            <button className="relative rounded-lg p-2 hover:bg-slate-100" aria-label="Notifications"><Bell className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" /></button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">AD</div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-4 sm:p-8">
          {active === "Dashboard" ? <DashboardOverview /> : active === "Admins" ? <AdminsManagement /> : active === "Gallery" ? <GalleryManagement /> : <SectionPlaceholder section={active} />}
        </div>
      </main>
    </div>
  );
}

function DashboardOverview() {
  const stats = [
    ["Total members", "1,248", "+12 this month", "text-emerald-600"],
    ["Gallery images", "86", "4 awaiting review", "text-amber-600"],
    ["Upcoming events", "5", "Next: 12 Aug", "text-sky-600"],
    ["Published notices", "24", "3 drafts saved", "text-violet-600"],
  ];
  return <>
    <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-2xl font-bold tracking-tight">Welcome back, Admin</h2><p className="mt-1 text-sm text-slate-500">Here’s what’s happening with AICDA today.</p></div><button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-deep">Create announcement</button></div>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, note, color]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p><p className={`mt-2 text-xs font-semibold ${color}`}>{note}</p></article>)}</section>
    <section className="mt-7 grid gap-6 lg:grid-cols-3"><article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"><div className="flex items-center justify-between"><h3 className="font-bold">Recent activity</h3><button className="text-sm font-semibold text-primary">View all</button></div><div className="mt-5 divide-y divide-slate-100">{["New member application submitted", "Gallery album ‘National Meet 2026’ updated", "Transfer ownership guide was published", "August committee event was created"].map((item, index) => <div key={item} className="flex items-center gap-4 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{index + 1}</span><div><p className="text-sm font-medium">{item}</p><p className="mt-0.5 text-xs text-slate-500">{index + 1} hour{index ? "s" : ""} ago</p></div></div>)}</div></article><article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="font-bold">Quick actions</h3><div className="mt-4 space-y-2">{["Add a member", "Upload gallery images", "Publish notice"].map((action) => <button key={action} className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium hover:bg-slate-100">{action}<ChevronRight className="h-4 w-4 text-slate-400" /></button>)}</div></article></section>
  </>;
}

function AdminsManagement() {
  const [showForm, setShowForm] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      setAdmins(await getAdmins());
    } catch (requestError) {
      setError(requestError.message || "Could not load administrators.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAdmins(); }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      await createAdmin({
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
        role: String(form.get("role")).replace(" ", "_").toUpperCase(),
      });
      setShowForm(false);
      await loadAdmins();
    } catch (requestError) {
      setError(requestError.message || "Could not create administrator.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (admin) => {
    const id = admin.id || admin._id;
    if (!id) return;
    const isActive = admin.isActive ?? admin.active ?? admin.status === "ACTIVE";
    try {
      await updateAdminStatus(id, { isActive: !isActive });
      await loadAdmins();
    } catch (requestError) {
      setError(requestError.message || "Could not update administrator status.");
    }
  };

  const removeAdmin = async (admin) => {
    const id = admin.id || admin._id;
    if (!id || !window.confirm(`Delete ${admin.email || "this administrator"}?`)) return;
    try {
      await deleteAdmin(id);
      await loadAdmins();
    } catch (requestError) {
      setError(requestError.message || "Could not delete administrator.");
    }
  };

  return <>
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm text-slate-500">Welcome back,</p>
        <h2 className="mt-0.5 text-2xl font-bold tracking-tight">Super Admin</h2>
      </div>
    </div>

    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-serif text-3xl font-bold text-primary">Admins</h3>
          <p className="mt-1 text-base text-slate-500">Manage administrator accounts</p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-deep">
          <Plus className="h-5 w-5" /> New admin
        </button>
      </div>

      {error && <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="py-12 text-center text-sm text-slate-500">Loading administrators…</p> : admins.length ? <div className="mt-8 overflow-x-auto"><table className="w-full min-w-160 text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="px-3 py-3">Name</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Role</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Actions</th></tr></thead><tbody>{admins.map((admin) => { const isActive = admin.isActive ?? admin.active ?? admin.status === "ACTIVE"; return <tr key={admin.id || admin._id || admin.email} className="border-b border-slate-100"><td className="px-3 py-4 font-medium">{admin.name || [admin.firstName, admin.lastName].filter(Boolean).join(" ") || "—"}</td><td className="px-3 py-4 text-slate-600">{admin.email}</td><td className="px-3 py-4 text-slate-600">{admin.role || "ADMIN"}</td><td className="px-3 py-4"><button onClick={() => toggleStatus(admin)} className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{isActive ? "Active" : "Inactive"}</button></td><td className="space-x-3 px-3 py-4 text-right"><button onClick={() => removeAdmin(admin)} className="text-sm font-semibold text-red-600 hover:text-red-800">Delete</button></td></tr>; })}</tbody></table></div> : <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="h-8 w-8" /></div><h4 className="mt-5 text-lg font-bold text-slate-800">No administrator accounts found</h4><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Create an administrator to grant management portal access.</p></div>}
    </section>

    {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[1px]" role="dialog" aria-modal="true" aria-labelledby="create-admin-title">
      <form className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-7" onSubmit={handleCreate}>
        <h3 id="create-admin-title" className="text-2xl font-bold text-slate-800">Create new admin</h3>
        <div className="mt-6 grid gap-x-5 gap-y-5 sm:grid-cols-2">
          <AdminField id="first-name" name="firstName" label="First name" required />
          <AdminField id="last-name" name="lastName" label="Last name" required />
          <AdminField id="admin-email" name="email" label="Email" type="email" required />
          <AdminField id="phone-number" name="phone" label="Phone number" type="tel" required />
          <AdminField id="new-password" name="password" label="Password" type="password" required />
          <div>
            <label htmlFor="admin-role" className="mb-2 block text-sm font-semibold text-slate-700">Role</label>
            <select id="admin-role" name="role" defaultValue="Admin" className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15">
              <option>Admin</option>
              <option>Super Admin</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setShowForm(false)} className="h-11 rounded-lg bg-slate-100 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">Cancel</button>
          <button type="submit" disabled={saving} className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-deep disabled:opacity-60">{saving ? "Creating…" : "Create admin"}</button>
        </div>
      </form>
    </div>}
  </>;
}

function AdminField({ id, name, label, type = "text", required = false }) {
  return <div>
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label}{required && <span className="text-primary"> *</span>}</label>
    <input id={id} name={name || id} type={type} required={required} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15" />
  </div>;
}

function GalleryManagement() {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("ASSOCIATION");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!file) return;
    setUploading(true);
    setError("");
    setMessage("");
    try {
      await uploadGalleryImage(file, category);
      setMessage("Image uploaded successfully.");
      setFile(null);
      setCategory("ASSOCIATION");
      form.reset();
    } catch (requestError) {
      setError(requestError.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return <section className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-bold">Gallery upload</h2><p className="mt-1 text-sm text-slate-500">Choose a category, then upload an image to its gallery.</p><form className="mt-7 space-y-5" onSubmit={handleUpload}><div><label htmlFor="gallery-category" className="mb-2 block text-sm font-semibold text-slate-700">Category</label><select id="gallery-category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800"><option value="ASSOCIATION">Association</option><option value="POLITICAL_ACHIEVEMENT">Political Achievement</option><option value="IMAGE">Image</option><option value="DIRECTORY">Directory</option><option value="LETTER">Letter</option></select></div><div><label htmlFor="gallery-image" className="mb-2 block text-sm font-semibold text-slate-700">Image</label><input id="gallery-image" type="file" accept="image/*" required onChange={(event) => setFile(event.target.files?.[0] || null)} className="block w-full rounded-lg border border-slate-200 p-3 text-sm" /></div>{file && <p className="text-sm text-slate-500">Selected: {file.name}</p>}{error && <p role="alert" className="text-sm text-red-600">{error}</p>}{message && <p className="text-sm text-emerald-600">{message}</p>}<button type="submit" disabled={!file || uploading} className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{uploading ? "Uploading…" : "Upload image"}</button></form></section>;
}

function SectionPlaceholder({ section }) {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm"><h2 className="text-xl font-bold">{section}</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Manage your AICDA {section.toLowerCase()} from this area. This section is ready for its content and data integration.</p></div>;
}
