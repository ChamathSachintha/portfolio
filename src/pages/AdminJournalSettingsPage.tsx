import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'
import {
  getAdminJournalSettings,
  updateJournalSettings,
  type JournalSettingsInput,
} from '../services/journalSettingsAdmin'

type PageStatus = 'checking' | 'ready' | 'denied' | 'error'

const initialForm: JournalSettingsInput = {
  module_title: '',
  heading: '',
  subheading: '',
  introduction: '',
}

const inputClass =
  'w-full rounded-lg border border-white/20 bg-[#131313] ' +
  'px-4 py-3 text-text outline-none focus:border-accent'

export default function AdminJournalSettingsPage() {
  const [status, setStatus] = useState<PageStatus>('checking')
  const [form, setForm] = useState<JournalSettingsInput>(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    async function loadSettings() {
      try {
        const client = supabase
        if (!client) throw new Error('Supabase is not configured')

        const { data: userData, error: userError } =
          await client.auth.getUser()

        if (userError || !userData.user) {
          if (active) setStatus('denied')
          return
        }

        const { data: isAdmin, error: roleError } =
          await client.rpc('is_current_journal_admin')

        if (roleError) throw new Error(roleError.message)
        if (isAdmin !== true) {
          if (active) setStatus('denied')
          return
        }

        const settings = await getAdminJournalSettings()
        if (!active) return

        setForm({
          module_title: settings.module_title,
          heading: settings.heading,
          subheading: settings.subheading ?? '',
          introduction: settings.introduction ?? '',
        })
        setStatus('ready')
      } catch (err) {
        console.error('Journal settings loading failed:', err)
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load journal settings.'
          )
          setStatus('error')
        }
      }
    }

    void loadSettings()

    return () => {
      active = false
    }
  }, [])

  function updateField(
    field: keyof JournalSettingsInput,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.module_title.trim() || !form.heading.trim()) {
      setError('Module Name and Journal Heading are required.')
      return
    }

    setSaving(true)

    try {
      await updateJournalSettings(form)
      setMessage('Journal settings saved successfully.')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save journal settings.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (status === 'checking') {
    return (
      <p className="py-24 text-center text-muted" role="status">
        Checking administrator access...
      </p>
    )
  }

  if (status === 'denied') {
    return <Navigate to="/journal-admin/login" replace />
  }

  if (status === 'error') {
    return (
      <p className="py-24 text-center text-red-400" role="alert">
        {error}
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
          Journal Settings
        </h1>

        <p className="mt-4 text-muted">
          Manage the module information displayed on your University Journal homepage.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-surface p-6 sm:p-8"
      >
        <div>
          <label htmlFor="module-title" className="mb-2 block text-sm text-text">
            Module Name *
          </label>
          <input
            id="module-title"
            required
            className={inputClass}
            value={form.module_title}
            onChange={(event) =>
              updateField('module_title', event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="journal-heading" className="mb-2 block text-sm text-text">
            Journal Heading *
          </label>
          <input
            id="journal-heading"
            required
            className={inputClass}
            value={form.heading}
            onChange={(event) =>
              updateField('heading', event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="journal-subheading" className="mb-2 block text-sm text-text">
            Journal Subheading
          </label>
          <input
            id="journal-subheading"
            className={inputClass}
            value={form.subheading}
            onChange={(event) =>
              updateField('subheading', event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="journal-introduction" className="mb-2 block text-sm text-text">
            Introduction
          </label>
          <textarea
            id="journal-introduction"
            rows={7}
            className={inputClass}
            value={form.introduction}
            onChange={(event) =>
              updateField('introduction', event.target.value)
            }
          />
        </div>

        {error && (
          <p
            className="rounded-xl border border-red-400/30 p-4 text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {message && (
          <p
            className="rounded-xl border border-accent/30 p-4 text-accent"
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-accent px-8 py-3 font-bold text-[#131313] disabled:opacity-50"
          >
            {saving ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </main>
  )
}
