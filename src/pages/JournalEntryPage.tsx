
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getJournalSession } from '../services/journal'
import type { JournalSession } from '../types/journal'

function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

export default function JournalEntryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [session, setSession] = useState<JournalSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    setLoading(true)
    setError(false)
    setSession(null)

    if (!slug) {
      setLoading(false)
      return
    }

    async function load() {
      try {
        const result = await getJournalSession(slug!)
        if (active) setSession(result)
      } catch (err) {
        console.error('Could not load journal session:', err)
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return (
      <p className="py-24 text-center text-muted" role="status">
        Loading journal entry...
      </p>
    )
  }

  if (error) {
    return (
      <p className="py-24 text-center text-muted" role="alert">
        Unable to load this session. Please try again later.
      </p>
    )
  }

  if (!session) {
    return (
      <section className="py-24 text-center">
        <h1 className="font-display text-5xl text-text">
          Entry Not Found
        </h1>
        <p className="mt-4 text-muted">
          This entry is unavailable or has not been published.
        </p>
        <Link
          to="/university-journal"
          className="mt-8 inline-block text-accent underline"
        >
          Back to Journal
        </Link>
      </section>
    )
  }

  const { entry, coverUrl, facilitatorPhotoUrl, gallery } = session

  const facilitatorLink =
    entry.facilitator_link &&
    /^https?:\/\//i.test(entry.facilitator_link)
      ? entry.facilitator_link
      : null

  return (
    <article className="space-y-12 pb-16">
      <Link
        to="/university-journal"
        className="inline-block text-sm text-accent hover:underline"
      >
        ← Back to University Journal
      </Link>

      {/* Entry header */}
      <header className="rounded-2xl bg-surface p-6 sm:p-10">
        <p className="mb-5 text-sm uppercase tracking-widest text-accent">
          {entry.week_number
            ? `Week ${entry.week_number}`
            : 'Week not assigned'}
        </p>

        <h1 className="font-display text-5xl leading-tight text-text sm:text-7xl">
          {entry.title}
        </h1>

        {entry.subheading && (
          <p className="mt-6 max-w-3xl text-lg text-muted">
            {entry.subheading}
          </p>
        )}
      </header>

      {/* Cover image */}
      {coverUrl && (
        <img
          src={coverUrl}
          alt={entry.title}
          className="aspect-video w-full rounded-2xl object-cover"
        />
      )}

      {/* Description */}
      <section className="space-y-5">
        <h2 className="font-display text-4xl text-accent sm:text-5xl">
          Description
        </h2>
        <div className="whitespace-pre-line text-base leading-8 text-text">
          {entry.description}
        </div>
      </section>

      {/* Personal reflection */}
      {entry.reflection && (
        <section className="rounded-2xl bg-surface p-6 sm:p-10">
          <h2 className="mb-5 font-display text-4xl text-accent sm:text-5xl">
            My Thoughts & Reflections
          </h2>
          <p className="whitespace-pre-line leading-8 text-text">
            {entry.reflection}
          </p>
        </section>
      )}

      {entry.content_sections.map((section) => (
        <section key={section.id} className="space-y-5">
          <h2 className="font-display text-4xl text-accent sm:text-5xl">
            {section.title}
          </h2>
          <div className="space-y-4 text-base leading-8 text-text">
            {paragraphs(section.body).map((paragraph, index) => (
              <p key={`${section.id}-${index}`} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}

      {/* Optional facilitator */}
      {entry.facilitator_name && (
        <section className="space-y-5">
          <h2 className="font-display text-4xl text-accent sm:text-5xl">
            Session Conducted By
          </h2>

          <div className="flex flex-col gap-6 rounded-2xl bg-surface p-6 sm:flex-row sm:p-8">
            {facilitatorPhotoUrl && (
              <img
                src={facilitatorPhotoUrl}
                alt={entry.facilitator_name}
                className="h-32 w-32 shrink-0 rounded-xl object-cover"
              />
            )}

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-text">
                {entry.facilitator_name}
              </h3>

              {entry.facilitator_title && (
                <p className="text-accent">
                  {entry.facilitator_title}
                </p>
              )}

              {entry.facilitator_organization && (
                <p className="text-muted">
                  {entry.facilitator_organization}
                </p>
              )}

              {entry.facilitator_bio && (
                <p className="whitespace-pre-line leading-7 text-text">
                  {entry.facilitator_bio}
                </p>
              )}

              {facilitatorLink && (
                <a
                  href={facilitatorLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-accent hover:underline"
                >
                  Professional Profile ↗
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Session-specific gallery */}
      {gallery.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-display text-4xl text-accent sm:text-5xl">
            Session Gallery
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((image) =>
              image.url ? (
                <figure
                  key={image.id}
                  className="overflow-hidden rounded-xl bg-surface"
                >
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={image.url}
                      alt={image.alt_text || image.caption || entry.title}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  </a>

                  {image.caption && (
                    <figcaption className="p-4 text-sm text-muted">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              ) : null
            )}
          </div>
        </section>
      )}

      <div className="border-t border-white/10 pt-8">
        <Link
          to="/university-journal"
          className="font-semibold text-accent hover:underline"
        >
          ← View All Journal Entries
        </Link>
      </div>
    </article>
  )
}
