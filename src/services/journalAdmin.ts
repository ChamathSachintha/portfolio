
import { supabase } from '../lib/supabase'
import type { JournalContentSection } from '../types/journal'

const JOURNAL_BUCKET = 'journal-assets'

export interface JournalDraftInput {
  title: string
  slug: string
  week_number: number | null
  session_date: string | null
  subheading: string
  description: string
  reflection: string
  content_sections: JournalContentSection[]

  facilitator_name: string
  facilitator_title: string
  facilitator_organization: string
  facilitator_bio: string
  facilitator_link: string
}

function optionalText(value: string): string | null {
  return value.trim() || null
}

function validWeekNumber(value: number | null): boolean {
  return (
    value !== null &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 52
  )
}

function cleanContentSections(
  sections: JournalContentSection[]
): JournalContentSection[] {
  return sections
    .filter(
      (section) =>
        section.title.trim() && section.body.trim()
    )
    .map((section) => ({
      id: section.id,
      title: section.title.trim(),
      body: section.body.trim(),
    }))
}

export async function createJournalDraft(
  input: JournalDraftInput
): Promise<string> {
  const client = supabase

  if (!client) {
    throw new Error('Supabase is not configured')
  }

  if (!validWeekNumber(input.week_number)) {
    throw new Error('Enter a valid week number from 1 to 52.')
  }

  const { data, error } = await client
    .from('journal_entries')
    .insert({
      title: input.title.trim(),
      slug: input.slug.trim(),
      week_number: input.week_number,
      session_date: input.session_date || null,
      subheading: optionalText(input.subheading),
      description: input.description.trim(),
      reflection: input.reflection.trim(),
      content_sections: cleanContentSections(
        input.content_sections
      ),

      facilitator_name: optionalText(input.facilitator_name),
      facilitator_title: optionalText(input.facilitator_title),
      facilitator_organization: optionalText(
        input.facilitator_organization
      ),
      facilitator_bio: optionalText(input.facilitator_bio),
      facilitator_link: optionalText(input.facilitator_link),

      status: 'draft',
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error(
        'A session with this URL slug already exists.'
      )
    }

    throw new Error(error.message)
  }

  return data.id
}


export async function getJournalDraftForEdit(
  id: string
): Promise<JournalDraftInput | null> {
  const client = supabase

  if (!client) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await client
    .from('journal_entries')
    .select(`
      title,
      slug,
      week_number,
      session_date,
      subheading,
      description,
      reflection,
      content_sections,
      facilitator_name,
      facilitator_title,
      facilitator_organization,
      facilitator_bio,
      facilitator_link
    `)
    .eq('id', id)
    .eq('status', 'draft')
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) return null

  return {
    title: data.title,
    slug: data.slug,
    week_number: data.week_number,
    session_date: data.session_date,
    subheading: data.subheading ?? '',
    description: data.description ?? '',
    reflection: data.reflection ?? '',
    content_sections: Array.isArray(data.content_sections)
      ? data.content_sections
      : [],
    facilitator_name: data.facilitator_name ?? '',
    facilitator_title: data.facilitator_title ?? '',
    facilitator_organization:
      data.facilitator_organization ?? '',
    facilitator_bio: data.facilitator_bio ?? '',
    facilitator_link: data.facilitator_link ?? '',
  }
}

