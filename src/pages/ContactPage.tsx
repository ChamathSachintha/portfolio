import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FiArrowUpRight, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { portfolioContent } from '../content/portfolio'

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string
        callback: (token: string) => void
        'expired-callback': () => void
        'error-callback': () => void
      }) => string
      reset: (widgetId: string) => void
    }
  }
}

const inquiryTypes = [
  'Web Development',
  'UI/UX Design',
  'Photography',
  'Graphic Design / Digital Content',
  'Collaboration',
  'Other',
]

type FormValues = {
  name: string
  email: string
  inquiryType: string
  message: string
  website: string
}

const initialForm: FormValues = {
  name: '',
  email: '',
  inquiryType: '',
  message: '',
  website: '',
}

const inputClass =
  'mt-2 w-full rounded-lg border border-white/20 bg-[#131313] px-4 py-3 text-text outline-none transition-colors focus:border-accent'

export default function ContactPage() {
  const { contact, hero } = portfolioContent
  const [form, setForm] = useState(initialForm)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey || !turnstileRef.current) return

    const renderWidget = () => {
      if (!window.turnstile || !turnstileRef.current || widgetId.current) return
      widgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        callback: setTurnstileToken,
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
      })
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
    )
    if (existingScript) {
      renderWidget()
      existingScript.addEventListener('load', renderWidget)
      return () => existingScript.removeEventListener('load', renderWidget)
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.addEventListener('load', renderWidget)
    document.head.appendChild(script)
    return () => script.removeEventListener('load', renderWidget)
  }, [siteKey])

  function updateField(field: keyof FormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function validate() {
    if (!form.name.trim() || !form.email.trim() || !form.inquiryType || !form.message.trim()) {
      return 'Please complete all required fields.'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Please enter a valid email address.'
    }
    if (form.message.trim().length < 10) {
      return 'Please provide a little more detail in your message.'
    }
    if (!siteKey) {
      return 'Online message delivery is not configured yet. Please use the email link instead.'
    }
    if (!turnstileToken) {
      return 'Please complete the security check before sending.'
    }
    return ''
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setBusy(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, turnstileToken }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Unable to send your message.')
      setForm(initialForm)
      setTurnstileToken('')
      setMessage('Thanks for reaching out. Your message has been sent.')
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send your message.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
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

        <section className="rounded-panel bg-surface p-7 sm:p-10" aria-labelledby="contact-form-heading">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Start a conversation</p>
          <h2 id="contact-form-heading" className="mt-4 font-display text-5xl font-black uppercase leading-[0.82] text-text sm:text-6xl">
            Send me a message
          </h2>
          <p className="mt-5 leading-7 text-muted">
            Tell me a little about what you have in mind, and I&apos;ll get back to you when I can.
          </p>

          <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
            <label className="block text-sm text-text">
              Full Name <span className="text-accent">*</span>
              <input className={inputClass} required value={form.name} onChange={(event) => updateField('name', event.target.value)} />
            </label>
            <label className="block text-sm text-text">
              Email Address <span className="text-accent">*</span>
              <input className={inputClass} type="email" required value={form.email} onChange={(event) => updateField('email', event.target.value)} />
            </label>
            <label className="block text-sm text-text">
              Inquiry Type <span className="text-accent">*</span>
              <select className={inputClass} required value={form.inquiryType} onChange={(event) => updateField('inquiryType', event.target.value)}>
                <option value="">Select an inquiry type</option>
                {inquiryTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="block text-sm text-text">
              Message <span className="text-accent">*</span>
              <textarea className={inputClass} rows={6} required value={form.message} onChange={(event) => updateField('message', event.target.value)} />
            </label>
            <label className="absolute -left-[9999px]" aria-hidden="true">
              Website
              <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => updateField('website', event.target.value)} />
            </label>
            {siteKey ? <div ref={turnstileRef} /> : <p className="rounded-lg border border-accent/30 p-4 text-sm text-muted">Online delivery is awaiting Turnstile and email provider setup. Please use the email link on the left for now.</p>}
            {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
            {message && <p className="text-sm text-accent" role="status">{message}</p>}
            <button type="submit" disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-bold text-page transition-colors hover:bg-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </section>
      </section>

      <p className="text-center text-sm text-muted">
        Prefer email? <a className="font-bold text-accent hover:underline" href={`mailto:${contact.email}`}>{contact.email}</a>
        {' · '}
        <Link className="font-bold text-accent hover:underline" to="/projects">Explore my projects <FiArrowUpRight className="inline" aria-hidden="true" /></Link>
      </p>
    </div>
  )
}
