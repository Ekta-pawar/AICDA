import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

export const Route = createFileRoute("/categories/emi-calculator")({
  head: () => ({
    meta: [
      { title: "EMI Calculator · AICDA" },
      { name: "description", content: "Estimate the monthly instalment for your car loan." },
      { property: "og:title", content: "EMI Calculator · AICDA" },
      { property: "og:description", content: "Estimate the monthly instalment for your car loan." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="EMI Calculator" subtitle="Estimate the monthly instalment for your car loan.">
      <Prose>
        <h2>About EMI Calculator</h2>
        <p>
          (1,00,000.00) Reducing Interest 12 24 36 48 60 10.00% 8719 4576 3199 2515 2107 10.25% 8728
          4586 3210 2526 2118 10.50% 8738 4597 3221 2537 2130
        </p>
      </Prose>
    </PageShell>
  );
}
