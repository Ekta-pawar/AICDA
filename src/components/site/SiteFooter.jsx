import { Link } from "@tanstack/react-router";
import { primaryNav } from "./nav-data";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-primary-deep text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <h3
            className="text-xl font-black mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            All India Car Dealers Association
          </h3>
          <p className="text-sm opacity-80 leading-relaxed">
            The apex body uniting authorized and independent car dealers across India — advocating
            for fair policy, transparent transfer procedures, and modern retail standards.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3 opacity-90">
            Quick Links
          </h4>
          <ul className="grid grid-cols-2 gap-y-1 text-sm">
            {primaryNav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="opacity-80 hover:opacity-100 hover:underline">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-3 opacity-90">
            Head Office
          </h4>
          <address className="not-italic text-sm opacity-80 leading-relaxed">
            CB-32B, OPP. RBI COLONY, SHALIMAR BAGH New Delhi — 110001, India
            <br />
            <span className="block mt-2">
              Phone: 9818691000, 9810027829, 8587036564, 8595288016
            </span>
            <span className="block">Email: info@aicda.in</span>
          </address>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} All India Car Dealers Association. All rights reserved.
      </div>
    </footer>
  );
}
