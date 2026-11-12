import { Link } from 'react-router-dom'
import { turtleConservationContent as project } from '../content/turtleConservation'

const imageBase = '/images/university-journal/turtle-conservation/'


function ContentSection({
  title,
  paragraphs,
}: {
  title: string
  paragraphs: readonly string[]
}) {
  return (
    <section className="space-y-5">
      <h2 className="font-display text-4xl font-black uppercase leading-none text-accent sm:text-5xl">
        {title}
      </h2>
      <div className="space-y-4 text-base leading-8 text-text">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  )
}

function ActivitySection({
  activity,
  index,
}: {
  activity: (typeof project.activities)[number]
  index: number
}) {
  const reversed = index % 2 === 1

  return (
    <section className="grid gap-7 rounded-2xl bg-surface p-5 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div className={reversed ? 'lg:order-2' : undefined}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
          Activity {String(index + 1).padStart(2, '0')}
        </p>
        <h3 className="mt-3 font-display text-3xl font-black uppercase leading-none text-text sm:text-4xl">
          {activity.title}
        </h3>
        <p className="mt-5 leading-8 text-muted">
          {activity.description}
        </p>
      </div>

      <div
        className={`grid gap-3 ${activity.images.length > 2 ? 'grid-cols-2' : 'sm:grid-cols-2'} ${reversed ? 'lg:order-1' : ''}`}
      >
        {activity.images.map((image, imageIndex) => (
          <img
            key={image}
            src={`${imageBase}${image}`}
            alt={`${activity.title}, photograph ${imageIndex + 1}`}
            className={`w-full rounded-xl object-cover ${activity.images.length === 2 ? 'aspect-[4/3]' : 'aspect-square'} ${activity.images.length === 2 && imageIndex === 0 ? 'sm:col-span-2 sm:aspect-[2/1]' : ''}`}
            loading="lazy"
          />
        ))}
      </div>
    </section>
  )
}

function ProjectLocationMap() {
  const { venueName, address, latitude, longitude, websiteUrl, googleMapsUrl } = project.location

  const hasVerifiedCoordinates =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180

  // The marker uses the published address's plus-code centre.
  // Keep the unmarked fallback for future updates with missing coordinates.
  const mapBounds = hasVerifiedCoordinates
    ? [longitude - 0.012, latitude - 0.008, longitude + 0.012, latitude + 0.008]
    : [79.3, 5.8, 82.2, 9.9]
  const bbox = mapBounds.join(',')
  const marker = hasVerifiedCoordinates ? `&marker=${latitude}%2C${longitude}` : ''
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik${marker}`
  const fullMapUrl = hasVerifiedCoordinates
    ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`
    : 'https://www.openstreetmap.org/#map=7/7.8731/80.7718'

  return (
    <section className="space-y-4" aria-labelledby="project-map-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Where we went
          </p>
          <h2
            id="project-map-heading"
            className="mt-2 font-display text-3xl font-black uppercase leading-none text-text sm:text-4xl"
          >
            Project Location
          </h2>
          {address && <p className="mt-2 text-sm text-muted">{address}</p>}
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center font-semibold text-accent hover:underline"
            >
              Visit conservation centre website ↗
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent hover:underline"
            >
              Open in Google Maps ↗
            </a>
          )}
          <a
            href={fullMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent hover:underline"
          >
            Open in OpenStreetMap ↗
          </a>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
        <iframe
          title={hasVerifiedCoordinates
            ? `Interactive map showing ${venueName || 'the turtle conservation site'}`
            : 'Interactive map preview of Sri Lanka; project venue is not yet marked'}
          src={embedUrl}
          loading="lazy"
          className="h-72 w-full border-0 sm:h-96"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 text-sm text-muted">
          <span>
            {hasVerifiedCoordinates
              ? (venueName || 'Project venue')
              : 'Map preview only. Add the exact venue and coordinates to show its location.'}
          </span>
          <span>Drag to move · Use +/− to zoom</span>
        </div>
      </div>
    </section>
  )
}

