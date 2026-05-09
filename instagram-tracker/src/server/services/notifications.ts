import { Resend } from 'resend'
import type { Post, Competitor, User } from '@prisma/client'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? '')
}

type PostWithCompetitor = Post & { competitor: Competitor }

export async function sendViralAlert(
  user: User,
  post: PostWithCompetitor,
  viralScore: number
) {
  const promises: Promise<unknown>[] = []

  promises.push(
    getResend().emails.send({
      from: process.env.EMAIL_FROM!,
      to: user.email,
      subject: `Viral post detected: @${post.competitor.instagramHandle}`,
      html: generateEmailHTML(post, viralScore),
    })
  )

  if (user.slackWebhook) {
    promises.push(
      fetch(user.slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Viral post detected`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*@${post.competitor.instagramHandle}* published content that's gaining traction fast.\n*Viral score:* ${viralScore.toFixed(1)}x average\n*Likes:* ${post.likesCount.toLocaleString()} · *Comments:* ${post.commentsCount.toLocaleString()}`,
              },
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'View & Recreate' },
                  url: `${process.env.NEXTAUTH_URL}/post/${post.id}`,
                  style: 'primary',
                },
              ],
            },
          ],
        }),
      })
    )
  }

  await Promise.allSettled(promises)
}

function generateEmailHTML(post: PostWithCompetitor, viralScore: number): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #111;">Viral post detected</h2>
      <p><strong>@${post.competitor.instagramHandle}</strong> published content that's gaining traction:</p>
      <div style="background: #f4f4f4; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p><strong>Viral score:</strong> ${viralScore.toFixed(1)}x profile average</p>
        <p><strong>Likes:</strong> ${post.likesCount.toLocaleString()}</p>
        <p><strong>Comments:</strong> ${post.commentsCount.toLocaleString()}</p>
        ${post.caption ? `<p><strong>Caption:</strong> ${post.caption.slice(0, 200)}${post.caption.length > 200 ? '...' : ''}</p>` : ''}
      </div>
      <a href="${process.env.NEXTAUTH_URL}/post/${post.id}"
         style="background: #111; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
        View post and recreate with AI
      </a>
    </body>
    </html>
  `
}
