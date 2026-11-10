import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { createProject, getAdminMedia, getAdminProject, updateProject, uploadProjectMedia, updateProjectMedia, deleteProjectMedia, setProjectThumbnail, clearProjectThumbnail } from '../services/projectAdmin'
import type { ProjectDraftInput, ProjectFeature, ProjectSection, ProjectMedia } from '../types/project'

const blank: ProjectDraftInput = { title: '', slug: '', short_description: '', overview: '', category: '', project_type: 'individual', role: '', contribution: '', challenges: '', lessons_learned: '', github_url: '', live_url: '', figma_url: '', other_url: '', technologies: [], features: [], content_sections: [] }
const inputClass = 'w-full rounded-lg border border-white/20 bg-[#131313] px-4 py-3 text-text outline-none focus:border-accent'
const id = () => crypto.randomUUID()

export default function PortfolioAdminProjectEditorPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState(blank)
  const [media, setMedia] = useState<ProjectMedia[]>([])
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(Boolean(projectId))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!projectId) { setAuthorized(true); return }
    Promise.all([getAdminProject(projectId), getAdminMedia(projectId)]).then(([project, images]) => {
      if (!project) throw new Error('Project not found.')
      setForm({ title: project.title, slug: project.slug, short_description: project.short_description, overview: project.overview ?? '', category: project.category ?? '', project_type: project.project_type, role: project.role ?? '', contribution: project.contribution ?? '', challenges: project.challenges ?? '', lessons_learned: project.lessons_learned ?? '', github_url: project.github_url ?? '', live_url: project.live_url ?? '', figma_url: project.figma_url ?? '', other_url: project.other_url ?? '', technologies: project.technologies.map((item) => item.name), features: project.features, content_sections: project.content_sections })
      setMedia(images as ProjectMedia[]); setAuthorized(true)
    }).catch((err) => { setError(err instanceof Error ? err.message : 'Unable to load project.'); setAuthorized(false) }).finally(() => setLoading(false))
  }, [projectId])

  function field<K extends keyof ProjectDraftInput>(name: K, value: ProjectDraftInput[K]) { setForm((current) => ({ ...current, [name]: value })) }
  function addFeature() { field('features', [...form.features, { id: id(), title: '', description: '', sort_order: form.features.length }]) }
  function addSection() { field('content_sections', [...form.content_sections, { id: id(), title: '', body: '', sort_order: form.content_sections.length }]) }
  function updateList<T extends ProjectFeature | ProjectSection>(name: 'features' | 'content_sections', index: number, value: Partial<T>) { field(name, form[name].map((item, itemIndex) => itemIndex === index ? { ...item, ...value } : item) as ProjectDraftInput[typeof name]) }
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setMessage('')
    try {
      if (projectId) await updateProject(projectId, form)
      else { const created = await createProject(form); navigate(`/portfolio-admin/projects/${created}/edit`, { replace: true }); return }
      setMessage('Draft saved successfully.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save project.') }
    finally { setSaving(false) }
  }
  async function upload(files: FileList | null) {
    if (!projectId || !files) return
    setError('')
    try { for (const file of Array.from(files)) await uploadProjectMedia(projectId, file); setMedia(await getAdminMedia(projectId) as ProjectMedia[]); setMessage('Images uploaded.') }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to upload images.') }
  }
  if (loading) return <p className="py-24 text-center text-muted" role="status">Loading project...</p>
  if (authorized === false) return <Navigate to="/journal-admin/login" replace />
  return <main className="mx-auto max-w-5xl space-y-8 pb-16"><header><Link to="/portfolio-admin/projects" className="text-sm text-accent hover:underline">← Back to Projects</Link><p className="mt-8 text-xs font-bold uppercase tracking-widest text-accent">Portfolio CMS</p><h1 className="mt-3 font-display text-5xl text-text sm:text-6xl">{projectId ? 'Edit Project' : 'Create Project'}</h1></header>
    <form onSubmit={submit} className="space-y-8">
      <section className="space-y-5 rounded-2xl bg-surface p-6 sm:p-8"><h2 className="text-2xl font-bold text-text">Project information</h2>{[['title','Title'],['slug','URL Slug'],['short_description','Short Description'],['category','Category'],['role','My Role']].map(([name, label]) => <label key={name} className="block text-sm text-text">{label}<input required={name === 'title' || name === 'slug' || name === 'short_description'} className={`${inputClass} mt-2`} value={String(form[name as keyof ProjectDraftInput] ?? '')} onChange={(event) => field(name as keyof ProjectDraftInput, event.target.value as never)} /></label>)}<label className="block text-sm text-text">Project Type<select className={`${inputClass} mt-2`} value={form.project_type} onChange={(event) => field('project_type', event.target.value as ProjectDraftInput['project_type'])}><option value="individual">Individual</option><option value="team">Team</option></select></label>{[['overview','Overview'],['contribution','My Contribution'],['challenges','Challenges'],['lessons_learned','Lessons Learned']].map(([name, label]) => <label key={name} className="block text-sm text-text">{label}<textarea rows={5} className={`${inputClass} mt-2`} value={String(form[name as keyof ProjectDraftInput] ?? '')} onChange={(event) => field(name as keyof ProjectDraftInput, event.target.value as never)} /></label>)}</section>
      <section className="space-y-5 rounded-2xl bg-surface p-6 sm:p-8"><h2 className="text-2xl font-bold text-text">Technology stack</h2><input className={inputClass} value={form.technologies.join(', ')} onChange={(event) => field('technologies', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} placeholder="React, TypeScript, PostgreSQL" /><h2 className="pt-4 text-2xl font-bold text-text">Links</h2>{[['github_url','GitHub'],['live_url','Live Demo'],['figma_url','Figma'],['other_url','Other']].map(([name, label]) => <label key={name} className="block text-sm text-text">{label}<input className={`${inputClass} mt-2`} value={String(form[name as keyof ProjectDraftInput] ?? '')} onChange={(event) => field(name as keyof ProjectDraftInput, event.target.value as never)} /></label>)}</section>
      <section className="space-y-4 rounded-2xl bg-surface p-6 sm:p-8"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-text">Key features</h2><button type="button" onClick={addFeature} className="text-sm text-accent">Add feature</button></div>{form.features.map((feature, index) => <div key={feature.id} className="grid gap-3 rounded-xl border border-white/10 p-4"><input className={inputClass} placeholder="Feature title" value={feature.title} onChange={(event) => updateList('features', index, { title: event.target.value })} /><textarea className={inputClass} placeholder="Description" value={feature.description} onChange={(event) => updateList('features', index, { description: event.target.value })} /><button type="button" className="justify-self-end text-sm text-red-400" onClick={() => field('features', form.features.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}</section>
      <section className="space-y-4 rounded-2xl bg-surface p-6 sm:p-8"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-text">Custom sections</h2><button type="button" onClick={addSection} className="text-sm text-accent">Add section</button></div>{form.content_sections.map((section, index) => <div key={section.id} className="grid gap-3 rounded-xl border border-white/10 p-4"><input className={inputClass} placeholder="Section title" value={section.title} onChange={(event) => updateList('content_sections', index, { title: event.target.value })} /><textarea rows={6} className={inputClass} placeholder="Section content" value={section.body} onChange={(event) => updateList('content_sections', index, { body: event.target.value })} /><button type="button" className="justify-self-end text-sm text-red-400" onClick={() => field('content_sections', form.content_sections.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}</section>
      {projectId && <section className="space-y-5 rounded-2xl bg-surface p-6 sm:p-8"><div><h2 className="text-2xl font-bold text-text">Screenshots</h2><p className="mt-2 text-sm text-muted">Upload screenshots, then choose one as the project card thumbnail.</p></div><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => void upload(event.target.files)} className="block text-sm text-muted" />{media.map((image) => <div key={image.id} className="grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-[10rem_1fr_auto]">{image.url && <img src={image.url} alt={image.alt_text ?? ''} className="h-24 w-full object-contain" />}<div className="space-y-2"><input className={inputClass} value={image.alt_text ?? ''} placeholder="Alternative text" onChange={(event) => setMedia((items) => items.map((item) => item.id === image.id ? { ...item, alt_text: event.target.value } : item))} /><input className={inputClass} value={image.caption ?? ''} placeholder="Caption" onChange={(event) => setMedia((items) => items.map((item) => item.id === image.id ? { ...item, caption: event.target.value } : item))} /></div><div className="flex flex-col gap-2 text-sm">{image.is_thumbnail ? <button type="button" className="text-accent" onClick={() => void clearProjectThumbnail(projectId).then(() => setMedia((items) => items.map((item) => ({ ...item, is_thumbnail: false })))).catch((err) => setError(err instanceof Error ? err.message : 'Unable to clear thumbnail.'))}>Clear Thumbnail</button> : <button type="button" className="text-accent" onClick={() => void setProjectThumbnail(projectId, image.id).then(() => setMedia((items) => items.map((item) => ({ ...item, is_thumbnail: item.id === image.id })))).catch((err) => setError(err instanceof Error ? err.message : 'Unable to set thumbnail.'))}>Set Thumbnail</button>}<button type="button" className="text-accent" onClick={() => void updateProjectMedia(projectId, image.id, { alt_text: image.alt_text ?? '', caption: image.caption ?? '', media_type: image.media_type })}>Save</button><button type="button" className="text-red-400" onClick={() => void deleteProjectMedia(projectId, image.id).then(() => setMedia((items) => items.filter((item) => item.id !== image.id))).catch((err) => setError(err instanceof Error ? err.message : 'Unable to delete image.'))}>Delete</button></div></div>)}</section>}
      {error && <p className="rounded-lg border border-red-400/30 p-4 text-red-400" role="alert">{error}</p>}{message && <p className="rounded-lg border border-accent/30 p-4 text-accent" role="status">{message}</p>}<div className="flex justify-end"><button type="submit" disabled={saving} className="rounded-lg bg-accent px-8 py-3 font-bold text-page disabled:opacity-50">{saving ? 'Saving...' : 'Save Draft'}</button></div>
    </form>
  </main>
}
