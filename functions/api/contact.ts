interface ContactEnv {
  CONTACT_EMAIL_TO?: string
  CONTACT_EMAIL_FROM?: string
  RESEND_API_KEY?: string
  TURNSTILE_SECRET_KEY?: string
}

const MAX_BODY_BYTES = 20 * 1024
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ALLOWED_INQUIRIES = new Set([
  'Web Development',
  'UI/UX Design',
  'Photography',
  'Graphic Design / Digital Content',
  'Collaboration',
  'Other',
])

function json(body: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export const onRequestPost: PagesFunction<ContactEnv> = async ({ request, env }) => {
  const origin = request.headers.get('Origin')
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Invalid request origin.' }, 403)

  const contentLength = Number(request.headers.get('Content-Length') || 0)
  if (contentLength > MAX_BODY_BYTES) return json({ error: 'Request is too large.' }, 413)

  let input: Record<string, unknown>
  try {
    const body = await request.text()
    if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
      return json({ error: 'Request is too large.' }, 413)
    }
    input = JSON.parse(body) as Record<string, unknown>
  } catch {
    return json({ error: 'Invalid request body.' }, 400)
  }

  const name = clean(input.name, 120)
  const email = clean(input.email, 254)
  const inquiryType = clean(input.inquiryType, 80)
  const message = clean(input.message, 5000)
  const website = clean(input.website, 200)
  const turnstileToken = clean(input.turnstileToken, 2048)
  if (website) return json({ ok: true })
  if (!name || !EMAIL_PATTERN.test(email) || !ALLOWED_INQUIRIES.has(inquiryType) || message.length < 10) {
    return json({ error: 'Please provide valid contact details and a message.' }, 400)
  }
  if (!turnstileToken) return json({ error: 'Security verification is required.' }, 400)
  if (!env.CONTACT_EMAIL_TO || !env.CONTACT_EMAIL_FROM || !env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY) {
    return json({ error: 'Contact delivery is not configured yet. Please use the direct email link.' }, 503)
  }

  let turnstileResponse: Response
  try {
    turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: turnstileToken, remoteip: request.headers.get('CF-Connecting-IP') || '' }),
    })
  } catch {
    return json({ error: 'Security verification is temporarily unavailable.' }, 502)
  }
  if (!turnstileResponse.ok) return json({ error: 'Security verification failed.' }, 502)
  const turnstileResult = await turnstileResponse.json() as { success?: boolean }
  if (!turnstileResult.success) return json({ error: 'Security verification failed.' }, 400)

  const subject = `Portfolio contact: ${inquiryType} — ${name}`.replace(/[\r\n]/g, ' ')
  let emailResponse: Response
  try {
    emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.CONTACT_EMAIL_FROM,
        to: [env.CONTACT_EMAIL_TO],
        reply_to: email,
        subject,
        text: `Name: ${name}\nEmail: ${email}\nInquiry type: ${inquiryType}\n\n${message}`,
      }),
    })
  } catch {
    return json({ error: 'The email service is temporarily unavailable. Please use the direct email link.' }, 502)
  }
  if (!emailResponse.ok) return json({ error: 'The message could not be delivered. Please use the direct email link.' }, 502)
  return json({ ok: true })
}
