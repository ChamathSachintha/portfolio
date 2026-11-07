import { useEffect, useState, type ChangeEvent } from 'react'

import {
  getAdminFacilitatorPhoto,
  removeFacilitatorPhoto,
  uploadFacilitatorPhoto,
} from '../services/journalMedia'

interface Props {
  entryId: string
}

export default function FacilitatorPhotoManager({
  entryId,
}: Props) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    getAdminFacilitatorPhoto(entryId)
      .then((url) => {
        if (active) setPhotoUrl(url)
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load facilitator photo.'
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
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return

    setBusy(true)
    setError('')
    setMessage('')

    try {
      await uploadFacilitatorPhoto(entryId, file)
      const updated = await getAdminFacilitatorPhoto(entryId)
      setPhotoUrl(updated)
      setMessage('Facilitator photo saved.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save facilitator photo.'
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove() {
    if (!window.confirm('Remove this facilitator photo permanently?')) {
      return
    }

    setBusy(true)
    setError('')
    setMessage('')

    try {
      await removeFacilitatorPhoto(entryId)
      setPhotoUrl(null)
      setMessage('Facilitator photo removed.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to remove facilitator photo.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-5 rounded-2xl bg-surface p-6 sm:p-8">
      <div>
        <h2 className="text-2xl font-bold text-text">
          Facilitator Photo
        </h2>
        <p className="mt-2 text-sm text-muted">
          Optional JPG, PNG or WebP image. Maximum 5 MB.
        </p>
      </div>

      {loading ? (
        <p className="text-muted" role="status">
          Loading facilitator photo...
        </p>
      ) : (
        <>
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Current facilitator"
              className="h-40 w-40 rounded-xl object-cover"
            />
          )}

          <div className="flex flex-wrap gap-3">
            <label
              htmlFor="facilitator-photo-upload"
              className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-bold text-[#131313]"
            >
              {busy
                ? 'Processing...'
                : photoUrl
                  ? 'Replace Photo'
                  : 'Upload Photo'}
            </label>
            <input
              id="facilitator-photo-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={(event) => void handleUpload(event)}
              className="sr-only"
            />

            {photoUrl && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleRemove()}
                className="rounded-lg border border-red-400/30 px-4 py-2 text-sm text-red-400 disabled:opacity-40"
              >
                Remove Photo
              </button>
            )}
          </div>
        </>
      )}

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
    </section>
  )
}
