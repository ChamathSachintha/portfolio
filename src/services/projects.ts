import { supabase } from '../lib/supabase'
import type {
  PortfolioProject,
  ProjectCardData,
  ProjectMedia,
} from '../types/project'

const BUCKET = 'portfolio-project-assets'

function clientOrThrow() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

async function signedUrl(path: string | null) {
  if (!path) return null
  const { data, error } = await clientOrThrow()
    .storage.from(BUCKET)
    .createSignedUrl(path, 300)
  if (error) {
    console.error('Unable to load project image:', error.message)
    return null
  }
  return data.signedUrl
}

export async function getPublishedProjects(): Promise<ProjectCardData[]> {
  const client = clientOrThrow()
  const { data, error } = await client
    .from('portfolio_projects')
    .select('id, slug, title, short_description, category, thumbnail_path, portfolio_project_technologies(id, name, sort_order)')
    .eq('status', 'published')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)

  return Promise.all((data ?? []).map(async (project) => ({
    id: project.id,
    slug: project.slug,
    title: project.title,
    short_description: project.short_description,
    category: project.category,
    technologies: project.portfolio_project_technologies ?? [],
    thumbnailUrl: await signedUrl(project.thumbnail_path),
  })))
}

export async function getPublishedProject(slug: string): Promise<PortfolioProject | null> {
  const client = clientOrThrow()
  const { data, error } = await client
    .from('portfolio_projects')
    .select(`
      id, slug, title, short_description, overview, category, project_type,
      role, contribution, challenges, lessons_learned, github_url, live_url,
      figma_url, other_url, status, display_order, thumbnail_path,
      hero_image_path, published_at,
      portfolio_project_technologies(id, name, sort_order),
      portfolio_project_features(id, title, description, sort_order),
      portfolio_project_sections(id, title, body, sort_order),
      portfolio_project_media(id, storage_path, caption, alt_text, sort_order, media_type)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null

  const media = await Promise.all((data.portfolio_project_media ?? []).map(async (item) => ({
    ...item,
    url: await signedUrl(item.storage_path),
  })))
  return {
    ...data,
    technologies: data.portfolio_project_technologies ?? [],
    features: data.portfolio_project_features ?? [],
    content_sections: data.portfolio_project_sections ?? [],
    media,
  } as PortfolioProject & { media: ProjectMedia[] }
}

export async function getPublishedFeaturedProjects(): Promise<ProjectCardData[]> {
  const client = clientOrThrow()
  const { data, error } = await client
    .from('portfolio_featured_projects')
    .select('position, project:portfolio_projects!inner(id, slug, title, short_description, category, thumbnail_path, status, portfolio_project_technologies(id, name, sort_order))')
    .eq('project.status', 'published')
    .order('position', { ascending: true })
  if (error) throw new Error(error.message)

  return Promise.all((data ?? []).map(async (row) => {
    const project = row.project as never as {
      id: string; slug: string; title: string; short_description: string
      category: string | null; thumbnail_path: string | null
      portfolio_project_technologies: ProjectCardData['technologies']
    }

    return {
      id: project.id,
      slug: project.slug,
      title: project.title,
      short_description: project.short_description,
      category: project.category,
      technologies: project.portfolio_project_technologies ?? [],
      thumbnailUrl: await signedUrl(project.thumbnail_path),
    }
  }))
}
