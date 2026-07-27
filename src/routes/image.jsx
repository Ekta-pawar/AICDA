import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import gallery1 from "@/assets/AICDA1-2023.webp";
import gallery2 from "@/assets/AICDA22.webp";
import gallery3 from "@/assets/AICDA33.webp";
import gallery4 from "@/assets/AICDA4.webp";
import gallery5 from "@/assets/AICDA5.webp";
import gallery6 from "@/assets/AICDA7.webp";

export const Route = createFileRoute("/image")({
  head: () => ({
    meta: [
      { title: "Image Gallery · AICDA" },
      {
        name: "description",
        content: "A visual record of AICDA conventions, meetings and dealer felicitations.",
      },
      { property: "og:title", content: "Image Gallery · AICDA" },
      {
        property: "og:description",
        content: "A visual record of AICDA conventions, meetings and dealer felicitations.",
      },
    ],
  }),
  component: Page,
});

const GALLERY = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6].map((src, i) => ({
  src,
  label: `Gallery Photo ${i + 1}`,
}));

function Page() {
  const [openIndex, setOpenIndex] = useState(null);
  const current = openIndex !== null ? GALLERY[openIndex] : null;

  return (
    <PageShell
      title="Image Gallery"
      subtitle="A visual record of AICDA conventions, meetings and dealer felicitations."
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
        {GALLERY.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] text-left cursor-pointer"
          >
            <img
              src={photo.src}
              alt={photo.label}
              className="aspect-[3/4] h-55 w-full object-contain object-top transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-xs sm:text-sm font-semibold px-3 py-2 text-center">
              {photo.label}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-3xl border-none bg-black p-0 overflow-hidden">
          <DialogTitle className="sr-only">{current?.label ?? "Photo"}</DialogTitle>
          {current && (
            <div className="relative">
              <img
                src={current.src}
                alt={current.label}
                className="max-h-[80vh] w-full object-contain bg-black"
              />
              {GALLERY.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() =>
                      setOpenIndex((i) =>
                        i === null ? i : (i - 1 + GALLERY.length) % GALLERY.length,
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white cursor-pointer hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() => setOpenIndex((i) => (i === null ? i : (i + 1) % GALLERY.length))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white cursor-pointer hover:bg-black/70"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
              <div className="bg-black/80 px-4 py-3 text-center text-sm font-semibold text-white">
                {current.label}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
