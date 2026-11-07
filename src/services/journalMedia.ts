
import { supabase } from '../lib/supabase'

const BUCKET = 'journal-assets'
const MAX_FILE_SIZE = 5 * 1024 * 1024

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export interface JournalGalleryImage {
  id: string
  storage_path: string
  caption: string | null
  alt_text: string | null
  sort_order: number
  url: string | null
  is_thumbnail: boolean
}

function imageType(file: File): string {
  const extension = IMAGE_TYPES[file.type]
  if (!extension) {
    throw new Error(
      `${file.name}: Only JPG, PNG and WebP images are allowed.`
    )
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    throw new Error(
      `${file.name}: Image must be between 1 byte and 5 MB.`
    )
  }

  return extension
}

async function requireDraftEntry(
  entryId: string
): Promise<NonNullable<typeof supabase>> {
  const client = supabase
  if (!client) {
    throw new Error('Supabase is not configured')
  }

  const { data: entry, error } = await client
    .from('journal_entries')
    .select('id, status, cover_image_path, facilitator_photo_path')
    .eq('id', entryId)
    .eq('status', 'draft')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!entry) {
    throw new Error('Draft entry not found or access denied.')
  }

  return client
}

// Load gallery images belonging to one entry.
// This function is intended for the admin editor,
// including entries that are still drafts.
export async function getAdminJournalGallery(
  entryId: string
): Promise<JournalGalleryImage[]> {
  const client = supabase

  if (!client) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await client
    .from('journal_media')
    .select(
      'id, storage_path, caption, alt_text, sort_order'
    )
    .eq('entry_id', entryId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  const { data: entry, error: entryError } = await client
    .from('journal_entries')
    .select('cover_image_path')
    .eq('id', entryId)
    .eq('status', 'draft')
    .maybeSingle()

  if (entryError) throw new Error(entryError.message)
  if (!entry) throw new Error('Draft entry not found or access denied.')

  const storage = client.storage.from(BUCKET)

  return Promise.all(
    (data ?? []).map(async (item) => {
      const { data: signed, error: urlError } =
        await storage.createSignedUrl(
          item.storage_path,
          300
        )

      if (urlError) {
        console.error(
          'Unable to preview image:',
          urlError.message
        )
      }

      return {
        ...item,
        url: signed?.signedUrl ?? null,
        is_thumbnail:
          item.storage_path === entry.cover_image_path,
      }
    })
  )
}

// Upload one gallery image to an existing draft.
export async function uploadJournalGalleryImage(
  entryId: string,
  file: File
): Promise<void> {
  const client = supabase

  if (!client) {
    throw new Error('Supabase is not configured')
  }

  const extension = imageType(file)

  // Only allow uploads to existing draft entries.
  await requireDraftEntry(entryId)

  // Determine the next gallery position.
  const { data: lastImages, error: orderError } =
    await client
      .from('journal_media')
      .select('sort_order')
      .eq('entry_id', entryId)
      .order('sort_order', { ascending: false })
      .limit(1)

  if (orderError) {
    throw new Error(orderError.message)
  }

  const nextOrder =
    (lastImages?.[0]?.sort_order ?? -1) + 1

  // Use a unique filename to avoid overwriting.
  const path =
    `entries/${entryId}/gallery/` +
    `${crypto.randomUUID()}.${extension}`

  const storage = client.storage.from(BUCKET)

  // Upload the file.
  const { error: uploadError } = await storage.upload(
    path,
    file,
    {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    }
  )

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  // Register the uploaded image in PostgreSQL.
  const { error: dbError } = await client
    .from('journal_media')
    .insert({
      entry_id: entryId,
      storage_path: path,
      alt_text: file.name.replace(/\.[^.]+$/, ''),
      caption: null,
      sort_order: nextOrder,
    })

  if (dbError) {
    // Attempt cleanup if metadata creation fails.
    const { error: cleanupError } =
      await storage.remove([path])

    if (cleanupError) {
      throw new Error(
        'Image metadata could not be saved, and ' +
        'Storage cleanup also failed. ' +
        `Please inspect ${path} in Supabase Storage.`
      )
    }

    throw new Error(dbError.message)
  }
}

export async function updateJournalGalleryImage(
  entryId: string,
  imageId: string,
  values: { caption: string; alt_text: string }
): Promise<void> {
  const client = await requireDraftEntry(entryId)

  const { data, error } = await client
    .from('journal_media')
    .update({
      caption: values.caption.trim() || null,
      alt_text: values.alt_text.trim() || null,
    })
    .eq('id', imageId)
    .eq('entry_id', entryId)
    .select('id')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Journal image not found or access denied.')
}

export async function updateJournalGalleryOrder(
  entryId: string,
  imageIds: string[]
): Promise<void> {
  const client = await requireDraftEntry(entryId)

  const { data: images, error: imageError } = await client
    .from('journal_media')
    .select('id')
    .eq('entry_id', entryId)

  if (imageError) throw new Error(imageError.message)

  const existingIds = new Set((images ?? []).map((image) => image.id))
  if (
    imageIds.length !== existingIds.size ||
    imageIds.some((imageId) => !existingIds.has(imageId))
  ) {
    throw new Error('The gallery changed. Refresh and try again.')
  }

  for (const [sortOrder, imageId] of imageIds.entries()) {
    const { error } = await client
      .from('journal_media')
      .update({ sort_order: sortOrder })
      .eq('id', imageId)
      .eq('entry_id', entryId)

    if (error) throw new Error(error.message)
  }
}

async function getDraftGalleryImage(
  entryId: string,
  imageId: string
) {
  const client = await requireDraftEntry(entryId)
  const { data, error } = await client
    .from('journal_media')
    .select('id, storage_path')
    .eq('id', imageId)
    .eq('entry_id', entryId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Journal image not found or access denied.')

  return { client, image: data }
}

export async function setJournalThumbnail(
  entryId: string,
  imageId: string
): Promise<void> {
  const { client, image } = await getDraftGalleryImage(
    entryId,
    imageId
  )

  const { data, error } = await client
    .from('journal_entries')
    .update({ cover_image_path: image.storage_path })
    .eq('id', entryId)
    .eq('status', 'draft')
    .select('id')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Draft entry could not be updated.')
}

export async function clearJournalThumbnail(
  entryId: string
): Promise<void> {
  const client = await requireDraftEntry(entryId)
  const { data, error } = await client
    .from('journal_entries')
    .update({ cover_image_path: null })
    .eq('id', entryId)
    .eq('status', 'draft')
    .select('id')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Draft entry could not be updated.')
}

export async function deleteJournalGalleryImage(
  entryId: string,
  imageId: string
): Promise<void> {
  const { client, image } = await getDraftGalleryImage(
    entryId,
    imageId
  )

  const { data: entry, error: entryError } = await client
    .from('journal_entries')
    .select('cover_image_path')
    .eq('id', entryId)
    .eq('status', 'draft')
    .maybeSingle()

  if (entryError) throw new Error(entryError.message)
  if (!entry) throw new Error('Draft entry not found or access denied.')

  if (entry.cover_image_path === image.storage_path) {
    const { error } = await client
      .from('journal_entries')
      .update({ cover_image_path: null })
      .eq('id', entryId)
      .eq('status', 'draft')

    if (error) throw new Error(error.message)
  }

  const { data, error } = await client
    .from('journal_media')
    .delete()
    .eq('id', imageId)
    .eq('entry_id', entryId)
    .select('id')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Journal image could not be deleted.')

  const { error: storageError } = await client.storage
    .from(BUCKET)
    .remove([image.storage_path])

  if (storageError) {
    throw new Error(
      `Image metadata was deleted, but Storage cleanup failed for ` +
      `${image.storage_path}. Remove this orphaned file from ` +
      `Supabase Storage after verifying the path.`
    )
  }
}

export async function uploadFacilitatorPhoto(
  entryId: string,
  file: File
): Promise<void> {
  const extension = imageType(file)
  const client = await requireDraftEntry(entryId)
  const { data: existing, error: existingError } = await client
    .from('journal_entries')
    .select('facilitator_photo_path')
    .eq('id', entryId)
    .eq('status', 'draft')
    .single()

  if (existingError) throw new Error(existingError.message)

  const path =
    `entries/${entryId}/facilitator/` +
    `${crypto.randomUUID()}.${extension}`
  const storage = client.storage.from(BUCKET)

  const { error: uploadError } = await storage.upload(
    path,
    file,
    {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    }
  )

  if (uploadError) throw new Error(uploadError.message)

  const { error: updateError } = await client
    .from('journal_entries')
    .update({ facilitator_photo_path: path })
    .eq('id', entryId)
    .eq('status', 'draft')

  if (updateError) {
    const { error: cleanupError } = await storage.remove([path])
    if (cleanupError) {
      throw new Error(
        `Facilitator photo could not be saved, and cleanup failed for ${path}.`
      )
    }
    throw new Error(updateError.message)
  }

  if (existing.facilitator_photo_path) {
    const { error: cleanupError } = await storage.remove([
      existing.facilitator_photo_path,
    ])
    if (cleanupError) {
      throw new Error(
        `Facilitator photo replaced, but cleanup failed for ` +
        `${existing.facilitator_photo_path}.`
      )
    }
  }
}

export async function getAdminFacilitatorPhoto(
  entryId: string
): Promise<string | null> {
  const client = await requireDraftEntry(entryId)
  const { data, error } = await client
    .from('journal_entries')
    .select('facilitator_photo_path')
    .eq('id', entryId)
    .eq('status', 'draft')
    .single()

  if (error) throw new Error(error.message)
  if (!data?.facilitator_photo_path) return null

  const { data: signed, error: signedError } = await client.storage
    .from(BUCKET)
    .createSignedUrl(data.facilitator_photo_path, 300)

  if (signedError) throw new Error(signedError.message)
  return signed.signedUrl
}

export async function removeFacilitatorPhoto(
  entryId: string
): Promise<void> {
  const client = await requireDraftEntry(entryId)
  const { data: entry, error: entryError } = await client
    .from('journal_entries')
    .select('facilitator_photo_path')
    .eq('id', entryId)
    .eq('status', 'draft')
    .single()

  if (entryError) throw new Error(entryError.message)
  const path = entry.facilitator_photo_path
  if (!path) return

  const { error: updateError } = await client
    .from('journal_entries')
    .update({ facilitator_photo_path: null })
    .eq('id', entryId)
    .eq('status', 'draft')

  if (updateError) throw new Error(updateError.message)

  const { error: storageError } = await client.storage
    .from(BUCKET)
    .remove([path])

  if (storageError) {
    throw new Error(
      `Facilitator photo reference was cleared, but Storage cleanup failed ` +
      `for ${path}. Remove this orphaned file from Supabase Storage.`
    )
  }
}
