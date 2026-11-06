import { LinkButton } from '../components/Button'
import { ProjectCard } from '../components/ProjectCard'
import { portfolioContent } from '../content/portfolio'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const { hero, introduction, featuredProjects, contact } = portfolioContent

  return (
    <div className="space-y-7">
      <section className="relative flex min-h-[32rem] items-center justify-center overflow-hidden px-0 py-16 text-center sm:min-h-[38rem] lg:min-h-[42rem]">
        <div aria-hidden="true" className="hero-outline">
          <div className="hero-marquee hero-marquee--left">
            <div className="hero-marquee__track">
              <span>{hero.skillRows[0]}&nbsp;&nbsp;</span>
              <span>{hero.skillRows[0]}&nbsp;&nbsp;</span>
              <span>{hero.skillRows[0]}&nbsp;&nbsp;</span>
              <span>{hero.skillRows[0]}&nbsp;&nbsp;</span>
            </div>
          </div>
          <div className="hero-marquee hero-marquee--right">
            <div className="hero-marquee__track">
              <span>{hero.skillRows[1]}&nbsp;&nbsp;</span>
              <span>{hero.skillRows[1]}&nbsp;&nbsp;</span>
              <span>{hero.skillRows[1]}&nbsp;&nbsp;</span>
              <span>{hero.skillRows[1]}&nbsp;&nbsp;</span>
            </div>
          </div>
        </div>
        <div className="relative z-10 max-w-4xl">
          <p className="text-base text-accent sm:text-xl">{hero.greeting}</p>
          <h1 className="mt-4 font-display text-[4.25rem] font-black uppercase leading-[0.72] tracking-[-0.045em] text-accent sm:whitespace-nowrap sm:text-[6.5rem] md:text-[8rem] lg:text-[10rem]">
            {hero.name}
          </h1>
          <p className="mx-auto mt-9 max-w-xl text-base leading-6 text-accent sm:text-xl">
            {hero.headline}
          </p>
          <p className="mt-1 text-sm leading-6 text-accent sm:text-base">
            {hero.secondaryTitle}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted sm:text-sm">
            {hero.affiliation}
          </p>
          <div className="mt-5 flex items-center justify-center gap-6">
            <a
              href={hero.socialLinks.linkedin.href}
              target="_blank"
              rel="noreferrer"
              aria-label={hero.socialLinks.linkedin.label}
            >
              <img
                className="h-9 w-9 object-contain"
                src={hero.socialLinks.linkedin.image}
                alt="LinkedIn"
              />
            </a>
            <a
              href={hero.socialLinks.github.href}
              target="_blank"
              rel="noreferrer"
              aria-label={hero.socialLinks.github.label}
            >
              <img
                className="h-9 w-9 object-contain"
                src={hero.socialLinks.github.image}
                alt="GitHub"
              />
            </a>
          </div>
        </div>
      </section>

      <section className="rounded-panel bg-accent px-7 py-10 text-page sm:px-12 sm:py-14">
          <h2 className="text-center font-display text-5xl font-black uppercase leading-[0.8] tracking-[-0.03em] sm:text-7xl">
            About
          </h2>
          <div className="mx-auto mt-8 max-w-5xl">
            <p className="text-sm leading-6 sm:text-base sm:leading-7 lg:text-lg lg:leading-8">
              {introduction}
            </p>
            <div className="mt-7 flex justify-end">
              <LinkButton className="!bg-page !text-accent hover:!bg-surface" to="/about">
                More About Me <span aria-hidden="true" className="ml-2">→</span>
              </LinkButton>
            </div>
          </div>
        </section>

      <section aria-labelledby="recent-projects">
          <div className="flex items-center justify-between gap-4 rounded-xl bg-surface px-6 py-6 sm:px-8">
            <h2 id="recent-projects" className="font-display text-4xl font-black uppercase leading-[0.82] tracking-[-0.02em] sm:text-6xl">
              Recent Projects
            </h2>
            <Link
              className="shrink-0 text-xs font-bold text-text transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:text-sm"
              to="/projects"
            >
              See all <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 min-[768px]:grid-cols-2 min-[1200px]:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>
          <div className="mt-7 flex justify-center">
            <LinkButton to="/projects">
              View All Projects <span aria-hidden="true" className="ml-2">→</span>
            </LinkButton>
          </div>
        </section>

      <section className="rounded-panel bg-accent px-7 py-10 text-page sm:px-12 sm:py-14">
          <div className="flex flex-col gap-10 min-[900px]:grid min-[900px]:grid-cols-[1.15fr_0.85fr] min-[900px]:items-center">
            <div className="max-w-2xl">
              <h2 className="whitespace-normal font-display text-6xl font-black uppercase leading-[0.78] tracking-[-0.03em] sm:text-7xl min-[900px]:whitespace-nowrap min-[1200px]:text-8xl">
                {contact.heading}
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-6 sm:text-base sm:leading-7">
                {contact.description}
              </p>
            </div>
            <div className="flex w-full max-w-[16rem] flex-col items-center gap-8 min-[900px]:justify-self-end">
              <div className="text-center">
                <p className="text-sm font-bold sm:text-base">Follow me on</p>
                <div className="mt-3 flex items-center justify-center gap-4">
                  <a
                    className="social-link social-link--dark"
                    href={hero.socialLinks.linkedin.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={hero.socialLinks.linkedin.label}
                  >
                    <img src={hero.socialLinks.linkedin.image} alt="LinkedIn" />
                  </a>
                  <a
                    className="social-link social-link--dark"
                    href={hero.socialLinks.github.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={hero.socialLinks.github.label}
                  >
                    <img src={hero.socialLinks.github.image} alt="GitHub" />
                  </a>
                </div>
              </div>
              <LinkButton
                className="contact-outline-button whitespace-nowrap !bg-transparent !text-page hover:!bg-page hover:!text-accent"
                to="/contact"
              >
                Contact Me <span aria-hidden="true" className="ml-2">↗</span>
              </LinkButton>
            </div>
          </div>
        </section>
    </div>
  )
}
