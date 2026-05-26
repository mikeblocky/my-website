/**
 * Notify the site owner about new questions via Discord webhook.
 * Set DISCORD_WEBHOOK_URL in your environment variables.
 */

export async function notifyOwnerNewTalk(author: string, body: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    console.log('[notify] DISCORD_WEBHOOK_URL not set, skipping owner notification')
    return
  }

  try {
    const truncatedBody = body.length > 300 ? body.slice(0, 300) + '...' : body

    const embed = {
      title: 'New post on Talk board',
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
          name: 'Content',
          value: truncatedBody,
        },
      ],
      footer: {
        text: 'mikeblocky.com/talk',
      },
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'mikeblocky.com',
        avatar_url: 'https://mikeblocky.com/icon-512.png',
        content: 'New Talk board post received.',
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(
        `Discord webhook responded with ${response.status}${errorText ? `: ${errorText}` : ''}`
      )
    }
  } catch (err) {
    // Non-blocking: don't fail the request if notification fails
    console.error('[notify] Discord webhook failed:', err)
  }
}

export async function notifyOwnerNewPrompt(author: string, body: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    console.log('[notify] DISCORD_WEBHOOK_URL not set, skipping owner notification')
    return
  }

  try {
    const truncatedBody = body.length > 300 ? body.slice(0, 300) + '...' : body

    const embed = {
      title: 'New drawing prompt suggestion',
      color: 0x8b5cf6, // violet-500
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
          name: 'Prompt',
          value: truncatedBody,
        },
      ],
      footer: {
        text: 'mikeblocky.com/draw',
      },
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'mikeblocky.com',
        avatar_url: 'https://mikeblocky.com/icon-512.png',
        content: 'New drawing prompt suggestion received.',
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(
        `Discord webhook responded with ${response.status}${errorText ? `: ${errorText}` : ''}`
      )
    }
  } catch (err) {
    // Non-blocking: don't fail the request if notification fails
    console.error('[notify] Discord webhook failed:', err)
  }
}

export async function notifyOwnerNewSuggestion(author: string, title: string, note?: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    console.log('[notify] DISCORD_WEBHOOK_URL not set, skipping owner notification')
    return
  }

  try {
    const body = note ? `${title}\n\n${note}` : title
    const truncatedBody = body.length > 300 ? body.slice(0, 300) + '...' : body

    const embed = {
      title: 'New read/watch suggestion',
      color: 0x0f766e,
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
          name: 'Suggestion',
          value: truncatedBody,
        },
      ],
      footer: {
        text: 'mikeblocky.com/interact?tab=suggestions',
      },
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'mikeblocky.com',
        avatar_url: 'https://mikeblocky.com/icon-512.png',
        content: 'New read/watch suggestion received.',
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(
        `Discord webhook responded with ${response.status}${errorText ? `: ${errorText}` : ''}`
      )
    }
  } catch (err) {
    console.error('[notify] Discord webhook failed:', err)
  }
}
