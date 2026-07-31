import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getGalleryImages } from "@/lib/gallery-api";

export const Route = createFileRoute("/image")({
  head: () => ({
    meta: [
      { title: "Image Gallery · AICDA" },
      {
        name: "description",
        content:
          "A visual record of AICDA conventions, meetings and dealer felicitations.",
      },
    ],
  }),
  component: Page,
});

function imageUrl(image) {
  return (
    image.imageUrl ||
    image.url ||
    image.secure_url ||
    image.image?.url ||
    image.image?.secure_url
  );
}

function Page() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const result = await getGalleryImages("IMAGE");

        setImages((result.gallery || []).filter((img) => imageUrl(img)));
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load images.");
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  const current = openIndex !== null ? images[openIndex] : null;

  return (
    <PageShell
      title="Image Gallery"
      subtitle="A visual record of AICDA conventions, meetings and dealer felicitations."
    >
      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      ) : images.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          No Images Found
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] cursor-pointer"
            >
              <img
                src={imageUrl(image)}
                alt={image.title}
                className="aspect-[3/4] h-55 w-full object-contain object-top transition-transform duration-300 group-hover:scale-105"
              />

              <span className="absolute inset-x-0 bottom-0 bg-black/70 px-3 py-2 text-center text-xs sm:text-sm font-semibold text-white">
                {image.title}
              </span>
            </button>
          ))}
        </div>
      )}

      <Dialog
        open={openIndex !== null}
        onOpenChange={(open) => !open && setOpenIndex(null)}
      >
        <DialogContent className="max-w-3xl border-none bg-black p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {current?.title ?? "Gallery Image"}
          </DialogTitle>

          {current && (
            <div className="relative">
              <img
                src={imageUrl(current)}
                alt={current.title}
                className="max-h-[80vh] w-full object-contain bg-black"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous Image"
                    onClick={() =>
                      setOpenIndex(
                        (i) => (i - 1 + images.length) % images.length
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    type="button"
                    aria-label="Next Image"
                    onClick={() =>
                      setOpenIndex(
                        (i) => (i + 1) % images.length
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              <div className="bg-black/80 px-4 py-3 text-center text-sm font-semibold text-white">
                {current.title}
              </div>

              {current.description && (
                <div className="bg-black px-4 pb-4 text-center text-gray-300 text-sm">
                  {current.description}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}