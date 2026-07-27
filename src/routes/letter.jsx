import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import letter1 from "@/assets/letter/AICDA latter1.webp";
import letter2 from "@/assets/letter/AICDA letter2.webp";
import letter3 from "@/assets/letter/AICDA letter3.webp";
import letter4 from "@/assets/letter/AICDA letter4.webp";
import letter5 from "@/assets/letter/AICDA letter5.webp";
import letter6 from "@/assets/letter/AICDA letter6.webp";
import letter7 from "@/assets/letter/AICDA letter7.webp";
import letter8 from "@/assets/letter/AICDA lletter8.webp";

export const Route = createFileRoute("/letter")({
  head: () => ({
    meta: [
      { title: "Letters & Circulars · AICDA" },
      {
        name: "description",
        content: "Official correspondence, member circulars and government representations.",
      },
      { property: "og:title", content: "Letters & Circulars · AICDA" },
      {
        property: "og:description",
        content: "Official correspondence, member circulars and government representations.",
      },
    ],
  }),
  component: Page,
});

const LETTERS = [letter1, letter2, letter3, letter4, letter5, letter6, letter7, letter8].map(
  (src, i) => ({
    src,
    label: `Letter of Association ${i + 1}`,
  }),
);

function Page() {
  const [openIndex, setOpenIndex] = useState(null);
  const current = openIndex !== null ? LETTERS[openIndex] : null;

  return (
    <PageShell
      title="Letters & Circulars"
      subtitle="Official correspondence, member circulars and government representations."
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
        {LETTERS.map((letter, i) => (
          <button
            key={letter.src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] text-left cursor-pointer"
          >
            <img
              src={letter.src}
              alt={letter.label}
              className="aspect-[3/4] h-55 w-full object-contaner object-top transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-xs sm:text-sm font-semibold px-3 py-2 text-center">
              {letter.label}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-3xl border-none bg-black p-0 overflow-hidden">
          <DialogTitle className="sr-only">{current?.label ?? "Letter"}</DialogTitle>
          {current && (
            <div className="relative">
              <img
                src={current.src}
                alt={current.label}
                className="max-h-[80vh] w-full object-contain bg-black"
              />
              {LETTERS.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous letter"
                    onClick={() =>
                      setOpenIndex((i) =>
                        i === null ? i : (i - 1 + LETTERS.length) % LETTERS.length,
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white cursor-pointer hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next letter"
                    onClick={() => setOpenIndex((i) => (i === null ? i : (i + 1) % LETTERS.length))}
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
