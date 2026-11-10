import { FiArrowUpRight, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { portfolioContent } from '../content/portfolio'

export default function ContactPage() {
  const { contact, hero } = portfolioContent

  return (
    <div className="space-y-10">
      <section>
        <div className="rounded-panel bg-accent p-7 text-page sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em]">Get in Touch</p>
          <h1 className="mt-5 font-display text-5xl font-black uppercase leading-[0.82] sm:text-7xl">
            Have something in mind? Let&apos;s talk.
          </h1>
          <p className="mt-7 leading-7">
            Whether it&apos;s a website, a design project, a photoshoot, or just an idea worth exploring, I&apos;d love to hear about it.
          </p>
          <p className="mt-4 leading-7">
            I&apos;m always interested in working on something creative, solving problems, and connecting with people who share similar interests.
          </p>

          <div className="mt-8 border-t border-page/20 pt-6">
            <p className="text-xs font-bold uppercase tracking-widest">Email Me</p>
            <a className="mt-2 inline-flex items-center gap-2 break-all text-lg font-bold hover:underline" href={`mailto:${contact.email}`}>
              <FiMail aria-hidden="true" />
              {contact.email}
            </a>
          </div>

          <div className="mt-7 flex gap-4">
            <a className="social-link social-link--dark" href={hero.socialLinks.github.href} target="_blank" rel="noreferrer" aria-label="GitHub">
              <FiGithub size="1.4rem" aria-hidden="true" />
            </a>
            <a className="social-link social-link--dark" href={hero.socialLinks.linkedin.href} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <FiLinkedin size="1.4rem" aria-hidden="true" />
            </a>
          </div>

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-widest">I can help with</p>
            <ul className="mt-4 space-y-2 text-sm">
              {['Web Development', 'UI/UX Design', 'Photography & Creative Work', 'Collaborations'].map((item) => (
                <li key={item}>— {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <p className="text-center text-sm text-muted">
        Prefer email? <a className="font-bold text-accent hover:underline" href={`mailto:${contact.email}`}>{contact.email}</a>
        {' · '}
        <Link className="font-bold text-accent hover:underline" to="/projects">Explore my projects <FiArrowUpRight className="inline" aria-hidden="true" /></Link>
      </p>
    </div>
  )
}
