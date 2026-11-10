import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { listAdminProjects, saveFeaturedProjects } from '../services/projectAdmin'

type Project = {
  id: string
  title: string
  status: 'draft' | 'published'
  portfolio_featured_projects: { position: number }[] | null
}

export default function PortfolioAdminFeaturedPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selected, setSelected] = useState<(string | null)[]>([null, null, null])
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    listAdminProjects()
      .then((items) => {
        const rows = items as Project[]
        setProjects(rows)
        setSelected([1, 2, 3].map((position) =>
          rows.find((item) =>
            item.portfolio_featured_projects?.[0]?.position === position
          )?.id ?? null
        ))
        setAuthorized(true)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load featured projects.')
        setAuthorized(false)
      })
  }, [])

  if (authorized === false) return <Navigate to="/journal-admin/login" replace />
  if (authorized === null) {
    return <p className="py-24 text-center text-muted" role="status">Loading featured projects...</p>
  }

  const published = projects.filter((project) => project.status === 'published')

  return (
    <main className="mx-auto max-w-4xl space-y-8 pb-16">
      <header>
        <Link to="/portfolio-admin/projects" className="text-sm text-accent hover:underline">
          ← Back to Projects
        </Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-accent">Portfolio CMS</p>
        <h1 className="mt-3 font-display text-5xl text-text sm:text-6xl">Homepage Featured</h1>
        <p className="mt-4 text-muted">
          Choose the three published projects shown on the homepage.
        </p>
      </header>

      <section className="space-y-5 rounded-2xl bg-surface p-6 sm:p-8">
        {selected.map((projectId, index) => (
          <label key={index} className="block text-sm text-text">
            Position {index + 1}
            <select
              className="mt-2 w-full rounded-lg border border-white/20 bg-[#131313] px-4 py-3 text-text"
              value={projectId ?? ''}
              onChange={(event) => setSelected((items) =>
                items.map((item, itemIndex) =>
                  itemIndex === index ? event.target.value || null : item
                )
              )}
            >
              <option value="">Empty</option>
              {published
                .filter((project) => !selected.includes(project.id) || project.id === projectId)
                .map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
            </select>
          </label>
        ))}
        {error && <p className="text-red-400" role="alert">{error}</p>}
        {message && <p className="text-accent" role="status">{message}</p>}
        <button
          type="button"
          className="rounded-lg bg-accent px-6 py-3 font-bold text-page"
          onClick={() => void saveFeaturedProjects(selected)
            .then(() => setMessage('Featured selection saved.'))
            .catch((err) => setError(err instanceof Error ? err.message : 'Unable to save selection.'))}
        >
          Save Selection
        </button>
      </section>
    </main>
  )
}
