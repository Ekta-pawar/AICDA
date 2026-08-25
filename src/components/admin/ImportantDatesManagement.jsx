import { useEffect, useMemo, useRef, useState } from "react";
import { Cake, CalendarDays, Image as ImageIcon, Pencil, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  createImportantDate,
  getImportantDates,
  getUpcomingBirthdays,
  updateImportantDate,
} from "@/lib/important-date-api";
import { fieldClass, FieldRow, inputClass, textareaClass } from "./directory-shared";
import { DirectoryTableSkeleton } from "./DirectoryManagement";

const emptyForm = { title: "", date: "", description: "", image: null };

function ImportantDateForm({ importantDate, onCancel, onSaved }) {
  const isEdit = Boolean(importantDate);
  const [form, setForm] = useState(
    importantDate
      ? {
          title: importantDate.title || "",
          date: importantDate.date ? importantDate.date.slice(0, 10) : "",
          description: importantDate.description || "",
          image: null,
        }
      : emptyForm,
  );
  const [existingImageUrl, setExistingImageUrl] = useState(importantDate?.imageUrl || null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!form.image) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(form.image);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.image]);

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

      <FieldRow label="Image (optional)">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Choose image"
            className="group relative shrink-0 cursor-pointer overflow-hidden rounded-[3px]"
          >
            {imagePreview || existingImageUrl ? (
              <img
                src={imagePreview || existingImageUrl}
                alt="Preview"
                className="h-16 w-16 rounded-[3px] border border-slate-300 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-[3px] border border-dashed border-slate-300 text-slate-300 transition-colors group-hover:border-sky-400 group-hover:text-sky-400">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
          </button>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => updateField("image", e.target.files?.[0] || null)}
              className="block text-[13px] text-slate-600 file:mr-3 file:rounded-[3px] file:border file:border-slate-300 file:bg-slate-50 file:px-2 file:py-1 file:text-[13px] file:font-semibold file:text-slate-700 hover:file:bg-slate-100"
            />
            {(imagePreview || existingImageUrl) && (
              <button
                type="button"
                onClick={() => {
                  updateField("image", null);
                  setExistingImageUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="mt-1 text-xs font-semibold text-red-600 hover:text-red-700"
              >
                Remove image
              </button>
            )}
          </div>
        </div>
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

// Reshapes a member returned by getUpcomingBirthdays into the same row
// shape as a plain ImportantDate, so both can sit in one merged, sortable
// table instead of the birthday list living in its own separate widget.
function birthdayToRow(member) {
  return {
    id: `birthday-${member.id}`,
    title: `${member.memberName}'s Birthday`,
    date: member.nextBirthday,
    isBirthday: true,
    photo: member.photo,
    daysLeft: member.daysLeft,
  };
}

export function ImportantDatesManagement() {
  const [dates, setDates] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDate, setEditingDate] = useState(null);

  const loadDates = async () => {
    setLoading(true);
    setError("");
    try {
      const [datesResult, birthdaysResult] = await Promise.all([
        getImportantDates(),
        getUpcomingBirthdays().catch(() => []),
      ]);
      setDates(datesResult);
      setBirthdays(birthdaysResult);
    } catch (requestError) {
      setError(requestError.message || "Could not load important dates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDates();
  }, []);

  // Birthdays and manually-added dates render as rows of the same table,
  // sorted together by date, rather than the birthday list living in its
  // own separate box above.
  const combined = useMemo(
    () =>
      [...dates, ...birthdays.map(birthdayToRow)].sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      ),
    [dates, birthdays],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return combined;
    return combined.filter((entry) =>
      [entry.title, entry.description].filter(Boolean).join(" ").toLowerCase().includes(query),
    );
  }, [combined, search]);

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
        <div className="rounded-[3px] border border-slate-300 bg-white">
          <div className="p-3">
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
                      <th className="px-2.5 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((entry) => (
                      <tr key={entry.id} className="border-t border-slate-200 hover:bg-sky-50/50">
                        <td className="px-2.5 py-2 font-medium">
                          <div className="flex items-center gap-2">
                            {entry.photo || entry.imageUrl ? (
                              <img
                                src={entry.photo || entry.imageUrl}
                                alt={entry.title}
                                className={`h-6 w-6 object-cover ${entry.isBirthday ? "rounded-full" : "rounded-[3px]"}`}
                              />
                            ) : entry.isBirthday ? (
                              <Cake className="h-4 w-4 shrink-0 text-pink-600" />
                            ) : null}
                            {entry.title}
                          </div>
                        </td>
                        <td className="px-2.5 py-2 text-slate-600">
                          {entry.date ? new Date(entry.date).toLocaleDateString() : "—"}
                          {entry.isBirthday && (
                            <span className="ml-2 text-xs font-medium text-pink-600">
                              ({birthdayLabel(entry.daysLeft)})
                            </span>
                          )}
                        </td>
                        <td className="px-2.5 py-2">
                          {!entry.isBirthday && (
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => editDate(entry)}
                                className="inline-flex items-center gap-1 font-semibold text-slate-600 transition-colors hover:text-sky-700"
                              >
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
