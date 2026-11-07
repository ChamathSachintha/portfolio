
import { useEffect, useState, type FormEvent } from 'react'
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { supabase } from '../lib/supabase'

import {
  getJournalDraftForEdit,
  updateJournalDraft,
  type JournalDraftInput,
} from '../services/journalAdmin'
import type { JournalContentSection } from '../types/journal'
import JournalMediaUploader from '../components/JournalMediaUploader'
import FacilitatorPhotoManager from '../components/FacilitatorPhotoManager'

type PageStatus =
  | 'loading'
  | 'ready'
  | 'unauthorized'
  | 'not-found'
  | 'error'

type Field = {
  key: keyof JournalDraftInput
  label: string
  type?: 'text' | 'number' | 'textarea'
  required?: boolean
}

const sections: {
  title: string
  description?: string
  fields: Field[]
}[] = [
  {
    title: 'Entry Information',
    fields: [
      { key: 'title', label: 'Entry Title', required: true },
      { key: 'slug', label: 'URL Slug', required: true },
      {
        key: 'week_number',
        label: 'Week Number',
        type: 'number',
        required: true,
      },
      { key: 'subheading', label: 'Subheading' },
    ],
  },
  {
    title: 'Entry Content',
    fields: [
      {
        key: 'description',
        label: 'About This Entry',
        type: 'textarea',
      },
      {
        key: 'reflection',
        label: 'My Thoughts & Reflections',
        type: 'textarea',
      },
    ],
  },
  {
    title: 'Facilitator Information',
    description: 'Optional facilitator information.',
    fields: [
      { key: 'facilitator_name', label: 'Facilitator Name' },
      { key: 'facilitator_title', label: 'Designation' },
      {
        key: 'facilitator_organization',
        label: 'Organization',
      },
      {
        key: 'facilitator_bio',
        label: 'Brief Biography',
        type: 'textarea',
      },
      {
        key: 'facilitator_link',
        label: 'Professional Profile URL',
      },
    ],
  },
]

const fieldClass =
  'w-full rounded-lg border border-white/20 ' +
  'bg-[#131313] px-4 py-3 text-text ' +
  'outline-none focus:border-accent'

function CustomSectionsEditor({
  sections,
  onChange,
}: {
  sections: JournalContentSection[]
  onChange: (sections: JournalContentSection[]) => void
}) {
  function updateSection(
    id: string,
    field: 'title' | 'body',
    value: string
  ) {
    onChange(
      sections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    )
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= sections.length) return

    const next = [...sections]
    const [section] = next.splice(index, 1)
    next.splice(target, 0, section)
    onChange(next)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-text">
          Custom Content Sections
        </h3>
        <p className="mt-2 text-sm text-muted">
          Add optional sections for activities, skills, outcomes, or other details.
        </p>
      </div>

      {sections.map((section, index) => (
        <div
          key={section.id}
          className="space-y-4 rounded-xl border border-white/10 p-4"
        >
          <input
            aria-label={`Section ${index + 1} title`}
            className={fieldClass}
            value={section.title}
            onChange={(e) =>
              updateSection(section.id, 'title', e.target.value)
            }
            placeholder="Section title"
          />
          <textarea
            aria-label={`Section ${index + 1} body`}
            rows={5}
            className={fieldClass}
            value={section.body}
            onChange={(e) =>
              updateSection(section.id, 'body', e.target.value)
            }
            placeholder="Write the section content..."
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => moveSection(index, -1)}
              className="rounded-lg border border-white/20 px-3 py-2 text-sm text-text disabled:opacity-40"
            >
              Move Up
            </button>
            <button
              type="button"
              disabled={index === sections.length - 1}
              onClick={() => moveSection(index, 1)}
              className="rounded-lg border border-white/20 px-3 py-2 text-sm text-text disabled:opacity-40"
            >
              Move Down
            </button>
            <button
              type="button"
              onClick={() =>
                onChange(
                  sections.filter((item) => item.id !== section.id)
                )
              }
              className="rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-400"
            >
              Remove Section
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          onChange([
            ...sections,
            {
              id: `section-${crypto.randomUUID()}`,
              title: '',
              body: '',
            },
          ])
        }
        className="rounded-lg border border-accent px-4 py-2 text-sm font-bold text-accent"
      >
        + Add Section
      </button>
    </div>
  )
}

