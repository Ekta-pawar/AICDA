import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";
import { getGalleryImages } from "@/lib/gallery-api";

export const Route = createFileRoute("/directory")({
  head: () => ({
    meta: [
      { title: "Dealer Directory · AICDA" },
      {
        name: "description",
        content:
          "Verified new & used car dealers across India — searchable by state and city.",
      },
      {
        property: "og:title",
        content: "Dealer Directory · AICDA",
      },
      {
        property: "og:description",
        content:
          "Verified new & used car dealers across India — searchable by state and city.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const response = await getGalleryImages("DIRECTORY");
        setImages(response.gallery || []);
      } catch (error) {
        console.error("Failed to load directory images:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, []);

  return (
    <PageShell
      title="Dealer Directory"
      subtitle="Verified new & used car dealers across India — searchable by state and city."
    >
      <Prose>
        <h2
          className="text-3xl font-black text-foreground mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Search the Directory
        </h2>
      </Prose>

      {loading ? (
        <div className="text-center py-10 text-lg">
          Loading...
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-10 text-lg text-gray-500">
          No Directory Images Found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-xl border border-border shadow-[var(--shadow-card)] bg-card"
            >
              <img
                src={image.imageUrl}
                alt={image.title}
                className="w-full h-72 object-cover"
              />

              <div className="p-4">
                <h3 className="font-semibold text-lg">
                  {image.title}
                </h3>

                {image.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {image.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}