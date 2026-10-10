import type { VercelRequest, VercelResponse } from '@vercel/node'
import nodemailer from 'nodemailer'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, page, screenshot } = req.body as { message?: string; page?: string; screenshot?: string }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message vide' })
  }
  if (message.trim().length > 500) {
    return res.status(400).json({ error: 'Message trop long (max. 500 caractères)' })
  }

  const { GMAIL_USER, GMAIL_APP_PASSWORD, FEEDBACK_TO } = process.env

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !FEEDBACK_TO) {
    console.error('Missing email env vars')
    return res.status(500).json({ error: 'Configuration email manquante' })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  })

  const pageName = page && typeof page === 'string' ? page : 'Page inconnue'
  const sentAt = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })

  const screenshotAttachment =
    screenshot &&
    typeof screenshot === 'string' &&
    screenshot.startsWith('data:image/')
      ? [{
          filename: 'screenshot.jpg',
          content: Buffer.from(screenshot.replace(/^data:image\/\w+;base64,/, ''), 'base64'),
        }]
      : []

  await transporter.sendMail({
    from: `"FlowDiff Feedback" <${GMAIL_USER}>`,
    to: FEEDBACK_TO,
    subject: `[Feedback FlowDiff] ${pageName}`,
    attachments: screenshotAttachment,
    text: [
      `Nouveau feedback reçu sur FlowDiff`,
      ``,
      `Page : ${pageName}`,
      `Date : ${sentAt}`,
      ``,
      `Message :`,
      message.trim(),
    ].join('\n'),
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto">
        <div style="background:#232f3e;padding:20px 24px;border-radius:8px 8px 0 0">
          <h2 style="margin:0;color:#C9A84C;font-size:1.1rem">Feedback FlowDiff</h2>
        </div>
        <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:20px 24px">
          <table style="width:100%;border-collapse:collapse;font-size:0.875rem;margin-bottom:16px">
            <tr>
              <td style="padding:6px 0;color:#555550;width:80px">Page</td>
              <td style="padding:6px 0;font-weight:600;color:#111111">${pageName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#555550">Date</td>
              <td style="padding:6px 0;color:#111111">${sentAt}</td>
            </tr>
          </table>
          <div style="background:#f4f4f0;border-left:4px solid #232f3e;border-radius:0 6px 6px 0;padding:14px 16px;font-size:0.9rem;color:#111111;line-height:1.6;white-space:pre-wrap">${message.trim()}</div>
        </div>
      </div>
    `,
  })

  return res.status(200).json({ ok: true })
}
