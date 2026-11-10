import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProjectCard } from '../components/ProjectCard'
import { getPublishedProjects } from '../services/projects'
import type { ProjectCardData } from '../types/project'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    getPublishedProjects().then(setProjects).catch((err) => {
      console.error('Projects loading failed:', err)
      setError('Unable to load projects right now.')
    }).finally(() => setLoading(false))
  }, [])
  return <div className="space-y-8">
    <header className="rounded-panel bg-surface p-8 sm:p-12"><p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Projects</p><h1 className="mt-4 font-display text-5xl font-black uppercase leading-[0.9] text-text sm:text-7xl">Selected Work</h1><p className="mt-6 max-w-2xl leading-7 text-muted">Software projects, experiments and case studies built through code, collaboration and design.</p></header>
    {loading && <p className="py-12 text-center text-muted" role="status">Loading projects...</p>}
    {error && <p className="rounded-xl border border-red-400/30 p-6 text-red-400" role="alert">{error}</p>}
    {!loading && !error && projects.length === 0 && <p className="rounded-panel bg-surface p-10 text-center text-muted">No published projects yet.</p>}
    {!loading && !error && projects.length > 0 && <div className="grid gap-5 min-[768px]:grid-cols-2 min-[1200px]:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>}
    <Link to="/" className="inline-block text-sm font-bold text-accent hover:underline">← Back home</Link>
  </div>
}
