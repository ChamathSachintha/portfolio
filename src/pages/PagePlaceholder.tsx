import { LinkButton } from '../components/Button'

type PagePlaceholderProps = {
  eyebrow: string
  title: string
  description: string
  action?: { label: string; to: string }
}

export function PagePlaceholder({
  eyebrow,
  title,
  description,
  action,
}: PagePlaceholderProps) {
  return (
    <section className="rounded-panel bg-surface p-8 shadow-panel sm:p-12 lg:p-20">
      <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-accent">
        {eyebrow}
      </p>
      <h1 className="max-w-4xl font-display text-5xl font-black uppercase leading-[0.9] tracking-tight text-text sm:text-7xl">
        {title}
      </h1>
      <p className="mt-7 max-w-2xl text-base leading-7 text-muted">{description}</p>
      {action ? <LinkButton className="mt-8" to={action.to}>{action.label}</LinkButton> : null}
    </section>
  )
}
