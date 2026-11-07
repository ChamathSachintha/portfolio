import { supabase } from '../lib/supabase'
import type { JournalSettings } from '../types/journal'

export interface JournalSettingsInput {
  module_title: string
  heading: string
  subheading: string
  introduction: string
}

async function requireJournalAdmin() {
  const client = supabase

  if (!client) {
    throw new Error('Supabase is not configured')
  }

  const { data: userData, error: userError } =
    await client.auth.getUser()

  if (userError) throw new Error(userError.message)
  if (!userData.user) {
    throw new Error('Administrator authentication is required.')
  }

  const { data: isAdmin, error: roleError } =
    await client.rpc('is_current_journal_admin')

  if (roleError) throw new Error(roleError.message)
  if (isAdmin !== true) {
    throw new Error('Administrator access is required.')
  }

  return client
}

export async function getAdminJournalSettings(): Promise<JournalSettings> {
  const client = await requireJournalAdmin()
  const { data, error } = await client
    .from('journal_settings')
    .select(
      'id, module_title, heading, subheading, introduction'
    )
    .eq('id', 1)
    .maybeSingle()

  if (error) throw new Error(`Unable to load journal settings: ${error.message}`)
  if (!data) {
    throw new Error(
      'The journal settings record is missing. Create the singleton record in Supabase before editing settings.'
    )
  }

  return data as JournalSettings
}

export async function updateJournalSettings(
  input: JournalSettingsInput
): Promise<void> {
  const moduleTitle = input.module_title.trim()
  const heading = input.heading.trim()

  if (!moduleTitle || !heading) {
    throw new Error('Module Name and Journal Heading are required.')
  }

  const client = await requireJournalAdmin()
  const { data, error } = await client
    .from('journal_settings')
    .update({
      module_title: moduleTitle,
      heading,
      subheading: input.subheading.trim() || null,
      introduction: input.introduction.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)
    .select('id')
    .maybeSingle()

  if (error) throw new Error(`Unable to save journal settings: ${error.message}`)
  if (!data) {
    throw new Error(
      'The journal settings record is missing or administrator access was denied.'
    )
  }
}
