import { supabase } from '../lib/supabase'
import type { PortfolioProject, ProjectDraftInput, ProjectStatus } from '../types/project'

const BUCKET = 'portfolio-project-assets'
const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const MAX_FILE_SIZE = 8 * 1024 * 1024

function clientOrThrow() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

async function requireAdmin() {
  const client = clientOrThrow()
  const { data: user, error: userError } = await client.auth.getUser()
  if (userError) throw new Error(userError.message)
  if (!user.user) throw new Error('Administrator authentication is required.')
  const { data, error } = await client.rpc('is_current_journal_admin')
  if (error) throw new Error(error.message)
  if (data !== true) throw new Error('Administrator access is required.')
  return client
}

function optional(value: string) {
  return value.trim() || null
}

function url(value: string) {
  const clean = value.trim()
  if (clean && !/^https?:\/\/\S+$/i.test(clean)) {
    throw new Error('External links must be valid http(s) URLs.')
  }
  return optional(clean)
}

function payload(input: ProjectDraftInput) {
  if (!input.title.trim() || !input.short_description.trim()) {
    throw new Error('Title and short description are required.')
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug)) {
    throw new Error('Use a lowercase hyphenated URL slug.')
  }
  return {
    title: input.title.trim(),
    slug: input.slug.trim(),
    short_description: input.short_description.trim(),
    overview: optional(input.overview),
    category: optional(input.category),
    project_type: input.project_type,
    role: optional(input.role),
    contribution: optional(input.contribution),
    challenges: optional(input.challenges),
    lessons_learned: optional(input.lessons_learned),
    github_url: url(input.github_url),
    live_url: url(input.live_url),
    figma_url: url(input.figma_url),
    other_url: url(input.other_url),
    technologies: input.technologies.map((name, sort_order) => ({ id: crypto.randomUUID(), name: name.trim(), sort_order })).filter((item) => item.name),
    features: input.features.filter((item) => item.title.trim() || item.description.trim()).map((item, sort_order) => ({ ...item, title: item.title.trim(), description: item.description.trim(), sort_order })),
    content_sections: input.content_sections.filter((item) => item.title.trim() || item.body.trim()).map((item, sort_order) => ({ ...item, title: item.title.trim(), body: item.body.trim(), sort_order })),
  }
}

