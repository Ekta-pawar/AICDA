import { useCallback, useEffect, useState } from "react";
import { ImageOff, LoaderCircle, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import {
  deleteGalleryImage,
  getGalleryImages,
  updateGalleryImage,
  uploadGalleryImage,
} from "@/lib/gallery-api";

const CATEGORIES = [
  ["ASSOCIATION", "Association"],
  ["POLITICAL_ACHIEVEMENT", "Political Achievement"],
  ["IMAGE", "Image"],
  ["DIRECTORY", "Directory"],
  ["LETTER", "Letter"],
];
const imageUrl = (image) =>
  image?.imageUrl ||
  image?.url ||
  image?.secure_url ||
  image?.image?.url ||
  image?.image?.secure_url;
const imageId = (image) => image.id || image._id;
const categoryLabel = (value) => CATEGORIES.find(([key]) => key === value)?.[1] || value;

function Modal({ title, description, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white p-7 shadow-2xl sm:p-10">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {description && <p className="-mt-2 mb-8 text-base text-slate-500">{description}</p>}
        {children}
      </div>
    </div>
  );
}

function GalleryForm({ image, onClose, onSaved }) {
  const [category, setCategory] = useState(image?.category || "ASSOCIATION");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const preview = file ? URL.createObjectURL(file) : imageUrl(image);
  useEffect(
    () => () => {
      if (file && preview) URL.revokeObjectURL(preview);
    },
    [file, preview],
  );
  const submit = async (event) => {
    event.preventDefault();
    if (!image && !file) return;
    setSaving(true);
    setError("");
    try {
      if (image) await updateGalleryImage(imageId(image), { file, category });
      else await uploadGalleryImage(file, category);
      await onSaved();
    } catch (requestError) {
      setError(requestError.message || "Unable to save the image.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label
          htmlFor="gallery-category"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Category
        </label>
        <select
          id="gallery-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
        >
          {CATEGORIES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="gallery-image" className="mb-2 block text-sm font-semibold text-slate-700">
          {image ? "Replace image (optional)" : "Image"}
        </label>
        <input
          id="gallery-image"
          type="file"
          accept="image/*"
          required={!image}
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="block w-full rounded-lg border border-slate-200 p-3 text-sm"
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-3 h-40 w-full rounded-lg border border-slate-200 object-contain"
          />
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-lg bg-slate-100 px-4 text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || (!image && !file)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {image ? "Save changes" : "Upload image"}
        </button>
      </div>
    </form>
  );
}

export function GalleryManagement() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const [working, setWorking] = useState(false);
  const loadImages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getGalleryImages(category);
      setImages(result.gallery);
    } catch (requestError) {
      setError(requestError.message || "Could not load gallery images.");
    } finally {
      setLoading(false);
    }
  }, [category]);
  useEffect(() => {
    loadImages();
  }, [loadImages]);
  const visibleImages = images.filter((image) =>
    [image.title, image.description, image.category]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const saved = async () => {
    setEditing(undefined);
    await loadImages();
  };
  const remove = async () => {
    setWorking(true);
    try {
      await deleteGalleryImage(imageId(deleting));
      setDeleting(null);
      await loadImages();
    } catch (requestError) {
      setError(requestError.message || "Could not delete the image.");
    } finally {
      setWorking(false);
    }
  };
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gallery management</h2>
          <p className="mt-1 text-sm text-slate-500">Upload, edit, and remove gallery images.</p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white"
        >
          <Plus className="h-5 w-5" /> Add image
        </button>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <label className="relative sm:ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search gallery"
            className="h-10 w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm sm:w-64"
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {loading ? (
        <div className="flex min-h-60 items-center justify-center gap-2 text-sm text-slate-500">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Loading images…
        </div>
      ) : visibleImages.length === 0 ? (
        <div className="mt-6 flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300">
          <ImageOff className="h-9 w-9 text-slate-300" />
          <p className="mt-3 text-sm font-semibold">No images found</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-150 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleImages.map((image) => (
                <tr key={imageId(image)} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <img
                      src={imageUrl(image)}
                      alt={image.title || "Gallery"}
                      className="h-14 w-14 rounded-md border border-slate-200 object-cover"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {categoryLabel(image.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {image.createdAt ? new Date(image.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setEditing(image)}
                        className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleting(image)}
                        className="inline-flex items-center gap-1 font-semibold text-red-600"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing !== undefined && (
        <Modal
          title={editing ? "Edit gallery image" : "Gallery upload"}
          description={
            editing
              ? "Update the category or replace the current image."
              : "Choose a category, then upload an image to its gallery."
          }
          onClose={() => setEditing(undefined)}
        >
          <GalleryForm image={editing} onClose={() => setEditing(undefined)} onSaved={saved} />
        </Modal>
      )}
      {deleting && (
        <Modal title="Delete this image?" onClose={() => setDeleting(null)}>
          <p className="text-sm text-slate-600">This cannot be undone.</p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setDeleting(null)}
              className="h-10 rounded-lg bg-slate-100 px-4 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={remove}
              disabled={working}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
            >
              {working && <LoaderCircle className="h-4 w-4 animate-spin" />}Delete
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
