import { portfolioContent } from '../content/portfolio'

export function SiteFooter() {
  const { footer } = portfolioContent

  return (
    <footer className="mt-10 px-0 pb-6">
      <div className="mx-auto grid max-w-[min(86vw,1240px)] gap-10 rounded-panel bg-surface px-7 py-12 sm:px-12 sm:py-14 min-[900px]:grid-cols-[0.8fr_1.2fr] min-[900px]:items-center min-[900px]:px-14 min-[900px]:py-16">
        <p className="font-display text-4xl font-black uppercase leading-[0.85] tracking-[-0.03em] text-text sm:text-5xl">
          {footer.name}<span className="text-accent">.</span>
        </p>
        <div className="max-w-2xl text-left min-[900px]:justify-self-end min-[900px]:text-right">
          <p className="font-display text-4xl font-black uppercase leading-[0.86] text-muted sm:text-5xl min-[1200px]:text-6xl">
            {footer.lines[0]}
          </p>
          <p className="font-display text-4xl font-black uppercase leading-[0.86] text-accent sm:text-5xl min-[1200px]:text-6xl">
            {footer.lines[1]}
          </p>
        </div>
      </div>
    </footer>
  )
}
