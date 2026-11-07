
import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  setJournalPublicationStatus,
  deleteJournalDraft,
} from '../services/journalAdmin'

type AdminEntry = {
  id: string
  slug: string
  title: string
  week_number: number | null
  status: 'draft' | 'published'
}

type DashboardResult =
  | { authorized: false }
  | {
      authorized: true
      email: string
      entries: AdminEntry[]
    }

async function loadDashboard(
  client: NonNullable<typeof supabase>
): Promise<DashboardResult> {
  const { data: userData, error: authError } =
    await client.auth.getUser()

  if (authError) throw authError

  if (!userData.user) {
    return { authorized: false }
  }

  const { data: isAdmin, error: roleError } =
    await client.rpc('is_current_journal_admin')

  if (roleError) throw roleError

  if (isAdmin !== true) {
    return { authorized: false }
  }

  const { data, error } = await client
    .from('journal_entries')
    .select('id, slug, title, week_number, status')
    .order('week_number', { ascending: true, nullsFirst: false })

  if (error) throw error

  return {
    authorized: true,
    email: userData.user.email ?? '',
    entries: (data ?? []) as AdminEntry[],
  }
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] =
    useState<boolean | null>(null)

  const [entries, setEntries] = useState<AdminEntry[]>([])
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let active = true
    const client = supabase

    if (!client) {
      setError('Supabase is not configured.')
      setLoading(false)
      return
    }

    void loadDashboard(client)
      .then((result) => {
        if (!active) return

        setAuthorized(result.authorized)

        if (result.authorized) {
          setEntries(result.entries)
          setEmail(result.email)
        }
      })
      .catch((err) => {
        if (!active) return

        console.error('Dashboard loading failed:', err)
        setError('Unable to load the CMS dashboard.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // Refresh the session list after any CMS operation.
  async function refreshEntries() {
    const client = supabase

    if (!client) {
      throw new Error('Supabase is not configured')
    }

    const { data, error } = await client
      .from('journal_entries')
      .select('id, slug, title, week_number, status')
      .order('week_number', { ascending: true, nullsFirst: false })

    if (error) throw new Error(error.message)

    setEntries((data ?? []) as AdminEntry[])
  }

  // Publish or unpublish one session.
  async function handlePublication(entry: AdminEntry) {
    const nextStatus =
      entry.status === 'draft' ? 'published' : 'draft'

    setBusyId(entry.id)
    setError('')
    setMessage('')

    try {
      await setJournalPublicationStatus(entry.id, nextStatus)
      await refreshEntries()

      setMessage(
        nextStatus === 'published'
          ? `"${entry.title}" published successfully.`
          : `"${entry.title}" unpublished successfully.`
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update publication status.'
      )
    } finally {
      setBusyId(null)
    }
  }

  // Delete an unpublished session after confirmation.
  async function handleDelete(entry: AdminEntry) {
    if (entry.status !== 'draft') return

    const confirmed = window.confirm(
      `Permanently delete "${entry.title}"?\n\n` +
      'This action cannot be undone.'
    )

    if (!confirmed) return

    setBusyId(entry.id)
    setError('')
    setMessage('')

    try {
      await deleteJournalDraft(entry.id)
      await refreshEntries()

      setMessage(`"${entry.title}" deleted successfully.`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete the draft.'
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleLogout() {
    const client = supabase
    if (!client) return

    setSigningOut(true)
    setError('')

    const { error: logoutError } = await client.auth.signOut()

    if (logoutError) {
      setError('Unable to sign out.')
      setSigningOut(false)
      return
    }

    navigate('/journal-admin/login', { replace: true })
  }

  if (loading) {
    return (
      <p className="py-24 text-center text-muted" role="status">
        Loading CMS Dashboard...
      </p>
    )
  }

  if (error && authorized === null) {
    return (
      <p className="py-24 text-center text-red-400" role="alert">
        {error}
      </p>
    )
  }

  if (authorized === false) {
    return <Navigate to="/journal-admin/login" replace />
  }

  const published = entries.filter(
    (entry) => entry.status === 'published'
  ).length

  const drafts = entries.length - published

  return (
    <main className="space-y-10 pb-16">

      {/* Dashboard header */}
      <header className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">
            University Journal
          </p>

          <h1 className="font-display text-5xl text-text sm:text-6xl">
            CMS Dashboard
          </h1>

          <p className="mt-3 text-sm text-muted">
            Signed in as {email}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={signingOut || busyId !== null}
          className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-text hover:border-accent disabled:opacity-50"
        >
          {signingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </header>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Entries', value: entries.length },
          { label: 'Published', value: published },
          { label: 'Drafts', value: drafts },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-surface p-6"
          >
            <p className="text-sm text-muted">
              {stat.label}
            </p>

            <p className="mt-3 text-4xl font-bold text-accent">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Feedback messages */}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-400/30 p-4 text-sm text-red-400"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-lg border border-accent/30 p-4 text-sm text-accent"
        >
          {message}
        </p>
      )}

      {/* Session management */}
      <section className="rounded-2xl bg-surface p-5 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text">
              Journal Entries
            </h2>

            <p className="mt-2 text-sm text-muted">
              Manage your university journal content
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/university-journal"
              className="text-sm font-semibold text-accent hover:underline"
            >
              View Public Journal ↗
            </Link>

            <Link
              to="/journal-admin/sessions/new"
              className="rounded-lg bg-accent px-5 py-3 text-sm font-bold text-[#131313]"
            >
              + Create Entry
            </Link>

            <Link
              to="/journal-admin/settings"
              className="rounded-lg border border-accent px-5 py-3 text-sm font-bold text-accent"
            >
              Journal Settings
            </Link>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/20 p-10 text-center">
            <h3 className="text-xl font-semibold text-text">
              No journal entries created yet
            </h3>

            <p className="mt-3 text-muted">
              Create your first journal entry to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 p-4"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-text">
                    {entry.title}
                  </h3>

                  <p className="mt-1 text-xs text-muted">
                    {entry.week_number
                      ? `Week ${entry.week_number}`
                      : 'Week not assigned'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={
                      entry.status === 'published'
                        ? 'rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent'
                        : 'rounded-full bg-white/10 px-3 py-1 text-xs text-muted'
                    }
                  >
                    {entry.status === 'published'
                      ? 'Published'
                      : 'Draft'}
                  </span>

                  {entry.status === 'draft' && (
                    <Link
                      to={`/journal-admin/sessions/${entry.id}/edit`}
                      className="rounded-lg border border-white/20 px-4 py-2 text-sm text-text hover:border-accent"
                    >
                      Edit
                    </Link>
                  )}

                  {entry.status === 'published' && (
                    <Link
                      to={`/university-journal/${entry.slug}`}
                      className="text-sm text-accent hover:underline"
                    >
                      View ↗
                    </Link>
                  )}

                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => void handlePublication(entry)}
                    className={
                      entry.status === 'draft'
                        ? 'rounded-lg bg-accent px-4 py-2 text-sm font-bold text-[#131313] disabled:opacity-50'
                        : 'rounded-lg border border-white/20 px-4 py-2 text-sm text-text hover:border-accent disabled:opacity-50'
                    }
                  >
                    {busyId === entry.id
                      ? 'Processing...'
                      : entry.status === 'draft'
                        ? 'Publish'
                        : 'Unpublish'}
                  </button>

                  {entry.status === 'draft' && (
                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() => void handleDelete(entry)}
                      className="rounded-lg border border-red-400/30 px-4 py-2 text-sm text-red-400 hover:border-red-400 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
