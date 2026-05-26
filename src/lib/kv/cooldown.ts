import { createHash } from 'crypto'
import { NextRequest } from 'next/server'
import { getRedisClient } from './client'

export const MESSAGE_COOLDOWN_MINUTES = 333
export const MESSAGE_COOLDOWN_MS = MESSAGE_COOLDOWN_MINUTES * 60 * 1000

export type CooldownScope = 'talk' | 'draw' | 'suggestion'

export type CooldownState = {
  expiresAt: string | null
  remainingMs: number
}

function getRequestAddress(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    forwardedFor ||
    'unknown-ip'
  )
}

function getCooldownKey(scope: CooldownScope, request: NextRequest) {
  const fingerprint = [
    getRequestAddress(request),
    request.headers.get('user-agent') || 'unknown-agent',
    request.headers.get('accept-language') || 'unknown-language',
    request.headers.get('accept') || 'unknown-accept',
    request.headers.get('sec-ch-ua') || 'unknown-ua-hints',
    request.headers.get('sec-ch-ua-platform') || 'unknown-platform',
    request.headers.get('sec-ch-ua-mobile') || 'unknown-mobile'
  ].join('|')

  const hash = createHash('sha256').update(fingerprint).digest('hex')
  return `cooldown:${scope}:${hash}`
}

export async function getMessageCooldown(scope: CooldownScope, request: NextRequest): Promise<CooldownState> {
  const redis = await getRedisClient()
  const stored = await redis.get(getCooldownKey(scope, request))
  const expiresAtMs = stored ? Number.parseInt(stored, 10) : 0
  const remainingMs = Number.isFinite(expiresAtMs) ? Math.max(0, expiresAtMs - Date.now()) : 0

  return {
    expiresAt: remainingMs > 0 ? new Date(expiresAtMs).toISOString() : null,
    remainingMs
  }
}

export async function assertMessageCooldown(scope: CooldownScope, request: NextRequest) {
  const state = await getMessageCooldown(scope, request)
  if (state.remainingMs > 0) {
    return state
  }

  return null
}

export async function reserveMessageCooldown(scope: CooldownScope, request: NextRequest) {
  const redis = await getRedisClient()
  const key = getCooldownKey(scope, request)
  const expiresAtMs = Date.now() + MESSAGE_COOLDOWN_MS
  const current = await getMessageCooldown(scope, request)

  if (current.remainingMs > 0) {
    return {
      blocked: true as const,
      cooldown: current
    }
  }

  const hasStoredCooldown = Boolean(await redis.get(key))
  const reserved = hasStoredCooldown
    ? Boolean(await redis.set(key, expiresAtMs.toString()))
    : await redis.setIfNotExists(key, expiresAtMs.toString())

  if (reserved) {
    return {
      blocked: false as const,
      cooldown: {
        expiresAt: new Date(expiresAtMs).toISOString(),
        remainingMs: MESSAGE_COOLDOWN_MS
      }
    }
  }

  return {
    blocked: true as const,
    cooldown: await getMessageCooldown(scope, request)
  }
}

export async function startMessageCooldown(scope: CooldownScope, request: NextRequest): Promise<CooldownState> {
  const redis = await getRedisClient()
  const expiresAtMs = Date.now() + MESSAGE_COOLDOWN_MS
  await redis.set(getCooldownKey(scope, request), expiresAtMs.toString())

  return {
    expiresAt: new Date(expiresAtMs).toISOString(),
    remainingMs: MESSAGE_COOLDOWN_MS
  }
}
