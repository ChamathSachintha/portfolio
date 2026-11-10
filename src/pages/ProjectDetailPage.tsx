import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPublishedProject } from '../services/projects'
import type { PortfolioProject, ProjectMedia } from '../types/project'

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<(PortfolioProject & { media: ProjectMedia[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    getPublishedProject(slug).then((value) => setProject(value as (PortfolioProject & { media: ProjectMedia[] }) | null)).catch((err) => {
      console.error('Project loading failed:', err)
      setError('Unable to load this project.')
    }).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <p className="py-24 text-center text-muted" role="status">Loading project...</p>
  if (error) return <p className="py-24 text-center text-red-400" role="alert">{error}</p>
  if (!project) return <section className="py-24 text-center"><h1 className="font-display text-5xl text-text">Project Not Found</h1><Link className="mt-6 inline-block text-accent underline" to="/projects">Back to Projects</Link></section>

  const media = project.media ?? []
  const links = [
    ['GitHub', project.github_url],
    ['Live Demo', project.live_url],
    ['Figma', project.figma_url],
    ['Other Link', project.other_url],
  ].filter((item): item is [string, string] => Boolean(item[1]))
  const hero = media.find((item) => item.media_type === 'hero' && item.url)

  return <article className="space-y-12 pb-16">
    <Link to="/projects" className="text-sm text-accent hover:underline">← Back to Projects</Link>
    <header className="rounded-2xl bg-surface p-7 sm:p-12">
      <p className="text-sm font-bold uppercase tracking-widest text-accent">{project.category ?? 'Software Project'}</p>
      <h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.9] text-text sm:text-7xl">{project.title}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{project.short_description}</p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm text-accent">{project.technologies.map((technology) => <span key={technology.id} className="rounded-full border border-accent/40 px-3 py-1">{technology.name}</span>)}</div>
    </header>
    {hero?.url && <img src={hero.url} alt={hero.alt_text || project.title} className="max-h-[42rem] w-full rounded-2xl object-contain" />}
    <div className="grid gap-10 lg:grid-cols-[1fr_0.35fr]">
      <div className="space-y-10">
        {[
          ['Overview', project.overview],
          ['My Contribution', project.contribution],
          ['Challenges', project.challenges],
          ['Lessons Learned', project.lessons_learned],
        ].filter((item): item is [string, string] => Boolean(item[1])).map(([heading, body]) => <section key={heading}><h2 className="font-display text-4xl text-accent">{heading}</h2><p className="mt-4 whitespace-pre-line leading-8 text-text">{body}</p></section>)}
        {project.features.length > 0 && <section><h2 className="font-display text-4xl text-accent">Key Features</h2><ul className="mt-5 space-y-4">{project.features.map((feature) => <li key={feature.id} className="rounded-xl bg-surface p-5"><h3 className="font-bold text-text">{feature.title}</h3>{feature.description && <p className="mt-2 leading-7 text-muted">{feature.description}</p>}</li>)}</ul></section>}
        {project.content_sections.map((section) => <section key={section.id}><h2 className="font-display text-4xl text-accent">{section.title}</h2><p className="mt-4 whitespace-pre-line leading-8 text-text">{section.body}</p></section>)}
      </div>
      <aside className="space-y-5 rounded-2xl bg-surface p-6"><div><p className="text-xs uppercase tracking-widest text-muted">Project type</p><p className="mt-2 font-bold capitalize text-text">{project.project_type}</p></div>{project.role && <div><p className="text-xs uppercase tracking-widest text-muted">Role</p><p className="mt-2 text-text">{project.role}</p></div>}{links.length > 0 && <div className="flex flex-col gap-3">{links.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="font-bold text-accent hover:underline">{label} ↗</a>)}</div>}</aside>
    </div>
    {media.filter((item) => item.media_type !== 'hero' && item.url).length > 0 && <section><h2 className="font-display text-4xl text-accent">Screenshots</h2><div className="mt-6 grid gap-5 sm:grid-cols-2">{media.filter((item) => item.media_type !== 'hero' && item.url).map((item) => <figure key={item.id} className="overflow-hidden rounded-xl bg-surface"><a href={item.url ?? '#'} target="_blank" rel="noreferrer"><img src={item.url ?? ''} alt={item.alt_text || project.title} className="w-full object-contain" loading="lazy" /></a>{item.caption && <figcaption className="p-4 text-sm text-muted">{item.caption}</figcaption>}</figure>)}</div></section>}
  </article>
}
