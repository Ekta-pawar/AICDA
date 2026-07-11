import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

export const Route = createFileRoute("/categories/duplicate-rc")({
  head: () => ({
    meta: [
      { title: "Duplicate R.C. · AICDA" },
      { name: "description", content: "Procedure to apply for a duplicate Registration Certificate." },
      { property: "og:title", content: "Duplicate R.C. · AICDA" },
      { property: "og:description", content: "Procedure to apply for a duplicate Registration Certificate." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Duplicate R.C." subtitle="Procedure to apply for a duplicate Registration Certificate.">
      <Prose>
        <h2>DUPLICATE REGISTRATION CERTIFICATE
        </h2>
       
        <hr />
         <br/>
        <p>To be applied on form supported with tax certificate copy of FIR
        </p><p>
          and clearance of Financier (If required). Valid Insurance (Photo Copy)

        </p>
        <br/>
        <hr />
      </Prose>
    </PageShell>
  );
}