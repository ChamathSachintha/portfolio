import {
  FiCamera,
  FiCode,
  FiEdit3,
  FiPenTool,
} from 'react-icons/fi'
import { useState } from 'react'
import { LinkButton } from '../components/Button'
import { portfolioContent } from '../content/portfolio'

const disciplines = [
  {
    title: 'Software Development',
    description: 'Building practical web experiences with thoughtful structure, reliable functionality and a focus on users.',
    icon: FiCode,
  },
  {
    title: 'UI/UX Design',
    description: 'Exploring clear interfaces, useful interactions and visual systems that make digital products easier to use.',
    icon: FiPenTool,
  },
  {
    title: 'Photography & Visual Storytelling',
    description: 'Capturing people, places and moments through photography and a considered visual perspective.',
    icon: FiCamera,
  },
  {
    title: 'Graphic Design & Digital Creation',
    description: 'Creating visual content, campaign materials and digital compositions across different creative formats.',
    icon: FiEdit3,
  },
]

function AboutPortrait() {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <div className="relative overflow-hidden rounded-panel bg-[#202731]">
      {imageFailed ? (
        <div className="flex aspect-[4/5] items-center justify-center p-8 text-center">
          <p className="font-display text-4xl uppercase leading-none text-accent">
            Chamath
            <br />
            Sachintha
          </p>
        </div>
      ) : (
        <>
          <img
            src="/images/about/chamath-portrait.png"
            alt="Portrait of Chamath Sachintha"
            className="aspect-[4/5] h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#131313] via-[#131313]/65 to-transparent"
          />
        </>
      )}
    </div>
  )
}

export default function AboutPage() {
  const { about } = portfolioContent
  const toolkitGroups: Array<{ label: string; tools: readonly string[] }> = [
    { label: 'Development', tools: about.toolkit.development },
    { label: 'Creative', tools: about.toolkit.creative },
    { label: 'Collaboration', tools: about.toolkit.collaboration },
  ]

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="rounded-panel bg-surface px-7 py-10 sm:px-12 sm:py-14">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
            About Me
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-6xl font-black uppercase leading-[0.82] tracking-[-0.03em] text-text sm:text-8xl">
            Hey, I&apos;m Chamath.
          </h1>
          <p className="mt-8 font-display text-3xl uppercase leading-none text-accent sm:text-4xl">
            I build, design and create.
          </p>
          <p className="mt-7 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            {about.intro}
          </p>
          <LinkButton className="mt-8" to="/projects">
            Explore My Projects <span aria-hidden="true" className="ml-2">→</span>
          </LinkButton>
        </div>

        <AboutPortrait />
      </section>

      <section className="rounded-panel bg-accent px-7 py-10 text-page sm:px-12 sm:py-14">
        <p className="text-sm font-bold uppercase tracking-[0.2em]">A Little About Me</p>
        <h2 className="mt-4 font-display text-5xl font-black uppercase leading-[0.82] sm:text-7xl">
          Code meets creativity.
        </h2>
        <p className="mt-8 max-w-4xl text-base leading-7 sm:text-lg sm:leading-8">
          {portfolioContent.introduction}
        </p>
      </section>

      <section>
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">What I Do</p>
          <h2 className="mt-3 font-display text-5xl font-black uppercase leading-[0.82] text-text sm:text-7xl">
            A mix of disciplines.
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {disciplines.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-xl border border-white/10 bg-surface p-6 transition duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:transform-none"
            >
              <Icon className="text-accent" size="2rem" aria-hidden="true" />
              <h3 className="mt-6 font-display text-3xl font-black uppercase leading-none text-text">
                {title}
              </h3>
              <p className="mt-4 leading-7 text-muted">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-panel bg-surface p-7 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Experience</p>
          <div className="mt-7 space-y-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Development Team Leader</p>
              <h3 className="mt-2 font-display text-3xl uppercase leading-none text-text">Workflow HRMS</h3>
              <p className="mt-4 leading-7 text-muted">
                Leading development work across authentication, session management, RBAC, system settings, company settings, dashboard integration and email functionality.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Co-founder &amp; Creative Director</p>
              <h3 className="mt-2 font-display text-3xl uppercase leading-none text-text">Merae Global</h3>
              <p className="mt-4 leading-7 text-muted">
                Working across creative direction, digital design, visual communication and the development of ideas into meaningful creative work.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-panel bg-accent p-7 text-page sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em]">Beyond the Screen</p>
          <h2 className="mt-4 font-display text-5xl font-black uppercase leading-[0.82] sm:text-6xl">
            Stay curious.
          </h2>
          <p className="mt-7 leading-8">{about.beyondScreen}</p>
        </article>
      </section>

      <section className="rounded-panel bg-surface p-7 sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">My Toolkit</p>
        <div className="mt-7 grid gap-8 md:grid-cols-3">
          {toolkitGroups.map(({ label, tools }) => (
            <div key={label}>
              <h3 className="font-display text-3xl uppercase leading-none text-text">{label}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {tools.map((tool) => (
                  <li key={tool} className="rounded-full border border-accent/50 px-3 py-2 text-sm text-accent">
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-panel bg-accent px-7 py-10 text-page sm:px-12 sm:py-14">
        <h2 className="font-display text-5xl font-black uppercase leading-[0.82] sm:text-7xl">
          Let&apos;s make something meaningful.
        </h2>
        <div className="mt-8 flex flex-wrap gap-4">
          <LinkButton className="!bg-page !text-accent hover:!bg-surface" to="/projects">
            Explore My Projects
          </LinkButton>
          <LinkButton className="!bg-transparent !text-page ring-2 ring-page hover:!bg-page hover:!text-accent" to="/contact">
            Get in Touch
          </LinkButton>
        </div>
      </section>
    </div>
  )
}
