import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";
import maneg1 from "@/assets/Member/maneg1.webp";
import member2 from "@/assets/Member/member2.webp";
import memberAICDA2 from "@/assets/Member/memberAICDA2.webp";

export const Route = createFileRoute("/directory")({
  head: () => ({
    meta: [
      { title: "Dealer Directory · AICDA" },
      { name: "description", content: "Verified new & used car dealers across India — searchable by state and city." },
      { property: "og:title", content: "Dealer Directory · AICDA" },
      { property: "og:description", content: "Verified new & used car dealers across India — searchable by state and city." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Dealer Directory" subtitle="Verified new & used car dealers across India — searchable by state and city.">
      <Prose>
              <h2 className="text-3xl font-black text-foreground mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Search the Directory</h2>
          
      </Prose>

      <div className="overflow-x-auto scrollbar-hide mt-6 h-87">
        <img src={maneg1} alt="AICDA Management" className="h-auto w-full max-w-none rounded-xl border border-border shadow-[var(--shadow-card)]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        <div className="overflow-x-auto scrollbar-hide mt-6 h-73">
        <img src={member2} alt="AICDA Member" className="w-full rounded-xl border border-border shadow-[var(--shadow-card)] object-cover " />
        </div>
        <div className="overflow-x-auto scrollbar-hide mt-6 h-85">
        <img src={memberAICDA2} alt="AICDA Member" className="w-full rounded-xl border border-border shadow-[var(--shadow-card)] object-cover" />
      </div>
      </div>

    </PageShell>
  );
}
