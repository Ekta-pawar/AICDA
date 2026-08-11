import { useEffect, useState } from "react";
import { ImageOff, LoaderCircle, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  deleteGalleryImage,
  getGalleryImages,
  updateGalleryImage,
  uploadGalleryImage,
} from "@/lib/gallery-api";
import { BANNER_SECTIONS } from "@/lib/banner-sections";
import { invalidateBannerCache } from "@/hooks/use-banners";

export function BannerManagement() {
  const [sectionKey, setSectionKey] = useState(BANNER_SECTIONS[0].key);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const loadBanners = async () => {
    setLoading(true);
    setError("");
    try {
      const { gallery } = await getGalleryImages("BANNER", { limit: 100 });
      setBanners(gallery);
    } catch (requestError) {
      setError(requestError.message || "Could not load banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const section = BANNER_SECTIONS.find((s) => s.key === sectionKey);
  const existing = banners.find((banner) => banner.title === sectionKey);

  const selectSection = (key) => {
    setSectionKey(key);
    setFile(null);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      if (existing) {
        await updateGalleryImage(existing.id, { file });
      } else {
        await uploadGalleryImage(file, "BANNER", sectionKey);
      }
      invalidateBannerCache();
      setFile(null);
      await loadBanners();
      toast.success(`${section.label} banner updated.`);
    } catch (requestError) {
      const message = requestError.message || "Could not save banner.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!existing) return;
    setRemoving(true);
    try {
      await deleteGalleryImage(existing.id);
      invalidateBannerCache();
      await loadBanners();
      toast.success(`${section.label} banner reset to default.`);
    } catch (requestError) {
      toast.error(requestError.message || "Could not remove banner.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <section className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold">Banner Master</h2>
      <p className="mt-1 text-sm text-slate-500">
        Choose which page's hero banner (or the header's Become Member button) to change, then
        upload a new image. Sections without an uploaded banner keep using their default image.
      </p>

      <div className="mt-6">
        <label htmlFor="banner-section" className="mb-2 block text-sm font-semibold text-slate-700">
          Section
        </label>
        <select
          id="banner-section"
          value={sectionKey}
          onChange={(e) => selectSection(e.target.value)}
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800"
        >
          {BANNER_SECTIONS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-6 flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
          <LoaderCircle className="h-5 w-5 animate-spin" /> Loading banners…
        </div>
      ) : (
        <>
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-slate-700">Current banner</p>
            {preview || existing?.imageUrl ? (
              <img
                src={preview || existing.imageUrl}
                alt={`${section.label} banner`}
                className="h-40 w-full rounded-lg border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-40 w-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400">
                <ImageOff className="h-8 w-8" />
                <p className="mt-2 text-sm">No banner uploaded — using the default image</p>
              </div>
            )}
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleUpload}>
            <div>
              <label
                htmlFor="banner-image"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                {existing ? "Replace image" : "Upload image"}
              </label>
              <input
                id="banner-image"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full rounded-lg border border-slate-200 p-3 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!file || saving}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {existing ? "Save new image" : "Upload banner"}
              </button>
              {existing && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={removing}
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-red-200 px-5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {removing ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Remove
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </section>
  );
}
