import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import public1 from "@/assets/Public/PublicAICDA1.webp";
import public2 from "@/assets/Public/public2.webp";
import public3 from "@/assets/Public/public3.webp";
import public4 from "@/assets/Public/public4.webp";
import public5 from "@/assets/Public/public5.webp";
import public6 from "@/assets/Public/public6.webp";
import public7 from "@/assets/Public/public7.webp";
import public9 from "@/assets/Public/public9.webp";
import public10 from "@/assets/Public/public10.webp";
import public11 from "@/assets/Public/public11.webp";

export const Route = createFileRoute("/political-achievements")({
  head: () => ({
    meta: [
      { title: "Political Achievements · AICDA" },
      { name: "description", content: "Two and a half decades of policy advocacy that reshaped the Indian dealer landscape." },
      { property: "og:title", content: "Political Achievements · AICDA" },
      { property: "og:description", content: "Two and a half decades of policy advocacy that reshaped the Indian dealer landscape." },
    ],
  }),
  component: Page,
});

const ACHIEVEMENTS = [public1, public2, public3, public4, public5, public6, public7, public9, public10, public11].map(
  (src, i) => ({
    src,
    label: `Political Achievement ${i + 1}`,
  })
);

function Page() {
  const [openIndex, setOpenIndex] = useState(null);
  const current = openIndex !== null ? ACHIEVEMENTS[openIndex] : null;

  return (
    <PageShell title="Political Achievements" subtitle="Two and a half decades of policy advocacy that reshaped the Indian dealer landscape.">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
        {ACHIEVEMENTS.map((item, i) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] text-left cursor-pointer"
          >
            <img
              src={item.src}
              alt={item.label}
              className="aspect-[3/4] h-55 w-full object-contain object-top transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-xs sm:text-sm font-semibold px-3 py-2 text-center">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-3xl border-none bg-black p-0 overflow-hidden">
          <DialogTitle className="sr-only">{current?.label ?? "Achievement"}</DialogTitle>
          {current && (
            <div className="relative">
              <img src={current.src} alt={current.label} className="max-h-[80vh] w-full object-contain bg-black" />
              {ACHIEVEMENTS.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous achievement"
                    onClick={() => setOpenIndex((i) => (i === null ? i : (i - 1 + ACHIEVEMENTS.length) % ACHIEVEMENTS.length))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white cursor-pointer hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next achievement"
                    onClick={() => setOpenIndex((i) => (i === null ? i : (i + 1) % ACHIEVEMENTS.length))}
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
