import { useCallback, useEffect, useState } from "react";
import { ImageOff, LoaderCircle, Pencil, Play, Plus, Search, Trash2, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteGalleryImage,
  getGalleryImages,
  isVideoFile,
  isVideoUrl,
  updateGalleryImage,
  uploadGalleryImage,
} from "@/lib/gallery-api";
import { BANNER_SECTIONS } from "@/lib/banner-sections";
import { invalidateBannerCache } from "@/hooks/use-banners";

const CATEGORIES = [
  ["ASSOCIATION", "Association"],
  ["POLITICAL_ACHIEVEMENT", "Political Achievement"],
  ["IMAGE", "Image / Video"],
  ["DIRECTORY", "Directory"],
  ["LETTER", "Letter"],
  ["BANNER", "Banner"],
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
  const [sectionKey, setSectionKey] = useState(image?.title || BANNER_SECTIONS[0].key);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const preview = file ? URL.createObjectURL(file) : imageUrl(image);
  const previewIsVideo = file ? isVideoFile(file) : isVideoUrl(preview);
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
      const title = category === "BANNER" ? sectionKey : undefined;
      if (image) await updateGalleryImage(imageId(image), { file, category, title });
      else await uploadGalleryImage(file, category, title);
      if (category === "BANNER" || image?.category === "BANNER") invalidateBannerCache();
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
      {category === "BANNER" && (
        <div>
          <label
            htmlFor="gallery-banner-section"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Banner section
          </label>
          <select
            id="gallery-banner-section"
            value={sectionKey}
            onChange={(event) => setSectionKey(event.target.value)}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            {BANNER_SECTIONS.map((section) => (
              <option key={section.key} value={section.key}>
                {section.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-slate-500">
            Which page's hero banner (or the header's Become Member button) this image is for.
          </p>
        </div>
      )}
      <div>
        <label htmlFor="gallery-image" className="mb-2 block text-sm font-semibold text-slate-700">
          {image ? "Replace image or video (optional)" : "Image or video"}
        </label>
        <input
          id="gallery-image"
          type="file"
          accept="image/*,video/*"
          required={!image}
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="block w-full rounded-lg border border-slate-200 p-3 text-sm"
        />
        {preview &&
          (previewIsVideo ? (
            <video
              src={preview}
              controls
              muted
              className="mt-3 h-40 w-full rounded-lg border border-slate-200 bg-black object-contain"
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="mt-3 h-40 w-full rounded-lg border border-slate-200 object-contain"
            />
          ))}
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
          {image ? "Save changes" : "Upload"}
        </button>
      </div>
    </form>
  );
}

const PAGE_SIZE = 12;

function GalleryTableSkeleton({ rows = 5 }) {
  return (
    <div className="mt-4 overflow-x-auto scrollbar-hide rounded-xl border border-slate-200">
      <table className="w-full min-w-150 text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-3 py-2.5">Image</th>
            <th className="px-3 py-2.5">Category</th>
            <th className="px-3 py-2.5">Uploaded</th>
            <th className="px-3 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="border-t border-slate-100">
              <td className="px-3 py-2.5">
                <Skeleton className="h-14 w-14 rounded-md" />
              </td>
              <td className="px-3 py-2.5">
                <Skeleton className="h-5 w-24 rounded-full" />
              </td>
              <td className="px-3 py-2.5">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-3 py-2.5">
                <div className="flex justify-end gap-3">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GalleryManagement() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
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
  const totalPages = Math.max(1, Math.ceil(visibleImages.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageImages = visibleImages.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  useEffect(() => {
    setPage(1);
  }, [category, search]);
  const saved = async () => {
    setEditing(undefined);
    await loadImages();
  };
  const remove = async () => {
    setWorking(true);
    try {
      await deleteGalleryImage(imageId(deleting));
      if (deleting?.category === "BANNER") invalidateBannerCache();
      setDeleting(null);
      await loadImages();
    } catch (requestError) {
      setError(requestError.message || "Could not delete the image.");
    } finally {
      setWorking(false);
    }
  };
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-primary">
          Total Images Found : <span className="text-slate-700">{visibleImages.length}</span>
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {loading ? (
          <GalleryTableSkeleton />
        ) : visibleImages.length === 0 ? (
          <div className="mt-4 flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300">
            <ImageOff className="h-9 w-9 text-slate-300" />
            <p className="mt-3 text-sm font-semibold">No images found</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto scrollbar-hide rounded-xl border border-slate-200">
            <table className="w-full min-w-150 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">Image</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Uploaded</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageImages.map((image) => (
                  <tr key={imageId(image)} className="border-t border-slate-100">
                    <td className="px-3 py-2.5">
                      <div className="relative h-14 w-14">
                        {isVideoUrl(imageUrl(image)) ? (
                          <video
                            src={imageUrl(image)}
                            muted
                            preload="metadata"
                            className="h-14 w-14 rounded-md border border-slate-200 bg-black object-cover"
                          />
                        ) : (
                          <img
                            src={imageUrl(image)}
                            alt={image.title || "Gallery"}
                            className="h-14 w-14 rounded-md border border-slate-200 object-cover"
                          />
                        )}
                        {isVideoUrl(imageUrl(image)) && (
                          <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/25">
                            <Play className="h-5 w-5 fill-white text-white" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {categoryLabel(image.category)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">
                      {image.createdAt ? new Date(image.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2.5">
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
        {totalPages > 1 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="rounded-lg border border-slate-200 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <span className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600">
              Page : {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-lg border border-slate-200 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
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
