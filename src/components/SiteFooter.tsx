export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <p className="font-display text-3xl font-black uppercase leading-none text-text">
          Portfolio<span className="text-accent">.</span>
        </p>
        <p className="max-w-sm text-sm leading-6 text-muted">
          A reusable foundation for an owner-approved portfolio and practical-session journal.
        </p>
      </div>
    </footer>
  )
}
