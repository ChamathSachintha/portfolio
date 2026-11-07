
import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import {
  createJournalDraft,
  type JournalDraftInput,
} from '../services/journalAdmin'
import type { JournalContentSection } from '../types/journal'

const initialForm: JournalDraftInput = {
  title: '',
  slug: '',
  week_number: null,
  session_date: null,
  subheading: '',
  description: '',
  reflection: '',
  content_sections: [],
  facilitator_name: '',
  facilitator_title: '',
  facilitator_organization: '',
  facilitator_bio: '',
  facilitator_link: '',
}

type AccessState =
  | 'checking'
  | 'authorized'
  | 'denied'
  | 'error'

function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const inputClass =
  'w-full rounded-lg border border-white/20 bg-[#131313] ' +
  'px-4 py-3 text-text outline-none focus:border-accent'

export default function AdminCreateSessionPage() {
  const navigate = useNavigate()

  const [access, setAccess] = useState<AccessState>('checking')
  const [form, setForm] = useState<JournalDraftInput>(
    initialForm
  )
  const [slugEdited, setSlugEdited] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const client = supabase

    if (!client) {
      setAccess('error')
      return
    }

    async function verifyAdmin() {
      const { data: userData, error: userError } =
        await client!.auth.getUser()

      if (userError || !userData.user) {
        if (active) setAccess('denied')
        return
      }

      const { data: isAdmin, error: roleError } =
        await client!.rpc('is_current_journal_admin')

      if (roleError) throw roleError

      if (active) {
        setAccess(isAdmin === true ? 'authorized' : 'denied')
      }
    }

    void verifyAdmin().catch((err) => {
      console.error('Admin verification failed:', err)
      if (active) setAccess('error')
    })

    return () => {
      active = false
    }
  }, [])

  function updateField<K extends keyof JournalDraftInput>(
    field: K,
    value: JournalDraftInput[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function addSection() {
    const section: JournalContentSection = {
      id: `section-${crypto.randomUUID()}`,
      title: '',
      body: '',
    }

    setForm((previous) => ({
      ...previous,
      content_sections: [...previous.content_sections, section],
    }))
  }

  function updateSection(
    id: string,
    field: 'title' | 'body',
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      content_sections: previous.content_sections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      ),
    }))
  }

  function removeSection(id: string) {
    setForm((previous) => ({
      ...previous,
      content_sections: previous.content_sections.filter(
        (section) => section.id !== id
      ),
    }))
  }

  function moveSection(index: number, direction: -1 | 1) {
    setForm((previous) => {
      const target = index + direction
      if (
        target < 0 ||
        target >= previous.content_sections.length
      ) {
        return previous
      }

      const content_sections = [...previous.content_sections]
      const [section] = content_sections.splice(index, 1)
      content_sections.splice(target, 0, section)
      return { ...previous, content_sections }
    })
  }

  function updateTitle(value: string) {
    setForm((previous) => ({
      ...previous,
      title: value,
      slug: slugEdited ? previous.slug : makeSlug(value),
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (
      !form.title.trim() ||
      form.week_number === null ||
      form.week_number < 1 ||
      form.week_number > 52
    ) {
      setError('Enter an entry title and a week number from 1 to 52.')
      return
    }

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug)) {
      setError(
        'The URL slug must contain lowercase letters, numbers, or hyphens.'
      )
      return
    }

    if (form.facilitator_link.trim()) {
      try {
        const url = new URL(form.facilitator_link)

        if (!['https:', 'http:'].includes(url.protocol)) {
          throw new Error('Invalid protocol')
        }
      } catch {
        setError('Enter a valid facilitator profile URL.')
        return
      }
    }

    setSaving(true)

    try {
      await createJournalDraft(form)
      navigate('/journal-admin')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save the session.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (access === 'checking') {
    return (
      <p className="py-24 text-center text-muted" role="status">
        Checking administrator access...
      </p>
    )
  }

  if (access === 'denied') {
    return <Navigate to="/journal-admin/login" replace />
  }

  if (access === 'error') {
    return (
      <p className="py-24 text-center text-red-400" role="alert">
        Unable to verify administrator access.
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
          Create Journal Entry
        </h1>

        <p className="mt-4 text-muted">
          Document a learning experience and save it as a draft.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Basic entry information */}
        <section className="space-y-5 rounded-2xl bg-surface p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-text">
            Entry Information
          </h2>

          <div>
            <label htmlFor="session-title" className="mb-2 block text-sm text-text">
              Entry Title *
            </label>
            <input
              id="session-title"
              required
              className={inputClass}
              value={form.title}
              onChange={(e) => updateTitle(e.target.value)}
              placeholder="Enter the journal entry title"
            />
          </div>

          <div>
            <label htmlFor="session-slug" className="mb-2 block text-sm text-text">
              URL Slug *
            </label>
            <input
              id="session-slug"
              required
              className={inputClass}
              value={form.slug}
              onChange={(e) => {
                updateField('slug', e.target.value.toLowerCase())
                setSlugEdited(true)
              }}
              placeholder="practical-session-01"
            />
            <p className="mt-2 text-xs text-muted">
              Used in the journal entry page URL.
            </p>
          </div>

          <div>
            <label htmlFor="week-number" className="mb-2 block text-sm text-text">
              Week Number *
            </label>
            <input
              id="week-number"
              type="number"
              required
              min={1}
              max={52}
              className={inputClass}
              value={form.week_number ?? ''}
              onChange={(e) =>
                updateField(
                  'week_number',
                  e.target.value ? Number(e.target.value) : null
                )
              }
            />
          </div>

          <div>
            <label htmlFor="session-subheading" className="mb-2 block text-sm text-text">
              Subheading
            </label>
            <input
              id="session-subheading"
              className={inputClass}
              value={form.subheading}
              onChange={(e) =>
                updateField('subheading', e.target.value)
              }
              placeholder="A short introduction to the session"
            />
          </div>
        </section>

        {/* Main content */}
        <section className="space-y-5 rounded-2xl bg-surface p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-text">
            Entry Content
          </h2>

          <div>
            <label htmlFor="session-description" className="mb-2 block text-sm text-text">
              About This Entry
            </label>
            <textarea
              id="session-description"
              rows={6}
              className={inputClass}
              value={form.description}
              onChange={(e) =>
                updateField('description', e.target.value)
              }
              placeholder="Describe what happened, the practical activities, and the work completed."
            />
          </div>

          <div>
            <label htmlFor="session-reflection" className="mb-2 block text-sm text-text">
              My Thoughts & Reflections
            </label>
            <textarea
              id="session-reflection"
              rows={6}
              className={inputClass}
              value={form.reflection}
              onChange={(e) =>
                updateField('reflection', e.target.value)
              }
              placeholder="What did you learn? What challenges did you face? What was your experience?"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-text">
                Custom Content Sections
              </h3>
              <p className="mt-2 text-sm text-muted">
                Add optional sections for activities, skills, outcomes, or other details.
              </p>
            </div>

            {form.content_sections.map((section, index) => (
              <div
                key={section.id}
                className="space-y-4 rounded-xl border border-white/10 p-4"
              >
                <input
                  aria-label={`Section ${index + 1} title`}
                  className={inputClass}
                  value={section.title}
                  onChange={(e) =>
                    updateSection(section.id, 'title', e.target.value)
                  }
                  placeholder="Section title"
                />
                <textarea
                  aria-label={`Section ${index + 1} body`}
                  rows={5}
                  className={inputClass}
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
                    disabled={index === form.content_sections.length - 1}
                    onClick={() => moveSection(index, 1)}
                    className="rounded-lg border border-white/20 px-3 py-2 text-sm text-text disabled:opacity-40"
                  >
                    Move Down
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className="rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-400"
                  >
                    Remove Section
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addSection}
              className="rounded-lg border border-accent px-4 py-2 text-sm font-bold text-accent"
            >
              + Add Section
            </button>
          </div>
        </section>

        {/* Optional session facilitator */}
        <section className="space-y-5 rounded-2xl bg-surface p-6 sm:p-8">
          <div>
            <h2 className="text-2xl font-bold text-text">
              Facilitator Information
            </h2>
            <p className="mt-2 text-sm text-muted">
              Optional — leave empty if no facilitator information is needed.
            </p>
          </div>

          {([
            ['facilitator_name', 'Facilitator Name', 'Full name'],
            ['facilitator_title', 'Designation', 'Professional position'],
            ['facilitator_organization', 'Organization', 'Institution or organization'],
            ['facilitator_link', 'Professional Profile URL', 'https://...'],
          ] as const).map(([field, label, placeholder]) => (
            <div key={field}>
              <label htmlFor={field} className="mb-2 block text-sm text-text">
                {label}
              </label>
              <input
                id={field}
                className={inputClass}
                value={form[field]}
                onChange={(e) =>
                  updateField(field, e.target.value)
                }
                placeholder={placeholder}
              />
            </div>
          ))}

          <div>
            <label htmlFor="facilitator-bio" className="mb-2 block text-sm text-text">
              Brief Biography
            </label>
            <textarea
              id="facilitator-bio"
              rows={4}
              className={inputClass}
              value={form.facilitator_bio}
              onChange={(e) =>
                updateField('facilitator_bio', e.target.value)
              }
              placeholder="Short introduction to the facilitator"
            />
          </div>
        </section>

        {error && (
          <p
            className="rounded-xl border border-red-400/30 p-4 text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-4">
          <Link
            to="/journal-admin"
            className="rounded-lg border border-white/20 px-6 py-3 text-text hover:border-accent"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-accent px-8 py-3 font-bold text-[#131313] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </main>
  )
}
