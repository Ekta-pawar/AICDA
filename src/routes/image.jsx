import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getGalleryImages } from "@/lib/gallery-api";

export const Route = createFileRoute("/image")({
  head: () => ({ meta: [{ title: "Image Gallery · AICDA" }, { name: "description", content: "A visual record of AICDA conventions, meetings and dealer felicitations." }] }),
  component: Page,
});

const CATEGORIES = [
  ["ASSOCIATION", "Association"],
  ["POLITICAL_ACHIEVEMENT", "Political Achievement"],
  ["IMAGE", "Image"],
  ["DIRECTORY", "Directory"],
  ["LETTER", "Letter"],
];
const PAGE_SIZE = 12;

function imageUrl(image) {
  return image.imageUrl || image.url || image.secure_url || image.image?.url || image.image?.secure_url;
}

function Page() {
  const [category, setCategory] = useState("IMAGE");
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const loadImages = async (requestedCategory, requestedPage, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError("");
    try {
      const result = await getGalleryImages({ category: requestedCategory, page: requestedPage, limit: PAGE_SIZE });
      const validImages = result.images.filter((image) => imageUrl(image));
      setImages((current) => append ? [...current, ...validImages] : validImages);
      const totalPages = result.pagination.totalPages || result.pagination.pages;
      setHasMore(typeof result.pagination.hasNextPage === "boolean" ? result.pagination.hasNextPage : totalPages ? requestedPage < totalPages : validImages.length === PAGE_SIZE);
      setPage(requestedPage);
    } catch (requestError) {
      setError(requestError.message || "Unable to load gallery images.");
      if (!append) setImages([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { loadImages(category, 1); }, [category]);

  const changeCategory = (nextCategory) => {
    setOpenIndex(null);
    setCategory(nextCategory);
  };
  const current = openIndex === null ? null : images[openIndex];

  return <PageShell title="Gallery" subtitle="Browse AICDA photos by category.">
    <div className="mb-7 flex flex-wrap gap-2" role="tablist" aria-label="Gallery categories">
      {CATEGORIES.map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={category === value} onClick={() => changeCategory(value)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${category === value ? "bg-primary text-white" : "border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"}`}>{label}</button>)}
    </div>

    {loading ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading gallery…</div> : error ? <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div> : images.length === 0 ? <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No images have been uploaded in this category yet.</div> : <><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"><>{images.map((photo, index) => <button key={photo.id || photo._id || `${imageUrl(photo)}-${index}`} type="button" onClick={() => setOpenIndex(index)} className="group relative overflow-hidden rounded-xl border border-border bg-card text-left shadow-[var(--shadow-card)]"><img src={imageUrl(photo)} alt={photo.title || `${CATEGORIES.find(([value]) => value === category)?.[1]} photo ${index + 1}`} className="aspect-square h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /><span className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2 text-xs font-semibold text-white">{photo.title || "View image"}</span></button>)}</></div>{hasMore && <div className="mt-8 text-center"><button type="button" onClick={() => loadImages(category, page + 1, true)} disabled={loadingMore} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{loadingMore && <LoaderCircle className="h-4 w-4 animate-spin" />}{loadingMore ? "Loading…" : "Load more"}</button></div>}</>}

    <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}><DialogContent className="max-w-4xl overflow-hidden border-none bg-black p-0"><DialogTitle className="sr-only">{current?.title || "Gallery image"}</DialogTitle>{current && <div className="relative"><img src={imageUrl(current)} alt={current.title || "Gallery image"} className="max-h-[80vh] w-full object-contain" />{images.length > 1 && <><button type="button" aria-label="Previous photo" onClick={() => setOpenIndex((index) => (index - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"><ChevronLeft className="h-6 w-6" /></button><button type="button" aria-label="Next photo" onClick={() => setOpenIndex((index) => (index + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"><ChevronRight className="h-6 w-6" /></button></>}<p className="bg-black/80 px-4 py-3 text-center text-sm font-semibold text-white">{current.title || "Gallery image"}</p></div>}</DialogContent></Dialog>
  </PageShell>;
}
