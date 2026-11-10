import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { deleteProject, listAdminProjects, setProjectStatus } from '../services/projectAdmin'

type AdminProject = {
  id: string
  slug: string
  title: string
  category: string | null
  status: 'draft' | 'published'
  portfolio_featured_projects: { position: number }[] | null
}

export default function PortfolioAdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  async function refresh() {
    try {
      setProjects(await listAdminProjects() as AdminProject[])
      setAuthorized(true)
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Unable to load projects.'
      if (text.includes('authentication') || text.includes('access')) setAuthorized(false)
      else setError(text)
    } finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [])

  async function publication(project: AdminProject) {
    setBusy(project.id); setError(''); setMessage('')
    try {
      await setProjectStatus(project.id, project.status === 'draft' ? 'published' : 'draft')
      await refresh()
      setMessage(`"${project.title}" updated.`)
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update project.') }
    finally { setBusy(null) }
  }
  async function remove(project: AdminProject) {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return
    setBusy(project.id); setError('')
    try { await deleteProject(project.id); await refresh(); setMessage('Draft deleted.') }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to delete project.') }
    finally { setBusy(null) }
  }

  if (loading) return <p className="py-24 text-center text-muted" role="status">Loading project CMS...</p>
  if (authorized === false) return <Navigate to="/journal-admin/login" replace />
  const published = projects.filter((project) => project.status === 'published').length
  return <main className="space-y-8 pb-16">
    <header className="flex flex-wrap items-end justify-between gap-5"><div><Link to="/admin" className="text-sm text-accent hover:underline">← Admin Hub</Link><p className="mt-7 text-xs font-bold uppercase tracking-widest text-accent">Portfolio CMS</p><h1 className="mt-3 font-display text-5xl text-text sm:text-6xl">Software Projects</h1></div><Link to="/portfolio-admin/projects/new" className="rounded-lg bg-accent px-5 py-3 font-bold text-page">Create Project</Link></header>
    <div className="grid gap-4 sm:grid-cols-3">{[['Total', projects.length], ['Published', published], ['Drafts', projects.length - published]].map(([label, value]) => <div key={label} className="rounded-2xl bg-surface p-6"><p className="text-muted">{label}</p><p className="mt-2 text-4xl font-bold text-accent">{value}</p></div>)}</div>
    {error && <p className="rounded-lg border border-red-400/30 p-4 text-red-400" role="alert">{error}</p>}
    {message && <p className="rounded-lg border border-accent/30 p-4 text-accent" role="status">{message}</p>}
    <section className="rounded-2xl bg-surface p-5 sm:p-8"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-2xl font-bold text-text">Projects</h2><p className="mt-2 text-sm text-muted">Create, edit and publish software case studies.</p></div><Link to="/portfolio-admin/featured" className="text-sm font-bold text-accent hover:underline">Manage Featured →</Link></div>
      {projects.length === 0 ? <p className="py-10 text-center text-muted">No projects created yet.</p> : <div className="space-y-3">{projects.map((project) => <div key={project.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 p-4"><div><h3 className="font-bold text-text">{project.title}</h3><p className="mt-1 text-sm text-muted">{project.category ?? 'Uncategorised'} · <span className={project.status === 'published' ? 'text-accent' : 'text-muted'}>{project.status}</span>{project.portfolio_featured_projects?.[0] && ` · Featured #${project.portfolio_featured_projects[0].position}`}</p></div><div className="flex flex-wrap gap-3 text-sm"><Link to={`/portfolio-admin/projects/${project.id}/edit`} className="text-accent hover:underline">Edit</Link>{project.status === 'published' && <Link to={`/projects/${project.slug}`} target="_blank" className="text-accent hover:underline">View</Link>}<button type="button" disabled={busy === project.id} onClick={() => void publication(project)} className="text-text hover:text-accent disabled:opacity-50">{project.status === 'draft' ? 'Publish' : 'Unpublish'}</button>{project.status === 'draft' && <button type="button" disabled={busy === project.id} onClick={() => void remove(project)} className="text-red-400 disabled:opacity-50">Delete</button>}</div></div>)}</div>}
    </section>
  </main>
}