export async function listAdminProjects() {
  const client = await requireAdmin()
  const { data, error } = await client.from('portfolio_projects').select('id, slug, title, category, status, display_order, thumbnail_path, created_at, portfolio_featured_projects(position)').order('display_order')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAdminProject(id: string): Promise<PortfolioProject | null> {
  const client = await requireAdmin()
  const { data, error } = await client.from('portfolio_projects').select(`
    id, slug, title, short_description, overview, category, project_type, role,
    contribution, challenges, lessons_learned, github_url, live_url, figma_url,
    other_url, status, display_order, thumbnail_path, hero_image_path, published_at,
    portfolio_project_technologies(id, name, sort_order),
    portfolio_project_features(id, title, description, sort_order),
    portfolio_project_sections(id, title, body, sort_order)
  `).eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return {
    ...data,
    technologies: data.portfolio_project_technologies ?? [],
    features: data.portfolio_project_features ?? [],
    content_sections: data.portfolio_project_sections ?? [],
  } as PortfolioProject
}

export async function createProject(input: ProjectDraftInput) {
  const client = await requireAdmin()
  const values = payload(input)
  const { data, error } = await client.from('portfolio_projects').insert({
    ...values,
    technologies: undefined,
    features: undefined,
    content_sections: undefined,
    status: 'draft',
  }).select('id').single()
  if (error) throw new Error(error.code === '23505' ? 'That project slug is already in use.' : error.message)
  await saveProjectCollections(data.id, values)
  return data.id as string
}

export async function updateProject(id: string, input: ProjectDraftInput) {
  const client = await requireAdmin()
  const values = payload(input)
  const { error } = await client.from('portfolio_projects').update({
    title: values.title, slug: values.slug, short_description: values.short_description,
    overview: values.overview, category: values.category, project_type: values.project_type,
    role: values.role, contribution: values.contribution, challenges: values.challenges,
    lessons_learned: values.lessons_learned, github_url: values.github_url, live_url: values.live_url,
    figma_url: values.figma_url, other_url: values.other_url, updated_at: new Date().toISOString(),
  }).eq('id', id)
  if (error) throw new Error(error.code === '23505' ? 'That project slug is already in use.' : error.message)
  await saveProjectCollections(id, values)
}

async function saveProjectCollections(id: string, values: ReturnType<typeof payload>) {
  const client = clientOrThrow()
  for (const table of ['portfolio_project_technologies', 'portfolio_project_features', 'portfolio_project_sections']) {
    const { error } = await client.from(table).delete().eq('project_id', id)
    if (error) throw new Error(error.message)
  }
  const collections = [
    ['portfolio_project_technologies', values.technologies],
    ['portfolio_project_features', values.features],
    ['portfolio_project_sections', values.content_sections],
  ] as const
  for (const [table, records] of collections) {
    if (!records.length) continue
    const { error } = await client.from(table).insert(records.map((record) => ({ ...record, project_id: id })))
    if (error) throw new Error(error.message)
  }
}

export async function setProjectStatus(id: string, status: ProjectStatus) {
  const client = await requireAdmin()
  const { error } = await client.from('portfolio_projects').update({ status, published_at: status === 'published' ? new Date().toISOString() : null }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteProject(id: string) {
  const client = await requireAdmin()
  const { data: media, error: mediaError } = await client.from('portfolio_project_media').select('storage_path').eq('project_id', id)
  if (mediaError) throw new Error(mediaError.message)
  const paths = (media ?? []).map((item) => item.storage_path)
  const { error } = await client.from('portfolio_projects').delete().eq('id', id).eq('status', 'draft')
  if (error) throw new Error(error.message)
  if (paths.length) {
    const { error: storageError } = await client.storage.from(BUCKET).remove(paths)
    if (storageError) throw new Error(`Project deleted, but media cleanup failed: ${storageError.message}`)
  }
}

export async function uploadProjectMedia(projectId: string, file: File) {
  const client = await requireAdmin()
  const extension = IMAGE_TYPES[file.type]
  if (!extension || file.size === 0 || file.size > MAX_FILE_SIZE) throw new Error('Use a JPG, PNG or WebP image up to 8 MB.')
  const path = `projects/${projectId}/screenshots/${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await client.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) throw new Error(uploadError.message)
  const { error } = await client.from('portfolio_project_media').insert({ project_id: projectId, storage_path: path, alt_text: file.name.replace(/\.[^.]+$/, '') })
  if (error) {
    await client.storage.from(BUCKET).remove([path])
    throw new Error(error.message)
  }
}

export async function saveFeaturedProjects(projectIds: (string | null)[]) {
  const client = await requireAdmin()
  if (projectIds.length !== 3 || new Set(projectIds.filter(Boolean)).size !== projectIds.filter(Boolean).length) throw new Error('Choose up to three different projects.')
  const { error } = await client.rpc('save_portfolio_featured_projects', { selected_project_ids: projectIds })
  if (error) throw new Error(error.message)
}

export async function getAdminMedia(projectId: string) {
  const client = await requireAdmin()
  const { data: project, error: projectError } = await client
    .from('portfolio_projects')
    .select('thumbnail_path')
    .eq('id', projectId)
    .maybeSingle()
  if (projectError) throw new Error(projectError.message)
  if (!project) throw new Error('Project not found.')

  const { data, error } = await client.from('portfolio_project_media').select('id, storage_path, caption, alt_text, sort_order, media_type').eq('project_id', projectId).order('sort_order')
  if (error) throw new Error(error.message)
  return Promise.all((data ?? []).map(async (item) => {
    const { data: signed } = await client.storage.from(BUCKET).createSignedUrl(item.storage_path, 300)
    return {
      ...item,
      url: signed?.signedUrl ?? null,
      is_thumbnail: item.storage_path === project.thumbnail_path,
    }
  }))
}

export async function setProjectThumbnail(projectId: string, mediaId: string): Promise<void> {
  const client = await requireAdmin()
  const { data: media, error: mediaError } = await client
    .from('portfolio_project_media')
    .select('storage_path')
    .eq('id', mediaId)
    .eq('project_id', projectId)
    .maybeSingle()
  if (mediaError) throw new Error(mediaError.message)
  if (!media) throw new Error('Project image not found or access denied.')

  const { error } = await client
    .from('portfolio_projects')
    .update({ thumbnail_path: media.storage_path, updated_at: new Date().toISOString() })
    .eq('id', projectId)
  if (error) throw new Error(error.message)
}

export async function clearProjectThumbnail(projectId: string): Promise<void> {
  const client = await requireAdmin()
  const { error } = await client
    .from('portfolio_projects')
    .update({ thumbnail_path: null, updated_at: new Date().toISOString() })
    .eq('id', projectId)
  if (error) throw new Error(error.message)
}

export async function updateProjectMedia(projectId: string, mediaId: string, values: { caption: string; alt_text: string; media_type: 'screenshot' | 'hero' }) {
  const client = await requireAdmin()
  const { error } = await client.from('portfolio_project_media').update({ ...values, caption: values.caption.trim() || null, alt_text: values.alt_text.trim() || null }).eq('id', mediaId).eq('project_id', projectId)
  if (error) throw new Error(error.message)
}

export async function deleteProjectMedia(projectId: string, mediaId: string) {
  const client = await requireAdmin()
  const { data, error } = await client.from('portfolio_project_media').select('storage_path').eq('id', mediaId).eq('project_id', projectId).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Project image not found.')
  const { data: project, error: projectError } = await client
    .from('portfolio_projects')
    .select('thumbnail_path')
    .eq('id', projectId)
    .maybeSingle()
  if (projectError) throw new Error(projectError.message)
  const { error: dbError } = await client.from('portfolio_project_media').delete().eq('id', mediaId).eq('project_id', projectId)
  if (dbError) throw new Error(dbError.message)
  if (project?.thumbnail_path === data.storage_path) {
    const { error: thumbnailError } = await client
      .from('portfolio_projects')
      .update({ thumbnail_path: null, updated_at: new Date().toISOString() })
      .eq('id', projectId)
    if (thumbnailError) throw new Error(`Image was deleted, but thumbnail cleanup failed: ${thumbnailError.message}`)
  }
  const { error: storageError } = await client.storage.from(BUCKET).remove([data.storage_path])
  if (storageError) throw new Error(`Image metadata was removed, but storage cleanup failed: ${storageError.message}`)
}
