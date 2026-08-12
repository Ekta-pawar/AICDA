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
import { inputClass } from "./directory-shared";

// Banners have their own dedicated page (Banner Master → /admin/banners),
// so this gallery never lists or creates BANNER-category images.
const CATEGORIES = [
  ["ASSOCIATION", "Association"],
  ["POLITICAL_ACHIEVEMENT", "Political Achievement"],
  ["IMAGE", "Image / Video"],
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
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl animate-in rounded-[3px] bg-white shadow-2xl fade-in-0 zoom-in-95 duration-150"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="min-w-0">
            <p className="text-[13px] font-bold uppercase tracking-wide text-slate-500">{title}</p>
            {description && <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-[3px] p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
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
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-[13px] font-semibold text-slate-700">
        Category
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className={`${inputClass} mt-1`}
        >
          {CATEGORIES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[13px] font-semibold text-slate-700">
        {image ? "Replace image or video (optional)" : "Image or video"}
        <input
          type="file"
          accept="image/*,video/*"
          required={!image}
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className={`${inputClass} mt-1 h-auto py-1.5`}
        />
      </label>
      {preview &&
        (previewIsVideo ? (
          <video
            src={preview}
            controls
            muted
            className="h-48 w-full rounded-[3px] border border-slate-200 bg-black object-contain"
          />
        ) : (
          <img
            src={preview}
            alt="Preview"
            className="h-48 w-full rounded-[3px] border border-slate-200 object-contain"
          />
        ))}
      {error && (
        <p role="alert" className="text-[13px] text-red-600">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="h-9 rounded-[3px] bg-slate-100 px-4 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || (!image && !file)}
          className="inline-flex h-9 items-center gap-2 rounded-[3px] bg-blue-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {image ? "Save changes" : "Upload"}
        </button>
      </div>
    </form>
  );
}

const PAGE_SIZE = 12;

function GalleryCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-[3px] border border-slate-300 p-2.5">
      <Skeleton className="h-14 w-14 shrink-0 rounded-[3px]" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

function GalleryTableSkeleton({ rows = 5 }) {
  return (
    <div className="mt-3 hidden overflow-x-auto scrollbar-hide rounded-[3px] border border-slate-300 md:block">
      <table className="w-full min-w-150 text-left text-[13px]">
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr
              key={index}
              className={`border-t border-slate-200 first:border-t-0 ${index % 2 === 0 ? "bg-rose-50/70" : "bg-white"}`}
            >
              <td className="px-2.5 py-2">
                <Skeleton className="h-14 w-14 rounded-[3px]" />
              </td>
              <td className="px-2.5 py-2">
                <Skeleton className="h-5 w-24 rounded-full" />
              </td>
              <td className="px-2.5 py-2">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-2.5 py-2">
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
      // Banners live on their own page (Banner Master) — never surface them here.
      setImages(result.gallery.filter((image) => image.category !== "BANNER"));
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
      setDeleting(null);
      await loadImages();
    } catch (requestError) {
      setError(requestError.message || "Could not delete the image.");
    } finally {
      setWorking(false);
    }
  };
  return (
    <section className="space-y-2">
      <div className="sticky top-16 z-10 -mx-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-white/95 px-3 py-2 backdrop-blur sm:top-20 sm:mx-0 sm:rounded-[3px] sm:border">
        <div>
          <h2 className="text-lg font-bold">Image Gallery</h2>
          <p className="text-[13px] text-slate-500">
            Association, achievement, directory and letter images.{" "}
            <span className="font-semibold text-slate-600">{visibleImages.length}</span> total.
          </p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[3px] bg-blue-600 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Add image
        </button>
      </div>

      <div className="rounded-[3px] border border-slate-300 bg-white p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-[13px] text-slate-600">
            Category:
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-8 rounded-[3px] border border-slate-300 px-2 text-[13px] outline-none transition-colors hover:border-slate-400 focus:border-sky-500"
            >
              <option value="">All categories</option>
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-[13px] text-slate-600">
            Search:
            <span className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search gallery"
                className="h-8 w-full rounded-[3px] border border-slate-300 py-1 pl-7 pr-2 text-[13px] outline-none transition-colors hover:border-slate-400 focus:border-sky-500 sm:w-56"
              />
            </span>
          </label>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-[3px] bg-red-50 px-3 py-2 text-[13px] text-red-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <>
            <div className="mt-3 space-y-2 md:hidden">
              {Array.from({ length: 5 }).map((_, index) => (
                <GalleryCardSkeleton key={index} />
              ))}
            </div>
            <GalleryTableSkeleton />
          </>
        ) : visibleImages.length === 0 ? (
          <div className="mt-3 flex min-h-48 flex-col items-center justify-center rounded-[3px] border border-dashed border-slate-300">
            <ImageOff className="h-9 w-9 text-slate-300" />
            <p className="mt-3 text-[13px] font-semibold text-slate-500">No images found</p>
          </div>
        ) : (
          <>
            <div className="mt-3 space-y-2 md:hidden">
              {pageImages.map((image) => (
                <div
                  key={imageId(image)}
                  className="flex items-center gap-3 rounded-[3px] border border-slate-300 p-2.5"
                >
                  <div className="relative h-14 w-14 shrink-0">
                    {isVideoUrl(imageUrl(image)) ? (
                      <video
                        src={imageUrl(image)}
                        muted
                        preload="metadata"
                        className="h-14 w-14 rounded-[3px] border border-slate-200 bg-black object-cover"
                      />
                    ) : (
                      <img
                        src={imageUrl(image)}
                        alt={image.title || "Gallery"}
                        className="h-14 w-14 rounded-[3px] border border-slate-200 object-cover"
                      />
                    )}
                    {isVideoUrl(imageUrl(image)) && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-[3px] bg-black/25">
                        <Play className="h-4 w-4 fill-white text-white" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                      {categoryLabel(image.category)}
                    </span>
                    <p className="mt-1 text-xs text-slate-500">
                      {image.createdAt ? new Date(image.createdAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 text-[13px] font-semibold">
                    <button
                      onClick={() => setEditing(image)}
                      className="inline-flex items-center gap-1 text-slate-600 transition-colors hover:text-sky-700"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleting(image)}
                      className="inline-flex items-center gap-1 text-red-600 transition-colors hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 hidden overflow-x-auto scrollbar-hide rounded-[3px] border border-slate-300 md:block">
              <table className="w-full min-w-150 text-left text-[13px]">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-2.5 py-2">Image</th>
                    <th className="px-2.5 py-2">Category</th>
                    <th className="px-2.5 py-2">Uploaded</th>
                    <th className="px-2.5 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageImages.map((image, index) => (
                    <tr
                      key={imageId(image)}
                      className={`border-t border-slate-200 transition-colors hover:bg-sky-50/50 ${
                        index % 2 === 0 ? "bg-rose-50/70" : "bg-white"
                      }`}
                    >
                      <td className="px-2.5 py-2">
                        <div className="relative h-14 w-14">
                          {isVideoUrl(imageUrl(image)) ? (
                            <video
                              src={imageUrl(image)}
                              muted
                              preload="metadata"
                              className="h-14 w-14 rounded-[3px] border border-slate-200 bg-black object-cover"
                            />
                          ) : (
                            <img
                              src={imageUrl(image)}
                              alt={image.title || "Gallery"}
                              className="h-14 w-14 rounded-[3px] border border-slate-200 object-cover"
                            />
                          )}
                          {isVideoUrl(imageUrl(image)) && (
                            <span className="absolute inset-0 flex items-center justify-center rounded-[3px] bg-black/25">
                              <Play className="h-5 w-5 fill-white text-white" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2.5 py-2">
                        <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                          {categoryLabel(image.category)}
                        </span>
                      </td>
                      <td className="px-2.5 py-2 text-slate-500">
                        {image.createdAt ? new Date(image.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-2.5 py-2">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setEditing(image)}
                            className="inline-flex items-center gap-1 font-semibold text-slate-600 transition-colors hover:text-sky-700"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => setDeleting(image)}
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
          </>
        )}

        {totalPages > 1 && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[13px] font-semibold">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="rounded-[3px] border border-slate-300 px-3 py-1.5 transition-colors hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:text-slate-700"
            >
              Prev
            </button>
            <span className="rounded-[3px] border border-slate-300 px-3 py-1.5 text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-[3px] border border-slate-300 px-3 py-1.5 transition-colors hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:text-slate-700"
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
          <p className="text-[13px] text-slate-600">This cannot be undone.</p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setDeleting(null)}
              className="h-9 rounded-[3px] bg-slate-100 px-4 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={remove}
              disabled={working}
              className="inline-flex h-9 items-center gap-2 rounded-[3px] bg-red-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {working && <LoaderCircle className="h-4 w-4 animate-spin" />}Delete
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
