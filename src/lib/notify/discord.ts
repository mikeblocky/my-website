/**
 * Notify the site owner about new questions via Discord webhook.
 * Set DISCORD_WEBHOOK_URL in your environment variables.
 */

export async function notifyOwnerNewQuestion(author: string, body: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    console.log('[notify] DISCORD_WEBHOOK_URL not set, skipping owner notification')
    return
  }

  try {
    const truncatedBody = body.length > 300 ? body.slice(0, 300) + '...' : body

    const embed = {
      title: '📬 New question on Ask board',
      color: 0x2563eb, // blue-600
      fields: [
        {
          name: 'From',
          value: author || 'anonymous',
          inline: true,
        },
        {
          name: 'Time',
          value: new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
          inline: true,
        },
        {
          name: 'Question',
          value: truncatedBody,
        },
      ],
      footer: {
        text: 'mikeblocky.com/ask',
      },
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'mikeblocky.com',
        avatar_url: 'https://mikeblocky.com/icon-512.png',
        embeds: [embed],
      }),
    })
  } catch (err) {
    // Non-blocking: don't fail the request if notification fails
    console.error('[notify] Discord webhook failed:', err)
  }
}
