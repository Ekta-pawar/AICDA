import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

export const Route = createFileRoute("/image")({
  head: () => ({
    meta: [
      { title: "Image Gallery · AICDA" },
      { name: "description", content: "A visual record of AICDA conventions, meetings and dealer felicitations." },
      { property: "og:title", content: "Image Gallery · AICDA" },
      { property: "og:description", content: "A visual record of AICDA conventions, meetings and dealer felicitations." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Image Gallery" subtitle="A visual record of AICDA conventions, meetings and dealer felicitations.">
      <Prose>
          <h2>Gallery</h2>
          <p>Browse memorable moments from our national conventions, regional summits, honour ceremonies and community outreach programmes. New albums are added after every major event.</p>
          <ul><li>25th National Convention — 42 photos</li><li>Delhi Chapter AGM — 28 photos</li><li>Karnataka Dealer Awards — 34 photos</li><li>Scrappage Policy Roundtable — 18 photos</li></ul>
      </Prose>
    </PageShell>
  );
}
