export function Prose({ children }) {
  return (
    <div className="prose w-full max-w-none px-[2px] text-foreground/85 leading-relaxed sm:px-4 lg:px-0 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:mb-3 [&_h2]:text-foreground [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-primary [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_ol]:mb-4">
      {children}
    </div>
  );
}

export function InfoCard({ title, children }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
      <div className="text-foreground/80 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
