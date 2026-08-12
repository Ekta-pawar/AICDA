export function SectionPlaceholder({ section }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <h2 className="text-xl font-bold">{section}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Manage your AICDA {section.toLowerCase()} from this area. This section is ready for its
        content and data integration.
      </p>
    </div>
  );
}
