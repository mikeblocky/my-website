import { NextResponse } from 'next/server'
import { musicActivities } from '@/app/journal/_data/activity'

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true,
      activities: musicActivities 
    })
  } catch (err) {
    console.error('Error fetching music activities:', err)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
