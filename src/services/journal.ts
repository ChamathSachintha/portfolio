
import { supabase } from '../lib/supabase'

import type {
  JournalSettings,
  JournalEntryPreview,
  JournalEntryCard,
  JournalSession,
} from '../types/journal'

const BUCKET = 'journal-assets'

// ============================================
// 1. GET JOURNAL LANDING PAGE
// ============================================

export async function getJournalLanding(): Promise<{
  settings: JournalSettings | null
  entries: JournalEntryCard[]
}> {
  const client = supabase

  if (!client) {
    throw new Error('Supabase is not configured')
  }

  const journalStorage = client.storage.from(BUCKET)

  // Fetch module settings and published entries
  const [settingsResult, entriesResult] = await Promise.all([
    client
      .from('journal_settings')
      .select(
        'id, module_title, heading, subheading, introduction'
      )
      .eq('id', 1)
      .maybeSingle(),

    client
      .from('journal_entries')
      .select(
        'id, slug, title, subheading, week_number, session_date, description, cover_image_path'
      )
      .eq('status', 'published')
      .order('week_number', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true }),
  ])

  if (settingsResult.error) {
    throw new Error(settingsResult.error.message)
  }

  if (entriesResult.error) {
    throw new Error(entriesResult.error.message)
  }

  const records =
    (entriesResult.data ?? []) as JournalEntryPreview[]

  // Get signed cover URLs for published entries
  const entries = await Promise.all(
    records.map(async (entry): Promise<JournalEntryCard> => {
      let coverUrl: string | null = null

      if (entry.cover_image_path) {
        const { data, error } = await journalStorage
          .createSignedUrl(entry.cover_image_path, 300)

        if (!error && data) {
          coverUrl = data.signedUrl
        }

        if (error) {
          console.error(
            'Unable to load journal cover:',
            error.message
          )
        }
      }

      return {
        ...entry,
        coverUrl,
      }
    })
  )

  return {
    settings: settingsResult.data as JournalSettings | null,
    entries,
  }
}

// ============================================
// 2. GET INDIVIDUAL JOURNAL ENTRY
// ============================================

export async function getJournalSession(
  slug: string
): Promise<JournalSession | null> {
  const client = supabase

  if (!client) {
    throw new Error('Supabase is not configured')
  }

  const journalStorage = client.storage.from(BUCKET)

  // Fetch only published sessions
  const { data: entry, error: entryError } = await client
    .from('journal_entries')
    .select(`
      id,
      slug,
      title,
      subheading,
      week_number,
      session_date,
      description,
      reflection,
      content_sections,
      cover_image_path,
      facilitator_name,
      facilitator_title,
      facilitator_organization,
      facilitator_bio,
      facilitator_photo_path,
      facilitator_link
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (entryError) {
    throw new Error(entryError.message)
  }

  // Return null if the entry is missing or unpublished
  if (!entry) {
    return null
  }

  // Get gallery images belonging to this session
  const { data: media, error: mediaError } = await client
    .from('journal_media')
    .select(
      'id, storage_path, caption, alt_text, sort_order'
    )
    .eq('entry_id', entry.id)
    .order('sort_order', { ascending: true })

  if (mediaError) {
    throw new Error(mediaError.message)
  }

  // Generate signed URLs using the non-null
  // journalStorage reference
  async function imageUrl(
    path: string | null
  ): Promise<string | null> {
    if (!path) {
      return null
    }

    const { data, error } = await journalStorage
      .createSignedUrl(path, 300)

    if (error) {
      console.error(
        'Unable to load journal image:',
        error.message
      )
      return null
    }

    return data.signedUrl
  }

  // Load cover image, facilitator photo,
  // and session-specific gallery images
  const [coverUrl, facilitatorPhotoUrl, gallery] =
    await Promise.all([
      imageUrl(entry.cover_image_path),

      imageUrl(entry.facilitator_photo_path),

      Promise.all(
        (media ?? []).map(async (item) => ({
          ...item,
          url: await imageUrl(item.storage_path),
        }))
      ),
    ])

  return {
    entry,
    coverUrl,
    facilitatorPhotoUrl,
    gallery,
  }
}
