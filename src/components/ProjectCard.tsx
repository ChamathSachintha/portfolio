import { Link } from 'react-router-dom'
import {
  SiCss,
  SiHtml5,
  SiJavascript,
  SiLaravel,
  SiMysql,
  SiNextdotjs,
  SiPhp,
  SiPostgresql,
  SiTypescript,
} from 'react-icons/si'
import type { IconType } from 'react-icons'
import type { FeaturedProject, TechnologyIconName } from '../content/portfolio'
import type { ProjectCardData } from '../types/project'

const technologyIcons: Record<TechnologyIconName, IconType> = {
  css: SiCss,
  html: SiHtml5,
  javascript: SiJavascript,
  laravel: SiLaravel,
  mysql: SiMysql,
  nextjs: SiNextdotjs,
  php: SiPhp,
  postgresql: SiPostgresql,
  typescript: SiTypescript,
}

type ProjectCardProps = {
  project: FeaturedProject | ProjectCardData
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isCmsProject = 'short_description' in project
  const title = project.title
  const description = isCmsProject ? project.short_description : project.description
  const technologies = isCmsProject
    ? project.technologies.map((technology) => technology.name).join(' · ')
    : project.technologies
  const card = (
    <>
      <div className={isCmsProject
        ? 'flex min-h-48 items-center justify-center bg-[#202731] p-5'
        : `project-preview project-preview--${project.preview}`}>
        {isCmsProject && project.thumbnailUrl ? (
          <img src={project.thumbnailUrl} alt="" className="h-full w-full object-contain" loading="lazy" />
        ) : (
          <span>{!isCmsProject && project.preview === 'pixeltech' ? 'Pixeltech' : title}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-3xl font-black uppercase leading-[0.84] tracking-[-0.02em] text-text">
          {title}
        </h3>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-accent">
          {project.category}
        </p>
        <p className="mt-4 text-sm leading-6 text-muted">        {description}</p>
        <p className="mt-auto pt-5 text-xs font-normal leading-5 tracking-wide text-muted">
          {technologies}
        </p>
        {!isCmsProject && <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tools and technologies">
          {project.techIcons.map((technology) => (
            <li
              key={technology}
              className="tech-icon"
              title={technology}
            >
              {(() => {
                const TechnologyIcon = technologyIcons[technology]
                return (
                  <TechnologyIcon
                    aria-label={technology}
                    role="img"
                    size="1.15rem"
                  />
                )
              })()}
            </li>
          ))}
        </ul>}
        {!isCmsProject && project.status ? (
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-accent">
            {project.status}
          </p>
        ) : null}
      </div>
    </>
  )

  return isCmsProject ? (
    <Link
      className="group flex min-h-full flex-col overflow-hidden rounded-xl border border-transparent bg-surface shadow-panel transition duration-200 ease-out hover:-translate-y-1 hover:border-accent hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none motion-reduce:hover:transform-none"
      to={`/projects/${project.slug}`}
    >
      {card}
    </Link>
  ) : project.externalUrl ? (
    <a
      className="group flex min-h-full flex-col overflow-hidden rounded-xl border border-transparent bg-surface shadow-panel transition duration-200 ease-out hover:-translate-y-1 hover:border-accent hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none motion-reduce:hover:transform-none"
      href={project.externalUrl}
      target="_blank"
      rel="noreferrer"
    >
      {card}
    </a>
  ) : project.to ? (
    <Link
      className="group flex min-h-full flex-col overflow-hidden rounded-xl bg-surface shadow-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      to={project.to}
    >
      {card}
    </Link>
  ) : (
    <article className="flex min-h-full flex-col overflow-hidden rounded-xl bg-surface shadow-panel">
      {card}
    </article>
  )
}
