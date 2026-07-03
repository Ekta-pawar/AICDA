import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

export const Route = createFileRoute("/management")({
  head: () => ({
    meta: [
      { title: "Management Committee · AICDA" },
      { name: "description", content: "The elected office bearers and national executive of AICDA." },
      { property: "og:title", content: "Management Committee · AICDA" },
      { property: "og:description", content: "The elected office bearers and national executive of AICDA." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Management Committee" subtitle="The elected office bearers and national executive of AICDA.">
      <Prose>
          <h2>National Office Bearers</h2>
          <ul><li>President — Shri Rajinder Singh Sethi</li><li>Vice President — Shri Anil Kumar Agrawal</li><li>General Secretary — Shri Vinay Sharma</li><li>Treasurer — Smt. Preeti Malhotra</li><li>Joint Secretary — Shri Mohammed Iqbal</li></ul>
          <h2>Executive Committee</h2>
          <p>The 21-member national executive represents every zone of the country and meets quarterly to review policy, member services and outreach.</p>
      </Prose>
    </PageShell>
  );
}