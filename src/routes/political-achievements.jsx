import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getGalleryImages } from "@/lib/gallery-api";

export const Route = createFileRoute("/political-achievements")({
  head: () => ({
    meta: [
      { title: "Political Achievements · AICDA" },
      {
        name: "description",
        content:
          "Two and a half decades of policy advocacy that reshaped the Indian dealer landscape.",
      },
      {
        property: "og:title",
        content: "Political Achievements · AICDA",
      },
      {
        property: "og:description",
        content:
          "Two and a half decades of policy advocacy that reshaped the Indian dealer landscape.",
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
        const result = await getGalleryImages("POLITICAL_ACHIEVEMENT");

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
      title="Political Achievements"
      subtitle="Two and a half decades of policy advocacy that reshaped the Indian dealer landscape."
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
          No Political Achievement Images Found
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
          {images.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]"
            >
              <img
                src={imageUrl(item)}
                alt={item.title}
                className="aspect-[3/4] h-55 w-full object-contain object-top transition-transform duration-300 group-hover:scale-105"
              />

              <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-xs sm:text-sm font-semibold px-3 py-2 text-center">
                {item.title}
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
            {current?.title ?? "Political Achievement"}
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
                    aria-label="Previous"
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
                    aria-label="Next"
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