import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, Share2, ThumbsUp, User } from "lucide-react";
import { toBlob, toJpeg } from "html-to-image";
import { toast } from "sonner";
import { PageShell } from "@/components/site/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MemberIdCard } from "@/components/site/MemberIdCard";
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

function mapMemberToBearer(member) {
  return {
    id: member.id,
    name: member.memberName || "",
    designation: member.designation || "",
    sOf: member.fatherName || "",
    officeAddress: member.companyAddress || "",
    city: member.city?.cityName || "",
    state: member.state?.stateName || "",
    companyTel: member.companyTelephone || "",
    pNo: member.packetNo || "",
    residence: member.residentialAddress || "",
    residentTel: member.residentialTelephone || "",
    dateOfJoining: member.dateOfJoining || "",
    mobile: member.mobile || "",
    memberId: member.memberId || "",
    validityFrom: member.validityFrom || "",
    validityTo: member.validityTo || "",
    photo: isDisplayableUrl(member.photo) ? member.photo : null,
  };
}

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

async function downloadCardAsJpg(node, fileName) {
  const dataUrl = await toJpeg(node, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    cacheBust: true,
    filter: (el) => el.dataset?.exportIgnore !== "true",
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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

async function shareCard(bearer, node) {
  const title = bearer.name.trim() || "AICDA Member";
  const text = cardSummary(bearer);

  let file = null;
  if (node) {
    try {
      const blob = await toBlob(node, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });
      if (blob) {
        const fileName = `${title.replace(/\s+/g, "_")}.jpg`;
        file = new File([blob], fileName, { type: "image/jpeg" });
      }
    } catch {
      // fall through to text sharing below
    }
  }

  if (file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title, text, files: [file] });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return; // user cancelled the share sheet
      // otherwise fall through to the text-only share below
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    toast.success("Member details copied to clipboard");
  } catch {
    toast.error("Couldn't share the card. Please try again.");
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
  const idCardRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleDownload = async () => {
    if (!idCardRef.current || exporting) return;
    setExporting(true);
    try {
      const fileName = `${bearer.name.trim().replace(/\s+/g, "_") || "member"}.jpg`;
      await downloadCardAsJpg(idCardRef.current, fileName);
    } catch {
      toast.error("Couldn't generate the image. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      await shareCard(bearer, idCardRef.current);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-[220px_1fr]">
      <div className="flex w-full items-start justify-center lg:h-45 sm:h-45 overflow-hidden rounded-lg">
        {bearer.photo ? (
          <img
            src={bearer.photo}
            alt={bearer.name}
            className="w-full object-contain"
            crossOrigin="anonymous"
          />
        ) : (
          <User className="h-16 w-16 text-muted-foreground/40" />
        )}
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-(--shadow-card)">
        <div className="relative">
          <h3 className="text-center text-lg font-bold text-primary">Member Detail</h3>
          <div className="absolute right-0 top-0 flex gap-1">
            <button
              type="button"
              onClick={handleDownload}
              disabled={exporting}
              title="Download ID card"
              aria-label="Download ID card"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              title="Share card"
              aria-label="Share card"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
            >
              {sharing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
            </button>
            {isValidityActive(bearer.validityTo) && (
              <span
                title="Membership valid"
                aria-label="Membership valid"
                className="flex items-center rounded-md p-1.5 text-emerald-600"
              >
                <ThumbsUp className="h-4 w-4" />
              </span>
            )}
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

      {/* Rendered off-screen purely so it can be captured as the downloaded JPG */}
      <div aria-hidden="true" style={{ position: "fixed", top: 0, left: "-9999px", zIndex: -1 }}>
        <MemberIdCard bearer={bearer} cardRef={idCardRef} />
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
        <OfficeBearerSlide key={bearer.id || `${bearer.name}-${index}`} bearer={bearer} />
      ))}
    </div>
  );
}

function isDisplayableUrl(value) {
  return typeof value === "string" && /^(https?:)?\/\//.test(value);
}

function isValidityActive(validityTo) {
  if (!validityTo) return false;
  const expiry = new Date(validityTo);
  if (Number.isNaN(expiry.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiry >= today;
}

function Page() {
  const [search, setSearch] = useState("");
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

  const officeBearers = useMemo(() => members.map(mapMemberToBearer), [members]);
  const filteredBearers = useMemo(
    () => officeBearers.filter((bearer) => matchesSearch(bearer, search)),
    [officeBearers, search],
  );

  return (
    <PageShell
      title="Management Committee"
      subtitle="The elected office bearers and national executive of AICDA."
    >
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-foreground">All Members</h2>

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

      {loading ? (
        <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Loading office bearers…
        </p>
      ) : (
        <OfficeBearersList bearers={filteredBearers} />
      )}
    </PageShell>
  );
}
