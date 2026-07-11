import { motion } from "framer-motion";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Sidebar } from "./Sidebar";
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

export function PageShell({ title, subtitle, children, hideSidebar }) {
  const bg = pickBanner(title);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <section className="relative overflow-hidden text-primary-foreground min-h-[420px] sm:min-h-[520px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bg})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-25" aria-hidden />
        <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent" aria-hidden />
        <div className="relative mx-auto flex max-w-7xl w-full flex-col items-center gap-6 px-4 py-16 text-center sm:py-24">
          <motion.h1
            initial={{ opacity: 0, y: 20, rotateX: -20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{ fontFamily: "'Playfair Display', serif", transformStyle: "preserve-3d" }}
            className="text-4xl sm:text-6xl font-black tracking-tight"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="max-w-2xl text-base sm:text-lg opacity-90"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </section>
      <main className="mx-auto max-w-7xl w-full px-4 py-10 flex-1">
        <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
          {!hideSidebar && <Sidebar />}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className={hideSidebar ? "lg:col-span-2" : ""}
          >
            {children}
          </motion.div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
