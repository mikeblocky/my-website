import { getRedisClient, sketchbookDrawingsKey } from './client'
import { SketchbookDrawing, SketchbookThreadMessage } from '@/app/sketchbook/_types/sketchbook'

const MAX_STORED_DRAWINGS = 200

export function buildDrawingPayload(partial: { 
  author: string; 
  body?: string; 
  imageUrl: string;
}): SketchbookDrawing {
  const now = new Date().toISOString()
  return {
    id: Math.random().toString(36).substring(2, 11),
    author: partial.author.trim() || 'anonymous',
    body: partial.body?.trim(),
    imageUrl: partial.imageUrl,
    createdAt: now,
    likes: 0,
    thread: []
  }
}

export async function saveDrawing(drawing: SketchbookDrawing) {
  const redis = await getRedisClient()
  const member = JSON.stringify(drawing)
  const score = new Date(drawing.createdAt).getTime()

  await redis.zAdd(sketchbookDrawingsKey, [{ score, value: member }])

  const total = await redis.zCard(sketchbookDrawingsKey)
  const surplus = total - MAX_STORED_DRAWINGS
  if (surplus > 0) {
    await redis.zRemRangeByRank(sketchbookDrawingsKey, 0, surplus - 1)
  }
}

export async function fetchDrawings(limit = 100): Promise<SketchbookDrawing[]> {
  const redis = await getRedisClient()
  const raw = await redis.zRange(sketchbookDrawingsKey, -limit, -1, { REV: true })
  return raw
    .map((entry: string) => {
      try {
        const d = JSON.parse(entry) as SketchbookDrawing
        if (!d.thread) d.thread = []
        if (typeof d.likes !== 'number') d.likes = 0
        return d
      } catch (_error) {
        return null
      }
    })
    .filter(Boolean) as SketchbookDrawing[]
}

export async function incrementDrawingLikes(id: string): Promise<SketchbookDrawing | null> {
  const redis = await getRedisClient()
  const drawings = await fetchDrawings(MAX_STORED_DRAWINGS)
  
  const target = drawings.find(d => d.id === id)
  if (!target) return null

  // Fetch the raw Redis data to locate the exact member string
  const rawAll = await redis.zRange(sketchbookDrawingsKey, 0, -1)
  const rawMember = rawAll.find((entry: string) => {
    try { return JSON.parse(entry).id === id } catch { return false }
  })
  if (!rawMember) return null

  const updatedDrawing: SketchbookDrawing = {
    ...target,
    likes: (target.likes || 0) + 1
  }

  const newMember = JSON.stringify(updatedDrawing)
  const score = new Date(target.createdAt).getTime()

  await redis.zRem(sketchbookDrawingsKey, rawMember)
  await redis.zAdd(sketchbookDrawingsKey, [{ score, value: newMember }])

  return updatedDrawing
}

export async function deleteDrawing(id: string): Promise<boolean> {
  const redis = await getRedisClient()
  const rawAll = await redis.zRange(sketchbookDrawingsKey, 0, -1)
  const rawMember = rawAll.find((entry: string) => {
    try { return JSON.parse(entry).id === id } catch { return false }
  })
  if (!rawMember) return false

  await redis.zRem(sketchbookDrawingsKey, rawMember)
  return true
}

export async function replyToDrawing(id: string, replyBody: string, imageUrl?: string): Promise<SketchbookDrawing | null> {
  const redis = await getRedisClient()
  const drawings = await fetchDrawings(MAX_STORED_DRAWINGS)
  
  const target = drawings.find(d => d.id === id)
  if (!target) return null
  
  const rawAll = await redis.zRange(sketchbookDrawingsKey, 0, -1)
  const rawMember = rawAll.find((entry: string) => {
    try { return JSON.parse(entry).id === id } catch { return false }
  })
  if (!rawMember) return null

  const now = new Date().toISOString()
  const newMessage: SketchbookThreadMessage = {
    id: Math.random().toString(36).substring(2, 11),
    role: 'admin',
    body: replyBody.trim(),
    createdAt: now,
    imageUrl
  }

  const updatedDrawing: SketchbookDrawing = {
    ...target,
    thread: [...(target.thread || []), newMessage]
  }
  
  const newMember = JSON.stringify(updatedDrawing)
  const score = new Date(target.createdAt).getTime()
  
  await redis.zRem(sketchbookDrawingsKey, rawMember)
  await redis.zAdd(sketchbookDrawingsKey, [{ score, value: newMember }])
  
  return updatedDrawing
}

export async function updateThreadMessage(
  drawingId: string, 
  messageId: string, 
  newBody: string, 
  newImageUrl?: string
): Promise<SketchbookDrawing | null> {
  const redis = await getRedisClient()
  const drawings = await fetchDrawings(MAX_STORED_DRAWINGS)
  
  const target = drawings.find(d => d.id === drawingId)
  if (!target || !target.thread) return null
  
  const messageIndex = target.thread.findIndex(m => m.id === messageId)
  if (messageIndex === -1) return null

  const rawAll = await redis.zRange(sketchbookDrawingsKey, 0, -1)
  const rawMember = rawAll.find((entry: string) => {
    try { return JSON.parse(entry).id === drawingId } catch { return false }
  })
  if (!rawMember) return null

  const updatedThread = [...target.thread]
  updatedThread[messageIndex] = {
    ...updatedThread[messageIndex],
    body: newBody.trim(),
    imageUrl: newImageUrl !== undefined ? newImageUrl : updatedThread[messageIndex].imageUrl
  }

  const updatedDrawing: SketchbookDrawing = {
    ...target,
    thread: updatedThread
  }
  
  const newMember = JSON.stringify(updatedDrawing)
  const score = new Date(target.createdAt).getTime()
  
  await redis.zRem(sketchbookDrawingsKey, rawMember)
  await redis.zAdd(sketchbookDrawingsKey, [{ score, value: newMember }])
  
  return updatedDrawing
}

export async function getDrawingById(id: string): Promise<SketchbookDrawing | null> {
  const drawings = await fetchDrawings(MAX_STORED_DRAWINGS)
  return drawings.find(d => d.id === id) || null
}
