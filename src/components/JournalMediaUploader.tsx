
import {
  useEffect,
  useState,
  type ChangeEvent,
} from 'react'

import {
  getAdminJournalGallery,
  deleteJournalGalleryImage,
  clearJournalThumbnail,
  setJournalThumbnail,
  updateJournalGalleryImage,
  updateJournalGalleryOrder,
  uploadJournalGalleryImage,
  type JournalGalleryImage,
} from '../services/journalMedia'

interface Props {
  entryId: string
}

export default function JournalMediaUploader({
  entryId,
}: Props) {
  const [images, setImages] =
    useState<JournalGalleryImage[]>([])

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [busyImageId, setBusyImageId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    getAdminJournalGallery(entryId)
      .then((data) => {
        if (active) setImages(data)
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load images.'
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [entryId])

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.currentTarget.files ?? []
    )

    // Allow selecting the same file again later.
    event.currentTarget.value = ''

    if (files.length === 0) return

    setUploading(true)
    setError('')
    setMessage('')

    let completed = 0
    const failures: string[] = []

    for (const file of files) {
      try {
        await uploadJournalGalleryImage(
          entryId,
          file
        )

        completed++
      } catch (err) {
        failures.push(
          err instanceof Error
            ? err.message
            : `Unable to upload ${file.name}`
        )
      }
    }

    try {
      const updated =
        await getAdminJournalGallery(entryId)

      setImages(updated)
    } catch (err) {
      failures.push(
        err instanceof Error
          ? err.message
          : 'Unable to refresh gallery.'
      )
    }

    if (completed > 0) {
      setMessage(
        `${completed} image(s) uploaded successfully.`
      )
    }

    if (failures.length > 0) {
      setError(failures.join('\n'))
    }

    setUploading(false)
  }

  function updateImage(
    imageId: string,
    field: 'caption' | 'alt_text',
    value: string
  ) {
    setImages((previous) =>
      previous.map((image) =>
        image.id === imageId
          ? { ...image, [field]: value }
          : image
      )
    )
  }

  async function saveImage(image: JournalGalleryImage) {
    setBusyImageId(image.id)
    setError('')
    setMessage('')

    try {
      await updateJournalGalleryImage(entryId, image.id, {
        caption: image.caption ?? '',
        alt_text: image.alt_text ?? '',
      })
      setMessage('Image details saved.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save image details.'
      )
    } finally {
      setBusyImageId(null)
    }
  }

  async function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= images.length) return

    const reordered = [...images]
    const [image] = reordered.splice(index, 1)
    reordered.splice(target, 0, image)
    setImages(reordered)
    setBusyImageId(image.id)
    setError('')
    setMessage('')

    try {
      await updateJournalGalleryOrder(
        entryId,
        reordered.map((item) => item.id)
      )
      setMessage('Gallery order saved.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save gallery order.'
      )
      const refreshed = await getAdminJournalGallery(entryId)
      setImages(refreshed)
    } finally {
      setBusyImageId(null)
    }
  }

  async function selectThumbnail(image: JournalGalleryImage) {
    setBusyImageId(image.id)
    setError('')
    setMessage('')

    try {
      if (image.is_thumbnail) {
        await clearJournalThumbnail(entryId)
      } else {
        await setJournalThumbnail(entryId, image.id)
      }
      setImages((previous) =>
        previous.map((item) => ({
          ...item,
          is_thumbnail: image.is_thumbnail
            ? false
            : item.id === image.id,
        }))
      )
      setMessage(
        image.is_thumbnail
          ? 'Thumbnail removed.'
          : 'Thumbnail selected.'
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update the thumbnail.'
      )
    } finally {
      setBusyImageId(null)
    }
  }

  async function deleteImage(image: JournalGalleryImage) {
    if (
      !window.confirm(
        'Delete this image permanently? This action cannot be undone.'
      )
    ) {
      return
    }

    setBusyImageId(image.id)
    setError('')
    setMessage('')

    try {
      await deleteJournalGalleryImage(entryId, image.id)
      setImages((previous) =>
        previous.filter((item) => item.id !== image.id)
      )
      setMessage('Image deleted successfully.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete image.'
      )
    } finally {
      setBusyImageId(null)
    }
  }

  return (
    <section className="space-y-6 rounded-2xl bg-surface p-6 sm:p-8">
      <div>
        <h2 className="text-2xl font-bold text-text">
          Entry Image Gallery
        </h2>

        <p className="mt-2 text-sm text-muted">
          Upload photographs related to this journal
          entry. Images are stored separately from
          your portfolio Gallery.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-white/20 p-6 text-center">
        <label
          htmlFor="journal-gallery-upload"
          className={
            uploading
              ? 'block cursor-not-allowed text-muted'
              : 'block cursor-pointer text-accent'
          }
        >
          <span className="block text-lg font-semibold">
            {uploading
              ? 'Uploading images...'
              : '+ Select Images'}
          </span>

          <span className="mt-2 block text-sm text-muted">
            JPG, PNG or WebP · Maximum 5 MB each
          </span>
        </label>

        <input
          id="journal-gallery-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploading || busyImageId !== null}
          onChange={(event) => void handleUpload(event)}
          className="sr-only"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="whitespace-pre-line rounded-lg border border-red-400/30 p-4 text-sm text-red-400"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="rounded-lg border border-accent/30 p-4 text-sm text-accent"
        >
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-muted" role="status">
          Loading images...
        </p>
      ) : images.length === 0 ? (
        <p className="text-sm text-muted">
          No images uploaded yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => {
            return (
            <div
              key={image.id}
              className="overflow-hidden rounded-xl border border-white/10"
            >
              {image.url ? (
                <img
                  src={image.url}
                  alt={image.alt_text ?? 'Journal image'}
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-[#202731] text-sm text-muted">
                  Preview unavailable
                </div>
              )}

              <div className="space-y-3 p-3">
                {image.is_thumbnail && (
                  <p className="text-xs font-bold uppercase tracking-widest text-accent">
                    Current Thumbnail
                  </p>
                )}

                <label className="block text-xs text-muted">
                  Caption
                  <input
                    className="mt-1 w-full rounded-lg border border-white/20 bg-[#131313] px-3 py-2 text-sm text-text outline-none focus:border-accent"
                    value={image.caption ?? ''}
                    onChange={(event) =>
                      updateImage(
                        image.id,
                        'caption',
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="block text-xs text-muted">
                  Alt text
                  <input
                    className="mt-1 w-full rounded-lg border border-white/20 bg-[#131313] px-3 py-2 text-sm text-text outline-none focus:border-accent"
                    value={image.alt_text ?? ''}
                    onChange={(event) =>
                      updateImage(
                        image.id,
                        'alt_text',
                        event.target.value
                      )
                    }
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyImageId !== null || index === 0}
                    onClick={() => void moveImage(index, -1)}
                    className="rounded-lg border border-white/20 px-2 py-1 text-xs text-text disabled:opacity-40"
                  >
                    Move Up
                  </button>
                  <button
                    type="button"
                    disabled={
                      busyImageId !== null ||
                      index === images.length - 1
                    }
                    onClick={() => void moveImage(index, 1)}
                    className="rounded-lg border border-white/20 px-2 py-1 text-xs text-text disabled:opacity-40"
                  >
                    Move Down
                  </button>
                  <button
                    type="button"
                    disabled={busyImageId !== null}
                    onClick={() => void saveImage(image)}
                    className="rounded-lg bg-accent px-2 py-1 text-xs font-bold text-[#131313] disabled:opacity-40"
                  >
                    Save Details
                  </button>
                  <button
                    type="button"
                    disabled={busyImageId !== null}
                    onClick={() => void selectThumbnail(image)}
                    className="rounded-lg border border-accent px-2 py-1 text-xs text-accent disabled:opacity-40"
                  >
                    {image.is_thumbnail
                      ? 'Remove Thumbnail'
                      : 'Set as Thumbnail'}
                  </button>
                  <button
                    type="button"
                    disabled={busyImageId !== null}
                    onClick={() => void deleteImage(image)}
                    className="rounded-lg border border-red-400/30 px-2 py-1 text-xs text-red-400 disabled:opacity-40"
                  >
                    Delete Image
                  </button>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
