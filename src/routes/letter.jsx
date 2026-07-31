import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getGalleryImages } from "@/lib/gallery-api";

export const Route = createFileRoute("/letter")({
  head: () => ({
    meta: [
      { title: "Letters & Circulars · AICDA" },
      {
        name: "description",
        content:
          "Official correspondence, member circulars and government representations.",
      },
      {
        property: "og:title",
        content: "Letters & Circulars · AICDA",
      },
      {
        property: "og:description",
        content:
          "Official correspondence, member circulars and government representations.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    async function fetchLetters() {
      try {
        const response = await getGalleryImages("LETTER");
        setLetters(response.gallery || []);
      } catch (error) {
        console.error("Failed to load letters:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLetters();
  }, []);

  const current = openIndex !== null ? letters[openIndex] : null;

  if (loading) {
    return (
      <PageShell
        title="Letters & Circulars"
        subtitle="Official correspondence, member circulars and government representations."
      >
        <div className="py-20 text-center text-lg">
          Loading...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Letters & Circulars"
      subtitle="Official correspondence, member circulars and government representations."
    >
      {letters.length === 0 ? (
        <div className="py-20 text-center text-lg text-muted-foreground">
          No Letters Found
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
          {letters.map((letter, index) => (
            <button
              key={letter.id}
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] text-left cursor-pointer"
            >
              <img
                src={letter.imageUrl}
                alt={letter.title}
                className="aspect-[3/4] h-55 w-full object-contain object-top transition-transform duration-300 group-hover:scale-105"
              />

              <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-xs sm:text-sm font-semibold px-3 py-2 text-center">
                {letter.title}
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
            {current?.title ?? "Letter"}
          </DialogTitle>

          {current && (
            <div className="relative">
              <img
                src={current.imageUrl}
                alt={current.title}
                className="max-h-[80vh] w-full object-contain bg-black"
              />

              {letters.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous Letter"
                    onClick={() =>
                      setOpenIndex((i) =>
                        i === null
                          ? i
                          : (i - 1 + letters.length) % letters.length
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    type="button"
                    aria-label="Next Letter"
                    onClick={() =>
                      setOpenIndex((i) =>
                        i === null ? i : (i + 1) % letters.length
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