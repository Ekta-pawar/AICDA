import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Share2, User } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/site/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPublicMembers } from "@/lib/member-api";

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
    designation: "National President AICDA",
    name: " J.S.Nayol",
    sOf: "Lt. M S Nayol",
    officeAddress: "CB-32B, Shalimar Bagh New Delhi-110088,",
    city: "New Delhi",
    state: "Delhi",
    companyTel: "8587036564",
    pNo: "0",
    residence: "BG/1,BLOCK,HOUSE NO.40D,SHALIMAR BAGH",
    residentTel: "",
    dateOfJoining: "2006",
    mobile: "9810027829, 9818691000",
    photo: null,
  },
  {
    designation: "",
    name: "KARTIKAY AHUJA",
    sOf: "SH ASHOK AHUJA",
    officeAddress:
      "MAIN ROAD SCHEME NO-3,NEAR SHRI GURU HARI KISHAN PUBLIC SCHOOL ALWAR RAJASTHAN -301001",
    city: "Alwar",
    state: "Rajasthan",
    companyTel: "",
    pNo: "0",
    residence: "",
    residentTel: "",
    dateOfJoining: "0000-00-00",
    mobile: "99828088815",
    photo: null,
  },
  {
    designation: " PRESIDENT-ALWAR",
    name: "ROHITASH",
    sOf: "SH.CHAGAN LAL",
    officeAddress:
      " MAIN ROAD, SCHEME NO-3, NEAR SHRI GURU HARI KISHAN PUBLIC SCHOOL- ALWAR RAJASTHAN",
    city: "ALWAR",
    state: "Rajasthan",
    companyTel: "",
    pNo: "",
    residence: " ALWAR RAJASTHAN",
    residentTel: "",
    dateOfJoining: "0000-00-00",
    mobile: "09829165050",
    photo: null,
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
    photo: null,
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
    photo: null,
  },
];

function matchesSearch(bearer, query) {
  if (!query.trim()) return true;
  const haystack = [
    bearer.name,
    bearer.designation,
    bearer.city,
    bearer.state,
    bearer.sOf,
    bearer.mobile,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function buildVCard(bearer) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${bearer.name.trim()}`,
    "ORG:AICDA",
    bearer.designation && `TITLE:${bearer.designation.trim()}`,
    bearer.companyTel && `TEL;TYPE=WORK,VOICE:${bearer.companyTel}`,
    bearer.mobile && `TEL;TYPE=CELL,VOICE:${bearer.mobile.split(",")[0].trim()}`,
    bearer.residentTel && `TEL;TYPE=HOME,VOICE:${bearer.residentTel}`,
    (bearer.officeAddress || bearer.city || bearer.state) &&
      `ADR;TYPE=WORK:;;${(bearer.officeAddress || "").replace(/,/g, "\\,")};${bearer.city || ""};${bearer.state || ""};;India`,
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\n");
}

function downloadVCard(bearer) {
  const blob = new Blob([buildVCard(bearer)], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${bearer.name.trim().replace(/\s+/g, "_")}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function cardSummary(bearer) {
  return [
    bearer.name.trim(),
    bearer.designation,
    bearer.officeAddress,
    [bearer.city, bearer.state].filter(Boolean).join(", "),
    bearer.mobile && `Mobile: ${bearer.mobile}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function shareCard(bearer) {
  const text = cardSummary(bearer);
  if (navigator.share) {
    try {
      await navigator.share({ title: bearer.name.trim(), text });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return; // user cancelled the share sheet
      // otherwise fall through to the clipboard fallback below
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Member details copied to clipboard");
  } catch {
    toast.error("Couldn't share or copy details");
  }
}

function DetailRow({ label, value }) {
  return (
    <p className="text-sm">
      <span className="font-bold text-foreground">{label} :</span>{" "}
      <span className="text-foreground/80">{value}</span>
    </p>
  );
}

function OfficeBearerSlide({ bearer }) {
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
        <div className="relative">
          <h3 className="text-center text-lg font-bold text-primary">Member Detail</h3>
          <div className="absolute right-0 top-0 flex gap-1">
            <button
              type="button"
              onClick={() => downloadVCard(bearer)}
              title="Download contact card"
              aria-label="Download contact card"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => shareCard(bearer)}
              title="Share card"
              aria-label="Share card"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-3 space-y-2">
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

function OfficeBearersList({ bearers }) {
  if (bearers.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No office bearers match your search.
      </p>
    );
  }

  return (
    <div className="mt-4 h-185 space-y-6 overflow-y-auto scrollbar-hide">
      {bearers.map((bearer, index) => (
        <OfficeBearerSlide key={`${bearer.name}-${index}`} bearer={bearer} />
      ))}
    </div>
  );
}

function isDisplayableUrl(value) {
  return typeof value === "string" && /^(https?:)?\/\//.test(value);
}

function MemberCard({ member }) {
  const location = [member.city?.cityName, member.state?.stateName].filter(Boolean).join(", ");
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
        {isDisplayableUrl(member.photo) ? (
          <img src={member.photo} alt={member.memberName} className="h-full w-full object-cover" />
        ) : (
          <User className="h-6 w-6 text-muted-foreground/40" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-bold text-foreground">{member.memberName}</p>
        {member.designation && (
          <p className="truncate text-sm text-primary">{member.designation}</p>
        )}
        {member.companyName && (
          <p className="truncate text-sm text-foreground/80">{member.companyName}</p>
        )}
        {location && <p className="truncate text-xs text-muted-foreground">{location}</p>}
      </div>
    </div>
  );
}

function AllMembers({ search }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPublicMembers()
      .then((data) => mounted && setMembers(data))
      .catch(() => mounted && setMembers([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;
    return members.filter((member) =>
      [
        member.memberName,
        member.designation,
        member.companyName,
        member.city?.cityName,
        member.state?.stateName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [members, search]);

  return (
    <div className="mt-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-foreground">All Members</h2>
        {!loading && (
          <p className="text-sm font-semibold text-primary">
            Total Members : <span className="text-foreground">{filteredMembers.length}</span>
          </p>
        )}
      </div>

      {loading ? (
        <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Loading members…
        </p>
      ) : filteredMembers.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No members match your search.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}

function Page() {
  const [search, setSearch] = useState("");
  const filteredBearers = useMemo(
    () => OFFICE_BEARERS.filter((bearer) => matchesSearch(bearer, search)),
    [search],
  );

  return (
    <PageShell
      title="Management Committee"
      subtitle="The elected office bearers and national executive of AICDA."
    >
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-foreground">National Office Bearers</h2>

        <div className="flex">
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-48 rounded-r-none focus-visible:ring-0 sm:w-64"
          />
          <Button type="button" variant="secondary" className="rounded-l-none border border-l-0">
            Search
          </Button>
        </div>
      </div>

      <OfficeBearersList bearers={filteredBearers} />

      <AllMembers search={search} />
    </PageShell>
  );
}