export async function updateJournalDraft(
  id: string,
  input: JournalDraftInput
): Promise<void> {
  const client = supabase

  if (!client) {
    throw new Error('Supabase is not configured')
  }

  if (
    !input.title.trim() ||
    !validWeekNumber(input.week_number) ||
    !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug)
  ) {
    throw new Error('Invalid title, week number, or slug.')
  }

  const { data, error } = await client
    .from('journal_entries')
    .update({
      title: input.title.trim(),
      slug: input.slug.trim(),
      week_number: input.week_number,
      session_date: input.session_date || null,
      subheading: optionalText(input.subheading),
      description: input.description.trim(),
      reflection: input.reflection.trim(),
      content_sections: cleanContentSections(
        input.content_sections
      ),

      facilitator_name: optionalText(input.facilitator_name),
      facilitator_title: optionalText(input.facilitator_title),
      facilitator_organization: optionalText(
        input.facilitator_organization
      ),
      facilitator_bio: optionalText(input.facilitator_bio),
      facilitator_link: optionalText(input.facilitator_link),

      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'draft')
    .select('id')
    .maybeSingle()

  if (error) {
    if (error.code === '23505') {
      throw new Error('This URL slug is already in use.')
    }

    throw new Error(error.message)
  }

  if (!data) {
    throw new Error(
      'Draft not found or administrator access denied.'
    )
  }
}


export type JournalStatus = 'draft' | 'published'

// ============================================
// PUBLISH OR UNPUBLISH SESSION
// ============================================

export async function setJournalPublicationStatus(
  id: string,
  nextStatus: JournalStatus
): Promise<void> {
  const client = supabase

  if (!client) {
    throw new Error('Supabase is not configured')
  }

  const previousStatus =
    nextStatus === 'published' ? 'draft' : 'published'

  // Require actual content before publishing.
  if (nextStatus === 'published') {
    const { data: draft, error: draftError } = await client
      .from('journal_entries')
      .select('week_number, description, reflection')
      .eq('id', id)
      .eq('status', 'draft')
      .maybeSingle()

    if (draftError) throw new Error(draftError.message)

    if (!draft) {
      throw new Error('Draft not found.')
    }

    if (!validWeekNumber(draft.week_number)) {
      throw new Error(
        'Assign a valid week number from 1 to 52 before publishing.'
      )
    }

    if (
      !draft.description?.trim() ||
      !draft.reflection?.trim()
    ) {
      throw new Error(
        'Add an entry description and personal reflection before publishing.'
      )
    }
  }

  const { data, error } = await client
    .from('journal_entries')
    .update({
      status: nextStatus,
      published_at:
        nextStatus === 'published'
          ? new Date().toISOString()
          : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', previousStatus)
    .select('id')
    .maybeSingle()

  if (error) throw new Error(error.message)

  if (!data) {
    throw new Error(
      'Session not found or its publication status has changed.'
    )
  }
}

// ============================================
// DELETE DRAFT SESSION
// ============================================

export async function deleteJournalDraft(
  id: string
): Promise<void> {
  const client = supabase

  if (!client) {
    throw new Error('Supabase is not configured')
  }

  // Check that the session is an unpublished draft.
  const { data: draft, error: draftError } = await client
    .from('journal_entries')
    .select('id, cover_image_path, facilitator_photo_path')
    .eq('id', id)
    .eq('status', 'draft')
    .maybeSingle()

  if (draftError) throw new Error(draftError.message)

  if (!draft) {
    throw new Error('Draft not found.')
  }

  const { data: media, error: mediaError } = await client
    .from('journal_media')
    .select('storage_path')
    .eq('entry_id', id)

  if (mediaError) throw new Error(mediaError.message)

  const paths = Array.from(
    new Set(
      [
        draft.cover_image_path,
        draft.facilitator_photo_path,
        ...(media ?? []).map((image) => image.storage_path),
      ].filter((path): path is string => Boolean(path))
    )
  )

  // Delete metadata first so no row can reference removed files.
  const { data, error } = await client
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .eq('status', 'draft')
    .select('id')
    .maybeSingle()

  if (error) throw new Error(error.message)

  if (!data) {
    throw new Error(
      'Draft could not be deleted. Refresh the dashboard and try again.'
    )
  }

  if (paths.length === 0) return

  const { error: storageError } = await client.storage
    .from(JOURNAL_BUCKET)
    .remove(paths)

  if (storageError) {
    throw new Error(
      `Draft deleted, but Storage cleanup failed for: ${paths.join(
        ', '
      )}. Verify these orphaned paths in Supabase Storage before removing them.`
    )
  }
}
