import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getGalleryImages } from "@/lib/gallery-api";

export const Route = createFileRoute("/association-events")({
  head: () => ({
    meta: [
      { title: "Association Events · AICDA" },
      {
        name: "description",
        content:
          "National conventions, regional meets and skill workshops organised by AICDA.",
      },
      {
        property: "og:title",
        content: "Association Events · AICDA",
      },
      {
        property: "og:description",
        content:
          "National conventions, regional meets and skill workshops organised by AICDA.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getGalleryImages("ASSOCIATION");
        setEvents(response.gallery || []);
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const current = openIndex !== null ? events[openIndex] : null;

  if (loading) {
    return (
      <PageShell
        title="Association Events"
        subtitle="Loading..."
      >
        <div className="py-20 text-center text-lg">
          Loading Association Events...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Association Events"
      subtitle="National conventions, regional meets and skill workshops organised by AICDA."
    >
      {events.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground text-lg">
          No Association Events Found
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <button
              key={event.id}
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] text-left cursor-pointer"
            >
              <img
                src={event.imageUrl}
                alt={event.title}
                className="aspect-[3/4] h-55 w-full object-contain object-top transition-transform duration-300 group-hover:scale-105"
              />

              <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-xs sm:text-sm font-semibold px-3 py-2 text-center">
                {event.title}
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
                src={current.imageUrl}
                alt={current.title}
                className="max-h-[80vh] w-full object-contain bg-black"
              />

              {events.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() =>
                      setOpenIndex((i) =>
                        i === null
                          ? i
                          : (i - 1 + events.length) % events.length
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
                      setOpenIndex((i) =>
                        i === null ? i : (i + 1) % events.length
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