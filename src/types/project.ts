export type ProjectStatus = 'draft' | 'published'
export type ProjectKind = 'individual' | 'team'

export interface ProjectTechnology {
  id: string
  name: string
  sort_order: number
}

export interface ProjectFeature {
  id: string
  title: string
  description: string
  sort_order: number
}

export interface ProjectSection {
  id: string
  title: string
  body: string
  sort_order: number
}

export interface ProjectMedia {
  id: string
  storage_path: string
  caption: string | null
  alt_text: string | null
  sort_order: number
  media_type: 'screenshot' | 'hero'
  url?: string | null
  is_thumbnail?: boolean
}

export interface PortfolioProject {
  id: string
  slug: string
  title: string
  short_description: string
  overview: string | null
  category: string | null
  project_type: ProjectKind
  role: string | null
  contribution: string | null
  challenges: string | null
  lessons_learned: string | null
  github_url: string | null
  live_url: string | null
  figma_url: string | null
  other_url: string | null
  status: ProjectStatus
  display_order: number
  thumbnail_path: string | null
  hero_image_path: string | null
  published_at: string | null
  technologies: ProjectTechnology[]
  features: ProjectFeature[]
  content_sections: ProjectSection[]
}

export interface ProjectCardData {
  id: string
  slug: string
  title: string
  short_description: string
  category: string | null
  technologies: ProjectTechnology[]
  thumbnailUrl: string | null
}

export interface ProjectDraftInput {
  title: string
  slug: string
  short_description: string
  overview: string
  category: string
  project_type: ProjectKind
  role: string
  contribution: string
  challenges: string
  lessons_learned: string
  github_url: string
  live_url: string
  figma_url: string
  other_url: string
  technologies: string[]
  features: ProjectFeature[]
  content_sections: ProjectSection[]
}
