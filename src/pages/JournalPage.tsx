
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJournalLanding } from '../services/journal'
import type {
  JournalSettings,
  JournalEntryCard,
} from '../types/journal'

export default function JournalPage() {
  const [settings, setSettings] =
    useState<JournalSettings | null>(null)

  const [entries, setEntries] =
    useState<JournalEntryCard[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    async function loadJournal() {
      try {
        const data = await getJournalLanding()

        if (!active) return

        setSettings(data.settings)
        setEntries(data.entries)
      } catch (err) {
        console.error('Journal loading failed:', err)
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadJournal()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-12 pb-12">
      {/* MODULE HEADER */}
      <section className="rounded-panel bg-surface px-6 py-12 text-center sm:px-12 sm:py-20">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-accent">
          {settings?.module_title || 'University Journal'}
        </p>

        <h1 className="font-display text-5xl font-black leading-none text-text sm:text-7xl lg:text-8xl">
          {settings?.heading || 'Practical Journal'}
        </h1>

        {settings?.subheading && (
          <p className="mx-auto mt-5 max-w-2xl text-lg text-accent">
            {settings.subheading}
          </p>
        )}

        {settings?.introduction && (
          <p className="mx-auto mt-6 max-w-3xl leading-8 text-muted">
            {settings.introduction}
          </p>
        )}
      </section>

      {/* JOURNAL LIST */}
      <section>
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">
              Learning experiences
            </p>
            <h2 className="font-display text-4xl font-black text-text sm:text-6xl">
              Journal Entries
            </h2>
          </div>

          <span className="text-sm text-muted">
            {loading ? 'Loading' : `${entries.length} entries`}
          </span>
        </div>

        {loading && (
          <p className="py-12 text-center text-muted" role="status">
            Loading journal entries...
          </p>
        )}

        {error && (
          <p className="rounded-xl border border-white/10 bg-surface p-8 text-center text-muted" role="alert">
            Unable to load the journal. Please try again later.
          </p>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="rounded-panel bg-surface p-12 text-center">
            <h3 className="mb-3 text-xl font-bold text-text">
              No journal entries published yet
            </h3>
            <p className="text-muted">
              Journal entries will appear here once published.
            </p>
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {entries.map((entry) => (
              <Link
                key={entry.id}
                to={`/university-journal/${entry.slug}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-surface transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                <div className="flex aspect-video items-center justify-center overflow-hidden bg-[#202731]">
                  {entry.coverUrl ? (
                    <img
                      src={entry.coverUrl}
                      alt={entry.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-display text-3xl text-accent">
                      JOURNAL ENTRY
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">
                    {entry.week_number
                      ? `WEEK ${entry.week_number}`
                      : 'Week not assigned'}
                  </p>

                  <h3 className="mb-3 text-2xl font-bold text-text">
                    {entry.title}
                  </h3>

                  {(entry.subheading || entry.description) && (
                    <p className="mb-4 text-sm leading-6 text-muted">
                      {entry.subheading || entry.description}
                    </p>
                  )}

                  <span className="text-sm font-bold text-accent">
                    View Entry →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
