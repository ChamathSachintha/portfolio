import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminHubPage() {
  const navigate = useNavigate()
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true

    async function verifyAccess() {
      if (!supabase) throw new Error('Supabase is not configured.')
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw new Error(userError.message)
      if (!userData.user) {
        if (active) setAuthorized(false)
        return
      }

      const { data: isAdmin, error: roleError } =
        await supabase.rpc('is_current_journal_admin')
      if (roleError) throw new Error(roleError.message)
      if (active) {
        setEmail(userData.user.email ?? '')
        setAuthorized(isAdmin === true)
      }
    }

    void verifyAccess().catch((err) => {
      console.error('Admin hub access check failed:', err)
      if (active) {
        setError(err instanceof Error ? err.message : 'Unable to verify administrator access.')
        setAuthorized(false)
      }
    })

    return () => {
      active = false
    }
  }, [])

  async function handleLogout() {
    if (!supabase) return
    setBusy(true)
    const { error: logoutError } = await supabase.auth.signOut()
    if (logoutError) {
      setError(logoutError.message)
      setBusy(false)
      return
    }
    navigate('/admin/login', { replace: true })
  }

  if (authorized === null) {
    return <p className="py-24 text-center text-muted" role="status">Checking administrator access...</p>
  }

  if (!authorized) {
    return error
      ? <p className="py-24 text-center text-red-400" role="alert">{error}</p>
      : <Navigate to="/admin/login" replace />
  }

  return (
    <main className="mx-auto max-w-5xl space-y-10 pb-16">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Portfolio Administration</p>
          <h1 className="mt-3 font-display text-5xl text-text sm:text-6xl">Admin Hub</h1>
          <p className="mt-3 text-sm text-muted">Signed in as {email}</p>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={busy}
          className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-text hover:border-accent disabled:opacity-50"
        >
          {busy ? 'Signing out...' : 'Sign Out'}
        </button>
      </header>

      {error && <p className="rounded-lg border border-red-400/30 p-4 text-red-400" role="alert">{error}</p>}

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl bg-surface p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Content</p>
          <h2 className="mt-3 font-display text-4xl text-text">University Journal</h2>
          <p className="mt-4 leading-7 text-muted">Create, edit, publish, and organize practical-session journal entries.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/journal-admin" className="rounded-lg bg-accent px-5 py-3 text-sm font-bold text-page">Open Journal CMS</Link>
            <Link to="/journal-admin/settings" className="rounded-lg border border-accent px-5 py-3 text-sm font-bold text-accent">Settings</Link>
          </div>
        </article>

        <article className="rounded-2xl bg-surface p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Portfolio</p>
          <h2 className="mt-3 font-display text-4xl text-text">Software Projects</h2>
          <p className="mt-4 leading-7 text-muted">Manage project case studies, screenshots, publication, and homepage featured slots.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/portfolio-admin/projects" className="rounded-lg bg-accent px-5 py-3 text-sm font-bold text-page">Open Projects CMS</Link>
            <Link to="/portfolio-admin/featured" className="rounded-lg border border-accent px-5 py-3 text-sm font-bold text-accent">Featured Projects</Link>
          </div>
        </article>
      </section>
    </main>
  )
}
