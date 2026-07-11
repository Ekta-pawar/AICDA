import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import event1 from "@/assets/Events/AICDAEvent1.webp";
import event2 from "@/assets/Events/AICDAEvent2.webp";
import event3 from "@/assets/Events/AICDAevent3.webp";
import event4 from "@/assets/Events/AICDAEvent4.webp";
import event5 from "@/assets/Events/AICDAEvent5.webp";
import event6 from "@/assets/Events/AICDAEvent6.webp";
import event7 from "@/assets/Events/AICDAEvent7.webp";
import event8 from "@/assets/Events/AICDAEvent8.webp";
import event9 from "@/assets/Events/AICDAEvent9.webp";
import event10 from "@/assets/Events/AICDAEvent10.webp";
import event11 from "@/assets/Events/AICDAEvent11.webp";
import event12 from "@/assets/Events/AICDAEvent12.webp";

export const Route = createFileRoute("/association-events")({
  head: () => ({
    meta: [
      { title: "Association Events · AICDA" },
      { name: "description", content: "National conventions, regional meets and skill workshops organised by AICDA." },
      { property: "og:title", content: "Association Events · AICDA" },
      { property: "og:description", content: "National conventions, regional meets and skill workshops organised by AICDA." },
    ],
  }),
  component: Page,
});

const EVENTS = [event1, event2, event3, event4, event5, event6, event7, event8, event9, event10, event11, event12].map(
  (src, i) => ({
    src,
    label: `Association Event ${i + 1}`,
  })
);

function Page() {
  const [openIndex, setOpenIndex] = useState(null);
  const current = openIndex !== null ? EVENTS[openIndex] : null;

  return (
    <PageShell title="Association Events" subtitle="National conventions, regional meets and skill workshops organised by AICDA.">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
        {EVENTS.map((event, i) => (
          <button
            key={event.src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] text-left cursor-pointer"
          >
            <img
              src={event.src}
              alt={event.label}
              className="aspect-[3/4] h-55 w-full object-contain object-top transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-xs sm:text-sm font-semibold px-3 py-2 text-center">
              {event.label}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-3xl border-none bg-black p-0 overflow-hidden">
          <DialogTitle className="sr-only">{current?.label ?? "Event"}</DialogTitle>
          {current && (
            <div className="relative">
              <img src={current.src} alt={current.label} className="max-h-[80vh] w-full object-contain bg-black" />
              {EVENTS.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous event"
                    onClick={() => setOpenIndex((i) => (i === null ? i : (i - 1 + EVENTS.length) % EVENTS.length))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white cursor-pointer hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next event"
                    onClick={() => setOpenIndex((i) => (i === null ? i : (i + 1) % EVENTS.length))}
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
