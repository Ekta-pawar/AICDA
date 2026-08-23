import { motion } from "framer-motion";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Sidebar } from "./Sidebar";
import { useBanner } from "@/hooks/use-banners";
import banner1 from "@/assets/AICDA13-2.webp.asset.json";
import banner2 from "@/assets/AICDA12-2.webp.asset.json";
import banner3 from "@/assets/AICDA11-2.webp.asset.json";
import banner4 from "@/assets/AICDA10-2.webp.asset.json";
import banner5 from "@/assets/AICDA9-2.webp.asset.json";
import banner6 from "@/assets/AICDA8-2.webp.asset.json";
import banner7 from "@/assets/AICDA6.webp.asset.json";

const BANNERS = [banner1, banner2, banner3, banner4, banner5, banner6, banner7];

function pickBanner(key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return BANNERS[h % BANNERS.length].url;
}

export function PageShell({ title, children, hideSidebar, bannerKey }) {
  const adminBanner = useBanner(bannerKey);
  const bg = adminBanner || pickBanner(title);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="relative flex min-h-[420px] items-center overflow-hidden text-primary-foreground sm:min-h-[520px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-25" aria-hidden />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{ fontFamily: "'Playfair Display', serif", transformStyle: "preserve-3d" }}
            className="text-4xl sm:text-6xl font-black tracking-tight"
          >
            {title}
          </motion.h1>
        </div>
      </section>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_16rem] lg:gap-8">
          {!hideSidebar && <Sidebar className="lg:order-2" />}
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className={`w-full lg:order-1 ${hideSidebar ? "lg:col-span-2" : ""}`}
          >
            {children}
          </motion.div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