export default function AdminEditSessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [status, setStatus] = useState<PageStatus>('loading')
  const [form, setForm] = useState<JournalDraftInput | null>(
    null
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const entryId = id

    if (!entryId) {
      setStatus('not-found')
      return
    }

    async function loadSession(draftId: string) {
      try {
        const client = supabase

        if (!client) {
          throw new Error('Supabase is not configured')
        }

        const { data: userData, error: userError } =
          await client.auth.getUser()

        if (userError || !userData.user) {
          if (active) setStatus('unauthorized')
          return
        }

        const { data: isAdmin, error: roleError } =
          await client.rpc('is_current_journal_admin')

        if (roleError) throw roleError

        if (isAdmin !== true) {
          if (active) setStatus('unauthorized')
          return
        }

        const draft = await getJournalDraftForEdit(draftId)
        if (!active) return

        if (!draft) {
          setStatus('not-found')
          return
        }

        setForm(draft)
        setStatus('ready')
      } catch (err) {
        console.error('Edit page loading failed:', err)

        if (active) {
          setStatus('error')
        }
      }
    }

    void loadSession(entryId)

    return () => {
      active = false
    }
  }, [id])

  function updateField<K extends keyof JournalDraftInput>(
    field: K,
    value: JournalDraftInput[K]
  ) {
    setForm((previous) =>
      previous
        ? { ...previous, [field]: value }
        : previous
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!id || !form) return

    setError('')

    if (
      !form.title.trim() ||
      form.week_number === null ||
      form.week_number < 1 ||
      form.week_number > 52 ||
      !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug)
    ) {
      setError('Enter a valid title, week number and URL slug.')
      return
    }

    if (form.facilitator_link.trim()) {
      try {
        const url = new URL(form.facilitator_link)

        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid URL protocol')
        }
      } catch {
        setError('Enter a valid facilitator profile URL.')
        return
      }
    }

    setSaving(true)

    try {
      await updateJournalDraft(id, form)
      navigate('/journal-admin', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update the session.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <p className="py-24 text-center text-muted" role="status">
        Loading session editor...
      </p>
    )
  }

  if (status === 'unauthorized') {
    return <Navigate to="/journal-admin/login" replace />
  }

  if (status === 'not-found') {
    return (
      <section className="py-24 text-center">
        <h1 className="text-3xl font-bold text-text">
          Draft Not Found
        </h1>
        <p className="mt-4 text-muted">
          This session does not exist or is not a draft.
        </p>
        <Link
          to="/journal-admin"
          className="mt-6 inline-block text-accent"
        >
          Back to Dashboard
        </Link>
      </section>
    )
  }

  if (status === 'error' || !form) {
    return (
      <p className="py-24 text-center text-red-400" role="alert">
        Unable to load the session editor.
      </p>
    )
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 pb-16">
      <header>
        <Link
          to="/journal-admin"
          className="text-sm text-accent hover:underline"
        >
          ← Back to CMS Dashboard
        </Link>

        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-accent">
          University Journal CMS
        </p>

        <h1 className="mt-3 font-display text-5xl text-text sm:text-6xl">
          Edit Journal Entry
        </h1>

        <p className="mt-4 text-muted">
          Update your journal entry and save the draft.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {sections.map((section) => (
          <section
            key={section.title}
            className="space-y-5 rounded-2xl bg-surface p-6 sm:p-8"
          >
            <h2 className="text-2xl font-bold text-text">
              {section.title}
            </h2>

            {section.description && (
              <p className="text-sm text-muted">
                {section.description}
              </p>
            )}

            {section.fields.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={field.key}
                  className="mb-2 block text-sm text-text"
                >
                  {field.label}
                  {field.required ? ' *' : ''}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    id={field.key}
                    rows={5}
                    className={fieldClass}
                    value={String(form[field.key] ?? '')}
                    onChange={(e) =>
                      updateField(field.key, e.target.value)
                    }
                  />
                ) : (
                  <input
                    id={field.key}
                    type={field.type === 'number' ? 'number' : 'text'}
                    min={field.type === 'number' ? 1 : undefined}
                    max={field.type === 'number' ? 52 : undefined}
                    required={field.required}
                    className={fieldClass}
                    value={String(form[field.key] ?? '')}
                    onChange={(e) =>
                      updateField(
                        field.key,
                        field.type === 'number'
                          ? e.target.value
                            ? Number(e.target.value)
                            : null
                          : e.target.value
                      )
                    }
                  />
                )}
              </div>
            ))}

            {section.title === 'Entry Content' && (
              <CustomSectionsEditor
                sections={form.content_sections}
                onChange={(content_sections) =>
                  setForm({ ...form, content_sections })
                }
              />
            )}
          </section>
        ))}

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-400/30 p-4 text-red-400"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-4">
          <Link
            to="/journal-admin"
            className="rounded-lg border border-white/20 px-6 py-3 text-text"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-accent px-8 py-3 font-bold text-[#131313] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Journal entry image management */}
      {id && <JournalMediaUploader entryId={id} />}
      {id && <FacilitatorPhotoManager entryId={id} />}
    </main>
  )
}
