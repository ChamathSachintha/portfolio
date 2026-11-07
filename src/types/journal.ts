
export interface JournalSettings {
  id: number
  module_title: string
  heading: string
  subheading: string | null
  introduction: string | null
}

export interface JournalContentSection {
  id: string
  title: string
  body: string
}

export interface JournalEntryPreview {
  id: string
  slug: string
  title: string
  subheading: string | null
  week_number: number | null
  session_date: string | null
  description: string
  cover_image_path: string | null
}

export interface JournalEntryCard extends JournalEntryPreview {
  coverUrl: string | null
}


export interface JournalEntryDetail extends JournalEntryPreview {
  reflection: string
  content_sections: JournalContentSection[]
  facilitator_name: string | null
  facilitator_title: string | null
  facilitator_organization: string | null
  facilitator_bio: string | null
  facilitator_photo_path: string | null
  facilitator_link: string | null
}

export interface JournalMedia {
  id: string
  storage_path: string
  caption: string | null
  alt_text: string | null
  sort_order: number
}

export interface JournalMediaItem extends JournalMedia {
  url: string | null
}

export interface JournalSession {
  entry: JournalEntryDetail
  coverUrl: string | null
  facilitatorPhotoUrl: string | null
  gallery: JournalMediaItem[]
}
