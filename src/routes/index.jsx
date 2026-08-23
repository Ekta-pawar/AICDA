import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, Users, FileText, Award, Newspaper, Bold } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Sidebar } from "@/components/site/Sidebar";
import { useBanner } from "@/hooks/use-banners";
import heroBanner from "@/assets/AICDA8-2.webp.asset.json";
import aicdaLogo from "@/assets/logoAICDA.png";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const adminHeroBanner = useBanner("home");
  const heroBannerUrl = adminHeroBanner || heroBanner.url;
  const features = [
    {
      icon: Users,
      title: "Members",
      text: "Dealers, showrooms and pre-owned specialists across every state.",
    },
    {
      icon: ShieldCheck,
      title: "Consumer Trust",
      text: "Code-of-conduct and grievance redressal for buyers nationwide.",
    },
    {
      icon: FileText,
      title: "RTO Assistance",
      text: "Transfer, NOC, duplicate RC and registration made simple.",
    },
    {
      icon: Award,
      title: "Policy Advocacy",
      text: "Voice of the trade before Ministry of Road Transport & Highways.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden text-primary-foreground">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBannerUrl})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-30" aria-hidden />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="flex items-center justify-center gap-6 px-4 sm:px-0">
            <motion.div
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="hidden sm:block shrink-0"
            >
              {/* <img src={aicdaLogo} alt="AICDA India logo" className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-full bg-white/90 p-2 ring-4 ring-white/40" /> */}
            </motion.div>
            <div className="max-w-4xl flex flex-col items-center text-center">
              <motion.h1
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                All India Car Dealers Association
              </motion.h1>
              {/* <motion.p
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="mt-3 text-sm sm:text-base font-semibold uppercase tracking-[0.2em] opacity-80"
              >
                — Est. Serving Car Dealers Across India —
              </motion.p> */}
              {/* <motion.p
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="mt-5 text-base sm:text-lg font-semibold opacity-90 max-w-xl leading-relaxed"
              >
                Uniting India's automobile dealers under a single professional banner — advancing
                fair trade, transparent transfers and modern retail standards from Kashmir to
                Kanyakumari.
              </motion.p> */}
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="mt-8 flex flex-wrap justify-center gap-3"
              >
                <Link
                  to="/about"
                  className="px-6 py-3 rounded-lg bg-primary-foreground text-primary font-bold shadow-[var(--shadow-elegant)] hover:scale-[1.03] transition"
                >
                  About the Association
                </Link>
                <Link
                  to="/directory"
                  className="px-6 py-3 rounded-lg ring-1 ring-primary-foreground/40 font-bold hover:bg-primary-foreground/10 transition"
                >
                  Browse Dealer Directory
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 -mt-10  relative z-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={false}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="tilt-3d rounded-2xl bg-card border border-border p-6 shadow-[var(--shadow-card)]"
            >
              <f.icon className="w-8 h-8 text-primary mb-3" />
              <div className="font-bold text-foreground">{f.title}</div>
              <p className="text-sm text-muted-foreground mt-1">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <main className="mx-auto max-w-7xl w-full px-4 py-16 flex-1">
        <div className="grid gap-8 lg:grid-cols-[1fr_16rem]">
          <Sidebar className="lg:order-2" />
          <div className="space-y-10 lg:order-1">
            <motion.div
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2
                className="text-3xl font-black text-foreground mb-6 px-2 sm:px-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Welcome to AICDA
              </h2>
              <div className="text-foreground/80 leading-relaxed px-2 sm:px-2">
                <h4 className="mb-[9px] font-bold">Dear Member,</h4>
                <p className="mb-[9px]">
                  If you have any problem regarding your vehicle in any of the Transport Authority,
                  please contact the concerned MLO along with your identity card & discuss the
                  problem with him. In case it is not resolved, contact the President and he shall
                  pursue the matter through secretary along with you to solve the problem through
                  proper channel.
                </p>
                <h3 className="mb-[9px] font-bold">President</h3>

                <h4>
                  Phone:9818691000
                  <br />
                  Mobile: 9818691000,9810027829
                </h4>
              </div>
            </motion.div>

            <motion.div
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid gap-6 md:grid-cols-2"
            >
              <Link
                to="/association-events"
                className="tilt-3d group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
              >
                <Newspaper className="w-8 h-8 text-primary mb-3" />
                <div className="text-xl font-bold group-hover:text-primary transition">
                  Latest Events
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Annual convention, regional meets, dealer skill workshops and industry conclaves.
                </p>
              </Link>
              <Link
                to="/political-achievements"
                className="tilt-3d group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
              >
                <Award className="w-8 h-8 text-primary mb-3" />
                <div className="text-xl font-bold group-hover:text-primary transition">
                  Political Achievements
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Policy wins on GST rationalisation, scrappage norms and dealer licensing reforms.
                </p>
              </Link>
            </motion.div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
