import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { User } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";

export const Route = createFileRoute("/management")({
  head: () => ({
    meta: [
      { title: "Management Committee · AICDA" },
      {
        name: "description",
        content: "The elected office bearers and national executive of AICDA.",
      },
      { property: "og:title", content: "Management Committee · AICDA" },
      {
        property: "og:description",
        content: "The elected office bearers and national executive of AICDA.",
      },
    ],
  }),
  component: Page,
});

// TODO: replace `photo` with an imported image (e.g. `photo: officeBearer1`) once real photographs are supplied.
const OFFICE_BEARERS = [
  {
    designation: "President",
    name: "Shri Rajinder Singh Sethi",
    sOf: "",
    officeAddress: "",
    city: "",
    state: "",
    companyTel: "",
    pNo: "",
    residence: "",
    residentTel: "",
    dateOfJoining: "0000-00-00",
    mobile: "",
    photo: null as string | null,
  },
  {
    designation: "Vice President",
    name: "Shri Anil Kumar Agrawal",
    sOf: "",
    officeAddress: "",
    city: "",
    state: "",
    companyTel: "",
    pNo: "",
    residence: "",
    residentTel: "",
    dateOfJoining: "0000-00-00",
    mobile: "",
    photo: null as string | null,
  },
  {
    designation: "General Secretary",
    name: "Shri Vinay Sharma",
    sOf: "",
    officeAddress: "",
    city: "",
    state: "",
    companyTel: "",
    pNo: "",
    residence: "",
    residentTel: "",
    dateOfJoining: "0000-00-00",
    mobile: "",
    photo: null as string | null,
  },
  {
    designation: "Treasurer",
    name: "Smt. Preeti Malhotra",
    sOf: "",
    officeAddress: "",
    city: "",
    state: "",
    companyTel: "",
    pNo: "",
    residence: "",
    residentTel: "",
    dateOfJoining: "0000-00-00",
    mobile: "",
    photo: null as string | null,
  },
  {
    designation: "Joint Secretary",
    name: "Shri Mohammed Iqbal",
    sOf: "",
    officeAddress: "",
    city: "",
    state: "",
    companyTel: "",
    pNo: "",
    residence: "",
    residentTel: "",
    dateOfJoining: "0000-00-00",
    mobile: "",
    photo: null as string | null,
  },
];

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm">
      <span className="font-bold text-foreground">{label} :</span>{" "}
      <span className="text-foreground/80">{value}</span>
    </p>
  );
}

function OfficeBearerSlide({ bearer }: { bearer: (typeof OFFICE_BEARERS)[number] }) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-[220px_1fr]">
      <div className="flex h-64 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted sm:h-auto">
        {bearer.photo ? (
          <img src={bearer.photo} alt={bearer.name} className="h-full w-full object-cover" />
        ) : (
          <User className="h-16 w-16 text-muted-foreground/40" />
        )}
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h3 className="text-center text-lg font-bold text-primary">Member Detail</h3>
        {/* <p className="mb-4 text-center text-sm text-foreground/70">National Office Bearer</p> */}
        {/* <div className="space-y-2.5" style={{ fontFamily: "'Playfair Display', serif" }}>
          <p className="!font-sans text-base font-black text-foreground">{bearer.name}</p>
        </div> */}
        <div className="mt-3 grid grid-cols-1 gap-y-2.5 sm:grid-cols-2 sm:gap-x-6">
          <DetailRow label="Designation" value={bearer.designation} />
          <DetailRow label="S/o" value={bearer.sOf} />
          <DetailRow label="Office Address" value={bearer.officeAddress} />
          <DetailRow label="City" value={bearer.city} />
          <DetailRow label="State" value={bearer.state} />
          <DetailRow label="Company Tel" value={bearer.companyTel} />
          <DetailRow label="P.No." value={bearer.pNo} />
          <DetailRow label="Residence" value={bearer.residence} />
          <DetailRow label="Resident Tel" value={bearer.residentTel} />
          <DetailRow label="Date of Joining" value={bearer.dateOfJoining} />
          <DetailRow label="Mobile" value={bearer.mobile} />
        </div>
      </div>
    </div>
  );
}

function OfficeBearersAutoScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const speed = 40; // pixels per second
    let frame: number;
    let last = performance.now();

    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      const half = el.scrollHeight / 2;
      el.scrollTop += speed * dt;
      if (el.scrollTop >= half) {
        el.scrollTop -= half;
      }

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={scrollRef}
      className="mt-4 h-185 space-y-6 overflow-y-auto scrollbar-hide"
      onWheel={(e) => e.preventDefault()}
    >
      {[...OFFICE_BEARERS, ...OFFICE_BEARERS].map((bearer, index) => (
        <OfficeBearerSlide key={`${bearer.name}-${index}`} bearer={bearer} />
      ))}
    </div>
  );
}

function Page() {
  return (
    <PageShell
      title="Management Committee"
      subtitle="The elected office bearers and national executive of AICDA."
    >
      <Prose>
        <h2>National Office Bearers</h2>
      </Prose>

      <OfficeBearersAutoScroll />
    </PageShell>
  );
}
