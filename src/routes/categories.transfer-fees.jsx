import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

export const Route = createFileRoute("/categories/transfer-fees")({
  head: () => ({
    meta: [
      { title: "Transfer Fees · AICDA" },
      {
        name: "description",
        content: "State-wise ownership transfer fee schedules updated for the current year.",
      },
      { property: "og:title", content: "Transfer Fees · AICDA" },
      {
        property: "og:description",
        content: "State-wise ownership transfer fee schedules updated for the current year.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell
      title="Transfer Fees"
      subtitle="State-wise ownership transfer fee schedules updated for the current year."
    >
      <Prose>
        <h2>About Transfer Fees</h2>
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-white text-left text-2xl font-normal px-3 py-2 w-[70%]">
                Vehicle Type
              </th>
              <th className="border border-gray-300 bg-white text-left text-2xl font-normal px-3 py-2 w-[30%]">
                Fees
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-1">Scooter / Two Wheeler</td>
              <td className="border border-gray-300 px-3 py-1">30</td>
            </tr>

            <tr>
              <td className="border border-gray-300 px-3 py-1">Duplicate Book</td>
              <td className="border border-gray-300 px-3 py-1">30</td>
            </tr>

            <tr>
              <td className="border border-gray-300 px-3 py-1">H.P.A Endorsement</td>
              <td className="border border-gray-300 px-3 py-1">100</td>
            </tr>

            <tr>
              <td className="border border-gray-300 px-3 py-1">H.P.A Cancellation</td>
              <td className="border border-gray-300 px-3 py-1">100</td>
            </tr>

            <tr>
              <td className="border border-gray-300 px-3 py-1">Private Car</td>
              <td className="border border-gray-300 px-3 py-1">100</td>
            </tr>

            <tr>
              <td className="border border-gray-300 px-3 py-1">Duplicate Books</td>
              <td className="border border-gray-300 px-3 py-1">100</td>
            </tr>

            <tr>
              <td className="border border-gray-300 px-3 py-1">H.P.A Endorsement</td>
              <td className="border border-gray-300 px-3 py-1">100</td>
            </tr>

            <tr>
              <td className="border border-gray-300 px-3 py-1">H.P.A Cancellation</td>
              <td className="border border-gray-300 px-3 py-1">100</td>
            </tr>

            <tr>
              <td className="border border-gray-300 px-3 py-1">Imported M/Cycle</td>
              <td className="border border-gray-300 px-3 py-1">150</td>
            </tr>

            <tr>
              <td className="border border-gray-300 px-3 py-1">Duplicate Books</td>
              <td className="border border-gray-300 px-3 py-1">150</td>
            </tr>

            <tr>
              <td className="border border-gray-300 px-3 py-1">Imported Cars</td>
              <td className="border border-gray-300 px-3 py-1">400</td>
            </tr>

            <tr>
              <td className="border border-gray-300 px-3 py-1">Duplicate Books</td>
              <td className="border border-gray-300 px-3 py-1">400</td>
            </tr>
          </tbody>
        </table>
      </Prose>
    </PageShell>
  );
}