export default function TurtleConservationPage() {
  return (
    <article className="space-y-14 pb-16">
      <Link
        to="/university-journal"
        className="inline-block text-sm text-accent hover:underline"
      >
        ← Back to University Journal
      </Link>

      <header className="overflow-hidden rounded-2xl bg-surface">
        <div className="relative min-h-[30rem]">
          <img
            src={project.heroImage}
            alt="The project team at the beach"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-page via-page/70 to-page/10" />
          <div className="relative flex min-h-[30rem] flex-col justify-end p-6 sm:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
              {project.projectType}
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-5xl font-black uppercase leading-[0.86] text-text sm:text-7xl lg:text-8xl">
              {project.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-text">
              {project.subtitle}
            </p>
          </div>
        </div>
        <div className="grid gap-5 border-t border-white/10 p-6 sm:grid-cols-3 sm:p-8">
          {[
            ['Location', project.location.venueName || 'To be added'],
            ['Team Name', project.teamName || 'To be added'],
            ['Date', project.location.projectDate || 'To be added'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
              <p className="mt-2 font-bold text-text">{value}</p>
            </div>
          ))}
        </div>
      </header>

      <ProjectLocationMap />

      <ContentSection title="About the Project" paragraphs={project.overview} />
      <ContentSection title="Why We Chose This Project" paragraphs={project.purpose} />

      <section className="rounded-2xl border border-accent/25 bg-surface p-6 sm:p-10" aria-labelledby="sdg14-heading">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md bg-accent px-3 py-2 text-sm font-black uppercase text-page">
            SDG {project.sustainabilityGoal.number}
          </span>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
            United Nations Sustainable Development Goals
          </p>
        </div>
        <h2
          id="sdg14-heading"
          className="mt-5 font-display text-4xl font-black uppercase leading-none text-accent sm:text-5xl"
        >
          {project.sustainabilityGoal.title}
        </h2>
        <div className="mt-6 space-y-4 text-base leading-8 text-text">
          {project.sustainabilityGoal.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <a
          href={project.sustainabilityGoal.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex font-semibold text-accent hover:underline"
        >
          Learn about UN SDG 14 ↗
        </a>
      </section>

      <section className="space-y-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Hands-on learning
          </p>
          <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none text-text sm:text-6xl">
            What We Did
          </h2>
        </div>
        <div className="space-y-6">
          {project.activities.map((activity, index) => (
            <ActivitySection key={activity.title} activity={activity} index={index} />
          ))}
        </div>
      </section>

      <section className="grid gap-8 rounded-2xl bg-surface p-6 sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Our team
          </p>
          <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none text-text sm:text-5xl">
            Our Team
          </h2>
          <p className="mt-5 leading-8 text-muted">
            {project.teamIntroduction}
          </p>
          <ol className="mt-6 grid gap-2 text-sm text-text sm:grid-cols-2">
            {project.teamMembers.map((member) => (
              <li key={member} className="rounded-lg border border-white/10 px-3 py-2">
                {member}
              </li>
            ))}
          </ol>
        </div>
        <img
          src={project.teamImage}
          alt="The project team together"
          className="aspect-[4/3] w-full rounded-xl object-cover"
          loading="lazy"
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <ContentSection title="Our Expenses" paragraphs={project.expenses} />
        <figure className="overflow-hidden rounded-2xl bg-surface">
          <img
            src={project.certificatesImage}
            alt="Project team certificates"
            className="aspect-[4/3] w-full object-cover"
            loading="lazy"
          />
          <figcaption className="p-5 text-sm text-muted">
            A group photo with our certificates at the end of the visit.
          </figcaption>
        </figure>
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Photos from the day
          </p>
          <h2 className="mt-3 font-display text-4xl font-black uppercase leading-none text-text sm:text-6xl">
            Moments from the Project
          </h2>
        </div>
        <p className="max-w-3xl leading-8 text-muted">{project.galleryIntroduction}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {project.gallery.map((image, index) => (
            <a
              key={image}
              href={`${imageBase}${image}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`overflow-hidden rounded-xl bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`}
            >
              <img
                src={`${imageBase}${image}`}
                alt={`Turtle conservation project photograph ${index + 1}`}
                className="h-full min-h-44 w-full object-cover"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-accent/30 bg-accent p-6 text-page sm:p-10">
        <h2 className="font-display text-4xl font-black uppercase leading-none sm:text-5xl">
          Looking Back
        </h2>
        <div className="mt-6 space-y-4 leading-8">
          {project.reflection.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <div className="border-t border-white/10 pt-8">
        <Link
          to="/university-journal"
          className="font-semibold text-accent hover:underline"
        >
          ← Return to University Journal
        </Link>
      </div>
    </article>
  )
}
