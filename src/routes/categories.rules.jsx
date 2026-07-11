import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

export const Route = createFileRoute("/categories/rules")({
  head: () => ({
    meta: [
      { title: "Rules · AICDA" },
      { name: "description", content: "Central Motor Vehicles Rules and dealer-specific compliance summarised." },
      { property: "og:title", content: "Rules · AICDA" },
      { property: "og:description", content: "Central Motor Vehicles Rules and dealer-specific compliance summarised." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell title="Rules" subtitle="Central Motor Vehicles Rules and dealer-specific compliance summarised.">
      <Prose>
          <h2>About Rules</h2>
          <h3 className="mb-[2px] font-bold">
            Dear Member,
          </h3>
          <p>
            On a commission deal the association will verify the role and share of earning of the dealers/dealers involved at the time of deal and then accordingly the shares for refund will be divided accordingly in case of any dispute.
          </p>
          <p>
            On a vehicle which has been purchased by a dealer and upon being sold if found wrong the concerned dealer without any share will refund the complete amount immediately.
          </p>
          <p>
            Any earnest money above Rs.1000/- is received by a dealer/dealers and the party does not come to mature the deal then the earnest money will be divided between all the dealers involved in the deal if earnest money is refunded at any stage it will be done accordingly.
          </p>
          <p>
            If two dealers reach a party together then the first dealer will have the first right two mature the deal and if he wishes he can put a share of the second dealer upon his choice in the deal.
          </p>
          <p>
            No dealer will deduct commission from any earnest money at any time.
          </p>
          <p>
            If a dealer sells or purchases a vehicle from a party then he should definitely collect the party's photo, Ration card, Driving License or passport photocopy or proof of credit card or latest bank A/C statement details. This is mandatory for all deals.
          </p>
          <p>
            All dealers should get the sold vehicle transferred in the buyer's name.
          </p>
          <p>
            Dealers should try their best to make the payment at the party's residence after proper verification.
          </p>
          <p>
            If a dealers shows a party vehicle to another dealer and the dealer purchases the vehicle directly or if a dealer takes a party to another dealers office/shop and the party purchases the vehicle from the dealer directly then the dealer who sells the vehicle to the party or the dealer who purchases the vehicle will be liable to pay the commission to that dealer.
          </p>
          <p>
            Total Boycott and total expulsion of a member if he does not agree to the association's ruling.
          </p>
          <p>
            Election to be held every 5 years.
          </p>
          <p>
            An advocate to be appointed by the association on the associations expenses.
          </p>
          <p>
            All members of committee should try to reach the person in trouble immediately without any delay.
          </p>
      </Prose>
    </PageShell>
  );
}
