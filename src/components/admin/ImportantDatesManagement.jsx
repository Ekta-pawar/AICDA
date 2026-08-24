import { useEffect, useMemo, useState } from "react";
import { Cake, CalendarDays, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createImportantDate,
  deleteImportantDate,
  getImportantDates,
  getUpcomingBirthdays,
  updateImportantDate,
} from "@/lib/important-date-api";
import { fieldClass, FieldRow, inputClass, textareaClass } from "./directory-shared";
import { DirectoryTableSkeleton } from "./DirectoryManagement";

const emptyForm = { title: "", date: "", description: "" };

function ImportantDateForm({ importantDate, onCancel, onSaved }) {
  const isEdit = Boolean(importantDate);
  const [form, setForm] = useState(
    importantDate
      ? {
          title: importantDate.title || "",
          date: importantDate.date ? importantDate.date.slice(0, 10) : "",
          description: importantDate.description || "",
        }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      setFieldErrors({ title: "Title is required." });
      return;
    }
    if (!form.date) {
      setError("Date is required.");
      setFieldErrors({ date: "Date is required." });
      return;
    }
    setError("");
    setFieldErrors({});
    setSaving(true);
    try {
      const saved = isEdit
        ? await updateImportantDate(importantDate.id, form)
        : await createImportantDate(form);
      toast.success(isEdit ? "Important date updated." : "Important date added.");
      onSaved(saved);
    } catch (requestError) {
      const message = requestError.message || "Could not save important date.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <FieldRow label="Title" required error={fieldErrors.title}>
          <input
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className={fieldClass(fieldErrors.title)}
          />
        </FieldRow>
        <FieldRow label="Date" required error={fieldErrors.date}>
          <input
            type="date"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
            className={fieldClass(fieldErrors.date)}
          />
        </FieldRow>
      </div>
      <FieldRow label="Description">
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={2}
          className={textareaClass}
        />
      </FieldRow>

      {error && (
        <p role="alert" className="px-3 text-[13px] text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 px-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-[3px] bg-slate-100 px-4 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-9 rounded-[3px] bg-blue-600 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Save Date" : "Add Date"}
        </button>
      </div>
    </form>
  );
}

function birthdayLabel(daysLeft) {
  if (daysLeft === 0) return "Today";
  if (daysLeft === 1) return "Tomorrow";
  return `In ${daysLeft} days`;
}

function UpcomingBirthdays() {
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getUpcomingBirthdays();
        if (!cancelled) setBirthdays(data);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message || "Could not load upcoming birthdays.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || error || birthdays.length === 0) return null;

  return (
    <div className="rounded-[3px] border border-slate-300 bg-white p-3">
      <div className="mb-2 flex items-center gap-1.5 px-1">
        <Cake className="h-4 w-4 text-pink-600" />
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-500">
          Upcoming Birthdays
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {birthdays.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-2 rounded-[3px] border border-slate-200 bg-slate-50 px-2.5 py-1.5"
          >
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.memberName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-500">
                {member.memberName?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-slate-800">{member.memberName}</p>
              <p className="text-[11px] font-medium text-pink-600">{birthdayLabel(member.daysLeft)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ImportantDatesManagement() {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDate, setEditingDate] = useState(null);

  const loadDates = async () => {
    setLoading(true);
    setError("");
    try {
      setDates(await getImportantDates());
    } catch (requestError) {
      setError(requestError.message || "Could not load important dates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDates();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return dates;
    return dates.filter((entry) =>
      [entry.title, entry.description].filter(Boolean).join(" ").toLowerCase().includes(query),
    );
  }, [dates, search]);

  const closeForm = () => {
    setShowForm(false);
    setEditingDate(null);
  };

  const handleSaved = async () => {
    closeForm();
    await loadDates();
  };

  const editDate = (entry) => {
    setEditingDate(entry);
    setShowForm(true);
  };

  const performDelete = async (entry) => {
    try {
      await deleteImportantDate(entry.id);
      await loadDates();
      toast.success(`"${entry.title}" deleted.`);
    } catch (requestError) {
      const message = requestError.message || "Could not delete this important date.";
      setError(message);
      toast.error(message);
    }
  };

  const confirmDelete = (entry) => {
    toast(`Delete "${entry.title}"?`, {
      description: "This action cannot be undone.",
      action: { label: "Delete", onClick: () => performDelete(entry) },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-slate-300 bg-white px-3 py-2">
        <div>
          <h2 className="text-lg font-bold">Important Dates</h2>
          <p className="text-[13px] text-slate-500">
            Anniversaries, meetings, and other dates the association wants to track.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[3px] bg-blue-600 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Date
          </button>
        )}
      </div>

      {!showForm && <UpcomingBirthdays />}

      {showForm && (
        <div className="rounded-[3px] border border-slate-300 bg-white p-3">
          <div className="mb-2 flex items-center justify-between px-3">
            <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-500">
              {editingDate ? "Edit Important Date" : "New Important Date"}
            </h3>
            {editingDate && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Editing {editingDate.title}
              </span>
            )}
          </div>
          <ImportantDateForm importantDate={editingDate} onCancel={closeForm} onSaved={handleSaved} />
        </div>
      )}

      {!showForm && (
        <div className="rounded-[3px] border border-slate-300 bg-white p-3">
          <label className="flex items-center gap-2 text-[13px] text-slate-600 sm:w-72">
            <span className="relative w-full">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title or description…"
                className="h-8 w-full rounded-[3px] border border-slate-300 py-1 pl-7 pr-2 text-[13px] outline-none transition-colors hover:border-slate-400 focus:border-sky-500"
              />
            </span>
          </label>

          {error && (
            <p role="alert" className="mt-3 rounded-[3px] bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {error}
            </p>
          )}

          {loading ? (
            <DirectoryTableSkeleton columns={4} />
          ) : filtered.length === 0 ? (
            <div className="mt-3 flex min-h-48 flex-col items-center justify-center rounded-[3px] border border-dashed border-slate-300">
              <CalendarDays className="h-9 w-9 text-slate-300" />
              <p className="mt-3 text-[13px] font-semibold text-slate-500">
                {search ? "No important dates match your search" : "No important dates yet"}
              </p>
            </div>
          ) : (
            <div className="mt-3 overflow-x-auto scrollbar-hide rounded-[3px] border border-slate-300">
              <table className="w-full min-w-150 text-left text-[13px]">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-2.5 py-2">Title</th>
                    <th className="px-2.5 py-2">Date</th>
                    <th className="px-2.5 py-2">Description</th>
                    <th className="px-2.5 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry) => (
                    <tr key={entry.id} className="border-t border-slate-200 hover:bg-sky-50/50">
                      <td className="px-2.5 py-2 font-medium">{entry.title}</td>
                      <td className="px-2.5 py-2 text-slate-600">
                        {entry.date ? new Date(entry.date).toLocaleDateString() : "—"}
                      </td>
                      <td className="max-w-80 truncate px-2.5 py-2 text-slate-600">
                        {entry.description || "—"}
                      </td>
                      <td className="px-2.5 py-2">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => editDate(entry)}
                            className="inline-flex items-center gap-1 font-semibold text-slate-600 transition-colors hover:text-sky-700"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(entry)}
                            className="inline-flex items-center gap-1 font-semibold text-red-600 transition-colors hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
